import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const POPULAR_PROVIDERS = [
  { id: "stripe", name: "Stripe", type: "payment", endpoint: "https://api.stripe.com" },
  { id: "paypal", name: "PayPal", type: "payment", endpoint: "https://api.paypal.com" },
  { id: "square", name: "Square", type: "payment", endpoint: "https://connect.squareup.com" },
  { id: "openai", name: "OpenAI", type: "ai", endpoint: "https://api.openai.com" },
  { id: "anthropic", name: "Anthropic", type: "ai", endpoint: "https://api.anthropic.com" },
  { id: "google-ai", name: "Google AI", type: "ai", endpoint: "https://generativelanguage.googleapis.com" },
  { id: "twilio", name: "Twilio", type: "sms", endpoint: "https://api.twilio.com" },
  { id: "vonage", name: "Vonage", type: "sms", endpoint: "https://rest.nexmo.com" },
  { id: "sendgrid", name: "SendGrid", type: "email", endpoint: "https://api.sendgrid.com" },
  { id: "mailgun", name: "Mailgun", type: "email", endpoint: "https://api.mailgun.net" },
  { id: "brevo", name: "Brevo", type: "email", endpoint: "https://api.brevo.com" },
  { id: "cloudinary", name: "Cloudinary", type: "storage", endpoint: "https://api.cloudinary.com" },
  { id: "uploadthing", name: "UploadThing", type: "storage", endpoint: "https://uploadthing.com/api" },
  { id: "clerk", name: "Clerk", type: "auth", endpoint: "https://api.clerk.com" },
  { id: "auth0", name: "Auth0", type: "auth", endpoint: "https://api.auth0.com" },
  { id: "livekit", name: "LiveKit", type: "video", endpoint: "https://api.livekit.io" },
  { id: "liveblocks", name: "Liveblocks", type: "realtime", endpoint: "https://api.liveblocks.io" },
  { id: "google-maps", name: "Google Maps", type: "maps", endpoint: "https://maps.googleapis.com" },
  { id: "mixpanel", name: "Mixpanel", type: "analytics", endpoint: "https://api.mixpanel.com" },
  { id: "sentry", name: "Sentry", type: "monitoring", endpoint: "https://sentry.io/api" },
  { id: "vercel", name: "Vercel", type: "storage", endpoint: "https://api.vercel.com" },
  { id: "supabase", name: "Supabase", type: "auth", endpoint: "https://api.supabase.com" },
  { id: "firebase", name: "Firebase", type: "auth", endpoint: "https://firebase.googleapis.com" },
  { id: "pusher", name: "Pusher", type: "realtime", endpoint: "https://api.pusherapp.com" },
  { id: "algolia", name: "Algolia", type: "analytics", endpoint: "https://api.algolia.com" },
  { id: "zoom", name: "Zoom", type: "video", endpoint: "https://api.zoom.us" },
  { id: "aws-s3", name: "AWS S3", type: "storage", endpoint: "https://s3.amazonaws.com" },
  { id: "resend", name: "Resend", type: "email", endpoint: "https://api.resend.com" },
  { id: "postmark", name: "Postmark", type: "email", endpoint: "https://api.postmarkapp.com" },
  { id: "plaid", name: "Plaid", type: "payment", endpoint: "https://api.plaid.com" }
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
  { value: "monitoring", label: "Monitoring", color: "bg-secondary" }
];

interface AddProviderDialogProps {
  children: React.ReactNode;
}

const AddProviderDialog = ({ children }: AddProviderDialogProps) => {
  const [open, setOpen] = useState(false);
  const [comboOpen, setComboOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<typeof POPULAR_PROVIDERS[0] | null>(null);
  const [customName, setCustomName] = useState("");
  const [customEndpoint, setCustomEndpoint] = useState("");
  const [customType, setCustomType] = useState("");

  const handleProviderSelect = (provider: typeof POPULAR_PROVIDERS[0]) => {
    setSelectedProvider(provider);
    setCustomName(provider.name);
    setCustomEndpoint(provider.endpoint);
    setCustomType(provider.type);
    setComboOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically add the provider to your state/backend
    console.log("Adding provider:", {
      name: customName,
      endpoint: customEndpoint,
      type: customType
    });
    setOpen(false);
    // Reset form
    setSelectedProvider(null);
    setCustomName("");
    setCustomEndpoint("");
    setCustomType("");
  };

  const getTypeColor = (type: string) => {
    return PROVIDER_TYPES.find(t => t.value === type)?.color || "bg-muted";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Provider</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="provider-select" className="text-foreground">Select Provider</Label>
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
                      <Badge className={`${getTypeColor(selectedProvider.type)} text-white`}>
                        {selectedProvider.type}
                      </Badge>
                      {selectedProvider.name}
                    </div>
                  ) : "Search providers..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 bg-popover border-border">
                <Command className="bg-popover">
                  <CommandInput placeholder="Search providers..." className="text-foreground" />
                  <CommandEmpty className="text-muted-foreground">No provider found.</CommandEmpty>
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
                            selectedProvider?.id === provider.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex items-center gap-2 flex-1">
                          <Badge className={`${getTypeColor(provider.type)} text-white text-xs`}>
                            {provider.type}
                          </Badge>
                          <span className="text-foreground">{provider.name}</span>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Provider Name</Label>
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
              <Label htmlFor="type" className="text-foreground">Type</Label>
              <Select value={customType} onValueChange={setCustomType} required>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {PROVIDER_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="text-foreground hover:bg-accent">
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
            <Label htmlFor="endpoint" className="text-foreground">API Endpoint</Label>
            <Input
              id="endpoint"
              value={customEndpoint}
              onChange={(e) => setCustomEndpoint(e.target.value)}
              placeholder="https://api.example.com"
              className="bg-input border-border text-foreground font-mono"
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-border text-foreground hover:bg-accent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="cyber"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Provider
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProviderDialog;