import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import Navigation from "@/components/Navigation";
import AlertCenter from "@/components/AlertCenter";
import { 
  Bell, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Plus,
  Filter,
  Archive
} from "lucide-react";

const Alerts = () => {
  const [activeTab, setActiveTab] = useState("active");

  const alerts = [
    {
      id: 1,
      type: "error",
      severity: "high",
      title: "Cohere API Completely Down",
      description: "All requests to Cohere Command API are failing with 503 errors",
      provider: "Cohere Command",
      timestamp: "2 minutes ago",
      status: "active",
      acknowledged: false
    },
    {
      id: 2,
      type: "warning", 
      severity: "medium",
      title: "High Latency Detected",
      description: "Google Gemini API response times exceed 200ms threshold",
      provider: "Google Gemini",
      timestamp: "15 minutes ago", 
      status: "active",
      acknowledged: false
    },
    {
      id: 3,
      type: "info",
      severity: "low",
      title: "Rate Limit Approaching",
      description: "OpenAI GPT-4 usage at 85% of monthly quota",
      provider: "OpenAI GPT-4",
      timestamp: "1 hour ago",
      status: "active",
      acknowledged: true
    },
    {
      id: 4,
      type: "success",
      severity: "low", 
      title: "Service Restored",
      description: "Anthropic Claude API has recovered from previous issues",
      provider: "Anthropic Claude",
      timestamp: "2 hours ago",
      status: "resolved",
      acknowledged: true
    }
  ];

  const alertRules = [
    {
      id: 1,
      name: "High Error Rate",
      description: "Trigger when error rate exceeds 5%",
      enabled: true,
      conditions: "Error Rate > 5% for 5 minutes",
      providers: ["All"]
    },
    {
      id: 2,
      name: "Service Unavailable", 
      description: "Trigger when API returns 5xx errors",
      enabled: true,
      conditions: "HTTP 5xx responses detected",
      providers: ["All"]
    },
    {
      id: 3,
      name: "High Latency Warning",
      description: "Trigger when response time is too high",
      enabled: true,
      conditions: "Latency > 200ms for 10 minutes", 
      providers: ["Google Gemini", "Cohere Command"]
    },
    {
      id: 4,
      name: "Quota Threshold",
      description: "Trigger when approaching rate limits",
      enabled: false,
      conditions: "Usage > 80% of quota",
      providers: ["OpenAI GPT-4", "Anthropic Claude"]
    }
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertTriangle className="w-4 h-4 text-error" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-success" />;
      default:
        return <Bell className="w-4 h-4 text-primary" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge className="bg-warning text-warning-foreground">Medium</Badge>;
      case "low":
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const filteredAlerts = alerts.filter(alert => 
    activeTab === "active" ? alert.status === "active" : alert.status === "resolved"
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Alert Management</h1>
              <p className="text-muted-foreground">Monitor system alerts and configure notification rules</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="cyber" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Rule
              </Button>
            </div>
          </div>
        </div>

        {/* Alert Center Component */}
        <div className="mb-8">
          <AlertCenter />
        </div>

        {/* Alert List */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Recent Alerts</h2>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={activeTab === "active" ? "default" : "outline"} 
                size="sm"
                onClick={() => setActiveTab("active")}
              >
                Active ({alerts.filter(a => a.status === "active").length})
              </Button>
              <Button 
                variant={activeTab === "resolved" ? "default" : "outline"} 
                size="sm"
                onClick={() => setActiveTab("resolved")}
              >
                Resolved ({alerts.filter(a => a.status === "resolved").length})
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <Card key={alert.id} className={`p-4 border ${alert.acknowledged ? 'border-border' : 'border-primary/30 bg-primary/5'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{alert.title}</h3>
                        {getSeverityBadge(alert.severity)}
                        {!alert.acknowledged && (
                          <Badge variant="outline" className="text-xs">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {alert.timestamp}
                        </span>
                        <span>Provider: {alert.provider}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {alert.status === "active" && (
                      <Button variant="outline" size="sm">
                        Acknowledge
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <Archive className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Alert Rules */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Alert Rules</h2>
            </div>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Rule
            </Button>
          </div>

          <div className="space-y-4">
            {alertRules.map((rule) => (
              <Card key={rule.id} className="p-4 border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">{rule.name}</h3>
                      <Switch checked={rule.enabled} />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{rule.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Conditions: {rule.conditions}</span>
                      <span>Providers: {rule.providers.join(", ")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm">Delete</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Alerts;