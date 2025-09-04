import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navigation from "@/components/Navigation";
import { 
  Settings as SettingsIcon, 
  Shield, 
  Bell, 
  Database,
  User,
  Key,
  Zap,
  Save,
  AlertTriangle,
  Download
} from "lucide-react";

const Settings = () => {
  const [activeSection, setActiveSection] = useState("general");

  const sections = [
    { id: "general", label: "General", icon: SettingsIcon },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "api-keys", label: "API Keys", icon: Key },
    { id: "performance", label: "Performance", icon: Zap },
    { id: "backup", label: "Backup & Export", icon: Database }
  ];

  const GeneralSettings = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Account Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="company">Organization Name</Label>
            <Input id="company" defaultValue="Acme Corporation" />
          </div>
          <div>
            <Label htmlFor="email">Admin Email</Label>
            <Input id="email" type="email" defaultValue="admin@acme.com" />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" defaultValue="AI-powered API resilience platform for enterprise applications" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">System Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Dark Mode</p>
              <p className="text-sm text-muted-foreground">Enable dark theme across the interface</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Auto-refresh Dashboard</p>
              <p className="text-sm text-muted-foreground">Automatically update metrics every 30 seconds</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Enable Analytics Tracking</p>
              <p className="text-sm text-muted-foreground">Collect usage analytics for improvement</p>
            </div>
            <Switch />
          </div>
        </div>
      </Card>
    </div>
  );

  const SecuritySettings = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Authentication & Security</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Not Enabled</Badge>
              <Button variant="outline" size="sm">Setup</Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">API Key Rotation</p>
              <p className="text-sm text-muted-foreground">Automatically rotate API keys every 90 days</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">IP Whitelist</p>
              <p className="text-sm text-muted-foreground">Restrict access to specific IP addresses</p>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Audit Logs</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Log Retention</p>
              <p className="text-sm text-muted-foreground">Keep audit logs for compliance</p>
            </div>
            <div className="flex items-center gap-2">
              <Input className="w-20" defaultValue="90" />
              <span className="text-sm text-muted-foreground">days</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const NotificationSettings = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Alert Preferences</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive alerts via email</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Slack Integration</p>
              <p className="text-sm text-muted-foreground">Send alerts to Slack channels</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Not Connected</Badge>
              <Button variant="outline" size="sm">Connect</Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">SMS Notifications</p>
              <p className="text-sm text-muted-foreground">Critical alerts via SMS</p>
            </div>
            <Switch />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Notification Rules</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>High Priority Alert Delay</Label>
              <Input defaultValue="0" placeholder="Minutes" />
            </div>
            <div>
              <Label>Medium Priority Alert Delay</Label>
              <Input defaultValue="5" placeholder="Minutes" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "general":
        return <GeneralSettings />;
      case "security":
        return <SecuritySettings />;
      case "notifications":
        return <NotificationSettings />;
      case "api-keys":
        return (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">API Key Management</h3>
            </div>
            <div className="flex items-center gap-2 p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <p className="text-sm text-warning">Configure your AI provider API keys in the Providers section</p>
            </div>
          </Card>
        );
      case "performance":
        return (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Performance Optimization</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Intelligent Caching</p>
                  <p className="text-sm text-muted-foreground">Cache responses to reduce API calls</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Request Batching</p>
                  <p className="text-sm text-muted-foreground">Group similar requests for efficiency</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>
        );
      case "backup":
        return (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Data Management</h3>
            </div>
            <div className="space-y-4">
              <Button variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export Configuration
              </Button>
              <Button variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export Analytics Data
              </Button>
            </div>
          </Card>
        );
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
              <p className="text-muted-foreground">Configure your API Resilience Hub preferences and security</p>
            </div>
            <Button variant="cyber">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                      activeSection === section.id
                        ? "bg-primary text-primary-foreground shadow-glow"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    <section.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{section.label}</span>
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;