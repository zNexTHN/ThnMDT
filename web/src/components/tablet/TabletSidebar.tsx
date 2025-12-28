import { 
  Home, 
  FileText, 
  Users, 
  Car, 
  ClipboardList, 
  UserPlus, 
  Medal, 
  BadgeCheck, 
  Clock, 
  Gavel 
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface TabletSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "Início", icon: <Home className="w-5 h-5" /> },
  { id: "occurrences", label: "Ocorrências", icon: <FileText className="w-5 h-5" /> },
  { id: "citizens", label: "Cidadãos", icon: <Users className="w-5 h-5" /> },
  { id: "vehicles", label: "Veículos", icon: <Car className="w-5 h-5" /> },
  { id: "missions", label: "Missões", icon: <ClipboardList className="w-5 h-5" /> },
  { id: "recruitment", label: "Recrutamento", icon: <UserPlus className="w-5 h-5" /> },
  { id: "positions", label: "Cargos", icon: <Medal className="w-5 h-5" /> },
  { id: "employees", label: "Funcionários", icon: <BadgeCheck className="w-5 h-5" /> },
  { id: "service", label: "Em Serviço", icon: <Clock className="w-5 h-5" /> },
  { id: "penal-code", label: "Código Penal", icon: <Gavel className="w-5 h-5" /> },
];

const TabletSidebar = ({ activeSection, onSectionChange }: TabletSidebarProps) => {
  return (
    <aside className="w-60 border-r border-border/40 bg-gradient-to-b from-sidebar to-sidebar/80 flex flex-col">
      {/* Decorative line */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-primary/20 via-primary/40 to-primary/20" />
      
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item, index) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`w-full nav-item-modern animate-fade-up ${
              activeSection === item.id ? "active" : ""
            }`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <span className={activeSection === item.id ? "text-primary" : ""}>
              {item.icon}
            </span>
            <span className="font-medium text-sm">{item.label}</span>
            
            {/* Active indicator */}
            {activeSection === item.id && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            )}
          </button>
        ))}
      </nav>

      {/* Bottom decoration */}
      <div className="p-4 border-t border-border/30">
        <div className="glass-card p-3 text-center">
          <p className="text-xs text-muted-foreground">Sistema Policial</p>
          <p className="text-sm font-semibold gradient-text">Orleans Nova</p>
        </div>
      </div>
    </aside>
  );
};

export default TabletSidebar;
