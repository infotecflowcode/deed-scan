import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { User, UserRole } from "@/types/auth";

interface UserFormProps {
  user?: User;
  onSubmit: (data: Omit<User, "id">) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const UserForm = ({ user, onSubmit, onCancel, isLoading = false }: UserFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "colaborador" as UserRole,
    contracts: [] as string[],
    isActive: true,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        contracts: user.contracts,
        isActive: user.isActive,
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.email.trim()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome Completo</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Ex: João Silva"
          required
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          placeholder="exemplo@email.com"
          required
        />
      </div>

      <div>
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          placeholder={user ? "Deixe em branco para manter" : "Senha temporária"}
          required={!user}
        />
      </div>

      <div>
        <Label htmlFor="role">Perfil</Label>
        <Select
          value={formData.role}
          onValueChange={(value: UserRole) => setFormData(prev => ({ ...prev, role: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o perfil" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="colaborador">Colaborador</SelectItem>
            <SelectItem value="lider">Líder</SelectItem>
            <SelectItem value="fiscal">Fiscal</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: !!checked }))}
        />
        <Label htmlFor="isActive">Usuário ativo</Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading || !formData.name.trim() || !formData.email.trim()}>
          {isLoading ? "Salvando..." : user ? "Atualizar" : "Criar"}
        </Button>
      </div>
    </form>
  );
};
