import { FileText, Users, Clock } from "lucide-react";
import StatCard from "./StatCard";
import AlertsPanel from "./AlertsPanel";
import ServiceChart from "./ServiceChart";

interface DashboardSectionProps {
  stats: {
    bulletins: number;
    officers: number;
    onDuty: number;
  };
  alertContent: string;
  alertLastUpdate: string;
  onAlertSave: (content: string) => void;
}

const DashboardSection = ({ 
  stats, 
  alertContent, 
  alertLastUpdate, 
  onAlertSave 
}: DashboardSectionProps) => {
  return (
    <div className="space-y-6">
      {/* Quick Actions Title */}
      <div className="flex items-center gap-3 animate-fade-up">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <span className="text-primary">⚡</span>
        </div>
        <h2 className="text-xl font-semibold text-foreground">Ações Rápidas</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          icon={FileText}
          title="Boletins"
          value={stats.bulletins}
          indicators={2}
          delay="0.1s"
        />
        <StatCard
          icon={Users}
          title="Policiais"
          value={stats.officers}
          indicators={2}
          delay="0.15s"
        />
        <StatCard
          icon={Clock}
          title="Em Serviço"
          value={stats.onDuty}
          indicators={1}
          delay="0.2s"
        />
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertsPanel
          content={alertContent}
          lastUpdate={alertLastUpdate}
          onSave={onAlertSave}
        />
        <ServiceChart
          onDuty={stats.onDuty}
          offDuty={stats.officers - stats.onDuty}
        />
      </div>
    </div>
  );
};

export default DashboardSection;
