import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActivityType } from "@/data/mockData";

interface ActivityTypeFormProps {
  type?: ActivityType;
  onSubmit: (data: Omit<ActivityType, "id" | "contractId">) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ActivityTypeForm = ({ type, onSubmit, onCancel, isLoading = false }: ActivityTypeFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
  });

  useEffect(() => {
    if (type) {
      setFormData({
        name: type.name,
      });
    }
  }, [type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome do Tipo</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Ex: Manutenção de BOP"
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading || !formData.name.trim()}>
          {isLoading ? "Salvando..." : type ? "Atualizar" : "Criar"}
        </Button>
      </div>
    </form>
  );
};
