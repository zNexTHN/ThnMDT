import { TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface ServiceChartProps {
  onDuty: number;
  offDuty: number;
}

const ServiceChart = ({ onDuty, offDuty }: ServiceChartProps) => {
  const data = [
    { name: "Em Serviço", value: onDuty, color: "hsl(142, 70%, 45%)" },
    { name: "Folga", value: offDuty, color: "hsl(215, 25%, 35%)" },
  ];

  const total = onDuty + offDuty;

  return (
    <div className="glass-card p-5 h-full flex flex-col animate-fade-up" style={{ animationDelay: "0.3s" }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Policiais em Serviço</h3>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  className="transition-all duration-300 hover:opacity-80"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(222, 47%, 10%)",
                border: "1px solid hsl(215, 25%, 25%)",
                borderRadius: "8px",
                color: "hsl(210, 40%, 98%)",
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value: string) => (
                <span className="text-sm text-muted-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border/30">
        <div className="text-center">
          <p className="text-2xl font-bold text-success">{onDuty}</p>
          <p className="text-xs text-muted-foreground">Em Serviço</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-muted-foreground">{offDuty}</p>
          <p className="text-xs text-muted-foreground">Em Folga</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Taxa de atividade</span>
          <span>{total > 0 ? Math.round((onDuty / total) * 100) : 0}%</span>
        </div>
        <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-success to-primary transition-all duration-500 rounded-full"
            style={{ width: `${total > 0 ? (onDuty / total) * 100 : 0}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ServiceChart;
