import WebSocket, { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { verifyToken } from '@clerk/backend';
import { env } from '../config/env.js';
import { WebSocketMessage, AuthenticatedUser } from '../types/index.js';

interface AuthenticatedWebSocket extends WebSocket {
  user?: AuthenticatedUser;
  isAlive?: boolean;
}

export class WebSocketService {
  private wss: WebSocketServer | null = null;
  private server: any = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private clients = new Set<AuthenticatedWebSocket>();

  async start(): Promise<void> {
    if (this.wss) {
      console.log('WebSocket server is already running');
      return;
    }

    console.log(`Starting WebSocket server on port ${env.WS_PORT}...`);

    // Create HTTP server for WebSocket
    this.server = createServer();
    
    // Create WebSocket server
    this.wss = new WebSocketServer({ 
      server: this.server,
      path: '/ws'
    });

    this.wss.on('connection', async (ws: AuthenticatedWebSocket, request) => {
      await this.handleConnection(ws, request);
    });

    // Start heartbeat
    this.startHeartbeat();

    // Start HTTP server
    this.server.listen(env.WS_PORT, () => {
      console.log(`WebSocket server started on port ${env.WS_PORT}`);
    });
  }

  async stop(): Promise<void> {
    if (!this.wss) {
      return;
    }

    console.log('Stopping WebSocket server...');

    // Stop heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Close all connections
    this.clients.forEach(ws => {
      ws.terminate();
    });
    this.clients.clear();

    // Close WebSocket server
    this.wss.close();
    this.wss = null;

    // Close HTTP server
    if (this.server) {
      this.server.close();
      this.server = null;
    }

    console.log('WebSocket server stopped');
  }

  private async handleConnection(ws: AuthenticatedWebSocket, request: any): Promise<void> {
    try {
      // Extract token from query parameters or headers
      const url = new URL(request.url!, `http://${request.headers.host}`);
      const token = url.searchParams.get('token') || request.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        ws.close(1008, 'Authentication required');
        return;
      }

      // Verify token
      const payload = await verifyToken(token, {
        secretKey: env.CLERK_SECRET_KEY,
        issuer: env.CLERK_JWT_ISSUER_DOMAIN,
      });

      if (!payload || !payload.sub) {
        ws.close(1008, 'Invalid token');
        return;
      }

      // Set user information
      ws.user = {
        userId: payload.sub,
        email: payload.email as string || '',
        name: payload.name as string || payload.given_name as string || '',
      };

      ws.isAlive = true;
      this.clients.add(ws);

      console.log(`WebSocket client connected: ${ws.user.email} (${this.clients.size} total)`);

      // Handle messages
      ws.on('message', (data) => {
        this.handleMessage(ws, data);
      });

      // Handle pong responses
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      // Handle disconnection
      ws.on('close', () => {
        this.clients.delete(ws);
        console.log(`WebSocket client disconnected: ${ws.user?.email} (${this.clients.size} total)`);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });

      // Send welcome message
      this.sendMessage(ws, {
        type: 'heartbeat',
        data: { timestamp: Date.now() }
      });

    } catch (error) {
      console.error('WebSocket authentication error:', error);
      ws.close(1008, 'Authentication failed');
    }
  }

  private handleMessage(ws: AuthenticatedWebSocket, data: any): void {
    try {
      const message = JSON.parse(data.toString());
      
      // Handle different message types
      switch (message.type) {
        case 'ping':
          this.sendMessage(ws, {
            type: 'heartbeat',
            data: { timestamp: Date.now() }
          });
          break;
        
        case 'subscribe':
          // Handle subscription requests (future feature)
          break;
        
        default:
          console.warn('Unknown WebSocket message type:', message.type);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }

  private sendMessage(ws: AuthenticatedWebSocket, message: WebSocketMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
      }
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach(ws => {
        if (!ws.isAlive) {
          ws.terminate();
          this.clients.delete(ws);
          return;
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, env.WS_HEARTBEAT_INTERVAL);
  }

  // Public methods for broadcasting updates
  broadcastStatusUpdate(data: {
    providerId: string;
    isHealthy: boolean;
    latency: number;
    timestamp: number;
  }): void {
    const message: WebSocketMessage = {
      type: 'status_update',
      data
    };

    this.broadcast(message);
  }

  broadcastProviderAdded(provider: any): void {
    const message: WebSocketMessage = {
      type: 'provider_added',
      data: provider
    };

    this.broadcast(message);
  }

  broadcastProviderUpdated(provider: any): void {
    const message: WebSocketMessage = {
      type: 'provider_updated',
      data: provider
    };

    this.broadcast(message);
  }

  broadcastProviderRemoved(providerId: string): void {
    const message: WebSocketMessage = {
      type: 'provider_removed',
      data: { providerId }
    };

    this.broadcast(message);
  }

  private broadcast(message: WebSocketMessage): void {
    this.clients.forEach(ws => {
      this.sendMessage(ws, message);
    });
  }

  // Get connection statistics
  getStats(): {
    connectedClients: number;
    isRunning: boolean;
  } {
    return {
      connectedClients: this.clients.size,
      isRunning: this.wss !== null,
    };
  }
}

// Singleton instance
export const webSocketService = new WebSocketService();
