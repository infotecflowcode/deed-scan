import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { EvaluationCriteria } from "@/data/mockData";

interface EvaluationCriteriaFormProps {
  criterion?: EvaluationCriteria;
  onSubmit: (data: Omit<EvaluationCriteria, "id" | "contractId">) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const EvaluationCriteriaForm = ({ criterion, onSubmit, onCancel, isLoading = false }: EvaluationCriteriaFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    maxScore: 5,
    required: false,
  });

  useEffect(() => {
    if (criterion) {
      setFormData({
        name: criterion.name,
        maxScore: criterion.maxScore,
        required: criterion.required,
      });
    }
  }, [criterion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome do Critério</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Ex: Qualidade do Trabalho"
          required
        />
      </div>

      <div>
        <Label htmlFor="maxScore">Nota Máxima</Label>
        <Input
          id="maxScore"
          type="number"
          value={formData.maxScore}
          onChange={(e) => setFormData(prev => ({ ...prev, maxScore: parseInt(e.target.value) || 5 }))}
          min={1}
          max={10}
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="required"
          checked={formData.required}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, required: !!checked }))}
        />
        <Label htmlFor="required">Critério obrigatório</Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading || !formData.name.trim()}>
          {isLoading ? "Salvando..." : criterion ? "Atualizar" : "Criar"}
        </Button>
      </div>
    </form>
  );
};
