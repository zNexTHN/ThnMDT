import { useState } from "react";
import { BadgeCheck, Edit, UserPlus, UserX, Search, Clock, FileText, ChevronUp, ChevronDown, X, Check, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface Employee {
  id: number;
  name: string;
  rank: string;
  rankColor: string;
  lastClockIn: string;
  isOnDuty: boolean;
  bulletinsCreated: number;
  isRecruiter: boolean;
  clockHistory: { type: 'in' | 'out'; date: string }[];
}

interface EmployeesSectionProps {
  data: Employee[];
  ranks: { id: number; name: string; color: string }[];
  onEdit: (employee: Employee, newRank: string) => void;
  onToggleRecruiter: (employee: Employee) => void;
  onDismiss: (employee: Employee) => void;
}

const EmployeesSection = ({ data, ranks, onEdit, onToggleRecruiter, onDismiss }: EmployeesSectionProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [dismissingEmployee, setDismissingEmployee] = useState<Employee | null>(null);
  const [selectedRank, setSelectedRank] = useState("");

  const filteredData = data.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.id.toString().includes(searchTerm) ||
    emp.rank.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setSelectedRank(employee.rank);
  };

  const handleSaveEdit = () => {
    if (editingEmployee && selectedRank) {
      onEdit(editingEmployee, selectedRank);
      setEditingEmployee(null);
    }
  };

  const handleConfirmDismiss = () => {
    if (dismissingEmployee) {
      onDismiss(dismissingEmployee);
      setDismissingEmployee(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <BadgeCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Funcionários</h2>
            <p className="text-sm text-muted-foreground">{data.length} oficiais registrados</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID, nome ou patente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64 bg-secondary/30 border-border/50"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Patente</th>
                <th>Último Ponto</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted-foreground">
                    Nenhum funcionário encontrado
                  </td>
                </tr>
              ) : (
                filteredData.map((employee, index) => (
                  <tr 
                    key={employee.id}
                    className="animate-fade-up"
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    <td className="font-mono text-primary">{employee.id}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{employee.name}</span>
                        {employee.isRecruiter && (
                          <span className="px-1.5 py-0.5 text-xs rounded bg-success/20 text-success">
                            Recrutador
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span 
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-sm"
                        style={{ 
                          backgroundColor: `${employee.rankColor}20`,
                          color: employee.rankColor 
                        }}
                      >
                        <span 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: employee.rankColor }}
                        />
                        {employee.rank}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{employee.lastClockIn}</span>
                        {employee.isOnDuty && (
                          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(employee)}
                          className="p-2 rounded-lg bg-warning/10 hover:bg-warning/20 text-warning transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onToggleRecruiter(employee)}
                          className={`p-2 rounded-lg transition-colors ${
                            employee.isRecruiter
                              ? 'bg-success/20 hover:bg-success/30 text-success'
                              : 'bg-secondary/50 hover:bg-secondary text-muted-foreground'
                          }`}
                          title={employee.isRecruiter ? "Remover Recrutador" : "Tornar Recrutador"}
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDismissingEmployee(employee)}
                          className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
                          title="Exonerar"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Employee Dialog */}
      <Dialog open={!!editingEmployee} onOpenChange={() => setEditingEmployee(null)}>
        <DialogContent className="glass-card border-border/50 max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-foreground">
              <Edit className="w-5 h-5 text-warning" />
              Editar Funcionário
            </DialogTitle>
          </DialogHeader>

          {editingEmployee && (
            <div className="space-y-6 mt-4">
              {/* Employee Info */}
              <div className="glass-card p-4 bg-secondary/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">
                      {editingEmployee.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{editingEmployee.name}</h3>
                    <p className="text-sm text-muted-foreground">ID: {editingEmployee.id}</p>
                  </div>
                </div>
              </div>

              {/* Clock History */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Histórico de Ponto
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {editingEmployee.clockHistory.map((entry, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 text-sm"
                    >
                      <span className={`flex items-center gap-2 ${
                        entry.type === 'in' ? 'text-success' : 'text-warning'
                      }`}>
                        {entry.type === 'in' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        {entry.type === 'in' ? 'Entrada' : 'Saída'}
                      </span>
                      <span className="text-muted-foreground">{entry.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bulletins Created */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  Boletins Criados
                </span>
                <span className="text-lg font-semibold text-foreground">{editingEmployee.bulletinsCreated}</span>
              </div>

              {/* Change Rank */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Alterar Patente</h4>
                <Select value={selectedRank} onValueChange={setSelectedRank}>
                  <SelectTrigger className="bg-secondary/30 border-border/50">
                    <SelectValue placeholder="Selecione a patente" />
                  </SelectTrigger>
                  <SelectContent>
                    {ranks.map((rank) => (
                      <SelectItem key={rank.id} value={rank.name}>
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: rank.color }}
                          />
                          {rank.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                <button
                  onClick={() => setEditingEmployee(null)}
                  className="px-4 py-2 rounded-lg bg-secondary/50 hover:bg-secondary text-muted-foreground transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/80 text-primary-foreground transition-colors flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Salvar
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dismiss Confirmation Dialog */}
      <Dialog open={!!dismissingEmployee} onOpenChange={() => setDismissingEmployee(null)}>
        <DialogContent className="glass-card border-border/50 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Confirmar Exoneração
            </DialogTitle>
          </DialogHeader>

          {dismissingEmployee && (
            <div className="space-y-4 mt-4">
              <p className="text-muted-foreground">
                Tem certeza que deseja exonerar <strong className="text-foreground">{dismissingEmployee.name}</strong>?
              </p>
              <p className="text-sm text-muted-foreground">
                Esta ação não pode ser desfeita.
              </p>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                <button
                  onClick={() => setDismissingEmployee(null)}
                  className="px-4 py-2 rounded-lg bg-secondary/50 hover:bg-secondary text-muted-foreground transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDismiss}
                  className="px-4 py-2 rounded-lg bg-destructive hover:bg-destructive/80 text-destructive-foreground transition-colors flex items-center gap-2"
                >
                  <UserX className="w-4 h-4" />
                  Exonerar
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeesSection;
