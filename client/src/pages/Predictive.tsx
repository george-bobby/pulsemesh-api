import Navigation from "@/components/Navigation";
import MetricsChart from "@/components/MetricsChart";
import StatusCard from "@/components/StatusCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Activity, LineChart, AlertTriangle, Clock, Gauge, TrendingDown, TrendingUp, Server, Zap, Users, Database, Wifi, HardDrive } from "lucide-react";

const Predictive = () => {
    const now = new Date();
    const timeLabels = Array.from({ length: 24 }, (_, i) => {
        const t = new Date(now.getTime() + i * 60 * 60 * 1000);
        return t.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    });

    // Provider data with realistic downtime predictions
    const providers = [
        {
            id: 1,
            name: "AWS US-East-1",
            type: "Cloud Provider",
            currentStatus: "operational",
            downtimeProbability: 78,
            predictedDowntime: "14:30 - 15:45",
            factors: [
                { name: "Latency Increase", severity: "high", value: "+245ms", trend: "up" },
                { name: "Error Rate", severity: "medium", value: "2.3%", trend: "up" },
                { name: "CPU Load", severity: "high", value: "89%", trend: "up" },
                { name: "Memory Usage", severity: "medium", value: "76%", trend: "up" }
            ],
            reasons: [
                "Unusual traffic spike detected (+340% from baseline)",
                "Database connection pool exhaustion imminent",
                "Auto-scaling lag behind demand curve",
                "Historical pattern: similar conditions led to outage 3/5 times"
            ],
            icon: <Server className="w-4 h-4" />
        },
        {
            id: 2,
            name: "Stripe Payment API",
            type: "Payment Service",
            currentStatus: "degraded",
            downtimeProbability: 65,
            predictedDowntime: "16:15 - 16:45",
            factors: [
                { name: "Response Time", severity: "high", value: "+1.2s", trend: "up" },
                { name: "Timeout Rate", severity: "high", value: "8.7%", trend: "up" },
                { name: "Queue Depth", severity: "medium", value: "1,247", trend: "up" },
                { name: "Success Rate", severity: "medium", value: "94.2%", trend: "down" }
            ],
            reasons: [
                "Payment processing queue backing up significantly",
                "Third-party bank API showing increased latency",
                "Webhook delivery failures increasing exponentially",
                "Similar degradation patterns preceded last 2 outages"
            ],
            icon: <Zap className="w-4 h-4" />
        },
        {
            id: 3,
            name: "MongoDB Atlas",
            type: "Database",
            currentStatus: "operational",
            downtimeProbability: 42,
            predictedDowntime: "18:00 - 18:20",
            factors: [
                { name: "Connection Count", severity: "medium", value: "847/1000", trend: "up" },
                { name: "Query Time", severity: "low", value: "+45ms", trend: "up" },
                { name: "Disk I/O", severity: "medium", value: "78%", trend: "up" },
                { name: "Replication Lag", severity: "low", value: "120ms", trend: "stable" }
            ],
            reasons: [
                "Connection pool approaching maximum capacity",
                "Large analytical queries consuming resources",
                "Index optimization needed for recent query patterns",
                "Moderate risk based on current resource utilization"
            ],
            icon: <Database className="w-4 h-4" />
        },
        {
            id: 4,
            name: "Cloudflare CDN",
            type: "CDN",
            currentStatus: "operational",
            downtimeProbability: 23,
            predictedDowntime: "Low Risk",
            factors: [
                { name: "Cache Hit Rate", severity: "low", value: "96.8%", trend: "stable" },
                { name: "Origin Load", severity: "low", value: "34%", trend: "stable" },
                { name: "Edge Latency", severity: "low", value: "12ms", trend: "stable" },
                { name: "Bandwidth Usage", severity: "low", value: "67%", trend: "up" }
            ],
            reasons: [
                "All metrics within normal operational ranges",
                "Strong cache performance reducing origin load",
                "No concerning patterns in recent data",
                "Historical reliability: 99.97% uptime last 30 days"
            ],
            icon: <Wifi className="w-4 h-4" />
        }
    ];

    // Global system metrics
    const systemLatency = timeLabels.map((time, idx) => {
        const base = 180 + Math.sin(idx / 3) * 40 + (idx > 12 ? (idx - 12) * 8 : 0);
        const value = Math.max(80, Math.round(base));
        return { time, value };
    });

    const errorRate = timeLabels.map((time, idx) => {
        const base = 1.2 + Math.abs(Math.sin(idx / 4)) * 1.8 + (idx > 14 ? (idx - 14) * 0.3 : 0);
        const value = Math.max(0, Number(base.toFixed(1)));
        return { time, value };
    });

    const throughput = timeLabels.map((time, idx) => {
        const base = 1200 + Math.cos(idx / 2) * 200 + (idx > 10 ? (idx - 10) * 15 : 0);
        const value = Math.max(500, Math.round(base));
        return { time, value };
    });

    const resourceUtilization = timeLabels.map((time, idx) => {
        const base = 65 + Math.sin(idx / 2.5) * 15 + (idx > 12 ? (idx - 12) * 1.5 : 0);
        const value = Math.max(30, Math.min(100, Math.round(base)));
        return { time, value };
    });

    // Overall system health KPIs
    const kpis = {
        predictedUptime: 97.2,
        avgDowntimeProbability: 52,
        criticalProviders: 2,
        systemHealthScore: 73,
    };

    return (
        <div className="min-h-screen bg-background">
            <Navigation />

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">Predictive Monitoring</h1>
                        <p className="text-muted-foreground">AI-powered infrastructure monitoring with real-time downtime predictions and risk analysis</p>
                        <div className="flex items-center gap-4 mt-3">
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                2 High Risk Providers
                            </Badge>
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Next Incident: ~2.5h
                            </Badge>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge className="bg-primary/20 text-primary border-primary/30 flex items-center gap-1">
                            <Brain className="w-3 h-3" />
                            ML Engine: Active
                        </Badge>
                        <Button variant="cyber" size="sm">Run Scenario Analysis</Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatusCard
                        title="System Uptime"
                        value={`${kpis.predictedUptime}%`}
                        subtitle="Next 24h forecast"
                        status={kpis.predictedUptime >= 99 ? "success" : kpis.predictedUptime >= 97 ? "warning" : "error"}
                        trend="down"
                        trendValue="-1.8%"
                        icon={<Activity className="w-4 h-4" />}
                    />

                    <StatusCard
                        title="Avg Downtime Risk"
                        value={`${kpis.avgDowntimeProbability}%`}
                        subtitle="Across all providers"
                        status={kpis.avgDowntimeProbability < 30 ? "success" : kpis.avgDowntimeProbability < 60 ? "warning" : "error"}
                        trend="up"
                        trendValue="+12%"
                        icon={<AlertTriangle className="w-4 h-4" />}
                    />

                    <StatusCard
                        title="Critical Providers"
                        value={`${kpis.criticalProviders}`}
                        subtitle="High risk of failure"
                        status={kpis.criticalProviders === 0 ? "success" : kpis.criticalProviders <= 2 ? "warning" : "error"}
                        trend="up"
                        trendValue="+1"
                        icon={<Server className="w-4 h-4" />}
                    />

                    <StatusCard
                        title="Health Score"
                        value={`${kpis.systemHealthScore}/100`}
                        subtitle="Overall system health"
                        status={kpis.systemHealthScore >= 80 ? "success" : kpis.systemHealthScore >= 60 ? "warning" : "error"}
                        trend="down"
                        trendValue="-7 pts"
                        icon={<Gauge className="w-4 h-4" />}
                    />
                </div>

                {/* Provider Risk Analysis */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-foreground mb-4">Provider Risk Analysis</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {providers.map((provider) => (
                            <Card key={provider.id} className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${provider.downtimeProbability >= 70 ? 'bg-red-500/20 text-red-400' :
                                            provider.downtimeProbability >= 40 ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-green-500/20 text-green-400'
                                            }`}>
                                            {provider.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground">{provider.name}</h3>
                                            <p className="text-sm text-muted-foreground">{provider.type}</p>
                                        </div>
                                    </div>
                                    <Badge className={`${provider.currentStatus === 'operational' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                        provider.currentStatus === 'degraded' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                            'bg-red-500/20 text-red-400 border-red-500/30'
                                        }`}>
                                        {provider.currentStatus}
                                    </Badge>
                                </div>

                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">Downtime Probability</span>
                                        <span className={`text-sm font-bold ${provider.downtimeProbability >= 70 ? 'text-red-400' :
                                            provider.downtimeProbability >= 40 ? 'text-yellow-400' :
                                                'text-green-400'
                                            }`}>
                                            {provider.downtimeProbability}%
                                        </span>
                                    </div>
                                    <Progress
                                        value={provider.downtimeProbability}
                                        className={`h-2 ${provider.downtimeProbability >= 70 ? '[&>div]:bg-red-500' :
                                            provider.downtimeProbability >= 40 ? '[&>div]:bg-yellow-500' :
                                                '[&>div]:bg-green-500'
                                            }`}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Predicted window: {provider.predictedDowntime}
                                    </p>
                                </div>

                                <div className="space-y-3 mb-4">
                                    <h4 className="text-sm font-medium text-foreground">Contributing Factors</h4>
                                    {provider.factors.map((factor, idx) => (
                                        <div key={idx} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${factor.severity === 'high' ? 'bg-red-500' :
                                                    factor.severity === 'medium' ? 'bg-yellow-500' :
                                                        'bg-green-500'
                                                    }`} />
                                                <span className="text-sm">{factor.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="text-sm font-mono">{factor.value}</span>
                                                {factor.trend === 'up' ? (
                                                    <TrendingUp className="w-3 h-3 text-red-400" />
                                                ) : factor.trend === 'down' ? (
                                                    <TrendingDown className="w-3 h-3 text-green-400" />
                                                ) : (
                                                    <div className="w-3 h-3" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-foreground">Risk Analysis</h4>
                                    <ul className="space-y-1">
                                        {provider.reasons.map((reason, idx) => (
                                            <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                                                <span className="text-primary mt-1">•</span>
                                                <span>{reason}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* System Metrics Charts */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-foreground mb-4">System Performance Trends</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <MetricsChart
                            title="Response Time Forecast"
                            subtitle="Average latency trending upward"
                            data={systemLatency}
                            dataKey="value"
                            type="area"
                            color="hsl(0, 84%, 60%)"
                            height={260}
                        />

                        <MetricsChart
                            title="Error Rate Projection"
                            subtitle="Increasing failure rate detected"
                            data={errorRate}
                            dataKey="value"
                            type="line"
                            color="hsl(25, 95%, 53%)"
                            height={260}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <MetricsChart
                            title="Throughput Analysis"
                            subtitle="Request volume vs capacity"
                            data={throughput}
                            dataKey="value"
                            type="area"
                            color="hsl(200, 98%, 60%)"
                            height={240}
                        />

                        <MetricsChart
                            title="Resource Utilization"
                            subtitle="CPU/Memory usage trending high"
                            data={resourceUtilization}
                            dataKey="value"
                            type="line"
                            color="hsl(280, 100%, 70%)"
                            height={240}
                        />
                    </div>
                </div>

                {/* Incident Prediction Summary */}
                <div className="mt-8">
                    <Card className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Brain className="w-5 h-5 text-primary" />
                            <h2 className="text-lg font-semibold text-foreground">AI Incident Prediction Summary</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-400 mb-1">2.5 hours</div>
                                <div className="text-sm text-muted-foreground">Until next predicted incident</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-400 mb-1">78%</div>
                                <div className="text-sm text-muted-foreground">Highest provider risk (AWS)</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-400 mb-1">4</div>
                                <div className="text-sm text-muted-foreground">Providers monitored</div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-medium text-foreground">Key Risk Indicators</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-red-400" />
                                        <span>AWS showing critical load patterns</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                                        <span>Stripe payment processing degraded</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-red-400" />
                                        <span>System latency increasing 15% hourly</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-yellow-400" />
                                        <span>Traffic 340% above baseline</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                            <h4 className="font-medium text-foreground mb-2">Recommended Actions</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                <li>• Scale AWS instances preemptively before 14:30</li>
                                <li>• Enable Stripe fallback payment processor</li>
                                <li>• Increase MongoDB connection pool limits</li>
                                <li>• Alert on-call team about impending high-risk window</li>
                            </ul>
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default Predictive;


