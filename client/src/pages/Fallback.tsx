import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Wifi, Database, Mail, ShieldCheck, ShieldAlert } from "lucide-react";

const fallbackScenarios = [
    {
        id: 1,
        name: "Payment Gateway",
        primary: { name: "Stripe", status: "degraded", icon: <Zap className="w-5 h-5" /> },
        fallback: { name: "PayPal", status: "operational", icon: <Zap className="w-5 h-5" /> },
        activeSystem: "fallback",
        trigger: "API error rate > 5% for 3 mins",
        details: "Stripe API is experiencing high latency and timeout rates. System has automatically rerouted all payment processing to PayPal to ensure service continuity. No customer impact detected.",
        lastSwitch: "2 minutes ago",
    },
    {
        id: 2,
        name: "CDN Service",
        primary: { name: "Cloudflare", status: "operational", icon: <Wifi className="w-5 h-5" /> },
        fallback: { name: "Fastly", status: "standby", icon: <Wifi className="w-5 h-5" /> },
        activeSystem: "primary",
        trigger: "Origin connection timeouts > 1%",
        details: "Cloudflare is operating normally. Fastly is on standby, ready to take over traffic if significant routing or origin connection issues are detected.",
        lastSwitch: "3 days ago",
    },
    {
        id: 3,
        name: "Primary Database",
        primary: { name: "PostgreSQL (US-East-1)", status: "operational", icon: <Database className="w-5 h-5" /> },
        fallback: { name: "Read Replica (US-West-1)", status: "standby", icon: <Database className="w-5 h-5" /> },
        activeSystem: "primary",
        trigger: "Replication lag > 60 seconds",
        details: "Primary database is healthy. All read/write operations are directed to the main cluster. The read replica is in sync and available for immediate failover.",
        lastSwitch: "1 month ago",
    },
    {
        id: 4,
        name: "Email Delivery",
        primary: { name: "SendGrid", status: "operational", icon: <Mail className="w-5 h-5" /> },
        fallback: { name: "Mailgun", status: "standby", icon: <Mail className="w-5 h-5" /> },
        activeSystem: "primary",
        trigger: "Delivery rate < 95% for 10 mins",
        details: "SendGrid is processing all transactional emails. Mailgun is configured and ready as a backup to handle email delivery if the primary service's success rate drops.",
        lastSwitch: "2 weeks ago",
    },
];

const FallbackCard = ({ scenario }) => {
    const isFallbackActive = scenario.activeSystem === 'fallback';

    return (
        <Card className="p-6 bg-card/50 backdrop-blur-sm">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-foreground mb-1">{scenario.name}</h3>
                    <p className="text-sm text-muted-foreground">Trigger: {scenario.trigger}</p>
                </div>
                <Badge className={`${isFallbackActive ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'} flex items-center gap-1`}>
                    {isFallbackActive ? <ShieldAlert className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                    {isFallbackActive ? 'Fallback Active' : 'Primary Active'}
                </Badge>
            </div>

            <div className="flex items-center justify-between gap-4 mb-4">
                {/* Primary System */}
                <div className={`flex-1 p-4 rounded-lg border ${!isFallbackActive ? 'border-primary/50 bg-primary/10' : 'border-border'}`}>
                    <div className="flex items-center gap-3">
                        {scenario.primary.icon}
                        <div>
                            <p className="text-sm font-semibold">{scenario.primary.name}</p>
                            <p className={`text-xs font-mono uppercase ${scenario.primary.status === 'operational' ? 'text-green-400' : 'text-red-400'}`}>{scenario.primary.status}</p>
                        </div>
                    </div>
                </div>

                <ArrowRight className={`w-6 h-6 transition-transform duration-300 ${isFallbackActive ? 'text-primary scale-125' : 'text-muted-foreground'}`} />

                {/* Fallback System */}
                <div className={`flex-1 p-4 rounded-lg border ${isFallbackActive ? 'border-primary/50 bg-primary/10' : 'border-border'}`}>
                    <div className="flex items-center gap-3">
                        {scenario.fallback.icon}
                        <div>
                            <p className="text-sm font-semibold">{scenario.fallback.name}</p>
                            <p className={`text-xs font-mono uppercase ${scenario.fallback.status === 'operational' ? 'text-green-400' : 'text-yellow-400'}`}>{scenario.fallback.status}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Status Details</h4>
                <p className="text-sm text-muted-foreground mb-3">{scenario.details}</p>
                <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Last Switch: {scenario.lastSwitch}</p>
                    <Button variant="outline" size="sm">View Logs</Button>
                </div>
            </div>
        </Card>
    );
};

const Fallback = () => {
    return (
        <div className="min-h-screen bg-background">
            <Navigation />

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">System Fallback Mechanisms</h1>
                    <p className="text-muted-foreground">Automated failover strategies to ensure high availability and service resilience.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {fallbackScenarios.map((scenario) => (
                        <FallbackCard key={scenario.id} scenario={scenario} />
                    ))}
                </div>
            </main>
        </div>
    );
};

export default Fallback;
