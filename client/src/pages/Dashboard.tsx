import { useState, useEffect, useMemo } from "react";
import Navigation from "@/components/Navigation";
import StatusCard from "@/components/StatusCard";
import ProviderStatus from "@/components/ProviderStatus";
import MetricsChart from "@/components/MetricsChart";
import AlertCenter from "@/components/AlertCenter";
import CircuitBreakerPanel from "@/components/CircuitBreakerPanel";
import FailoverSimulator from "@/components/FailoverSimulator";
import AIResilienceEngine from "@/components/AIResilienceEngine";
import LiveApiTester from "@/components/LiveApiTester";
import UserProfile from "@/components/UserProfile";
import TestMessages from "@/components/TestMessages";

import { useProviders } from "@/hooks/useProviders";
import {
  Activity,
  Shield,
  Zap,
  Clock,
  TrendingUp,
  Database,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const { providers, loading, error } = useProviders();
  const [selectedTab, setSelectedTab] = useState("overview");

  // Calculate real metrics from provider data
  const metrics = useMemo(() => {
    if (!providers.length) {
      return {
        totalProviders: 0,
        healthyProviders: 0,
        avgLatency: 0,
        systemUptime: 0,
        totalRequests: 0,
        successRate: 0,
      };
    }

    const healthyCount = providers.filter((p) => p.isHealthy).length;
    const avgLatency =
      providers.reduce((sum, p) => sum + p.latency, 0) / providers.length;
    const avgSuccessRate =
      providers.reduce((sum, p) => sum + (p.successRate || 0), 0) /
      providers.length;
    const systemUptime =
      providers.reduce((sum, p) => sum + (p.uptime || 0), 0) / providers.length;

    return {
      totalProviders: providers.length,
      healthyProviders: healthyCount,
      avgLatency: Math.round(avgLatency),
      systemUptime: Math.round(systemUptime),
      totalRequests: providers.reduce(
        (sum, p) => sum + (p.totalRequests || 0),
        0
      ),
      successRate: Math.round(avgSuccessRate),
    };
  }, [providers]);

  // Generate chart data from real provider metrics
  const latencyData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 10 }, (_, i) => {
      const time = new Date(now.getTime() - (9 - i) * 15 * 60 * 1000);
      const timeStr = time.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      // Simulate some variation around current average latency
      const baseLatency = metrics.avgLatency || 120;
      const variation = (Math.random() - 0.5) * 40;
      return {
        time: timeStr,
        value: Math.max(50, Math.round(baseLatency + variation)),
      };
    });
  }, [metrics.avgLatency]);

  const requestVolumeData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 10 }, (_, i) => {
      const time = new Date(now.getTime() - (9 - i) * 15 * 60 * 1000);
      const timeStr = time.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      // Simulate request volume based on number of providers
      const baseVolume = providers.length * 200;
      const variation = (Math.random() - 0.5) * baseVolume * 0.3;
      return {
        time: timeStr,
        value: Math.max(100, Math.round(baseVolume + variation)),
      };
    });
  }, [providers.length]);

  const errorRateData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 10 }, (_, i) => {
      const time = new Date(now.getTime() - (9 - i) * 15 * 60 * 1000);
      const timeStr = time.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      // Calculate average error rate from providers
      const avgErrorRate =
        providers.length > 0
          ? providers.reduce((sum, p) => sum + p.errorRate, 0) /
            providers.length
          : 0;
      const variation = (Math.random() - 0.5) * 0.5;
      return {
        time: timeStr,
        value: Math.max(0, Number((avgErrorRate + variation).toFixed(1))),
      };
    });
  }, [providers]);

  const uptimeData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 10 }, (_, i) => {
      const time = new Date(now.getTime() - (9 - i) * 15 * 60 * 1000);
      const timeStr = time.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      // Use system uptime with some variation
      const baseUptime = metrics.systemUptime || 99;
      const variation = (Math.random() - 0.5) * 2;
      return {
        time: timeStr,
        value: Math.max(
          95,
          Math.min(100, Number((baseUptime + variation).toFixed(1)))
        ),
      };
    });
  }, [metrics.systemUptime]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              API Resilience Hub
            </h1>
            <p className="text-muted-foreground">
              Intelligent middleware platform for API monitoring, failover, and
              resilience
            </p>
          </div>
          {/* <div className="lg:w-80">
            <UserProfile />
          </div> */}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading dashboard data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-8">
            <p className="text-destructive">Error loading data: {error}</p>
          </div>
        )}

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatusCard
            title="System Health"
            value={`${metrics.systemUptime}%`}
            subtitle="Uptime"
            status={
              metrics.systemUptime >= 99
                ? "success"
                : metrics.systemUptime >= 95
                  ? "warning"
                  : "error"
            }
            trend={metrics.systemUptime >= 99 ? "up" : "down"}
            trendValue={metrics.systemUptime >= 99 ? "+0.2%" : "-0.5%"}
            icon={<Shield className="w-4 h-4" />}
          />

          <StatusCard
            title="Active Providers"
            value={`${metrics.healthyProviders}/${metrics.totalProviders}`}
            subtitle="Online"
            status={
              metrics.healthyProviders === metrics.totalProviders
                ? "success"
                : "warning"
            }
            trend="stable"
            trendValue={`${metrics.totalProviders - metrics.healthyProviders} degraded`}
            icon={<Database className="w-4 h-4" />}
          />

          <StatusCard
            title="Avg Response Time"
            value={`${metrics.avgLatency}ms`}
            subtitle="Last 15min"
            status={
              metrics.avgLatency <= 200
                ? "success"
                : metrics.avgLatency <= 500
                  ? "warning"
                  : "error"
            }
            trend={metrics.avgLatency <= 200 ? "down" : "up"}
            trendValue={metrics.avgLatency <= 200 ? "-8ms" : "+15ms"}
            icon={<Clock className="w-4 h-4" />}
          />

          <StatusCard
            title="Success Rate"
            value={`${metrics.successRate}%`}
            subtitle="Last hour"
            status={
              metrics.successRate >= 99
                ? "success"
                : metrics.successRate >= 95
                  ? "warning"
                  : "error"
            }
            trend={metrics.successRate >= 99 ? "up" : "down"}
            trendValue={metrics.successRate >= 99 ? "+0.5%" : "-2%"}
            icon={<Activity className="w-4 h-4" />}
          />
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="resilience">AI Resilience</TabsTrigger>
            <TabsTrigger value="testing">Live Testing</TabsTrigger>
            <TabsTrigger value="simulation">Simulation</TabsTrigger>
            <TabsTrigger value="providers">Providers</TabsTrigger>
            <TabsTrigger value="auth-test">Auth Test</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
              <MetricsChart
                title="Response Time"
                subtitle="Average latency"
                data={latencyData}
                dataKey="value"
                color="hsl(200, 98%, 60%)"
                type="area"
                height={160}
              />

              <MetricsChart
                title="Request Volume"
                subtitle="Requests per minute"
                data={requestVolumeData}
                dataKey="value"
                color="hsl(142, 76%, 36%)"
                type="area"
                height={160}
              />

              <MetricsChart
                title="Error Rate"
                subtitle="Failed requests %"
                data={errorRateData}
                dataKey="value"
                color="hsl(0, 84%, 60%)"
                type="line"
                height={160}
              />

              <MetricsChart
                title="System Uptime"
                subtitle="Availability %"
                data={uptimeData}
                dataKey="value"
                color="hsl(280, 100%, 70%)"
                type="area"
                height={160}
              />
            </div>

            {/* Provider Status & Alerts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <ProviderStatus providers={providers} />
              <AlertCenter providers={providers} />
            </div>

            {/* Circuit Breakers */}
            <CircuitBreakerPanel />
          </TabsContent>

          <TabsContent value="resilience" className="space-y-6">
            <AIResilienceEngine />
          </TabsContent>

          <TabsContent value="testing" className="space-y-6">
            <LiveApiTester />
          </TabsContent>

          <TabsContent value="simulation" className="space-y-6">
            <FailoverSimulator />
          </TabsContent>

          <TabsContent value="providers" className="space-y-6">
            <ProviderStatus providers={providers} />
            <CircuitBreakerPanel />
          </TabsContent>

          <TabsContent value="auth-test" className="space-y-6">
            <TestMessages />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
