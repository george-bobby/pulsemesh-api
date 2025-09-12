import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProviderWithMetrics } from "@/hooks/useProviders";
import {
  Circle,
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from "lucide-react";

interface ProviderStatusProps {
  providers?: ProviderWithMetrics[];
}

const ProviderStatus = ({ providers = [] }: ProviderStatusProps) => {
  // Helper function to determine status from provider data
  const getProviderStatus = (provider: ProviderWithMetrics): "healthy" | "degraded" | "down" => {
    if (!provider.isHealthy) return "down";
    if (provider.errorRate > 5 || provider.latency > 500) return "degraded";
    return "healthy";
  };

  // Helper function to format last check time
  const formatLastCheck = (lastCheck: string): string => {
    try {
      const date = new Date(lastCheck);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins} min ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString();
    } catch {
      return lastCheck;
    }
  };

  const getStatusIcon = (status: "healthy" | "degraded" | "down") => {
    switch (status) {
      case "healthy":
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case "degraded":
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case "down":
        return <XCircle className="w-4 h-4 text-error" />;
    }
  };

  const getStatusColor = (status: "healthy" | "degraded" | "down") => {
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
          <p className="text-sm text-muted-foreground">
            {providers.length === 0 ? "No providers configured" : `Monitor ${providers.length} connected services`}
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Manage
        </Button>
      </div>

      <div className="space-y-4">
        {providers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No API providers configured yet.</p>
            <p className="text-sm">Add providers to start monitoring.</p>
          </div>
        ) : (
          providers.map((provider) => {
            const status = getProviderStatus(provider);
            return (
              <div
                key={provider._id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(status)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-foreground">{provider.name}</span>
                        {provider.isPrimary && (
                          <Badge variant="outline" className="text-xs">Primary</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span className="capitalize">{provider.type}</span>
                        <Circle className="w-1 h-1 fill-current" />
                        <span>Last check: {formatLastCheck(provider.lastCheck)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">
                      {status === "down" ? "—" : `${provider.latency}ms`}
                    </div>
                    <div className="text-xs text-muted-foreground">Latency</div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">
                      {provider.uptime?.toFixed(1) || "—"}%
                    </div>
                    <div className="text-xs text-muted-foreground">Uptime (24h)</div>
                  </div>

                  <Badge className={`${getStatusColor(status)} border`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Badge>

                  <Button variant="ghost" size="icon">
                    <Activity className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};

export default ProviderStatus;