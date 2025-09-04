import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import AddProviderDialog from "@/components/AddProviderDialog";
import { PROVIDERS } from "@/lib/apiResilienceManager";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

// --- Utility Functions (moved outside component to be accessible by modals) ---
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

const Providers = () => {

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
            <Card className="p-4 border border-border min-h-[600px] sticky top-8">
              <div className="flex items-center mb-4">
                <h2 className="text-lg font-semibold text-foreground">API Providers</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Monitor all connected services
              </p>
              <DemoManageModal />
              {/* Provider Settings - Inline */}
              <div className="mt-6">
                <h3 className="text-md font-semibold text-foreground mb-4">Provider Settings</h3>
                <ProviderSettingsInline />
              </div>
            </Card>
          </div>

          {/* Main Content - Provider Cards */}
          <div className="lg:col-span-3">
            <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
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

// --- Provider Settings Inline Component ---
const ProviderSettingsInline = () => {
  const [settings, setSettings] = useState({
    healthCheckInterval: 30,
    maxRetries: 3,
    timeoutMs: 5000,
    enableFailover: true,
    logLevel: 'info',
    alertsEnabled: true
  });

  const handleSave = () => {
    console.log('Saving provider settings:', settings);
    // Here you would typically save to your state management or API
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="healthCheck" className="text-xs">Health Check Interval (s)</Label>
          <Input
            id="healthCheck"
            type="number"
            value={settings.healthCheckInterval}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              healthCheckInterval: parseInt(e.target.value)
            }))}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxRetries" className="text-xs">Max Retries</Label>
          <Input
            id="maxRetries"
            type="number"
            value={settings.maxRetries}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              maxRetries: parseInt(e.target.value)
            }))}
            className="h-8 text-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="timeout" className="text-xs">Timeout (ms)</Label>
        <Input
          id="timeout"
          type="number"
          value={settings.timeoutMs}
          onChange={(e) => setSettings(prev => ({
            ...prev,
            timeoutMs: parseInt(e.target.value)
          }))}
          className="h-8 text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="logLevel" className="text-xs">Log Level</Label>
        <Select value={settings.logLevel} onValueChange={(value) =>
          setSettings(prev => ({ ...prev, logLevel: value }))
        }>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="debug">Debug</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warn">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="failover" className="text-xs">Enable Auto Failover</Label>
        <Switch
          id="failover"
          checked={settings.enableFailover}
          onCheckedChange={(checked) => setSettings(prev => ({
            ...prev,
            enableFailover: checked
          }))}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="alerts" className="text-xs">Enable Alerts</Label>
        <Switch
          id="alerts"
          checked={settings.alertsEnabled}
          onCheckedChange={(checked) => setSettings(prev => ({
            ...prev,
            alertsEnabled: checked
          }))}
        />
      </div>

      <div className="pt-2">
        <Button onClick={handleSave} size="sm" className="w-full">
          Save Settings
        </Button>
      </div>
    </div>
  );
};

// --- Provider Management Modal ---
const DemoManageModal = () => {
  const [open, setOpen] = useState(false);
  const [providers, setProviders] = useState(PROVIDERS);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const handleToggleProvider = (id: string) => {
    setProviders(prev => prev.map(p =>
      p.id === id ? { ...p, isHealthy: !p.isHealthy } : p
    ));
  };

  const handleSetPrimary = (id: string) => {
    setProviders(prev => prev.map(p => ({
      ...p,
      isPrimary: p.id === id
    })));
  };

  const handleTestProvider = async (id: string) => {
    setSelectedProvider(id);
    // Simulate API test
    setTimeout(() => {
      console.log(`Testing provider ${id}...`);
      setProviders(prev => prev.map(p =>
        p.id === id ? {
          ...p,
          latency: Math.floor(Math.random() * 200) + 50,
          lastCheck: new Date().toLocaleTimeString()
        } : p
      ));
      setSelectedProvider(null);
    }, 1500);
  };

  const getProviderStats = () => {
    const total = providers.length;
    const healthy = providers.filter(p => p.isHealthy).length;
    const avgLatency = providers
      .filter(p => p.latency > 0)
      .reduce((acc, p) => acc + p.latency, 0) / providers.filter(p => p.latency > 0).length;

    return { total, healthy, avgLatency: Math.round(avgLatency) };
  };

  const stats = getProviderStats();

  return (
    <>
      <Button variant="outline" size="sm" className="w-full" onClick={() => setOpen(true)}>
        <Settings className="w-4 h-4 mr-2" />
        Manage
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Manage API Providers</DialogTitle>
          </DialogHeader>

          {/* Stats Overview */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="p-3">
              <div className="text-sm text-muted-foreground">Total Providers</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </Card>
            <Card className="p-3">
              <div className="text-sm text-muted-foreground">Healthy</div>
              <div className="text-2xl font-bold text-success">{stats.healthy}</div>
            </Card>
            <Card className="p-3">
              <div className="text-sm text-muted-foreground">Avg Latency</div>
              <div className="text-2xl font-bold">{stats.avgLatency}ms</div>
            </Card>
          </div>

          {/* Provider List */}
          <div className="space-y-3 overflow-y-auto flex-1 pr-2">
            {providers.map((provider) => (
              <Card key={provider.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(provider.isHealthy)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{provider.name}</span>
                        {provider.isPrimary && (
                          <Badge variant="outline" className="text-xs border-primary text-primary">
                            Primary
                          </Badge>
                        )}
                        <Badge className={`text-xs ${getTypeColor(provider.type)}`}>
                          {provider.type.charAt(0).toUpperCase() + provider.type.slice(1)}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Latency: {provider.latency > 0 ? `${provider.latency}ms` : "—"} |
                        Error Rate: {provider.errorRate.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestProvider(provider.id)}
                      disabled={selectedProvider === provider.id}
                    >
                      {selectedProvider === provider.id ? (
                        <>
                          <Activity className="w-4 h-4 mr-1 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Activity className="w-4 h-4 mr-1" />
                          Test
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetPrimary(provider.id)}
                      disabled={provider.isPrimary}
                    >
                      <Shield className="w-4 h-4 mr-1" />
                      {provider.isPrimary ? "Primary" : "Set Primary"}
                    </Button>

                    <Button
                      variant={provider.isHealthy ? "destructive" : "default"}
                      size="sm"
                      onClick={() => handleToggleProvider(provider.id)}
                    >
                      {provider.isHealthy ? "Disable" : "Enable"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              console.log('Saving provider changes:', providers);
              setOpen(false);
            }}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Providers;