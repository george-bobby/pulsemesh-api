import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Calendar } from "lucide-react";

const UserProfile = () => {
  const userProfile = useQuery(api.messages.getUserProfile);

  if (!userProfile) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4"></div>
          <div className="h-4 bg-muted rounded w-3/4 mx-auto mb-2"></div>
          <div className="h-3 bg-muted rounded w-1/2 mx-auto"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-cyber rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow">
          {userProfile.profileImageUrl ? (
            <img 
              src={userProfile.profileImageUrl} 
              alt={userProfile.name || "User"} 
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <User className="w-8 h-8 text-foreground" />
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {userProfile.name || "Anonymous User"}
        </h3>
        
        <div className="flex items-center justify-center space-x-1 text-muted-foreground mb-3">
          <Mail className="w-4 h-4" />
          <span className="text-sm">{userProfile.email}</span>
        </div>
        
        <Badge variant="secondary" className="text-xs">
          <Calendar className="w-3 h-3 mr-1" />
          User ID: {userProfile.userId?.slice(0, 8)}...
        </Badge>
      </div>
    </Card>
  );
};

export default UserProfile;
