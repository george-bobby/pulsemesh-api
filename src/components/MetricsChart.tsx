import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from "recharts";

interface MetricsChartProps {
  title: string;
  subtitle?: string;
  data: any[];
  type?: "line" | "area";
  dataKey: string;
  color?: string;
  height?: number;
}

const MetricsChart = ({ 
  title, 
  subtitle, 
  data, 
  type = "line", 
  dataKey, 
  color = "hsl(200, 98%, 60%)",
  height = 200 
}: MetricsChartProps) => {
  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {type === "area" ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 32%, 17%)" />
              <XAxis 
                dataKey="time" 
                stroke="hsl(215, 20%, 65%)"
                fontSize={12}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                stroke="hsl(215, 20%, 65%)"
                fontSize={12}
                axisLine={false}
                tickLine={false}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                fill="url(#gradient)"
              />
            </AreaChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 32%, 17%)" />
              <XAxis 
                dataKey="time" 
                stroke="hsl(215, 20%, 65%)"
                fontSize={12}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                stroke="hsl(215, 20%, 65%)"
                fontSize={12}
                axisLine={false}
                tickLine={false}
              />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: color, strokeWidth: 2 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default MetricsChart;