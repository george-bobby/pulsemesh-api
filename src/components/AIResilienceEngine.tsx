import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Eye,
  Zap,
  Target
} from "lucide-react";

interface MLPrediction {
  id: string;
  provider: string;
  type: "outage" | "degradation" | "anomaly";
  confidence: number;
  timeToEvent: string;
  description: string;
  impact: "low" | "medium" | "high" | "critical";
  recommended_action: string;
  timestamp: string;
}

interface AnomalyDetection {
  metric: string;
  currentValue: number;
  expectedRange: [number, number];
  anomalyScore: number;
  severity: "low" | "medium" | "high";
}

const AIResilienceEngine = () => {
  const [predictions, setPredictions] = useState<MLPrediction[]>([
    {
      id: "pred-1",
      provider: "PayPal",
      type: "degradation",
      confidence: 87,
      timeToEvent: "15-20 minutes",
      description: "ML model detected pattern similar to previous degradation events",
      impact: "medium",
      recommended_action: "Preemptively reduce traffic to PayPal, prepare Stripe for increased load",
      timestamp: "2 min ago"
    },
    {
      id: "pred-2", 
      provider: "Twilio",
      type: "outage",
      confidence: 92,
      timeToEvent: "5-10 minutes",
      description: "Unusual latency spikes detected across multiple regions",
      impact: "high",
      recommended_action: "Activate SMS failover to Vonage immediately",
      timestamp: "30 sec ago"
    },
    {
      id: "pred-3",
      provider: "SendGrid",
      type: "anomaly",
      confidence: 76,
      timeToEvent: "2-5 minutes",
      description: "Email delivery rates below expected threshold",
      impact: "low",
      recommended_action: "Monitor closely, consider backup email service if trend continues",
      timestamp: "1 min ago"
    }
  ]);

  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([
    {
      metric: "Response Time",
      currentValue: 380,
      expectedRange: [100, 250],
      anomalyScore: 0.85,
      severity: "high"
    },
    {
      metric: "Error Rate", 
      currentValue: 2.1,
      expectedRange: [0.1, 0.8],
      anomalyScore: 0.92,
      severity: "high"
    },
    {
      metric: "Request Volume",
      currentValue: 1850,
      expectedRange: [1200, 1600],
      anomalyScore: 0.45,
      severity: "medium"
    }
  ]);

  const [isLearning, setIsLearning] = useState(false);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "critical":
        return "bg-error text-error-foreground";
      case "high":
        return "bg-error/80 text-error-foreground";
      case "medium":
        return "bg-warning text-warning-foreground";
      case "low":
        return "bg-success/60 text-success-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "outage":
        return <Zap className="w-4 h-4 text-error" />;
      case "degradation":
        return <TrendingUp className="w-4 h-4 text-warning" />;
      case "anomaly":
        return <Eye className="w-4 h-4 text-primary" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-error";
      case "medium":
        return "text-warning";
      case "low":
        return "text-success";
      default:
        return "text-muted-foreground";
    }
  };

  const triggerMLTraining = () => {
    setIsLearning(true);
    setTimeout(() => {
      setIsLearning(false);
      // Add new prediction after "training"
      const newPrediction: MLPrediction = {
        id: `pred-${Date.now()}`,
        provider: "Stripe",
        type: "anomaly",
        confidence: 82,
        timeToEvent: "10-15 minutes",
        description: "Pattern recognition identified unusual traffic distribution",
        impact: "medium",
        recommended_action: "Increase monitoring frequency for Stripe endpoints",
        timestamp: "just now"
      };
      setPredictions(prev => [newPrediction, ...prev]);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* AI Predictions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Brain className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-semibold text-foreground">
                Predictive Outage Detection
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered predictions based on historical patterns and real-time metrics
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={triggerMLTraining}
              disabled={isLearning}
            >
              <Target className="w-3 h-3 mr-1" />
              {isLearning ? "Training..." : "Retrain Model"}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {predictions.map((prediction) => (
            <div 
              key={prediction.id}
              className="p-4 rounded-lg border border-border hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getTypeIcon(prediction.type)}
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-foreground">
                        {prediction.provider} - {prediction.type.charAt(0).toUpperCase() + prediction.type.slice(1)} Predicted
                      </span>
                      <Badge className={getImpactColor(prediction.impact)}>
                        {prediction.impact.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {prediction.description}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      ETA: {prediction.timeToEvent} • Confidence: {prediction.confidence}% • {prediction.timestamp}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold text-foreground mb-1">
                    {prediction.confidence}%
                  </div>
                  <div className="text-xs text-muted-foreground">Confidence</div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 border-l-4 border-l-accent">
                <h4 className="text-sm font-medium text-foreground mb-1">
                  Recommended Action:
                </h4>
                <p className="text-sm text-muted-foreground">
                  {prediction.recommended_action}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Anomaly Detection */}
      <Card className="p-6">
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-1">
            <Eye className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Real-time Anomaly Detection
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Machine learning algorithms monitoring for unusual patterns
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {anomalies.map((anomaly, index) => (
            <div 
              key={index}
              className="p-4 rounded-lg border border-border bg-card"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-foreground">{anomaly.metric}</h3>
                <Badge className={`${getSeverityColor(anomaly.severity)} bg-transparent border`}>
                  {anomaly.severity.toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current:</span>
                  <span className={getSeverityColor(anomaly.severity)}>
                    {anomaly.currentValue}{anomaly.metric === "Response Time" ? "ms" : anomaly.metric === "Error Rate" ? "%" : ""}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Expected:</span>
                  <span className="text-foreground">
                    {anomaly.expectedRange[0]}-{anomaly.expectedRange[1]}{anomaly.metric === "Response Time" ? "ms" : anomaly.metric === "Error Rate" ? "%" : ""}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Anomaly Score:</span>
                  <span className={getSeverityColor(anomaly.severity)}>
                    {(anomaly.anomalyScore * 100).toFixed(0)}%
                  </span>
                </div>

                {/* Anomaly Score Bar */}
                <div className="mt-3">
                  <div className="bg-muted rounded-full h-2">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        anomaly.severity === "high" ? "bg-error" :
                        anomaly.severity === "medium" ? "bg-warning" : "bg-success"
                      }`}
                      style={{ width: `${anomaly.anomalyScore * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AIResilienceEngine;