import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Wifi,
  WifiOff,
  Activity,
  Shield,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  TrendingUp,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface HealthUpdate {
  type: string;
  timestamp: number;
  providers: number;
  recentChecks: any[];
}

interface SelfHealingEvent {
  type: 'circuit_breaker' | 'retry' | 'failover' | 'anomaly' | 'recovery';
  providerId?: string;
  providerName?: string;
  action: string;
  status: 'in_progress' | 'success' | 'failed';
  timestamp: number;
  details?: any;
}

interface SelfHealingStats {
  totalActions: number;
  resolvedActions: number;
  criticalActions: number;
  totalFailovers: number;
  successfulFailovers: number;
  totalAnomalies: number;
  resolvedAnomalies: number;
  averageRecoveryTime: number;
}

const RealTimeStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const [selfHealingEvents, setSelfHealingEvents] = useState<SelfHealingEvent[]>([]);
  const [selfHealingStats, setSelfHealingStats] = useState<SelfHealingStats | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [activeRecoveries, setActiveRecoveries] = useState<Map<string, SelfHealingEvent>>(new Map());
  const { user } = useUser();
  const { getToken } = useAuth();
  const { toast } = useToast();

  const handleSelfHealingEvent = (event: SelfHealingEvent) => {
    // Add to events list
    setSelfHealingEvents(prev => [event, ...prev.slice(0, 9)]); // Keep last 10 events

    // Track active recoveries
    if (event.status === 'in_progress') {
      setActiveRecoveries(prev => new Map(prev.set(event.providerId || 'system', event)));
    } else if (event.status === 'success' || event.status === 'failed') {
      setActiveRecoveries(prev => {
        const newMap = new Map(prev);
        newMap.delete(event.providerId || 'system');
        return newMap;
      });
    }

    // Show appropriate toast notifications
    if (event.type === 'circuit_breaker' && event.action.includes('OPENED')) {
      toast({
        title: "Circuit Breaker Activated",
        description: `${event.providerName || 'Provider'} temporarily isolated due to failures`,
        variant: "destructive",
      });
    } else if (event.type === 'failover' && event.status === 'success') {
      toast({
        title: "Automatic Failover",
        description: `Successfully switched to backup provider: ${event.providerName}`,
      });
    } else if (event.type === 'recovery' && event.status === 'success') {
      toast({
        title: "Self-Healing Success",
        description: `${event.providerName || 'System'} has been automatically restored`,
      });
    } else if (event.type === 'anomaly') {
      toast({
        title: "Anomaly Detected",
        description: `Unusual behavior detected in ${event.providerName || 'system'}`,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    const connectToStream = async () => {
      try {
        // Get auth token
        const token = await getToken();
        if (!token) {
          console.warn("No auth token available for real-time monitoring");
          return;
        }

        // Only connect in production or if the backend is running
        const backendUrl =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:3004";
        const streamUrl = `${backendUrl}/api/monitoring/stream/${user.id}?token=${encodeURIComponent(token)}`;

        console.log("Attempting to connect to real-time monitoring:", streamUrl);

        const source = new EventSource(streamUrl);

        source.onopen = () => {
          console.log("Real-time monitoring connected");
          setIsConnected(true);
          setLastUpdate(new Date());
        };

        source.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("Received update:", data);

            if (data.type === "health_update") {
              setLastUpdate(new Date());

              // Show toast for critical updates
              const criticalChecks = data.recentChecks?.filter(
                (check) => !check.isHealthy
              );
              if (criticalChecks && criticalChecks.length > 0) {
                toast({
                  title: `${criticalChecks.length} provider(s) experiencing issues`,
                  description: "Check your providers page for details",
                  variant: "destructive",
                });
              }
            } else if (data.type === "self_healing_event") {
              // Handle self-healing events
              const event: SelfHealingEvent = data.event;
              handleSelfHealingEvent(event);
            } else if (data.type === "self_healing_stats") {
              setSelfHealingStats(data.stats);
            } else if (data.type === "connected") {
              console.log("Stream connection confirmed");
            }
          } catch (error) {
            console.error("Failed to parse SSE data:", error);
          }
        };

        source.onerror = (error) => {
          console.warn("Real-time monitoring connection error:", error);
          setIsConnected(false);
          // Don't show error toast for connection issues to avoid spam
        };

        setEventSource(source);

        // Cleanup on unmount
        return () => {
          console.log("Cleaning up real-time monitoring connection");
          source.close();
          setEventSource(null);
          setIsConnected(false);
        };
      } catch (error) {
        console.error("Failed to connect to real-time monitoring:", error);
        setIsConnected(false);
      }
    };

    connectToStream();
  }, [user?.id, getToken, toast]);

  // Don't render if we don't have a user or if the feature is disabled
  if (!user?.id) return null;

  const hasActiveRecoveries = activeRecoveries.size > 0;
  const hasRecentEvents = selfHealingEvents.length > 0;

  return (
    <div className="flex items-center gap-2">
      {/* Main Status Badge */}
      <Badge
        variant="outline"
        className={`gap-1 ${isConnected
          ? "border-success/30 text-success bg-success/10"
          : "border-muted-foreground/30 text-muted-foreground bg-muted/10"
          }`}
      >
        {isConnected ? (
          <Wifi className="w-3 h-3" />
        ) : (
          <WifiOff className="w-3 h-3" />
        )}
        {isConnected ? "Live" : "Offline"}
      </Badge>

      {/* Self-Healing Status */}
      {hasActiveRecoveries && (
        <Badge variant="outline" className="gap-1 border-orange-300 text-orange-600 bg-orange-50">
          <RefreshCw className="w-3 h-3 animate-spin" />
          Healing ({activeRecoveries.size})
        </Badge>
      )}

      {/* Self-Healing Stats */}
      {selfHealingStats && (
        <Badge
          variant="outline"
          className="gap-1 border-blue-300 text-blue-600 bg-blue-50 cursor-pointer"
          onClick={() => setShowDetails(!showDetails)}
        >
          <Shield className="w-3 h-3" />
          {selfHealingStats.resolvedActions}/{selfHealingStats.totalActions}
          {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </Badge>
      )}

      {lastUpdate && (
        <span className="text-xs text-muted-foreground">
          Last: {lastUpdate.toLocaleTimeString()}
        </span>
      )}

      {/* Detailed Self-Healing Panel */}
      {showDetails && (selfHealingStats || hasRecentEvents) && (
        <Card className="absolute top-full right-0 mt-2 w-80 z-50 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Self-Healing Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Active Recoveries */}
            {hasActiveRecoveries && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2">Active Recoveries</h4>
                <div className="space-y-1">
                  {Array.from(activeRecoveries.values()).map((recovery, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <RefreshCw className="w-3 h-3 animate-spin text-orange-500" />
                      <span className="flex-1">{recovery.action}</span>
                      <Badge variant="secondary" className="text-xs">
                        {recovery.providerName || 'System'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats Summary */}
            {selfHealingStats && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2">24h Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>{selfHealingStats.resolvedActions} Resolved</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-orange-500" />
                    <span>{selfHealingStats.criticalActions} Critical</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-blue-500" />
                    <span>{selfHealingStats.successfulFailovers} Failovers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-purple-500" />
                    <span>{Math.round(selfHealingStats.averageRecoveryTime / 1000)}s Avg</span>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Events */}
            {hasRecentEvents && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2">Recent Events</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {selfHealingEvents.slice(0, 5).map((event, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      {event.type === 'circuit_breaker' && <Shield className="w-3 h-3 text-red-500" />}
                      {event.type === 'retry' && <RefreshCw className="w-3 h-3 text-orange-500" />}
                      {event.type === 'failover' && <TrendingUp className="w-3 h-3 text-blue-500" />}
                      {event.type === 'recovery' && <CheckCircle className="w-3 h-3 text-green-500" />}
                      {event.type === 'anomaly' && <AlertTriangle className="w-3 h-3 text-yellow-500" />}

                      <span className="flex-1 truncate">{event.action}</span>

                      {event.status === 'success' && <CheckCircle className="w-3 h-3 text-green-500" />}
                      {event.status === 'failed' && <XCircle className="w-3 h-3 text-red-500" />}
                      {event.status === 'in_progress' && <RefreshCw className="w-3 h-3 animate-spin text-orange-500" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RealTimeStatus;
