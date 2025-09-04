import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import ProviderStatus from "@/components/ProviderStatus";
import { 
  Shield, 
  Settings, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Plus,
  ExternalLink
} from "lucide-react";

const Providers = () => {
  const providers = [
    {
      id: 1,
      name: "OpenAI GPT-4",
      status: "active",
      endpoint: "https://api.openai.com/v1",
      latency: "145ms",
      uptime: "99.9%",
      requests: "2.4K",
      errors: 2
    },
    {
      id: 2,
      name: "Anthropic Claude",
      status: "active", 
      endpoint: "https://api.anthropic.com/v1",
      latency: "89ms",
      uptime: "99.8%",
      requests: "1.8K",
      errors: 0
    },
    {
      id: 3,
      name: "Google Gemini",
      status: "maintenance",
      endpoint: "https://generativelanguage.googleapis.com/v1",
      latency: "210ms",
      uptime: "98.5%",
      requests: "890",
      errors: 15
    },
    {
      id: 4,
      name: "Cohere Command",
      status: "error",
      endpoint: "https://api.cohere.ai/v1",
      latency: "—",
      uptime: "0%",
      requests: "0",
      errors: 45
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "maintenance":
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case "error":
        return <AlertTriangle className="w-4 h-4 text-error" />;
      default:
        return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-success text-success-foreground">Active</Badge>;
      case "maintenance": 
        return <Badge variant="secondary" className="bg-warning text-warning-foreground">Maintenance</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">AI Provider Management</h1>
              <p className="text-muted-foreground">Monitor and manage your AI API providers with intelligent failover</p>
            </div>
            <Button variant="cyber" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Provider
            </Button>
          </div>
        </div>

        {/* Provider Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <ProviderStatus />
        </div>

        {/* Provider List */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Configured Providers</h2>
            </div>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Bulk Actions
            </Button>
          </div>

          <div className="space-y-4">
            {providers.map((provider) => (
              <Card key={provider.id} className="p-4 border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(provider.status)}
                      <h3 className="font-semibold text-foreground">{provider.name}</h3>
                    </div>
                    {getStatusBadge(provider.status)}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Endpoint</p>
                    <p className="text-foreground font-mono text-xs">{provider.endpoint}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Latency</p>
                    <p className="text-foreground font-semibold">{provider.latency}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Uptime</p>
                    <p className="text-foreground font-semibold">{provider.uptime}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Requests (24h)</p>
                    <p className="text-foreground font-semibold">{provider.requests}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Errors</p>
                    <p className={`font-semibold ${provider.errors > 0 ? 'text-error' : 'text-success'}`}>
                      {provider.errors}
                    </p>
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

export default Providers;