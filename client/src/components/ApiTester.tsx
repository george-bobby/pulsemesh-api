import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useProviders, ProviderWithMetrics } from "@/hooks/useProviders";
import {
  Play,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Code2,
  AlertCircle,
  Copy,
} from "lucide-react";

const HTTP_METHODS = [
  { value: "GET", label: "GET", color: "bg-green-500" },
  { value: "POST", label: "POST", color: "bg-blue-500" },
  { value: "PUT", label: "PUT", color: "bg-orange-500" },
  { value: "PATCH", label: "PATCH", color: "bg-purple-500" },
  { value: "DELETE", label: "DELETE", color: "bg-red-500" },
];

interface TestResult {
  status: "success" | "error";
  statusCode?: number;
  responseTime: number;
  responseSize?: number;
  headers?: Record<string, string>;
  body?: string;
  error?: string;
}

const ApiTester = () => {
  const [selectedProvider, setSelectedProvider] =
    useState<ProviderWithMetrics | null>(null);
  const [customEndpoint, setCustomEndpoint] = useState("");
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState("{}");
  const [body, setBody] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const { providers } = useProviders();
  const { toast } = useToast();

  const handleProviderSelect = (provider: ProviderWithMetrics) => {
    setSelectedProvider(provider);
    setCustomEndpoint(provider.endpoint);
  };

  const parseHeaders = (headersStr: string): Record<string, string> => {
    try {
      return JSON.parse(headersStr);
    } catch {
      return {};
    }
  };

  const runTest = async () => {
    const endpoint = selectedProvider
      ? selectedProvider.endpoint
      : customEndpoint;

    if (!endpoint.trim()) {
      toast({
        title: "Missing Endpoint",
        description: "Please provide an API endpoint to test.",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const startTime = Date.now();

      // Validate URL
      const url = new URL(endpoint);

      const requestHeaders = parseHeaders(headers);
      const requestInit: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "PulseMesh-Tester/1.0",
          ...requestHeaders,
        },
        mode: "cors",
      };

      if (method !== "GET" && method !== "HEAD" && body.trim()) {
        requestInit.body = body;
      }

      const response = await fetch(endpoint, requestInit);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Get response headers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      // Get response body
      const responseBody = await response.text();
      const responseSize = new Blob([responseBody]).size;

      setTestResult({
        status: response.ok ? "success" : "error",
        statusCode: response.status,
        responseTime,
        responseSize,
        headers: responseHeaders,
        body: responseBody,
      });

      toast({
        title: response.ok ? "Test Successful" : "Test Completed",
        description: `${response.status} ${response.statusText} in ${responseTime}ms`,
        variant: response.ok ? "default" : "destructive",
      });
    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - Date.now();

      setTestResult({
        status: "error",
        responseTime,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });

      toast({
        title: "Test Failed",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Content copied to clipboard.",
    });
  };

  const formatJson = (text: string) => {
    try {
      return JSON.stringify(JSON.parse(text), null, 2);
    } catch {
      return text;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Code2 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">API Tester</h2>
          <Badge variant="outline">Live Testing</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Configuration */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Provider (Optional)</Label>
              <Select
                value={selectedProvider?._id || ""}
                onValueChange={(value) => {
                  const provider = providers.find((p) => p._id === value);
                  if (provider) handleProviderSelect(provider);
                }}
              >
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue placeholder="Select a configured provider" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {providers.map((provider) => (
                    <SelectItem key={provider._id} value={provider._id!}>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary text-white text-xs">
                          {provider.type}
                        </Badge>
                        {provider.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <div className="w-32">
                <Label className="text-foreground">Method</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {HTTP_METHODS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${m.color}`} />
                          {m.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label className="text-foreground">Endpoint URL</Label>
                <Input
                  value={customEndpoint}
                  onChange={(e) => setCustomEndpoint(e.target.value)}
                  placeholder="https://api.example.com/endpoint"
                  className="bg-input border-border text-foreground font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Headers (JSON)</Label>
              <Textarea
                value={headers}
                onChange={(e) => setHeaders(e.target.value)}
                placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
                className="bg-input border-border text-foreground font-mono"
                rows={3}
              />
            </div>

            {method !== "GET" && method !== "HEAD" && (
              <div className="space-y-2">
                <Label className="text-foreground">Request Body</Label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder='{"key": "value"}'
                  className="bg-input border-border text-foreground font-mono"
                  rows={4}
                />
              </div>
            )}

            <Button
              onClick={runTest}
              disabled={isTesting}
              className="w-full gap-2"
              variant="cyber"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Test
                </>
              )}
            </Button>
          </div>

          {/* Response */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-foreground">Response</Label>
              {testResult && (
                <div className="flex items-center gap-2">
                  {testResult.status === "success" ? (
                    <CheckCircle className="w-4 h-4 text-success" />
                  ) : (
                    <XCircle className="w-4 h-4 text-error" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {testResult.responseTime}ms
                  </span>
                </div>
              )}
            </div>

            {testResult ? (
              <Card className="p-4">
                <div className="space-y-4">
                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {testResult.statusCode && (
                        <Badge
                          className={`${
                            testResult.status === "success"
                              ? "bg-success text-success-foreground"
                              : "bg-error text-error-foreground"
                          }`}
                        >
                          {testResult.statusCode}
                        </Badge>
                      )}
                      {testResult.responseSize && (
                        <span className="text-sm text-muted-foreground">
                          {testResult.responseSize} bytes
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span className="text-sm">
                        {testResult.responseTime}ms
                      </span>
                    </div>
                  </div>

                  {/* Error */}
                  {testResult.error && (
                    <div className="flex items-start gap-2 p-2 bg-error/10 border border-error/20 rounded">
                      <AlertCircle className="w-4 h-4 text-error mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-error">
                        {testResult.error}
                      </span>
                    </div>
                  )}

                  {/* Response Tabs */}
                  {(testResult.body || testResult.headers) && (
                    <Tabs defaultValue="body" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="body">Response Body</TabsTrigger>
                        <TabsTrigger value="headers">Headers</TabsTrigger>
                      </TabsList>

                      <TabsContent value="body" className="space-y-2">
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              testResult.body &&
                              copyToClipboard(testResult.body)
                            }
                            className="gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            Copy
                          </Button>
                        </div>
                        <pre className="bg-muted p-3 rounded text-sm overflow-auto max-h-64 font-mono">
                          {testResult.body
                            ? formatJson(testResult.body)
                            : "No response body"}
                        </pre>
                      </TabsContent>

                      <TabsContent value="headers" className="space-y-2">
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              testResult.headers &&
                              copyToClipboard(
                                JSON.stringify(testResult.headers, null, 2)
                              )
                            }
                            className="gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            Copy
                          </Button>
                        </div>
                        <pre className="bg-muted p-3 rounded text-sm overflow-auto max-h-64 font-mono">
                          {testResult.headers
                            ? JSON.stringify(testResult.headers, null, 2)
                            : "No headers"}
                        </pre>
                      </TabsContent>
                    </Tabs>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <Globe className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Configure your request and click "Run Test" to see the
                  response
                </p>
              </Card>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ApiTester;
