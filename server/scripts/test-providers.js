#!/usr/bin/env node

/**
 * Test script for adding valid and invalid API providers
 * Tests both frontend (via Convex) and server (via REST API) flows
 * 
 * Usage:
 *   node scripts/test-providers.js
 * 
 * Requires:
 *   - Server running on http://localhost:3004
 *   - Valid Clerk JWT token (set CLERK_TEST_TOKEN env var)
 *   - Convex deployment configured
 */

import axios from 'axios';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '../.env') });

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3004';
const CLERK_TOKEN = process.env.CLERK_TEST_TOKEN || '';

// Test providers
const VALID_PROVIDERS = [
  {
    name: 'Test Valid Provider - HTTPBin',
    type: 'monitoring',
    endpoint: 'https://httpbin.org/status/200',
    isHealthy: true,
    latency: 0,
    errorRate: 0,
    priority: 1,
  },
  {
    name: 'Test Valid Provider - JSONPlaceholder',
    type: 'api',
    endpoint: 'https://jsonplaceholder.typicode.com',
    isHealthy: true,
    latency: 0,
    errorRate: 0,
    priority: 2,
  },
];

const INVALID_PROVIDERS = [
  {
    name: 'Test Invalid Provider - Bad URL',
    type: 'monitoring',
    endpoint: 'not-a-valid-url',
    isHealthy: true,
    latency: 0,
    errorRate: 0,
    priority: 1,
  },
  {
    name: 'Test Invalid Provider - Non-HTTP',
    type: 'monitoring',
    endpoint: 'ftp://example.com',
    isHealthy: true,
    latency: 0,
    errorRate: 0,
    priority: 1,
  },
  {
    name: 'Test Invalid Provider - Missing Fields',
    type: 'monitoring',
    // Missing endpoint
    isHealthy: true,
    latency: 0,
    errorRate: 0,
    priority: 1,
  },
  {
    name: 'Test Invalid Provider - Unreachable',
    type: 'monitoring',
    endpoint: 'https://this-domain-does-not-exist-12345.com',
    isHealthy: true,
    latency: 0,
    errorRate: 0,
    priority: 1,
  },
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function checkServerHealth() {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    if (response.data.success) {
      logSuccess('Server is healthy');
      return true;
    } else {
      logError('Server health check failed');
      return false;
    }
  } catch (error) {
    logError(`Server health check failed: ${error.message}`);
    return false;
  }
}

async function createProviderViaAPI(provider, expectSuccess = true) {
  try {
    const headers = {};
    if (CLERK_TOKEN) {
      headers['Authorization'] = `Bearer ${CLERK_TOKEN}`;
    }

    logInfo(`Creating provider: ${provider.name}`);
    logInfo(`  Endpoint: ${provider.endpoint || '(missing)'}`);

    const response = await axios.post(
      `${API_BASE_URL}/api/providers`,
      provider,
      { headers }
    );

    if (expectSuccess) {
      logSuccess(`Provider created successfully: ${response.data.data?.id || 'N/A'}`);
      return { success: true, data: response.data.data };
    } else {
      logError(`Expected failure but got success: ${provider.name}`);
      return { success: false, error: 'Unexpected success' };
    }
  } catch (error) {
    if (expectSuccess) {
      logError(`Failed to create provider: ${error.response?.data?.error || error.message}`);
      return { success: false, error: error.response?.data?.error || error.message };
    } else {
      logSuccess(`Correctly rejected invalid provider: ${error.response?.data?.error || error.message}`);
      return { success: true, error: error.response?.data?.error || error.message };
    }
  }
}

async function testHealthCheck(providerId) {
  try {
    const headers = {};
    if (CLERK_TOKEN) {
      headers['Authorization'] = `Bearer ${CLERK_TOKEN}`;
    }

    logInfo(`Triggering health check for provider: ${providerId}`);
    const response = await axios.post(
      `${API_BASE_URL}/api/monitoring/providers/${providerId}/check`,
      {},
      { headers }
    );

    if (response.data.success) {
      const result = response.data.data;
      logSuccess(`Health check completed: ${result.isHealthy ? 'Healthy' : 'Unhealthy'}`);
      logInfo(`  Latency: ${result.latency}ms`);
      logInfo(`  Status Code: ${result.statusCode || 'N/A'}`);
      if (result.errorMessage) {
        logWarning(`  Error: ${result.errorMessage}`);
      }
      return { success: true, data: result };
    } else {
      logError(`Health check failed: ${response.data.error}`);
      return { success: false, error: response.data.error };
    }
  } catch (error) {
    logError(`Health check request failed: ${error.response?.data?.error || error.message}`);
    return { success: false, error: error.response?.data?.error || error.message };
  }
}

async function getProviderHistory(providerId) {
  try {
    const headers = {};
    if (CLERK_TOKEN) {
      headers['Authorization'] = `Bearer ${CLERK_TOKEN}`;
    }

    const response = await axios.get(
      `${API_BASE_URL}/api/monitoring/providers/${providerId}/history?limit=5`,
      { headers }
    );

    if (response.data.success) {
      const history = response.data.data || [];
      logInfo(`Health check history: ${history.length} records`);
      return { success: true, data: history };
    } else {
      logError(`Failed to get history: ${response.data.error}`);
      return { success: false, error: response.data.error };
    }
  } catch (error) {
    logError(`History request failed: ${error.response?.data?.error || error.message}`);
    return { success: false, error: error.response?.data?.error || error.message };
  }
}

async function runTests() {
  log('\n' + '='.repeat(60), 'blue');
  log('PulseMesh API Provider Testing Script', 'blue');
  log('='.repeat(60) + '\n', 'blue');

  // Check server health
  log('Step 1: Checking server health...', 'cyan');
  const serverHealthy = await checkServerHealth();
  if (!serverHealthy) {
    logError('Server is not healthy. Please start the server first.');
    process.exit(1);
  }

  if (!CLERK_TOKEN) {
    logWarning('CLERK_TEST_TOKEN not set. API tests will fail authentication.');
    logWarning('Set CLERK_TEST_TOKEN environment variable to test authenticated endpoints.');
    logWarning('Continuing with unauthenticated tests...\n');
  }

  // Test valid providers
  log('\n' + '='.repeat(60), 'blue');
  log('Testing VALID Providers', 'blue');
  log('='.repeat(60) + '\n', 'blue');

  const validResults = [];
  for (const provider of VALID_PROVIDERS) {
    const result = await createProviderViaAPI(provider, true);
    validResults.push({ provider, result });
    
    if (result.success && result.data?.id) {
      // Wait a bit for the provider to be processed
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Test health check
      log('\nTesting health check...', 'cyan');
      await testHealthCheck(result.data.id);
      
      // Get history
      log('\nGetting health check history...', 'cyan');
      await getProviderHistory(result.data.id);
    }
    
    log(''); // Empty line between tests
  }

  // Test invalid providers
  log('\n' + '='.repeat(60), 'blue');
  log('Testing INVALID Providers (should fail)', 'blue');
  log('='.repeat(60) + '\n', 'blue');

  const invalidResults = [];
  for (const provider of INVALID_PROVIDERS) {
    const result = await createProviderViaAPI(provider, false);
    invalidResults.push({ provider, result });
    log(''); // Empty line between tests
  }

  // Summary
  log('\n' + '='.repeat(60), 'blue');
  log('Test Summary', 'blue');
  log('='.repeat(60) + '\n', 'blue');

  const validSuccess = validResults.filter(r => r.result.success).length;
  const validTotal = validResults.length;
  log(`Valid Providers: ${validSuccess}/${validTotal} succeeded`, validSuccess === validTotal ? 'green' : 'red');

  const invalidSuccess = invalidResults.filter(r => r.result.success).length;
  const invalidTotal = invalidResults.length;
  log(`Invalid Providers: ${invalidSuccess}/${invalidTotal} correctly rejected`, invalidSuccess === invalidTotal ? 'green' : 'red');

  log('\n' + '='.repeat(60), 'blue');
  log('Testing Complete', 'blue');
  log('='.repeat(60) + '\n', 'blue');

  // Exit with appropriate code
  if (validSuccess === validTotal && invalidSuccess === invalidTotal) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  logError(`Test execution failed: ${error.message}`);
  console.error(error);
  process.exit(1);
});

