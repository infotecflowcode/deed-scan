import { User, LogOut } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const roleColors = {
  colaborador: "bg-blue-500",
  lider: "bg-green-500",
  fiscal: "bg-yellow-500",
  admin: "bg-red-500",
};

const roleLabels = {
  colaborador: "Colaborador",
  lider: "Líder",
  fiscal: "Fiscal",
  admin: "Admin",
};

export const UserSelector = () => {
  const { user, logout, currentContract, availableContracts, selectContract } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleContractChange = (contractId: string) => {
    selectContract(contractId);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Seletor de Contrato */}
      {availableContracts.length > 1 && (
        <Select
          value={currentContract?.id || ""}
          onValueChange={handleContractChange}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Selecionar contrato" />
          </SelectTrigger>
          <SelectContent>
            {availableContracts.map((contract) => (
              <SelectItem key={contract.id} value={contract.id}>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{contract.name}</span>
                  <span className="text-xs text-muted-foreground">{contract.code}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Informações do Usuário */}
      <div className="flex items-center gap-2">
        <User className="w-4 h-4 text-muted-foreground" />
        <div className="flex items-center gap-2">
          <Badge className={`${roleColors[user.role]} text-white text-xs`}>
            {roleLabels[user.role]}
          </Badge>
          <span className="text-sm font-medium">{user.name}</span>
        </div>
      </div>

      {/* Botão de Logout */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleLogout}
        title="Sair"
      >
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );
};
