import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Activity, 
  Zap, 
  BarChart3, 
  Eye, 
  CheckCircle2,
  ArrowRight,
  Github,
  Star,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const features = [
    {
      icon: <Activity className="w-6 h-6" />,
      title: "Real-Time Monitoring",
      description: "Monitor API health, latency, and error rates across all your providers with live dashboards and alerts."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Intelligent Failover",
      description: "Automatic failover to backup providers when issues are detected, ensuring zero downtime for critical services."
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "AI-Powered Resilience",
      description: "Machine learning algorithms predict outages and anomalies before they impact your users."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Advanced Analytics",
      description: "Comprehensive performance analytics and SLA reporting to optimize your API strategy."
    }
  ];

  const stats = [
    { label: "APIs Monitored", value: "10K+" },
    { label: "Uptime Improved", value: "99.9%" },
    { label: "Companies Trust Us", value: "500+" },
    { label: "Incidents Prevented", value: "2.5K+" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/95">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-cyber rounded-lg flex items-center justify-center shadow-glow">
                <Shield className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">API Resilience Hub</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
              <Link to="/dashboard">
                <Button variant="cyber">
                  View Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30">
              <Star className="w-3 h-3 mr-1" />
              Enterprise-Grade API Resilience
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Bulletproof Your
              <span className="bg-gradient-cyber bg-clip-text text-transparent"> API Infrastructure</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Intelligent middleware platform that monitors, predicts, and automatically handles API failures 
              across multiple providers. Never lose a transaction again.
            </p>

            <div className="flex items-center justify-center space-x-4 mb-12">
              <Link to="/dashboard">
                <Button variant="cyber" size="lg" className="animate-pulse-glow">
                  <Shield className="w-5 h-5 mr-2" />
                  Try Live Demo
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                <Users className="w-5 h-5 mr-2" />
                Book Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Built for Mission-Critical Applications
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive API resilience with intelligent monitoring, predictive analytics, 
              and automated failover systems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-glow transition-all duration-300 border-border">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to Eliminate API Downtime?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join hundreds of companies protecting their revenue with intelligent API resilience.
            </p>
            
            <div className="flex items-center justify-center space-x-4">
              <Link to="/dashboard">
                <Button variant="cyber" size="lg">
                  <Shield className="w-5 h-5 mr-2" />
                  Start Free Trial
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                Schedule Demo
              </Button>
            </div>

            <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>Setup in 5 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 bg-card">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-cyber rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">API Resilience Hub</span>
          </div>
          <p className="text-muted-foreground text-sm">
            © 2024 API Resilience Hub. Built with Lovable for demonstration purposes.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
