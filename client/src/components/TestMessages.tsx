import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, User, Clock } from "lucide-react";

const TestMessages = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const messages = useQuery(api.messages.getAllMessages);
  const sendMessage = useMutation(api.messages.sendMessage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    setIsSubmitting(true);
    try {
      await sendMessage({ 
        title: title.trim() || undefined, 
        body: body.trim() 
      });
      setTitle("");
      setBody("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2" />
          Test Authentication with Messages
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Message title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full"
          />
          <Textarea
            placeholder="Write your message here..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full min-h-[100px]"
            required
          />
          <Button 
            type="submit" 
            disabled={isSubmitting || !body.trim()}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Recent Messages
        </h3>
        
        {messages === undefined ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No messages yet. Send the first one!
          </p>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-foreground">
                    {message.title}
                  </h4>
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm mb-3">
                  {message.body}
                </p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <User className="w-3 h-3 mr-1" />
                  {message.authorName} ({message.author})
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default TestMessages;
