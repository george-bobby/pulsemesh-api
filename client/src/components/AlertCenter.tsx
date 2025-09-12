import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProviderWithMetrics } from "@/hooks/useProviders";
import {
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  X
} from "lucide-react";

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: "critical" | "warning" | "info";
  timestamp: string;
  provider: string;
  resolved?: boolean;
}

interface AlertCenterProps {
  providers?: ProviderWithMetrics[];
}

const AlertCenter = ({ providers = [] }: AlertCenterProps) => {
  // Generate alerts from real provider data
  const alerts: Alert[] = providers.flatMap((provider) => {
    const alerts: Alert[] = [];

    // Critical: Provider is down
    if (!provider.isHealthy) {
      alerts.push({
        id: `${provider._id}-down`,
        title: `${provider.name} Service Down`,
        message: `API endpoint is not responding. Last check: ${new Date(provider.lastCheck).toLocaleTimeString()}`,
        severity: "critical",
        timestamp: getTimeAgo(provider.lastCheck),
        provider: provider.name
      });
    }

    // Warning: High latency
    if (provider.isHealthy && provider.latency > 500) {
      alerts.push({
        id: `${provider._id}-latency`,
        title: `${provider.name} High Latency`,
        message: `Response time is ${provider.latency}ms (above 500ms threshold)`,
        severity: "warning",
        timestamp: getTimeAgo(provider.lastCheck),
        provider: provider.name
      });
    }

    // Warning: High error rate
    if (provider.isHealthy && provider.errorRate > 5) {
      alerts.push({
        id: `${provider._id}-errors`,
        title: `${provider.name} High Error Rate`,
        message: `Error rate is ${provider.errorRate.toFixed(1)}% (above 5% threshold)`,
        severity: "warning",
        timestamp: getTimeAgo(provider.lastCheck),
        provider: provider.name
      });
    }

    return alerts;
  });

  const getTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getSeverityIcon = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical":
        return <XCircle className="w-4 h-4 text-error" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case "info":
        return <CheckCircle2 className="w-4 h-4 text-primary" />;
    }
  };

  const getSeverityColor = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical":
        return "bg-error/20 text-error border-error/30";
      case "warning":
        return "bg-warning/20 text-warning border-warning/30";
      case "info":
        return "bg-primary/20 text-primary border-primary/30";
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Alert Center</h2>
          <p className="text-sm text-muted-foreground">
            Recent incidents and notifications
          </p>
        </div>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg border transition-colors ${alert.resolved
              ? "border-border bg-muted/30 opacity-60"
              : "border-border hover:bg-secondary/30"
              }`}
          >
            <div className="flex items-start space-x-3">
              <div className="mt-0.5">
                {alert.resolved ? (
                  <CheckCircle2 className="w-4 h-4 text-success" />
                ) : (
                  getSeverityIcon(alert.severity)
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className={`font-medium ${alert.resolved ? "text-muted-foreground" : "text-foreground"}`}>
                        {alert.title}
                      </h4>
                      {alert.resolved && (
                        <Badge variant="outline" className="text-xs bg-success/20 text-success border-success/30">
                          Resolved
                        </Badge>
                      )}
                    </div>

                    <p className={`text-sm mb-2 ${alert.resolved ? "text-muted-foreground" : "text-muted-foreground"}`}>
                      {alert.message}
                    </p>

                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{alert.timestamp}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {alert.provider}
                      </Badge>
                      {!alert.resolved && (
                        <Badge className={`${getSeverityColor(alert.severity)} border text-xs`}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default AlertCenter;