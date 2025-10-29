import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "colaborador" | "lider" | "fiscal" | "admin";
  requireContract?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  requireContract = true 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, currentContract } = useAuth();

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado, redirecionar para login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Se requer contrato mas não há contrato selecionado, redirecionar para seleção
  if (requireContract && !currentContract) {
    return <Navigate to="/contract-selection" replace />;
  }

  // Se requer role específico, verificar permissão
  if (requiredRole && user.role !== requiredRole) {
    // Redirecionar para página de acesso negado ou dashboard
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
