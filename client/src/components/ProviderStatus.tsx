import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Circle, 
  Settings, 
  Activity, 
  AlertTriangle,
  CheckCircle2,
  XCircle
} from "lucide-react";

interface Provider {
  id: string;
  name: string;
  type: string;
  status: "healthy" | "degraded" | "down";
  latency: number;
  uptime: number;
  lastCheck: string;
  isPrimary: boolean;
}

const ProviderStatus = () => {
  const providers: Provider[] = [
    {
      id: "stripe",
      name: "Stripe",
      type: "Payment",
      status: "healthy",
      latency: 125,
      uptime: 99.95,
      lastCheck: "2 min ago",
      isPrimary: true
    },
    {
      id: "paypal",
      name: "PayPal",
      type: "Payment",
      status: "degraded",
      latency: 380,
      uptime: 98.2,
      lastCheck: "1 min ago",
      isPrimary: false
    },
    {
      id: "square",
      name: "Square",
      type: "Payment",
      status: "healthy",
      latency: 210,
      uptime: 99.8,
      lastCheck: "3 min ago",
      isPrimary: false
    },
    {
      id: "twilio",
      name: "Twilio",
      type: "SMS",
      status: "down",
      latency: 0,
      uptime: 85.5,
      lastCheck: "15 min ago",
      isPrimary: true
    },
    {
      id: "sendgrid",
      name: "SendGrid",
      type: "Email",
      status: "healthy",
      latency: 95,
      uptime: 99.9,
      lastCheck: "1 min ago",
      isPrimary: true
    }
  ];

  const getStatusIcon = (status: Provider["status"]) => {
    switch (status) {
      case "healthy":
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case "degraded":
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case "down":
        return <XCircle className="w-4 h-4 text-error" />;
    }
  };

  const getStatusColor = (status: Provider["status"]) => {
    switch (status) {
      case "healthy":
        return "bg-success/20 text-success border-success/30";
      case "degraded":
        return "bg-warning/20 text-warning border-warning/30";
      case "down":
        return "bg-error/20 text-error border-error/30";
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">API Providers</h2>
          <p className="text-sm text-muted-foreground">Monitor all connected services</p>
        </div>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Manage
        </Button>
      </div>

      <div className="space-y-4">
        {providers.map((provider) => (
          <div 
            key={provider.id}
            className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/30 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {getStatusIcon(provider.status)}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-foreground">{provider.name}</span>
                    {provider.isPrimary && (
                      <Badge variant="outline" className="text-xs">Primary</Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span>{provider.type}</span>
                    <Circle className="w-1 h-1 fill-current" />
                    <span>Last check: {provider.lastCheck}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-sm font-medium text-foreground">
                  {provider.status === "down" ? "—" : `${provider.latency}ms`}
                </div>
                <div className="text-xs text-muted-foreground">Latency</div>
              </div>
              
              <div className="text-right">
                <div className="text-sm font-medium text-foreground">
                  {provider.uptime}%
                </div>
                <div className="text-xs text-muted-foreground">Uptime (24h)</div>
              </div>

              <Badge className={`${getStatusColor(provider.status)} border`}>
                {provider.status.charAt(0).toUpperCase() + provider.status.slice(1)}
              </Badge>

              <Button variant="ghost" size="icon">
                <Activity className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ProviderStatus;