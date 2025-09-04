import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import AddProviderDialog from "@/components/AddProviderDialog";
import { PROVIDERS } from "@/lib/apiResilienceManager";
import { 
  Shield, 
  Settings, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Plus,
  ExternalLink,
  TrendingUp
} from "lucide-react";

const Providers = () => {
  const getStatusIcon = (isHealthy: boolean) => {
    if (isHealthy) {
      return <CheckCircle className="w-4 h-4 text-success" />;
    } else {
      return <AlertTriangle className="w-4 h-4 text-error" />;
    }
  };

  const getStatusBadge = (isHealthy: boolean, errorRate: number) => {
    if (isHealthy && errorRate < 1) {
      return <Badge className="bg-success text-success-foreground">Healthy</Badge>;
    } else if (isHealthy && errorRate < 5) {
      return <Badge className="bg-warning text-warning-foreground">Degraded</Badge>;
    } else {
      return <Badge className="bg-error text-error-foreground">Down</Badge>;
    }
  };

  const getUptimeColor = (isHealthy: boolean, errorRate: number) => {
    if (isHealthy && errorRate < 1) return "text-success";
    if (isHealthy && errorRate < 5) return "text-warning";
    return "text-error";
  };

  const calculateUptime = (errorRate: number) => {
    return Math.max(85, 100 - errorRate).toFixed(1) + "%";
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "payment": return "bg-success text-success-foreground";
      case "ai": return "bg-primary text-primary-foreground";
      case "sms": return "bg-warning text-warning-foreground";
      case "email": return "bg-accent text-accent-foreground";
      case "storage": return "bg-secondary text-secondary-foreground";
      case "auth": return "bg-error text-error-foreground";
      case "video": return "bg-success text-success-foreground";
      case "realtime": return "bg-primary text-primary-foreground";
      case "maps": return "bg-warning text-warning-foreground";
      case "analytics": return "bg-accent text-accent-foreground";
      case "monitoring": return "bg-secondary text-secondary-foreground";
      default: return "bg-muted text-muted-foreground";
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
            <AddProviderDialog>
              <Button variant="cyber" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Provider
              </Button>
            </AddProviderDialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - API Providers Overview */}
          <div className="lg:col-span-1">
            <Card className="p-4 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">API Providers</h2>
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Monitor all connected services
              </p>
              <Button variant="outline" size="sm" className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Manage
              </Button>
            </Card>
          </div>

          {/* Main Content - Provider Cards */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              {PROVIDERS.map((provider) => (
                <Card key={provider.id} className="p-4 border border-border hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(provider.isHealthy)}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{provider.name}</h3>
                            {provider.isPrimary && (
                              <Badge variant="outline" className="text-xs border-primary text-primary">
                                Primary
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`text-xs ${getTypeColor(provider.type)}`}>
                              {provider.type.charAt(0).toUpperCase() + provider.type.slice(1)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Last check: {provider.lastCheck}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {getStatusBadge(provider.isHealthy, provider.errorRate)}
                      <Button variant="ghost" size="sm">
                        <TrendingUp className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Latency</p>
                      <p className="text-foreground font-semibold">
                        {provider.latency > 0 ? `${provider.latency}ms` : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Uptime (24h)</p>
                      <p className={`font-semibold ${getUptimeColor(provider.isHealthy, provider.errorRate)}`}>
                        {calculateUptime(provider.errorRate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Error Rate</p>
                      <p className={`font-semibold ${provider.errorRate > 1 ? 'text-error' : 'text-success'}`}>
                        {provider.errorRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Providers;