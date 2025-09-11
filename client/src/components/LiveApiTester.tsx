import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Play, 
  CreditCard, 
  MessageSquare, 
  Mail, 
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2
} from "lucide-react";
import { apiManager } from "@/lib/apiResilienceManager";
import { useToast } from "@/hooks/use-toast";

interface TestRequest {
  id: string;
  type: "payment" | "sms" | "email" | "maps";
  status: "pending" | "success" | "failed" | "running";
  provider?: string;
  duration?: number;
  error?: string;
  timestamp: Date;
  data?: any;
}

const LiveApiTester = () => {
  const [requests, setRequests] = useState<TestRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [testData, setTestData] = useState({
    payment: { amount: 100, currency: "usd", description: "Test payment" },
    sms: { to: "+1234567890", message: "Test SMS from API Resilience Hub" },
    email: { to: "test@example.com", subject: "Test Email", body: "This is a test email" },
    maps: { address: "1600 Amphitheatre Parkway, Mountain View, CA" }
  });

  const testApiEndpoint = async (type: "payment" | "sms" | "email" | "maps") => {
    const requestId = `req-${Date.now()}`;
    const newRequest: TestRequest = {
      id: requestId,
      type,
      status: "running",
      timestamp: new Date()
    };

    setRequests(prev => [newRequest, ...prev]);
    setIsLoading(true);

    try {
      const startTime = Date.now();
      const result = await apiManager.makeRequest(type, testData[type]);
      const duration = Date.now() - startTime;

      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { 
              ...req, 
              status: "success", 
              provider: result.provider,
              duration,
              data: result.data
            }
          : req
      ));

      toast({
        title: "API Request Successful",
        description: `${result.provider} processed the request in ${duration}ms`,
      });

    } catch (error) {
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { 
              ...req, 
              status: "failed", 
              error: error instanceof Error ? error.message : "Unknown error"
            }
          : req
      ));

      toast({
        title: "API Request Failed", 
        description: error instanceof Error ? error.message : "All providers failed",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "payment":
        return <CreditCard className="w-4 h-4" />;
      case "sms":
        return <MessageSquare className="w-4 h-4" />;
      case "email":
        return <Mail className="w-4 h-4" />;
      case "maps":
        return <MapPin className="w-4 h-4" />;
      default:
        return <Play className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-error" />;
      case "running":
        return <Loader2 className="w-4 h-4 text-warning animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
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
    <div className="space-y-6">
      {/* Test Controls */}
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Live API Testing
          </h2>
          <p className="text-sm text-muted-foreground">
            Test real failover scenarios across different API providers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Payment Test */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-primary" />
              <h3 className="font-medium text-foreground">Payment</h3>
            </div>
            <div className="space-y-2">
              <Input
                placeholder="Amount"
                value={testData.payment.amount}
                onChange={(e) => setTestData(prev => ({
                  ...prev,
                  payment: { ...prev.payment, amount: Number(e.target.value) }
                }))}
              />
              <Input
                placeholder="Currency"
                value={testData.payment.currency}
                onChange={(e) => setTestData(prev => ({
                  ...prev,
                  payment: { ...prev.payment, currency: e.target.value }
                }))}
              />
            </div>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => testApiEndpoint("payment")}
              disabled={isLoading}
            >
              Test Payment
            </Button>
          </div>

          {/* SMS Test */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <h3 className="font-medium text-foreground">SMS</h3>
            </div>
            <div className="space-y-2">
              <Input
                placeholder="Phone Number"
                value={testData.sms.to}
                onChange={(e) => setTestData(prev => ({
                  ...prev,
                  sms: { ...prev.sms, to: e.target.value }
                }))}
              />
              <Input
                placeholder="Message"
                value={testData.sms.message}
                onChange={(e) => setTestData(prev => ({
                  ...prev,
                  sms: { ...prev.sms, message: e.target.value }
                }))}
              />
            </div>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => testApiEndpoint("sms")}
              disabled={isLoading}
            >
              Send SMS
            </Button>
          </div>

          {/* Email Test */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-primary" />
              <h3 className="font-medium text-foreground">Email</h3>
            </div>
            <div className="space-y-2">
              <Input
                placeholder="Email Address"
                value={testData.email.to}
                onChange={(e) => setTestData(prev => ({
                  ...prev,
                  email: { ...prev.email, to: e.target.value }
                }))}
              />
              <Input
                placeholder="Subject"
                value={testData.email.subject}
                onChange={(e) => setTestData(prev => ({
                  ...prev,
                  email: { ...prev.email, subject: e.target.value }
                }))}
              />
            </div>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => testApiEndpoint("email")}
              disabled={isLoading}
            >
              Send Email
            </Button>
          </div>

          {/* Maps Test */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-primary" />
              <h3 className="font-medium text-foreground">Maps</h3>
            </div>
            <div className="space-y-2">
              <Input
                placeholder="Address"
                value={testData.maps.address}
                onChange={(e) => setTestData(prev => ({
                  ...prev,
                  maps: { ...prev.maps, address: e.target.value }
                }))}
              />
            </div>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => testApiEndpoint("maps")}
              disabled={isLoading}
            >
              Geocode
            </Button>
          </div>
        </div>
      </Card>

      {/* Request History */}
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Request History
          </h3>
          <p className="text-sm text-muted-foreground">
            Live results showing provider selection and failover behavior
          </p>
        </div>

        <div className="space-y-3">
          {requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Play className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No requests yet. Test an API endpoint above to see results.</p>
            </div>
          ) : (
            requests.map((request) => (
              <div 
                key={request.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {getTypeIcon(request.type)}
                  {getStatusIcon(request.status)}
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-foreground capitalize">
                        {request.type} Request
                      </span>
                      <Badge className={`${getStatusColor(request.status)} border text-xs`}>
                        {request.status.toUpperCase()}
                      </Badge>
                      {request.provider && (
                        <Badge variant="outline" className="text-xs">
                          {request.provider}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      {request.timestamp.toLocaleTimeString()}
                      {request.duration && ` • ${request.duration}ms`}
                      {request.error && ` • ${request.error}`}
                    </div>
                  </div>
                </div>

                {request.status === "success" && request.duration && (
                  <div className="text-right">
                    <div className="text-sm font-medium text-success">
                      {request.duration}ms
                    </div>
                    <div className="text-xs text-muted-foreground">Response Time</div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default LiveApiTester;