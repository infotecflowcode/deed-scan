import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ServiceGroup } from "@/data/mockData";

interface ServiceGroupFormProps {
  group?: ServiceGroup;
  onSubmit: (data: Omit<ServiceGroup, "id" | "contractId">) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ServiceGroupForm = ({ group, onSubmit, onCancel, isLoading = false }: ServiceGroupFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    color: "#3B82F6",
  });

  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name,
        color: group.color,
      });
    }
  }, [group]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome do Grupo</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Ex: Manutenção"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="color">Cor</Label>
        <div className="flex items-center gap-2">
          <Input
            id="color"
            type="color"
            value={formData.color}
            onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
            className="w-16 h-10"
          />
          <Input
            value={formData.color}
            onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
            placeholder="#3B82F6"
            className="flex-1"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading || !formData.name.trim()}>
          {isLoading ? "Salvando..." : group ? "Atualizar" : "Criar"}
        </Button>
      </div>
    </form>
  );
};
