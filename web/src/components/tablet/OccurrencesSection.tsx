import { FileText, Plus } from "lucide-react";
import DataTable from "./DataTable";

interface Occurrence {
  id: number;
  title: string;
  date: string;
  requester: string;
  openedBy: string;
  openedAt: string;
}

interface OccurrencesSectionProps {
  data: Occurrence[];
  onAdd: () => void;
  onView: (row: Occurrence) => void;
  onEdit: (row: Occurrence) => void;
  onDelete: (row: Occurrence) => void;
}

const OccurrencesSection = ({ data, onAdd, onView, onEdit, onDelete }: OccurrencesSectionProps) => {
  const columns = [
    { key: "id", label: "ID" },
    { key: "title", label: "Título" },
    { key: "date", label: "Data" },
    { key: "requester", label: "Requerente" },
    { key: "openedBy", label: "Aberto por" },
    { key: "openedAt", label: "Aberto em" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="section-header">
        <div className="section-title">
          <FileText className="w-6 h-6" />
          <h2>Ocorrências</h2>
        </div>
        <button onClick={onAdd} className="btn-primary-glow flex items-center gap-2">
          <Plus className="w-4 h-4" />
          ADICIONAR
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

export default OccurrencesSection;
