import { useState } from "react";
import { Gavel, Search, Edit, Trash2, Plus, X, Check, ChevronDown, ChevronRight, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface PenalCode {
  id: number;
  article: string;
  title: string;
  description: string;
  penalty: string;
  category: string;
}

interface PenalCodeSectionProps {
  data: PenalCode[];
  canEdit: boolean;
  onAdd: (code: Omit<PenalCode, 'id'>) => void;
  onEdit: (code: PenalCode) => void;
  onDelete: (code: PenalCode) => void;
}

const PenalCodeSection = ({ data, canEdit, onAdd, onEdit, onDelete }: PenalCodeSectionProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [editingCode, setEditingCode] = useState<PenalCode | null>(null);
  const [deletingCode, setDeletingCode] = useState<PenalCode | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    article: "",
    title: "",
    description: "",
    penalty: "",
    category: "",
  });

  // Filter and group by category
  const filteredData = data.filter(code =>
    code.article.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedData = filteredData.reduce((acc, code) => {
    if (!acc[code.category]) {
      acc[code.category] = [];
    }
    acc[code.category].push(code);
    return acc;
  }, {} as Record<string, PenalCode[]>);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleOpenEdit = (code: PenalCode) => {
    setEditingCode(code);
    setFormData({
      article: code.article,
      title: code.title,
      description: code.description,
      penalty: code.penalty,
      category: code.category,
    });
  };

  const handleOpenAdd = () => {
    setIsAdding(true);
    setFormData({
      article: "",
      title: "",
      description: "",
      penalty: "",
      category: "",
    });
  };

  const handleSave = () => {
    if (editingCode) {
      onEdit({ ...editingCode, ...formData });
      setEditingCode(null);
    } else if (isAdding) {
      onAdd(formData);
      setIsAdding(false);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingCode) {
      onDelete(deletingCode);
      setDeletingCode(null);
    }
  };

  const categories = Object.keys(groupedData);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Gavel className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Código Penal</h2>
            <p className="text-sm text-muted-foreground">{data.length} artigos cadastrados</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar artigo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64 bg-secondary/30 border-border/50"
            />
          </div>

          {canEdit && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/80 text-primary-foreground transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Adicionar</span>
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      {categories.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary/50 flex items-center justify-center">
            <Gavel className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Nenhum artigo encontrado</h3>
          <p className="text-muted-foreground">Tente ajustar sua busca ou adicione um novo artigo.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((category, catIndex) => (
            <Collapsible
              key={category}
              open={expandedCategories.includes(category)}
              onOpenChange={() => toggleCategory(category)}
            >
              <div 
                className="glass-card overflow-hidden animate-fade-up"
                style={{ animationDelay: `${catIndex * 0.05}s` }}
              >
                <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    {expandedCategories.includes(category) ? (
                      <ChevronDown className="w-5 h-5 text-primary" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                    <h3 className="text-lg font-semibold text-foreground">{category}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-secondary/50 text-xs text-muted-foreground">
                      {groupedData[category].length} artigos
                    </span>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="border-t border-border/50">
                    {groupedData[category].map((code, index) => (
                      <div 
                        key={code.id}
                        className={`p-4 flex items-start justify-between gap-4 ${
                          index !== groupedData[category].length - 1 ? 'border-b border-border/30' : ''
                        } hover:bg-secondary/20 transition-colors`}
                      >
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-1 rounded-lg bg-primary/20 text-primary text-sm font-mono font-semibold">
                              {code.article}
                            </span>
                            <h4 className="font-medium text-foreground">{code.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {code.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Pena:</span>
                            <span className="px-2 py-0.5 rounded bg-warning/20 text-warning text-xs font-medium">
                              {code.penalty}
                            </span>
                          </div>
                        </div>

                        {canEdit && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenEdit(code)}
                              className="p-2 rounded-lg bg-warning/10 hover:bg-warning/20 text-warning transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingCode(code)}
                              className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={!!editingCode || isAdding} onOpenChange={() => { setEditingCode(null); setIsAdding(false); }}>
        <DialogContent className="glass-card border-border/50 max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-foreground">
              <Gavel className="w-5 h-5 text-primary" />
              {editingCode ? 'Editar Artigo' : 'Adicionar Artigo'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Artigo</label>
                <Input
                  placeholder="Ex: Art. 121"
                  value={formData.article}
                  onChange={(e) => setFormData(prev => ({ ...prev, article: e.target.value }))}
                  className="bg-secondary/30 border-border/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Categoria</label>
                <Input
                  placeholder="Ex: Crimes contra a vida"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="bg-secondary/30 border-border/50"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Título</label>
              <Input
                placeholder="Título do artigo"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="bg-secondary/30 border-border/50"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Descrição</label>
              <Textarea
                placeholder="Descrição completa do artigo..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="bg-secondary/30 border-border/50 min-h-[100px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Pena</label>
              <Input
                placeholder="Ex: 6 a 20 anos de reclusão"
                value={formData.penalty}
                onChange={(e) => setFormData(prev => ({ ...prev, penalty: e.target.value }))}
                className="bg-secondary/30 border-border/50"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
              <button
                onClick={() => { setEditingCode(null); setIsAdding(false); }}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingCode} onOpenChange={() => setDeletingCode(null)}>
        <DialogContent className="glass-card border-border/50 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Confirmar Exclusão
            </DialogTitle>
          </DialogHeader>

          {deletingCode && (
            <div className="space-y-4 mt-4">
              <p className="text-muted-foreground">
                Tem certeza que deseja excluir o artigo <strong className="text-foreground">{deletingCode.article} - {deletingCode.title}</strong>?
              </p>
              <p className="text-sm text-muted-foreground">
                Esta ação não pode ser desfeita.
              </p>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                <button
                  onClick={() => setDeletingCode(null)}
                  className="px-4 py-2 rounded-lg bg-secondary/50 hover:bg-secondary text-muted-foreground transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-lg bg-destructive hover:bg-destructive/80 text-destructive-foreground transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PenalCodeSection;
