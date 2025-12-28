import { Users } from "lucide-react";
import DataTable from "./DataTable";

interface Citizen {
  id: number;
  name: string;
  phone: string;
  registration: string;
}

interface CitizensSectionProps {
  data: Citizen[];
  onView: (row: Citizen) => void;
  onEdit: (row: Citizen) => void;
}

const CitizensSection = ({ data, onView, onEdit }: CitizensSectionProps) => {
  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Nome" },
    { key: "phone", label: "Celular" },
    { key: "registration", label: "Registro" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="section-header">
        <div className="section-title">
          <Users className="w-6 h-6" />
          <h2>Cidadãos</h2>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data}
        onView={onView}
        onEdit={onEdit}
      />
    </div>
  );
};

export default CitizensSection;
