import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Wifi, WifiOff, Activity } from "lucide-react";

interface HealthUpdate {
  type: string;
  timestamp: number;
  providers: number;
  recentChecks: any[];
}

const RealTimeStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const { user } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    if (!user?.id) return;

    // Only connect in production or if the backend is running
    const backendUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3004";
    const streamUrl = `${backendUrl}/api/monitoring/stream/${user.id}`;

    console.log("Attempting to connect to real-time monitoring:", streamUrl);

    const source = new EventSource(streamUrl, {
      // Note: EventSource doesn't support custom headers for auth
      // We'd need to implement this differently for production
    });

    source.onopen = () => {
      console.log("Real-time monitoring connected");
      setIsConnected(true);
      setLastUpdate(new Date());
    };

    source.onmessage = (event) => {
      try {
        const data: HealthUpdate = JSON.parse(event.data);
        console.log("Received health update:", data);

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
  }, [user?.id, toast]);

  // Don't render if we don't have a user or if the feature is disabled
  if (!user?.id) return null;

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant="outline"
        className={`gap-1 ${
          isConnected
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

      {lastUpdate && (
        <span className="text-xs text-muted-foreground">
          Last: {lastUpdate.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

export default RealTimeStatus;
