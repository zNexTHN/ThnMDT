import { Car, Plus, CheckCircle, XCircle } from "lucide-react";
import DataTable from "./DataTable";

interface Vehicle {
  id: number;
  plate: string;
  model: string;
  owner: string;
  garage: string;
  status: string;
  irregular: boolean;
}

interface VehiclesSectionProps {
  data: Vehicle[];
  onAdd: () => void;
  onView: (row: Vehicle) => void;
  onEdit: (row: Vehicle) => void;
}

const VehiclesSection = ({ data, onAdd, onView, onEdit }: VehiclesSectionProps) => {
  const columns = [
    { key: "plate", label: "Placa" },
    { key: "model", label: "Modelo" },
    { key: "owner", label: "Proprietário" },
    { key: "garage", label: "Garagem" },
    { 
      key: "status", 
      label: "Status",
      render: (value: string) => (
        <span className={`status-badge ${value === "Regular" ? "success" : "warning"}`}>
          {value}
        </span>
      )
    },
    { 
      key: "irregular", 
      label: "Irregular",
      render: (value: boolean) => (
        <span className={`flex items-center gap-1 ${value ? "text-destructive" : "text-success"}`}>
          {value ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          {value ? "Sim" : "Não"}
        </span>
      )
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="section-header">
        <div className="section-title">
          <Car className="w-6 h-6" />
          <h2>Veículos</h2>
        </div>
        <button onClick={onAdd} className="btn-primary-glow flex items-center gap-2">
          <Plus className="w-4 h-4" />
          VISTORIAR VEÍCULO
        </button>
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

export default VehiclesSection;
