import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EvaluationCriteria } from "@/data/mockData";
import { Plus, Trash2, Edit, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContractEvaluationCriteriaProps {
  criteria: EvaluationCriteria[];
  onCriteriaChange: (criteria: EvaluationCriteria[]) => void;
}

export const ContractEvaluationCriteria = ({ criteria, onCriteriaChange }: ContractEvaluationCriteriaProps) => {
  const { toast } = useToast();
  const [editingCriterion, setEditingCriterion] = useState<EvaluationCriteria | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Estado do formulário de edição
  const [formData, setFormData] = useState({
    name: "",
    maxScore: 5,
    required: false,
    description: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      maxScore: 5,
      required: false,
      description: "",
    });
    setEditingCriterion(null);
    setIsCreating(false);
  };

  const startCreating = () => {
    resetForm();
    setIsCreating(true);
  };

  const startEditing = (criterion: EvaluationCriteria) => {
    setFormData({
      name: criterion.name,
      maxScore: criterion.maxScore,
      required: criterion.required,
      description: criterion.description || "",
    });
    setEditingCriterion(criterion);
    setIsCreating(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome do critério é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (formData.maxScore < 1 || formData.maxScore > 10) {
      toast({
        title: "Erro",
        description: "Nota máxima deve estar entre 1 e 10",
        variant: "destructive",
      });
      return;
    }

    const criterionData: EvaluationCriteria = {
      id: editingCriterion?.id || `criteria-${Date.now()}`,
      name: formData.name.trim(),
      maxScore: formData.maxScore,
      required: formData.required,
      description: formData.description.trim() || undefined,
      contractId: editingCriterion?.contractId,
    };

    if (editingCriterion) {
      const updatedCriteria = criteria.map(c => c.id === editingCriterion.id ? criterionData : c);
      onCriteriaChange(updatedCriteria);
      toast({
        title: "Sucesso",
        description: "Critério atualizado com sucesso",
      });
    } else {
      onCriteriaChange([...criteria, criterionData]);
      toast({
        title: "Sucesso",
        description: "Critério criado com sucesso",
      });
    }

    resetForm();
  };

  const handleDelete = (criterionId: string) => {
    const updatedCriteria = criteria.filter(c => c.id !== criterionId);
    onCriteriaChange(updatedCriteria);
    toast({
      title: "Sucesso",
      description: "Critério removido com sucesso",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Critérios de Avaliação do Contrato</h3>
          <p className="text-sm text-muted-foreground">
            Configure os critérios específicos para avaliação das atividades deste contrato
          </p>
        </div>
        <Button size="sm" onClick={startCreating}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Critério
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de Critérios */}
        <div className="space-y-4">
          <h4 className="font-medium">Critérios Configurados</h4>
          {criteria.length === 0 ? (
            <Card>
              <CardContent className="text-center py-6">
                <p className="text-muted-foreground text-sm">
                  Nenhum critério configurado ainda.
                </p>
                <Button onClick={startCreating} size="sm" className="mt-2">
                  Criar Primeiro Critério
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {criteria.map((criterion) => (
                <Card key={criterion.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{criterion.name}</span>
                          {criterion.required && (
                            <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            Máx: {criterion.maxScore}
                          </Badge>
                        </div>
                        {criterion.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {criterion.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => startEditing(criterion)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(criterion.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Formulário de Edição */}
        {isCreating && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {editingCriterion ? "Editar Critério" : "Novo Critério"}
              </CardTitle>
              <CardDescription className="text-sm">
                Configure as propriedades do critério de avaliação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="name" className="text-sm">Nome do Critério</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="ex: Qualidade Técnica"
                  className="h-8"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="maxScore" className="text-sm">Nota Máxima</Label>
                  <Input
                    id="maxScore"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.maxScore}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxScore: parseInt(e.target.value) || 5 }))}
                    className="h-8"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    id="required"
                    checked={formData.required}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, required: !!checked }))}
                  />
                  <Label htmlFor="required" className="text-sm">Critério obrigatório</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-sm">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição detalhada do critério..."
                  className="h-16"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button variant="outline" size="sm" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleSave}>
                  {editingCriterion ? "Atualizar" : "Criar"} Critério
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
