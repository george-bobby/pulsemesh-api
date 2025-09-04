import { useState } from "react";
import Navigation from "@/components/Navigation";
import StatusCard from "@/components/StatusCard";
import ProviderStatus from "@/components/ProviderStatus";
import MetricsChart from "@/components/MetricsChart";
import AlertCenter from "@/components/AlertCenter";
import CircuitBreakerPanel from "@/components/CircuitBreakerPanel";
import FailoverSimulator from "@/components/FailoverSimulator";
import AIResilienceEngine from "@/components/AIResilienceEngine";
import LiveApiTester from "@/components/LiveApiTester";
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
  // Mock data for charts
  const latencyData = [
    { time: "00:00", value: 120 },
    { time: "00:15", value: 135 },
    { time: "00:30", value: 142 },
    { time: "00:45", value: 138 },
    { time: "01:00", value: 155 },
    { time: "01:15", value: 148 },
    { time: "01:30", value: 132 },
    { time: "01:45", value: 125 },
    { time: "02:00", value: 118 },
    { time: "02:15", value: 145 },
  ];

  const requestVolumeData = [
    { time: "00:00", value: 1200 },
    { time: "00:15", value: 1450 },
    { time: "00:30", value: 1380 },
    { time: "00:45", value: 1620 },
    { time: "01:00", value: 1850 },
    { time: "01:15", value: 1720 },
    { time: "01:30", value: 1580 },
    { time: "01:45", value: 1640 },
    { time: "02:00", value: 1920 },
    { time: "02:15", value: 1750 },
  ];

  const errorRateData = [
    { time: "00:00", value: 0.2 },
    { time: "00:15", value: 0.1 },
    { time: "00:30", value: 0.3 },
    { time: "00:45", value: 0.8 },
    { time: "01:00", value: 1.2 },
    { time: "01:15", value: 0.9 },
    { time: "01:30", value: 0.4 },
    { time: "01:45", value: 0.2 },
    { time: "02:00", value: 0.6 },
    { time: "02:15", value: 0.3 },
  ];

  const uptimeData = [
    { time: "00:00", value: 99.9 },
    { time: "00:15", value: 99.8 },
    { time: "00:30", value: 99.7 },
    { time: "00:45", value: 98.5 },
    { time: "01:00", value: 97.2 },
    { time: "01:15", value: 98.8 },
    { time: "01:30", value: 99.5 },
    { time: "01:45", value: 99.8 },
    { time: "02:00", value: 99.9 },
    { time: "02:15", value: 99.9 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            API Resilience Hub
          </h1>
          <p className="text-muted-foreground">
            Intelligent middleware platform for API monitoring, failover, and resilience
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatusCard
            title="System Health"
            value="98.5%"
            subtitle="Uptime"
            status="success"
            trend="up"
            trendValue="+0.2%"
            icon={<Shield className="w-4 h-4" />}
          />
          
          <StatusCard
            title="Active Providers"
            value="6/8"
            subtitle="Online"
            status="warning"
            trend="stable"
            trendValue="2 degraded"
            icon={<Database className="w-4 h-4" />}
          />
          
          <StatusCard
            title="Avg Response Time"
            value="142ms"
            subtitle="Last 15min"
            status="success"
            trend="down"
            trendValue="-8ms"
            icon={<Clock className="w-4 h-4" />}
          />
          
          <StatusCard
            title="Request Volume"
            value="1.8K"
            subtitle="req/min"
            status="neutral"
            trend="up"
            trendValue="+15%"
            icon={<Activity className="w-4 h-4" />}
          />
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="resilience">AI Resilience</TabsTrigger>
            <TabsTrigger value="testing">Live Testing</TabsTrigger>
            <TabsTrigger value="simulation">Simulation</TabsTrigger>
            <TabsTrigger value="providers">Providers</TabsTrigger>
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
              <ProviderStatus />
              <AlertCenter />
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
            <ProviderStatus />
            <CircuitBreakerPanel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;