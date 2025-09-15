import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Shield,
  Settings,
  BarChart3,
  Brain,
  Bell,
  User,
  Menu,
  X,
  ShieldAlert,
} from "lucide-react";
import { GoShieldCheck } from "react-icons/go";
import { UserButton } from "@clerk/clerk-react";
import { Authenticated, Unauthenticated } from "convex/react";
import RealTimeStatus from "./RealTimeStatus";
const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navItems = [
    {
      icon: Activity,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: Shield,
      label: "Providers",
      href: "/providers",
    },
    {
      icon: BarChart3,
      label: "Analytics",
      href: "/analytics",
    },
    {
      icon: Brain,
      label: "Predictive",
      href: "/predictive",
    },
    {
      icon: ShieldAlert,
      label: "Fallback",
      href: "/fallback",
    },
    {
      icon: Bell,
      label: "Alerts",
      href: "/alerts",
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/settings",
    },
  ];
  return (
    <nav className="bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <GoShieldCheck size={25} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-foreground">PulseMesh</h1>
              {/* <p className="text-xs text-muted-foreground">
                Intelligent Middleware Platform
              </p> */}
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${location.pathname === item.href ? "bg-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Authenticated>
              <RealTimeStatus />
              <Button variant="ghost" size="icon">
                <Bell className="w-4 h-4" />
              </Button>
              <UserButton />
            </Authenticated>

            <Unauthenticated>
              <Link to="/home">
                <Button variant="outline" size="sm">
                  Home
                </Button>
              </Link>
            </Unauthenticated>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${location.pathname === item.href ? "bg-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
export default Navigation;
