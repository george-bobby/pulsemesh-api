import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Zap,
  AlertTriangle,
  PlayCircle,
  Settings,
  RotateCcw
} from "lucide-react";

interface CircuitBreaker {
  id: string;
  provider: string;
  state: "closed" | "open" | "half-open";
  failureCount: number;
  threshold: number;
  timeout: number;
  lastFailure?: string;
  nextAttempt?: string;
}

const CircuitBreakerPanel = () => {
  const [circuitBreakers, setCircuitBreakers] = useState<CircuitBreaker[]>([
    {
      id: "stripe-cb",
      provider: "Stripe",
      state: "closed",
      failureCount: 0,
      threshold: 5,
      timeout: 60000
    },
    {
      id: "paypal-cb",
      provider: "PayPal",
      state: "half-open",
      failureCount: 3,
      threshold: 5,
      timeout: 60000,
      lastFailure: "2 min ago",
      nextAttempt: "30s"
    },
    {
      id: "twilio-cb",
      provider: "Twilio",
      state: "open",
      failureCount: 8,
      threshold: 5,
      timeout: 300000,
      lastFailure: "15 min ago",
      nextAttempt: "4m 30s"
    }
  ]);

  const getStateColor = (state: CircuitBreaker["state"]) => {
    switch (state) {
      case "closed":
        return "bg-success/20 text-success border-success/30";
      case "half-open":
        return "bg-warning/20 text-warning border-warning/30";
      case "open":
        return "bg-error/20 text-error border-error/30";
    }
  };

  const getStateIcon = (state: CircuitBreaker["state"]) => {
    switch (state) {
      case "closed":
        return <Activity className="w-4 h-4 text-success" />;
      case "half-open":
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case "open":
        return <Zap className="w-4 h-4 text-error" />;
    }
  };

  const resetCircuitBreaker = (id: string) => {
    setCircuitBreakers(prev =>
      prev.map(cb =>
        cb.id === id
          ? { ...cb, state: "closed", failureCount: 0, lastFailure: undefined, nextAttempt: undefined }
          : cb
      )
    );
  };

  const testFailover = async (provider: string) => {
    // Simulate failover test
    console.log(`Testing failover for ${provider}...`);
    // Add visual feedback here
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Circuit Breakers</h2>
          <p className="text-sm text-muted-foreground">
            Monitor and control API circuit breaker states
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Configure
        </Button>
      </div>

      <div className="space-y-4">
        {circuitBreakers.map((cb) => (
          <div
            key={cb.id}
            className="p-4 rounded-lg border border-border hover:bg-secondary/30 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {getStateIcon(cb.state)}
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-foreground">{cb.provider}</span>
                    <Badge className={`${getStateColor(cb.state)} border text-xs`}>
                      {cb.state.replace("-", " ").toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Failures: {cb.failureCount}/{cb.threshold} • Timeout: {cb.timeout / 1000}s
                  </div>
                  {cb.lastFailure && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Last failure: {cb.lastFailure}
                      {cb.nextAttempt && ` • Next attempt: ${cb.nextAttempt}`}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testFailover(cb.provider)}
                >
                  <PlayCircle className="w-3 h-3 mr-1" />
                  Test
                </Button>

                {cb.state !== "closed" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => resetCircuitBreaker(cb.id)}
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Reset
                  </Button>
                )}
              </div>
            </div>

            {/* Circuit Breaker Visual */}
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Circuit State</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${cb.state === "closed" ? "bg-success" :
                    cb.state === "half-open" ? "bg-warning" : "bg-error"
                    }`} />
                  <span className="text-muted-foreground">
                    {cb.state === "closed" ? "Traffic flowing" :
                      cb.state === "half-open" ? "Testing recovery" : "Traffic blocked"}
                  </span>
                </div>
              </div>

              <div className="mt-2 bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${cb.state === "closed" ? "bg-success" :
                    cb.state === "half-open" ? "bg-warning" : "bg-error"
                    }`}
                  style={{ width: `${Math.min((cb.failureCount / cb.threshold) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default CircuitBreakerPanel;