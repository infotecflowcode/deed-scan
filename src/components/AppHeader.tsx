import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserSelector } from "@/components/UserSelector";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, Plus, Settings, ArrowLeft } from "lucide-react";

interface AppHeaderProps {
  showContractInfo?: boolean;
  showNewActivity?: boolean;
  showBackButton?: boolean;
  backTo?: string;
  backLabel?: string;
  customActions?: React.ReactNode;
}

export const AppHeader = ({
  showContractInfo = true,
  showNewActivity = false,
  showBackButton = false,
  backTo = "/",
  backLabel = "Voltar",
  customActions
}: AppHeaderProps) => {
  const { user: currentUser, currentContract } = useAuth();

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <Link to={backTo}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
            )}
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">CDA</h1>
              <p className="text-sm text-muted-foreground">
                Sistema de Controle de Atividades
              </p>
              {showContractInfo && currentContract && (
                <div className="mt-1">
                  <span className="text-xs text-muted-foreground">Contrato: </span>
                  <span className="text-xs font-medium text-primary">
                    {currentContract.name}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({currentContract.billingType})
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <UserSelector />
            {showContractInfo && currentContract && (
              <Link to="/contract-selection">
                <Button variant="outline" size="sm">
                  Trocar Contrato
                </Button>
              </Link>
            )}
            {currentUser?.role === "admin" && (
              <Link to="/admin">
                <Button variant="outline" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
            )}
            {customActions}
          </div>
        </div>
      </div>
    </header>
  );
};
