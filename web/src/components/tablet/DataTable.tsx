import { Eye, Edit, Trash2 } from "lucide-react";

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  onView?: (row: any) => void;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
}

const DataTable = ({ columns, data, onView, onEdit, onDelete }: DataTableProps) => {
  return (
    <div className="glass-card overflow-hidden animate-fade-up" style={{ animationDelay: "0.1s" }}>
      <div className="overflow-x-auto">
        <table className="table-modern">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
              {(onView || onEdit || onDelete) && <th className="text-right">Ações</th>}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length + (onView || onEdit || onDelete ? 1 : 0)}
                  className="text-center py-12 text-muted-foreground"
                >
                  Nenhum registro encontrado
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr 
                  key={row.id || index}
                  className="animate-fade-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                  {(onView || onEdit || onDelete) && (
                    <td>
                      <div className="flex justify-end gap-2">
                        {onView && (
                          <button
                            onClick={() => onView(row)}
                            className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors duration-200"
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            className="p-2 rounded-lg bg-warning/10 hover:bg-warning/20 text-warning transition-colors duration-200"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(row)}
                            className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors duration-200"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
