import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import MetricsChart from "@/components/MetricsChart";
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Zap,
  Download,
  Filter,
  Calendar
} from "lucide-react";

const Analytics = () => {
  const responseTimeData = [
    { time: "00:00", value: 120 },
    { time: "04:00", value: 95 },
    { time: "08:00", value: 180 },
    { time: "12:00", value: 210 },
    { time: "16:00", value: 165 },
    { time: "20:00", value: 140 },
    { time: "24:00", value: 110 }
  ];

  const requestVolumeData = [
    { time: "00:00", value: 45 },
    { time: "04:00", value: 12 },
    { time: "08:00", value: 89 },
    { time: "12:00", value: 156 },
    { time: "16:00", value: 134 },
    { time: "20:00", value: 98 },
    { time: "24:00", value: 67 }
  ];

  const errorRateData = [
    { time: "00:00", value: 2.1 },
    { time: "04:00", value: 0.8 },
    { time: "08:00", value: 1.5 },
    { time: "12:00", value: 3.2 },
    { time: "16:00", value: 2.8 },
    { time: "20:00", value: 1.9 },
    { time: "24:00", value: 1.2 }
  ];

  const providerMetrics = [
    { name: "OpenAI GPT-4", requests: 2400, avgLatency: 145, errorRate: 0.08, cost: "$48.50" },
    { name: "Anthropic Claude", requests: 1800, avgLatency: 89, errorRate: 0.00, cost: "$36.20" },
    { name: "Google Gemini", requests: 890, avgLatency: 210, errorRate: 1.68, cost: "$12.40" },
    { name: "Cohere Command", requests: 0, avgLatency: 0, errorRate: 100, cost: "$0.00" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Analytics & Performance</h1>
              <p className="text-muted-foreground">Monitor API performance, costs, and usage patterns across all providers</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Last 24h
              </Button>
              <Button variant="cyber" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Requests</p>
                <p className="text-2xl font-bold text-foreground">5,090</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-success" />
                  <span className="text-xs text-success">+12.5%</span>
                </div>
              </div>
              <div className="w-10 h-10 bg-gradient-cyber rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-foreground" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Avg Response Time</p>
                <p className="text-2xl font-bold text-foreground">156ms</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-success" />
                  <span className="text-xs text-success">-8.2%</span>
                </div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/40 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Error Rate</p>
                <p className="text-2xl font-bold text-foreground">1.8%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-error" />
                  <span className="text-xs text-error">+0.3%</span>
                </div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-error/20 to-error/40 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-error" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Cost</p>
                <p className="text-2xl font-bold text-foreground">$97.10</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-warning" />
                  <span className="text-xs text-warning">+5.7%</span>
                </div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-warning/20 to-warning/40 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-warning" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <MetricsChart
            title="Response Time Trends"
            subtitle="Average response time over the last 24 hours"
            data={responseTimeData}
            dataKey="value"
            type="area"
            color="hsl(200, 98%, 60%)"
            height={300}
          />
          
          <MetricsChart
            title="Request Volume"
            subtitle="API calls per hour"
            data={requestVolumeData}
            dataKey="value"
            type="line"
            color="hsl(142, 76%, 36%)"
            height={300}
          />
        </div>

        <div className="mb-8">
          <MetricsChart
            title="Error Rate Analysis"
            subtitle="Error percentage across all providers"
            data={errorRateData}
            dataKey="value"
            type="area"
            color="hsl(0, 84%, 60%)"
            height={250}
          />
        </div>

        {/* Provider Performance Table */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Provider Performance Breakdown</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Provider</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Requests</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Avg Latency</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Error Rate</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Cost</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {providerMetrics.map((provider, index) => (
                  <tr key={index} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="py-4 px-4">
                      <span className="font-medium text-foreground">{provider.name}</span>
                    </td>
                    <td className="py-4 px-4 text-foreground">{provider.requests.toLocaleString()}</td>
                    <td className="py-4 px-4 text-foreground">{provider.avgLatency}ms</td>
                    <td className="py-4 px-4">
                      <span className={`font-semibold ${provider.errorRate > 5 ? 'text-error' : provider.errorRate > 1 ? 'text-warning' : 'text-success'}`}>
                        {provider.errorRate.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-foreground">{provider.cost}</td>
                    <td className="py-4 px-4">
                      <Badge variant={provider.errorRate === 100 ? "destructive" : provider.errorRate > 5 ? "secondary" : "default"}>
                        {provider.errorRate === 100 ? "Offline" : provider.errorRate > 5 ? "Degraded" : "Healthy"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Analytics;