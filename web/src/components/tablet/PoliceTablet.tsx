import { useState } from "react";
import { ClipboardList } from "lucide-react";
import TabletHeader from "./TabletHeader";
import TabletSidebar from "./TabletSidebar";
import DashboardSection from "./DashboardSection";
import OccurrencesSection from "./OccurrencesSection";
import CitizensSection from "./CitizensSection";
import VehiclesSection from "./VehiclesSection";
import RecruitmentSection from "./RecruitmentSection";
import PositionsSection from "./PositionsSection";
import EmployeesSection from "./EmployeesSection";

import OnDutySection from "./OnDutySection";
import PenalCodeSection from "./PenalCodeSection";
import PlaceholderSection from "./PlaceholderSection";
import { closeTablet } from "@/lib/fivem";
import { toast } from "@/hooks/use-toast";

// Mock data
const mockOccurrences = [
  { id: 1, title: "Roubo em estabelecimento comercial", date: "2024-01-15", requester: "Maria Silva", openedBy: "Sgt. Silva", openedAt: "15/01/2024 14:30" },
  { id: 2, title: "Acidente de trânsito - Av. Principal", date: "2024-01-15", requester: "João Santos", openedBy: "Cabo Santos", openedAt: "15/01/2024 16:45" },
  { id: 3, title: "Furto de veículo", date: "2024-01-16", requester: "Pedro Costa", openedBy: "Ten. Costa", openedAt: "16/01/2024 10:15" },
];

const mockCitizens = [
  { id: 1, name: "Maria Silva", phone: "(11) 99999-1234", registration: "123.456.789-00" },
  { id: 2, name: "João Santos", phone: "(11) 98888-5678", registration: "987.654.321-00" },
  { id: 3, name: "Ana Oliveira", phone: "(11) 97777-9012", registration: "456.789.123-00" },
];

const mockVehicles = [
  { id: 1, plate: "ABC-1234", model: "Volkswagen Gol", owner: "Maria Silva", garage: "Centro", status: "Regular", irregular: false },
  { id: 2, plate: "DEF-5678", model: "Fiat Palio", owner: "João Santos", garage: "Sul", status: "Irregular", irregular: true },
  { id: 3, plate: "GHI-9012", model: "Chevrolet Onix", owner: "Pedro Costa", garage: "Norte", status: "Regular", irregular: false },
];

const mockRecruitment = [
  { id: 1, name: "Carlos Ferreira", grade: 8.5, status: "Aprovado", updatedBy: "Ten. Costa", updatedAt: "10/01/2024" },
  { id: 2, name: "Ana Souza", grade: 7.2, status: "Pendente", updatedBy: "Sgt. Silva", updatedAt: "12/01/2024" },
  { id: 3, name: "Lucas Martins", grade: 5.5, status: "Reprovado", updatedBy: "Cabo Santos", updatedAt: "14/01/2024" },
];

const mockPositions = [
  { id: 1, name: "Coronel", salary: "R$ 15.000", officerCount: 1, color: "#FFD700", permissions: ["dashboard", "occurrences", "citizens", "vehicles", "recruitment", "missions", "positions", "employees", "penal-code", "alerts"] },
  { id: 2, name: "Tenente-Coronel", salary: "R$ 12.000", officerCount: 2, color: "#C0C0C0", permissions: ["dashboard", "occurrences", "citizens", "vehicles", "recruitment", "employees", "penal-code"] },
  { id: 3, name: "Major", salary: "R$ 10.000", officerCount: 3, color: "#CD7F32", permissions: ["dashboard", "occurrences", "citizens", "vehicles", "recruitment"] },
  { id: 4, name: "Capitão", salary: "R$ 8.000", officerCount: 5, color: "#4169E1", permissions: ["dashboard", "occurrences", "citizens", "vehicles"] },
  { id: 5, name: "Tenente", salary: "R$ 6.000", officerCount: 8, color: "#32CD32", permissions: ["dashboard", "occurrences", "citizens", "vehicles"] },
  { id: 6, name: "Sargento", salary: "R$ 4.500", officerCount: 12, color: "#FF6347", permissions: ["dashboard", "occurrences", "citizens"] },
  { id: 7, name: "Cabo", salary: "R$ 3.500", officerCount: 15, color: "#9370DB", permissions: ["dashboard", "occurrences"] },
  { id: 8, name: "Soldado", salary: "R$ 2.500", officerCount: 20, color: "#20B2AA", permissions: ["dashboard"] },
];

const mockEmployees = [
  { id: 31228, name: "Bruno Thomas", rank: "Tenente", rankColor: "#32CD32", lastClockIn: "18/08/2025 11:39", isOnDuty: true, bulletinsCreated: 15, isRecruiter: true, clockHistory: [{ type: 'in' as const, date: "18/08/2025 11:39" }, { type: 'out' as const, date: "17/08/2025 22:00" }] },
  { id: 31229, name: "Maria Silva", rank: "Sargento", rankColor: "#FF6347", lastClockIn: "18/08/2025 08:00", isOnDuty: true, bulletinsCreated: 8, isRecruiter: false, clockHistory: [{ type: 'in' as const, date: "18/08/2025 08:00" }] },
  { id: 31230, name: "João Santos", rank: "Cabo", rankColor: "#9370DB", lastClockIn: "17/08/2025 14:30", isOnDuty: false, bulletinsCreated: 3, isRecruiter: false, clockHistory: [{ type: 'out' as const, date: "17/08/2025 22:30" }] },
  { id: 31231, name: "Ana Costa", rank: "Soldado", rankColor: "#20B2AA", lastClockIn: "18/08/2025 09:15", isOnDuty: true, bulletinsCreated: 1, isRecruiter: false, clockHistory: [{ type: 'in' as const, date: "18/08/2025 09:15" }] },
  { id: 31232, name: "Pedro Oliveira", rank: "Capitão", rankColor: "#4169E1", lastClockIn: "18/08/2025 07:00", isOnDuty: true, bulletinsCreated: 22, isRecruiter: true, clockHistory: [{ type: 'in' as const, date: "18/08/2025 07:00" }] },
];

const mockOnDuty = mockEmployees.filter(e => e.isOnDuty).map(e => ({
  id: e.id,
  name: e.name,
  rank: e.rank,
  rankColor: e.rankColor,
  clockInTime: e.lastClockIn,
}));

const mockPenalCode = [
  { id: 1, article: "Art. 121", title: "Homicídio Simples", description: "Matar alguém. Pena - reclusão, de seis a vinte anos.", penalty: "6 a 20 anos", category: "Crimes contra a vida" },
  { id: 2, article: "Art. 129", title: "Lesão Corporal", description: "Ofender a integridade corporal ou a saúde de outrem.", penalty: "3 meses a 1 ano", category: "Crimes contra a vida" },
  { id: 3, article: "Art. 155", title: "Furto", description: "Subtrair, para si ou para outrem, coisa alheia móvel.", penalty: "1 a 4 anos", category: "Crimes contra o patrimônio" },
  { id: 4, article: "Art. 157", title: "Roubo", description: "Subtrair coisa móvel alheia, para si ou para outrem, mediante grave ameaça ou violência.", penalty: "4 a 10 anos", category: "Crimes contra o patrimônio" },
  { id: 5, article: "Art. 180", title: "Receptação", description: "Adquirir, receber, transportar, conduzir ou ocultar, em proveito próprio ou alheio, coisa que sabe ser produto de crime.", penalty: "1 a 4 anos", category: "Crimes contra o patrimônio" },
  { id: 6, article: "Art. 288", title: "Associação Criminosa", description: "Associarem-se 3 ou mais pessoas, para o fim específico de cometer crimes.", penalty: "1 a 3 anos", category: "Crimes contra a paz pública" },
  { id: 7, article: "Art. 330", title: "Desobediência", description: "Desobedecer a ordem legal de funcionário público.", penalty: "15 dias a 6 meses", category: "Crimes contra a administração pública" },
  { id: 8, article: "Art. 331", title: "Desacato", description: "Desacatar funcionário público no exercício da função ou em razão dela.", penalty: "6 meses a 2 anos", category: "Crimes contra a administração pública" },
];

const initialAlertContent = `
<p><strong>🚔 PATRULHA:</strong></p>
<p>Agente: POL LC 14041</p>
<p>Veículo: POL LC 14041</p>
<p>PH: - POL LC 14041</p>
<p>Interpol: POL LC 14041</p>
<br/>
<p><strong>📢 AVISOS:</strong></p>
<p>Comando: 20:30hrs - Quinta</p>
<br/>
<p><strong>🔗 INFORMAR:</strong> https://discord.gg/aefq-jdm5</p>
<br/>
<p><strong>👥 EFETIVO:</strong> OPTIMIT</p>
`;

const PoliceTablet = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [alertContent, setAlertContent] = useState(initialAlertContent);
  const [alertLastUpdate, setAlertLastUpdate] = useState(new Date().toLocaleString("pt-BR"));

  // Stats
  const stats = {
    bulletins: mockOccurrences.length,
    officers: 44,
    onDuty: 12,
  };

  const handleClose = () => {
    closeTablet(); // <--- ADICIONE ISSO PARA DESTRAVAR A TELA E SUMIR O TABLET
    toast({
      title: "Tablet fechado",
      description: "O tablet policial foi fechado.",
    });
  };

  const handleToggleDuty = () => {
    setIsOnDuty(!isOnDuty);
    toast({
      title: isOnDuty ? "Saída de serviço" : "Entrada em serviço",
      description: isOnDuty 
        ? "Você saiu de serviço com sucesso." 
        : "Você entrou em serviço com sucesso.",
    });
  };

  const handleAlertSave = (content: string) => {
    setAlertContent(content);
    setAlertLastUpdate(new Date().toLocaleString("pt-BR"));
    toast({
      title: "Avisos atualizados",
      description: "Os avisos foram salvos com sucesso.",
    });
  };

  const handleAction = (action: string, item?: any) => {
    toast({
      title: `Ação: ${action}`,
      description: item ? `Item ID: ${item.id}` : "Ação executada",
    });
  };

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <DashboardSection
            stats={stats}
            alertContent={alertContent}
            alertLastUpdate={alertLastUpdate}
            onAlertSave={handleAlertSave}
          />
        );
      case "occurrences":
        return (
          <OccurrencesSection
            data={mockOccurrences}
            onAdd={() => handleAction("Adicionar ocorrência")}
            onView={(row) => handleAction("Visualizar", row)}
            onEdit={(row) => handleAction("Editar", row)}
            onDelete={(row) => handleAction("Excluir", row)}
          />
        );
      case "citizens":
        return (
          <CitizensSection
            data={mockCitizens}
            onView={(row) => handleAction("Visualizar", row)}
            onEdit={(row) => handleAction("Editar", row)}
          />
        );
      case "vehicles":
        return (
          <VehiclesSection
            data={mockVehicles}
            onAdd={() => handleAction("Vistoriar veículo")}
            onView={(row) => handleAction("Visualizar", row)}
            onEdit={(row) => handleAction("Editar", row)}
          />
        );
      case "recruitment":
        return (
          <RecruitmentSection
            data={mockRecruitment}
            onAdd={() => handleAction("Novo candidato")}
            onView={(row) => handleAction("Visualizar", row)}
            onEdit={(row) => handleAction("Editar", row)}
            onDelete={(row) => handleAction("Excluir", row)}
          />
        );
      case "missions":
        return <PlaceholderSection title="Missões" icon={<ClipboardList className="w-10 h-10" />} />;
      case "positions":
        return (
          <PositionsSection
            data={mockPositions}
            onEdit={(position, permissions) => {
              toast({ title: "Permissões atualizadas", description: `${position.name} atualizado com ${permissions.length} permissões.` });
            }}
          />
        );
      case "employees":
        return (
          <EmployeesSection
            data={mockEmployees}
            ranks={mockPositions.map(p => ({ id: p.id, name: p.name, color: p.color }))}
            onEdit={(emp, newRank) => {
              toast({ title: "Patente alterada", description: `${emp.name} agora é ${newRank}.` });
            }}
            onToggleRecruiter={(emp) => {
              toast({ title: emp.isRecruiter ? "Recrutador removido" : "Recrutador adicionado", description: `${emp.name}` });
            }}
            onDismiss={(emp) => {
              toast({ title: "Oficial exonerado", description: `${emp.name} foi exonerado.`, variant: "destructive" });
            }}
          />
        );
      case "service":
        return <OnDutySection data={mockOnDuty} />;
      case "penal-code":
        return (
          <PenalCodeSection
            data={mockPenalCode}
            canEdit={true}
            onAdd={(code) => toast({ title: "Artigo adicionado", description: code.title })}
            onEdit={(code) => toast({ title: "Artigo editado", description: code.title })}
            onDelete={(code) => toast({ title: "Artigo excluído", description: code.title, variant: "destructive" })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full max-w-7xl h-[90vh] max-h-[900px] glass-card overflow-hidden flex flex-col animate-scale-in">
      {/* Header */}
      <TabletHeader
        userName="Bruno Thomas"
        userId="31228"
        rank="Policial - Tenente"
        isOnDuty={isOnDuty}
        serviceTime="18/08/2025 11:39"
        onClose={handleClose}
        onToggleDuty={handleToggleDuty}
      />

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <TabletSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto bg-background">
          {renderSection()}
        </main>
      </div>
    </div>
  );
};

export default PoliceTablet;
