import { useState } from "react";
import { Medal, Edit, Users, DollarSign, Shield, X, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface Position {
  id: number;
  name: string;
  salary: string;
  officerCount: number;
  color: string;
  permissions: string[];
}

interface PositionsSectionProps {
  data: Position[];
  onEdit: (position: Position, permissions: string[]) => void;
}

const allPermissions = [
  { id: "dashboard", label: "Dashboard", description: "Acesso ao painel principal" },
  { id: "occurrences", label: "Ocorrências", description: "Gerenciar ocorrências" },
  { id: "citizens", label: "Cidadãos", description: "Consultar cidadãos" },
  { id: "vehicles", label: "Veículos", description: "Gerenciar veículos" },
  { id: "recruitment", label: "Recrutamento", description: "Gerenciar recrutamento" },
  { id: "missions", label: "Missões", description: "Acesso às missões" },
  { id: "positions", label: "Cargos", description: "Gerenciar cargos" },
  { id: "employees", label: "Funcionários", description: "Gerenciar funcionários" },
  { id: "penal-code", label: "Código Penal", description: "Editar código penal" },
  { id: "alerts", label: "Avisos", description: "Editar avisos" },
];

const PositionsSection = ({ data, onEdit }: PositionsSectionProps) => {
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const handleOpenEdit = (position: Position) => {
    setEditingPosition(position);
    setSelectedPermissions(position.permissions || []);
  };

  const handleTogglePermission = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(p => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSave = () => {
    if (editingPosition) {
      onEdit(editingPosition, selectedPermissions);
      setEditingPosition(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Medal className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Cargos</h2>
            <p className="text-sm text-muted-foreground">Gerenciamento de patentes</p>
          </div>
        </div>
        <div className="badge-primary">
          <Shield className="w-3 h-3" />
          Área Administrativa
        </div>
      </div>

      {/* Positions Grid */}
      <div className="grid gap-4">
        {data.map((position, index) => (
          <div 
            key={position.id}
            className="glass-card p-5 animate-fade-up hover:border-primary/30 transition-all duration-300"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Color indicator */}
                <div 
                  className="w-3 h-12 rounded-full"
                  style={{ backgroundColor: position.color }}
                />
                
                {/* Position info */}
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-foreground">{position.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-success" />
                      {position.salary}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-primary" />
                      {position.officerCount} {position.officerCount === 1 ? 'oficial' : 'oficiais'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Edit button */}
              <button
                onClick={() => handleOpenEdit(position)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-warning/10 hover:bg-warning/20 text-warning transition-colors duration-200"
              >
                <Edit className="w-4 h-4" />
                <span className="text-sm font-medium">Editar</span>
              </button>
            </div>

            {/* Permissions tags */}
            {position.permissions && position.permissions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <div className="flex flex-wrap gap-2">
                  {position.permissions.slice(0, 5).map(perm => {
                    const permInfo = allPermissions.find(p => p.id === perm);
                    return (
                      <span key={perm} className="px-2 py-1 text-xs rounded-md bg-secondary/50 text-muted-foreground">
                        {permInfo?.label || perm}
                      </span>
                    );
                  })}
                  {position.permissions.length > 5 && (
                    <span className="px-2 py-1 text-xs rounded-md bg-primary/20 text-primary">
                      +{position.permissions.length - 5} mais
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit Permissions Dialog */}
      <Dialog open={!!editingPosition} onOpenChange={() => setEditingPosition(null)}>
        <DialogContent className="glass-card border-border/50 max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-foreground">
              <div 
                className="w-3 h-8 rounded-full"
                style={{ backgroundColor: editingPosition?.color }}
              />
              Editar Permissões - {editingPosition?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Selecione as permissões para esta patente:
            </p>

            <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
              {allPermissions.map((permission) => (
                <label 
                  key={permission.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                    selectedPermissions.includes(permission.id)
                      ? 'border-primary/50 bg-primary/10'
                      : 'border-border/50 bg-secondary/30 hover:bg-secondary/50'
                  }`}
                >
                  <Checkbox
                    checked={selectedPermissions.includes(permission.id)}
                    onCheckedChange={() => handleTogglePermission(permission.id)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{permission.label}</p>
                    <p className="text-xs text-muted-foreground">{permission.description}</p>
                  </div>
                  {selectedPermissions.includes(permission.id) && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
              <button
                onClick={() => setEditingPosition(null)}
                className="px-4 py-2 rounded-lg bg-secondary/50 hover:bg-secondary text-muted-foreground transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/80 text-primary-foreground transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Salvar
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PositionsSection;
