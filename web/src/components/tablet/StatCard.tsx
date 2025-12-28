import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: number | string;
  indicators?: number;
  delay?: string;
}

const StatCard = ({ icon: Icon, title, value, indicators = 0, delay = "0s" }: StatCardProps) => {
  return (
    <div 
      className="stat-card group animate-fade-up"
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 group-hover:border-primary/40 transition-colors duration-300">
            <Icon className="w-7 h-7 text-primary" />
          </div>
          <div className="absolute inset-0 rounded-2xl bg-primary/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold gradient-text">{value}</p>
        </div>

        {/* Indicators */}
        {indicators > 0 && (
          <div className="flex flex-col gap-1.5">
            {Array.from({ length: indicators }).map((_, i) => (
              <span 
                key={i} 
                className="w-2 h-2 rounded-full bg-destructive animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
