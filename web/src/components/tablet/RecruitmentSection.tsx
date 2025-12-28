import { UserPlus, Plus } from "lucide-react";
import DataTable from "./DataTable";

interface Candidate {
  id: number;
  name: string;
  grade: number;
  status: string;
  updatedBy: string;
  updatedAt: string;
}

interface RecruitmentSectionProps {
  data: Candidate[];
  onAdd: () => void;
  onView: (row: Candidate) => void;
  onEdit: (row: Candidate) => void;
  onDelete: (row: Candidate) => void;
}

const RecruitmentSection = ({ data, onAdd, onView, onEdit, onDelete }: RecruitmentSectionProps) => {
  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Nome" },
    { 
      key: "grade", 
      label: "Nota",
      render: (value: number) => (
        <span className={`font-semibold ${
          value >= 8 ? "text-success" : value >= 6 ? "text-warning" : "text-destructive"
        }`}>
          {value.toFixed(1)}
        </span>
      )
    },
    { 
      key: "status", 
      label: "Status",
      render: (value: string) => {
        const statusClass = 
          value === "Aprovado" ? "success" : 
          value === "Reprovado" ? "destructive" : 
          value === "Pendente" ? "warning" : "info";
        return (
          <span className={`status-badge ${statusClass}`}>
            {value}
          </span>
        );
      }
    },
    { key: "updatedBy", label: "Atualizado por" },
    { key: "updatedAt", label: "Atualizado em" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="section-header">
        <div className="section-title">
          <UserPlus className="w-6 h-6" />
          <h2>Recrutamento</h2>
        </div>
        <button onClick={onAdd} className="btn-primary-glow flex items-center gap-2">
          <Plus className="w-4 h-4" />
          NOVO CANDIDATO
        </button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
};

export default RecruitmentSection;
