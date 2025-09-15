import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProviders } from "@/hooks/useProviders";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Check,
  ChevronsUpDown,
  Loader2,
  TestTube,
  AlertCircle,
  CheckCircle,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

const POPULAR_PROVIDERS = [
  {
    id: "stripe",
    name: "Stripe",
    type: "payment",
    endpoint: "https://api.stripe.com",
  },
  {
    id: "paypal",
    name: "PayPal",
    type: "payment",
    endpoint: "https://api.paypal.com",
  },
  {
    id: "square",
    name: "Square",
    type: "payment",
    endpoint: "https://connect.squareup.com",
  },
  {
    id: "openai",
    name: "OpenAI",
    type: "ai",
    endpoint: "https://api.openai.com",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    type: "ai",
    endpoint: "https://api.anthropic.com",
  },
  {
    id: "google-ai",
    name: "Google AI",
    type: "ai",
    endpoint: "https://generativelanguage.googleapis.com",
  },
  {
    id: "twilio",
    name: "Twilio",
    type: "sms",
    endpoint: "https://api.twilio.com",
  },
  {
    id: "vonage",
    name: "Vonage",
    type: "sms",
    endpoint: "https://rest.nexmo.com",
  },
  {
    id: "sendgrid",
    name: "SendGrid",
    type: "email",
    endpoint: "https://api.sendgrid.com",
  },
  {
    id: "mailgun",
    name: "Mailgun",
    type: "email",
    endpoint: "https://api.mailgun.net",
  },
  {
    id: "brevo",
    name: "Brevo",
    type: "email",
    endpoint: "https://api.brevo.com",
  },
  {
    id: "cloudinary",
    name: "Cloudinary",
    type: "storage",
    endpoint: "https://api.cloudinary.com",
  },
  {
    id: "uploadthing",
    name: "UploadThing",
    type: "storage",
    endpoint: "https://uploadthing.com/api",
  },
  {
    id: "clerk",
    name: "Clerk",
    type: "auth",
    endpoint: "https://api.clerk.com",
  },
  {
    id: "auth0",
    name: "Auth0",
    type: "auth",
    endpoint: "https://api.auth0.com",
  },
  {
    id: "livekit",
    name: "LiveKit",
    type: "video",
    endpoint: "https://api.livekit.io",
  },
  {
    id: "liveblocks",
    name: "Liveblocks",
    type: "realtime",
    endpoint: "https://api.liveblocks.io",
  },
  {
    id: "google-maps",
    name: "Google Maps",
    type: "maps",
    endpoint: "https://maps.googleapis.com",
  },
  {
    id: "mixpanel",
    name: "Mixpanel",
    type: "analytics",
    endpoint: "https://api.mixpanel.com",
  },
  {
    id: "sentry",
    name: "Sentry",
    type: "monitoring",
    endpoint: "https://sentry.io/api",
  },
  {
    id: "vercel",
    name: "Vercel",
    type: "storage",
    endpoint: "https://api.vercel.com",
  },
  {
    id: "supabase",
    name: "Supabase",
    type: "auth",
    endpoint: "https://api.supabase.com",
  },
  {
    id: "firebase",
    name: "Firebase",
    type: "auth",
    endpoint: "https://firebase.googleapis.com",
  },
  {
    id: "pusher",
    name: "Pusher",
    type: "realtime",
    endpoint: "https://api.pusherapp.com",
  },
  {
    id: "algolia",
    name: "Algolia",
    type: "analytics",
    endpoint: "https://api.algolia.com",
  },
  { id: "zoom", name: "Zoom", type: "video", endpoint: "https://api.zoom.us" },
  {
    id: "aws-s3",
    name: "AWS S3",
    type: "storage",
    endpoint: "https://s3.amazonaws.com",
  },
  {
    id: "resend",
    name: "Resend",
    type: "email",
    endpoint: "https://api.resend.com",
  },
  {
    id: "postmark",
    name: "Postmark",
    type: "email",
    endpoint: "https://api.postmarkapp.com",
  },
  {
    id: "plaid",
    name: "Plaid",
    type: "payment",
    endpoint: "https://api.plaid.com",
  },
];

const PROVIDER_TYPES = [
  { value: "payment", label: "Payment", color: "bg-success" },
  { value: "ai", label: "AI", color: "bg-primary" },
  { value: "sms", label: "SMS", color: "bg-warning" },
  { value: "email", label: "Email", color: "bg-accent" },
  { value: "storage", label: "Storage", color: "bg-secondary" },
  { value: "auth", label: "Authentication", color: "bg-error" },
  { value: "video", label: "Video", color: "bg-success" },
  { value: "realtime", label: "Realtime", color: "bg-primary" },
  { value: "maps", label: "Maps", color: "bg-warning" },
  { value: "analytics", label: "Analytics", color: "bg-accent" },
  { value: "monitoring", label: "Monitoring", color: "bg-secondary" },
];

interface AddProviderDialogProps {
  children: React.ReactNode;
}

const AddProviderDialog = ({ children }: AddProviderDialogProps) => {
  const [open, setOpen] = useState(false);
  const [comboOpen, setComboOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<
    (typeof POPULAR_PROVIDERS)[0] | null
  >(null);
  const [customName, setCustomName] = useState("");
  const [customEndpoint, setCustomEndpoint] = useState("");
  const [customType, setCustomType] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [priority, setPriority] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latency?: number;
  } | null>(null);
  const [activeTab, setActiveTab] = useState("template");

  const { createProvider } = useProviders();
  const { toast } = useToast();

  const handleProviderSelect = (provider: (typeof POPULAR_PROVIDERS)[0]) => {
    setSelectedProvider(provider);
    setCustomName(provider.name);
    setCustomEndpoint(provider.endpoint);
    setCustomType(provider.type);
    setCustomDescription(`${provider.name} API integration`);
    setComboOpen(false);
    setTestResult(null);
  };

  const testConnection = async () => {
    if (!customEndpoint.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter an API endpoint to test.",
        variant: "destructive",
      });
      return;
    }

    setIsTestingConnection(true);
    setTestResult(null);

    try {
      const startTime = Date.now();

      // Basic URL validation
      try {
        new URL(customEndpoint);
      } catch {
        throw new Error("Invalid URL format");
      }

      // Test connection to the endpoint
      const response = await fetch(customEndpoint, {
        method: "GET",
        mode: "no-cors", // This allows cross-origin requests but limits response access
        cache: "no-cache",
      });

      const latency = Date.now() - startTime;

      // Since we're using no-cors, we can only check if the request completed
      setTestResult({
        success: true,
        message: `Connection successful! Server responded in ${latency}ms`,
        latency,
      });

      toast({
        title: "Connection Test Successful",
        description: `Server responded in ${latency}ms`,
      });
    } catch (error) {
      const latency = Date.now() - Date.now();
      setTestResult({
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        latency,
      });

      toast({
        title: "Connection Test Failed",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customName.trim() || !customEndpoint.trim() || !customType) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // URL validation
    try {
      const url = new URL(customEndpoint.trim());
      if (!url.protocol.startsWith("http")) {
        throw new Error("URL must use HTTP or HTTPS protocol");
      }
    } catch (error) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid HTTP or HTTPS URL.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createProvider({
        name: customName.trim(),
        endpoint: customEndpoint.trim(),
        type: customType,
        isHealthy: true,
        latency: testResult?.latency || 0,
        errorRate: 0,
        priority: priority,
        isPrimary: isPrimary,
      });

      toast({
        title: "Provider Added",
        description: `${customName} has been added successfully and will be monitored every 30 seconds.`,
      });

      setOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to create provider:", error);
      toast({
        title: "Error",
        description: "Failed to add provider. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedProvider(null);
    setCustomName("");
    setCustomEndpoint("");
    setCustomType("");
    setCustomDescription("");
    setIsPrimary(false);
    setPriority(1);
    setTestResult(null);
    setActiveTab("template");
  };

  const getTypeColor = (type: string) => {
    return PROVIDER_TYPES.find((t) => t.value === type)?.color || "bg-muted";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px] bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Add New API Provider
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="template">From Template</TabsTrigger>
            <TabsTrigger value="custom">Custom API</TabsTrigger>
          </TabsList>

          <TabsContent value="template" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider-select" className="text-foreground">
                Select Provider Template
              </Label>
              <Popover open={comboOpen} onOpenChange={setComboOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={comboOpen}
                    className="w-full justify-between bg-input border-border text-foreground"
                  >
                    {selectedProvider ? (
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`${getTypeColor(selectedProvider.type)} text-white`}
                        >
                          {selectedProvider.type}
                        </Badge>
                        {selectedProvider.name}
                      </div>
                    ) : (
                      "Search popular API providers..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-popover border-border">
                  <Command className="bg-popover">
                    <CommandInput
                      placeholder="Search providers..."
                      className="text-foreground"
                    />
                    <CommandEmpty className="text-muted-foreground">
                      No provider found.
                    </CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      {POPULAR_PROVIDERS.map((provider) => (
                        <CommandItem
                          key={provider.id}
                          onSelect={() => handleProviderSelect(provider)}
                          className="cursor-pointer hover:bg-accent"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedProvider?.id === provider.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <div className="flex items-center gap-2 flex-1">
                            <Badge
                              className={`${getTypeColor(provider.type)} text-white text-xs`}
                            >
                              {provider.type}
                            </Badge>
                            <span className="text-foreground">
                              {provider.name}
                            </span>
                            <span className="text-muted-foreground text-sm ml-auto font-mono">
                              {provider.endpoint}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">
                Create Custom API Provider
              </Label>
              <p className="text-sm text-muted-foreground">
                Add your own API endpoint for monitoring and failover
                management.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                Provider Name *
              </Label>
              <Input
                id="name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Enter provider name"
                className="bg-input border-border text-foreground"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type" className="text-foreground">
                Type *
              </Label>
              <Select value={customType} onValueChange={setCustomType} required>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {PROVIDER_TYPES.map((type) => (
                    <SelectItem
                      key={type.value}
                      value={type.value}
                      className="text-foreground hover:bg-accent"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${type.color}`} />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="endpoint" className="text-foreground">
                API Endpoint *
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={testConnection}
                disabled={!customEndpoint.trim() || isTestingConnection}
                className="gap-2"
              >
                {isTestingConnection ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <TestTube className="w-4 h-4" />
                )}
                Test Connection
              </Button>
            </div>
            <Input
              id="endpoint"
              value={customEndpoint}
              onChange={(e) => {
                setCustomEndpoint(e.target.value);
                setTestResult(null);
              }}
              placeholder="https://api.example.com"
              className="bg-input border-border text-foreground font-mono"
              required
            />
            {testResult && (
              <div
                className={`flex items-center gap-2 p-2 rounded-md text-sm ${
                  testResult.success
                    ? "bg-success/10 text-success border border-success/20"
                    : "bg-error/10 text-error border border-error/20"
                }`}
              >
                {testResult.success ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                {testResult.message}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">
              Description
            </Label>
            <Textarea
              id="description"
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              placeholder="Optional description of this API provider"
              className="bg-input border-border text-foreground resize-none"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-foreground">
                Priority
              </Label>
              <Select
                value={priority.toString()}
                onValueChange={(value) => setPriority(parseInt(value))}
              >
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="1">1 (Highest)</SelectItem>
                  <SelectItem value="2">2 (High)</SelectItem>
                  <SelectItem value="3">3 (Medium)</SelectItem>
                  <SelectItem value="4">4 (Low)</SelectItem>
                  <SelectItem value="5">5 (Lowest)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Settings</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is-primary"
                  checked={isPrimary}
                  onCheckedChange={setIsPrimary}
                />
                <Label htmlFor="is-primary" className="text-sm text-foreground">
                  Primary provider
                </Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
              className="border-border text-foreground hover:bg-accent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="cyber"
              className="gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Provider
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProviderDialog;
