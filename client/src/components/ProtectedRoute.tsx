import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { SignInButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Shield, Lock } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  return (
    <>
      <AuthLoading>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-cyber rounded-lg flex items-center justify-center shadow-glow mx-auto mb-4 animate-pulse">
              <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </AuthLoading>

      <Unauthenticated>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-16 h-16 bg-gradient-cyber rounded-lg flex items-center justify-center shadow-glow mx-auto mb-6">
              <Lock className="w-8 h-8 text-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">Authentication Required</h1>
            <p className="text-muted-foreground mb-6">
              You need to sign in to access this page. Please sign in to continue.
            </p>
            <div className="space-y-3">
              <SignInButton mode="modal">
                <Button variant="cyber" className="w-full">
                  <Shield className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </SignInButton>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = "/home"}
              >
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        {children}
      </Authenticated>
    </>
  );
};

export default ProtectedRoute;
