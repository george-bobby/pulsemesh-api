import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatusCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  status: "success" | "warning" | "error" | "neutral";
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  icon?: React.ReactNode;
}

const StatusCard = ({ 
  title, 
  value, 
  subtitle, 
  status, 
  trend, 
  trendValue, 
  icon 
}: StatusCardProps) => {
  const statusColors = {
    success: "text-success",
    warning: "text-warning", 
    error: "text-error",
    neutral: "text-muted-foreground"
  };

  const statusBadges = {
    success: "bg-success/20 text-success border-success/30",
    warning: "bg-warning/20 text-warning border-warning/30",
    error: "bg-error/20 text-error border-error/30", 
    neutral: "bg-muted text-muted-foreground border-border"
  };

  const getTrendIcon = () => {
    if (trend === "up") return <TrendingUp className="w-3 h-3" />;
    if (trend === "down") return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  const getTrendColor = () => {
    if (trend === "up") return "text-success";
    if (trend === "down") return "text-error";
    return "text-muted-foreground";
  };

  return (
    <Card className="p-6 hover:bg-card/80 transition-colors border-border">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {icon && <div className="text-muted-foreground">{icon}</div>}
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          </div>
          
          <div className="flex items-baseline space-x-2 mb-2">
            <span className={`text-2xl font-bold ${statusColors[status]}`}>
              {value}
            </span>
            {subtitle && (
              <span className="text-sm text-muted-foreground">{subtitle}</span>
            )}
          </div>

          {trend && trendValue && (
            <div className={`flex items-center space-x-1 text-xs ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>{trendValue}</span>
              <span className="text-muted-foreground">from yesterday</span>
            </div>
          )}
        </div>

        <Badge className={`${statusBadges[status]} border`}>
          {status === "success" ? "Healthy" : 
           status === "warning" ? "Warning" :
           status === "error" ? "Critical" : "Unknown"}
        </Badge>
      </div>
    </Card>
  );
};

export default StatusCard;