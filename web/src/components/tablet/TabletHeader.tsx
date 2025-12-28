import { Shield, Search, LogOut, X } from "lucide-react";

interface TabletHeaderProps {
  userName: string;
  userId: string;
  rank: string;
  isOnDuty: boolean;
  serviceTime: string;
  onClose: () => void;
  onToggleDuty: () => void;
}

const TabletHeader = ({
  userName,
  userId,
  rank,
  isOnDuty,
  serviceTime,
  onClose,
  onToggleDuty,
}: TabletHeaderProps) => {
  const currentDate = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="relative px-6 py-4 border-b border-border/50 bg-gradient-to-r from-card via-card/80 to-card">
      {/* Glow effect */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="flex items-center justify-between">
        {/* Left: Logo & Welcome */}
        <div className="flex items-center gap-4 animate-slide-in-left">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg glow-subtle">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-success border-2 border-card animate-pulse" />
          </div>
          
          <div>
            <h2 className="text-lg font-semibold gradient-text">Bem vindo,</h2>
            <p className="text-sm text-muted-foreground capitalize">{currentDate}</p>
          </div>
        </div>

        {/* Right: User Info & Actions */}
        <div className="flex items-center gap-6 animate-slide-in-right" style={{ animationDelay: "0.1s" }}>
          {/* User Info */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 text-sm text-foreground/90">
              <span className="text-muted-foreground">ID:</span>
              <span className="font-medium">{userId}</span>
              <span className="text-muted-foreground">|</span>
              <span className="font-medium">{userName}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              Posto: {rank}
            </span>
          </div>

          {/* Service Status */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-secondary/40 border border-border/40">
            <div className={`pulse-dot ${isOnDuty ? '' : 'warning'}`} />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">
                {isOnDuty ? "Em Serviço" : "Fora de Serviço"}
              </span>
              <span className="text-xs text-muted-foreground">
                Desde: {serviceTime}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="btn-secondary-glass flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span className="hidden lg:inline">Buscar</span>
            </button>
            
            <button 
              onClick={onToggleDuty}
              className={`btn-primary-glow flex items-center gap-2 ${
                !isOnDuty ? "bg-success" : ""
              }`}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden lg:inline">
                {isOnDuty ? "SAIR DE SERVIÇO" : "ENTRAR EM SERVIÇO"}
              </span>
            </button>
            
            <button 
              onClick={onClose}
              className="p-2.5 rounded-lg bg-destructive/20 border border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TabletHeader;
