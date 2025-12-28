import { Clock, Users, Radio } from "lucide-react";

interface Officer {
  id: number;
  name: string;
  rank: string;
  rankColor: string;
  clockInTime: string;
}

interface OnDutySectionProps {
  data: Officer[];
}

const OnDutySection = ({ data }: OnDutySectionProps) => {
  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
            <Radio className="w-5 h-5 text-success animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Em Serviço</h2>
            <p className="text-sm text-muted-foreground">Oficiais atualmente de ponto batido</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-success/10 border border-success/20">
          <Users className="w-4 h-4 text-success" />
          <span className="text-success font-semibold">{data.length}</span>
          <span className="text-muted-foreground text-sm">online</span>
        </div>
      </div>

      {/* Officers Grid */}
      {data.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary/50 flex items-center justify-center">
            <Clock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Nenhum oficial em serviço</h3>
          <p className="text-muted-foreground">Não há oficiais com ponto batido no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((officer, index) => (
            <div 
              key={officer.id}
              className="glass-card p-4 animate-fade-up hover:border-success/30 transition-all duration-300"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold"
                      style={{ 
                        backgroundColor: `${officer.rankColor}20`,
                        color: officer.rankColor 
                      }}
                    >
                      {officer.name.charAt(0)}
                    </div>
                    {/* Online indicator */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-background flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
                    </div>
                  </div>

                  {/* Info */}
                  <div>
                    <h3 className="font-medium text-foreground">{officer.name}</h3>
                    <span 
                      className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
                      style={{ 
                        backgroundColor: `${officer.rankColor}20`,
                        color: officer.rankColor 
                      }}
                    >
                      <span 
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: officer.rankColor }}
                      />
                      {officer.rank}
                    </span>
                  </div>
                </div>

                {/* ID Badge */}
                <span className="px-2 py-1 rounded-lg bg-secondary/50 text-xs font-mono text-muted-foreground">
                  #{officer.id}
                </span>
              </div>

              {/* Clock in time */}
              <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Entrada
                </span>
                <span className="text-foreground font-medium">{officer.clockInTime}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {data.length > 0 && (
        <div className="glass-card p-4 mt-6">
          <div className="flex flex-wrap items-center justify-center gap-8 text-center">
            <div>
              <p className="text-2xl font-bold text-success">{data.length}</p>
              <p className="text-xs text-muted-foreground">Oficiais Ativos</p>
            </div>
            <div className="w-px h-8 bg-border/50" />
            <div>
              <p className="text-2xl font-bold text-primary">
                {new Set(data.map(o => o.rank)).size}
              </p>
              <p className="text-xs text-muted-foreground">Patentes Diferentes</p>
            </div>
            <div className="w-px h-8 bg-border/50" />
            <div>
              <p className="text-2xl font-bold text-foreground">
                {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xs text-muted-foreground">Horário Atual</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnDutySection;
