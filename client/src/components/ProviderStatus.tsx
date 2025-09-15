import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProviderWithMetrics, useProviders } from "@/hooks/useProviders";
import AddProviderDialog from "./AddProviderDialog";
import { useToast } from "@/hooks/use-toast";
import {
  Circle,
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  TestTube,
  Globe,
  RefreshCw,
} from "lucide-react";

const PROVIDER_TYPES = [
  { value: "payment", label: "Payment", color: "bg-success" },
  { value: "ai", label: "AI", color: "bg-primary" },
  { value: "sms", label: "SMS", color: "bg-warning" },
  { value: "email", label: "Email", color: "bg-accent" },
  { value: "storage", label: "Storage", color: "bg-secondary" },
  { value: "auth", label: "Authentication", color: "bg-error" },
  { value: "video", label: "Video", color: "bg-success" },
  { value: "realtime", label: "Realtime", color: "bg-primary" },
  { value: "maps", label: "Maps", color: "bg-warning" },
  { value: "analytics", label: "Analytics", color: "bg-accent" },
  { value: "monitoring", label: "Monitoring", color: "bg-secondary" },
];

interface ProviderStatusProps {
  providers?: ProviderWithMetrics[];
}

const ProviderStatus = ({ providers = [] }: ProviderStatusProps) => {
  const [selectedProvider, setSelectedProvider] =
    useState<ProviderWithMetrics | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { deleteProvider, refreshFromBackend } = useProviders();
  const { toast } = useToast();
  // Helper function to determine status from provider data
  const getProviderStatus = (
    provider: ProviderWithMetrics
  ): "healthy" | "degraded" | "down" => {
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

  const handleDeleteProvider = async () => {
    if (!selectedProvider) return;

    setIsDeleting(true);
    try {
      await deleteProvider(selectedProvider._id!);
      toast({
        title: "Provider Deleted",
        description: `${selectedProvider.name} has been removed successfully.`,
      });
      setIsDeleteDialogOpen(false);
      setSelectedProvider(null);
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete provider. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const testProviderConnection = async (provider: ProviderWithMetrics) => {
    try {
      const response = await fetch(provider.endpoint, {
        method: "GET",
        mode: "no-cors",
        cache: "no-cache",
      });

      toast({
        title: "Connection Test",
        description: `${provider.name} endpoint is reachable.`,
      });
    } catch (error) {
      toast({
        title: "Connection Test Failed",
        description: `${provider.name} endpoint is not reachable.`,
        variant: "destructive",
      });
    }
  };

  const refreshData = async () => {
    try {
      await refreshFromBackend();
      toast({
        title: "Data Refreshed",
        description: "Provider status has been updated.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh provider data.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              API Providers
            </h2>
            <p className="text-sm text-muted-foreground">
              {providers.length === 0
                ? "No providers configured"
                : `Monitor ${providers.length} connected services`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <AddProviderDialog>
              <Button variant="cyber" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Provider
              </Button>
            </AddProviderDialog>
          </div>
        </div>

        <div className="space-y-4">
          {providers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">
                No API providers configured
              </h3>
              <p className="text-sm mb-4">
                Add your first API provider to start monitoring.
              </p>
              <AddProviderDialog>
                <Button variant="cyber" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Your First Provider
                </Button>
              </AddProviderDialog>
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
                          <span className="font-medium text-foreground">
                            {provider.name}
                          </span>
                          {provider.isPrimary && (
                            <Badge variant="outline" className="text-xs">
                              Primary
                            </Badge>
                          )}
                          <Badge
                            className={`${PROVIDER_TYPES.find((t) => t.value === provider.type)?.color || "bg-muted"} text-white text-xs`}
                          >
                            {provider.type}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <Globe className="w-3 h-3" />
                          <span className="font-mono">{provider.endpoint}</span>
                          <Circle className="w-1 h-1 fill-current" />
                          <span>
                            Last check: {formatLastCheck(provider.lastCheck)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground">
                        {status === "down" ? "—" : `${provider.latency}ms`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Response Time
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground">
                        {provider.uptime?.toFixed(1) || "—"}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Uptime (24h)
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground">
                        {provider.successRate?.toFixed(1) || "—"}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Success Rate
                      </div>
                    </div>

                    <Badge className={`${getStatusColor(status)} border`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-popover border-border"
                      >
                        <DropdownMenuItem
                          onClick={() => testProviderConnection(provider)}
                          className="cursor-pointer"
                        >
                          <TestTube className="w-4 h-4 mr-2" />
                          Test Connection
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedProvider(provider);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="cursor-pointer text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Delete Provider
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-foreground">
              Are you sure you want to delete{" "}
              <strong>{selectedProvider?.name}</strong>?
            </p>
            <p className="text-sm text-muted-foreground">
              This will stop monitoring this API provider and remove all
              associated data. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setSelectedProvider(null);
                }}
                className="border-border text-foreground hover:bg-accent"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteProvider}
                disabled={isDeleting}
                className="gap-2"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Provider
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProviderStatus;
