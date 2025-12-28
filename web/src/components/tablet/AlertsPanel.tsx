import { useState } from "react";
import { AlertTriangle, Edit3, Save, X } from "lucide-react";

interface AlertsPanelProps {
  content: string;
  lastUpdate: string;
  onSave: (content: string) => void;
}

const AlertsPanel = ({ content, lastUpdate, onSave }: AlertsPanelProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);

  const handleSave = () => {
    onSave(editContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(content);
    setIsEditing(false);
  };

  return (
    <div className="glass-card p-5 h-full flex flex-col animate-fade-up" style={{ animationDelay: "0.2s" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center border border-warning/30">
            <AlertTriangle className="w-5 h-5 text-warning" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Avisos</h3>
        </div>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 rounded-lg bg-secondary/50 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all duration-200"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="p-2 rounded-lg bg-success/20 hover:bg-success/30 text-success transition-all duration-200"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancel}
              className="p-2 rounded-lg bg-destructive/20 hover:bg-destructive/30 text-destructive transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isEditing ? (
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="input-modern h-full min-h-[200px] resize-none font-mono text-sm"
            placeholder="Digite os avisos aqui..."
          />
        ) : (
          <div className="prose prose-sm prose-invert max-w-none">
            <div 
              className="text-foreground/90 leading-relaxed space-y-3"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-border/30">
        <p className="text-xs text-muted-foreground">
          Última atualização: {lastUpdate}
        </p>
      </div>
    </div>
  );
};

export default AlertsPanel;
