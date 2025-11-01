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
    cpf: "",
    cargo: "",
    contracts: [] as string[],
    isActive: true,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: "", // Sempre começar vazio ao editar (senha não é mostrada por segurança)
        role: user.role,
        cpf: user.cpf || "",
        cargo: user.cargo || "",
        contracts: user.contracts,
        isActive: user.isActive,
      });
    } else {
      // Resetar formulário ao criar novo usuário
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "colaborador",
        cpf: "",
        cargo: "",
        contracts: [],
        isActive: true,
      });
    }
  }, [user]);

  // Função para formatar CPF (070.358.439-14)
  const formatCPF = (cpf: string): string => {
    // Remove tudo que não é dígito
    const numbers = cpf.replace(/\D/g, '');
    
    // Aplica a máscara
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    } else if (numbers.length <= 9) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    } else {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
    }
  };

  // Função para remover formatação do CPF (apenas números)
  const unformatCPF = (cpf: string): string => {
    return cpf.replace(/\D/g, '').slice(0, 11);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.email.trim()) {
      // Quando editando, só enviar senha se foi preenchida
      const dataToSubmit = { ...formData };
      if (user && !dataToSubmit.password.trim()) {
        // Remover senha se estiver vazia ao editar
        delete (dataToSubmit as any).password;
      }
      // Garantir que CPF está apenas com números para salvar no banco
      if (dataToSubmit.cpf) {
        dataToSubmit.cpf = unformatCPF(dataToSubmit.cpf);
      }
      onSubmit(dataToSubmit);
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            type="text"
            value={formatCPF(formData.cpf)}
            onChange={(e) => {
              // Remove formatação e limita a 11 dígitos
              const unformatted = unformatCPF(e.target.value);
              setFormData(prev => ({ ...prev, cpf: unformatted }));
            }}
            placeholder="000.000.000-00"
            maxLength={14}
          />
        </div>

        <div>
          <Label htmlFor="cargo">Cargo</Label>
          <Input
            id="cargo"
            value={formData.cargo}
            onChange={(e) => setFormData(prev => ({ ...prev, cargo: e.target.value }))}
            placeholder="Ex: Analista de Sistemas"
          />
        </div>
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
