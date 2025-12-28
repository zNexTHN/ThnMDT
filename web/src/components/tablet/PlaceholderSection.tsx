import { Construction } from "lucide-react";

interface PlaceholderSectionProps {
  title: string;
  icon: React.ReactNode;
}

const PlaceholderSection = ({ title, icon }: PlaceholderSectionProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] animate-fade-up">
      <div className="glass-card p-12 text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-secondary/50 flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground mb-6">
          Esta seção está em desenvolvimento.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-primary">
          <Construction className="w-4 h-4" />
          <span>Em breve disponível</span>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderSection;
