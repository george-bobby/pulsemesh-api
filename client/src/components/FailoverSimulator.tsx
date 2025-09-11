import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Square, 
  AlertTriangle, 
  CheckCircle2,
  XCircle,
  Zap,
  Clock
} from "lucide-react";

interface FailoverScenario {
  id: string;
  name: string;
  description: string;
  status: "idle" | "running" | "completed" | "failed";
  steps: FailoverStep[];
  duration?: number;
}

interface FailoverStep {
  id: string;
  description: string;
  status: "pending" | "running" | "completed" | "failed";
  timestamp?: string;
  details?: string;
}

const FailoverSimulator = () => {
  const [scenarios, setScenarios] = useState<FailoverScenario[]>([
    {
      id: "payment-failover",
      name: "Payment Provider Failover",
      description: "Simulate Stripe outage and failover to PayPal",
      status: "idle",
      steps: [
        { id: "1", description: "Detect Stripe API failures", status: "pending" },
        { id: "2", description: "Open circuit breaker for Stripe", status: "pending" },
        { id: "3", description: "Route traffic to PayPal", status: "pending" },
        { id: "4", description: "Verify PayPal connectivity", status: "pending" },
        { id: "5", description: "Update monitoring dashboards", status: "pending" }
      ]
    },
    {
      id: "sms-failover",
      name: "SMS Service Failover",
      description: "Simulate Twilio outage and failover to Vonage",
      status: "idle", 
      steps: [
        { id: "1", description: "Detect Twilio service degradation", status: "pending" },
        { id: "2", description: "Trigger circuit breaker", status: "pending" },
        { id: "3", description: "Switch to Vonage provider", status: "pending" },
        { id: "4", description: "Test message delivery", status: "pending" },
        { id: "5", description: "Send notifications to team", status: "pending" }
      ]
    },
    {
      id: "chaos-test",
      name: "Chaos Engineering Test",
      description: "Random provider failures to test resilience",
      status: "idle",
      steps: [
        { id: "1", description: "Select random provider", status: "pending" },
        { id: "2", description: "Inject artificial failures", status: "pending" },
        { id: "3", description: "Monitor system response", status: "pending" },
        { id: "4", description: "Verify automatic recovery", status: "pending" },
        { id: "5", description: "Generate resilience report", status: "pending" }
      ]
    }
  ]);

  const runScenario = async (scenarioId: string) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario || scenario.status === "running") return;

    // Start scenario
    setScenarios(prev => 
      prev.map(s => 
        s.id === scenarioId 
          ? { ...s, status: "running", duration: 0 }
          : s
      )
    );

    // Simulate step execution
    for (let i = 0; i < scenario.steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setScenarios(prev => 
        prev.map(s => {
          if (s.id === scenarioId) {
            const updatedSteps = [...s.steps];
            updatedSteps[i] = {
              ...updatedSteps[i],
              status: "running",
              timestamp: new Date().toLocaleTimeString()
            };
            return { ...s, steps: updatedSteps };
          }
          return s;
        })
      );

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setScenarios(prev => 
        prev.map(s => {
          if (s.id === scenarioId) {
            const updatedSteps = [...s.steps];
            updatedSteps[i] = {
              ...updatedSteps[i],
              status: Math.random() > 0.1 ? "completed" : "failed",
              details: Math.random() > 0.1 ? "Success" : "Error: Timeout"
            };
            return { ...s, steps: updatedSteps };
          }
          return s;
        })
      );
    }

    // Complete scenario
    setScenarios(prev => 
      prev.map(s => 
        s.id === scenarioId 
          ? { ...s, status: "completed" }
          : s
      )
    );
  };

  const stopScenario = (scenarioId: string) => {
    setScenarios(prev => 
      prev.map(s => 
        s.id === scenarioId 
          ? { 
              ...s, 
              status: "idle",
              steps: s.steps.map(step => ({ ...step, status: "pending", timestamp: undefined, details: undefined }))
            }
          : s
      )
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-error" />;
      case "running":
        return <Zap className="w-4 h-4 text-warning animate-pulse" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success/20 text-success border-success/30";
      case "failed":
        return "bg-error/20 text-error border-error/30";
      case "running":
        return "bg-warning/20 text-warning border-warning/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Failover Simulator
        </h2>
        <p className="text-sm text-muted-foreground">
          Test and validate failover scenarios in a controlled environment
        </p>
      </div>

      <div className="space-y-6">
        {scenarios.map((scenario) => (
          <div key={scenario.id} className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-medium text-foreground">{scenario.name}</h3>
                  <Badge className={`${getStatusColor(scenario.status)} border text-xs`}>
                    {scenario.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{scenario.description}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                {scenario.status === "idle" && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => runScenario(scenario.id)}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Run
                  </Button>
                )}
                
                {scenario.status === "running" && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => stopScenario(scenario.id)}
                  >
                    <Square className="w-3 h-3 mr-1" />
                    Stop
                  </Button>
                )}
                
                {(scenario.status === "completed" || scenario.status === "failed") && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => stopScenario(scenario.id)}
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-2">
              {scenario.steps.map((step, index) => (
                <div 
                  key={step.id}
                  className={`flex items-center justify-between p-3 rounded border transition-colors ${
                    step.status === "running" ? "bg-warning/10 border-warning/30" :
                    step.status === "completed" ? "bg-success/10 border-success/30" :
                    step.status === "failed" ? "bg-error/10 border-error/30" :
                    "bg-muted/30 border-border"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-background border">
                      <span className="text-xs font-medium">{index + 1}</span>
                    </div>
                    {getStatusIcon(step.status)}
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        {step.description}
                      </span>
                      {step.details && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {step.details}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {step.timestamp && (
                    <span className="text-xs text-muted-foreground">
                      {step.timestamp}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default FailoverSimulator;