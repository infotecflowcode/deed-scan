import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface RoleBasedRedirectProps {
  children: React.ReactNode;
}

export const RoleBasedRedirect = ({ children }: RoleBasedRedirectProps) => {
  const { isAuthenticated, isLoading, user, currentContract } = useAuth();

  console.log("🔍 RoleBasedRedirect - Debug:", {
    isLoading,
    isAuthenticated,
    user: user ? { id: user.id, name: user.name, role: user.role } : null,
    currentContract: currentContract?.name
  });

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
    console.log("❌ Usuário não autenticado, redirecionando para login");
    return <Navigate to="/login" replace />;
  }

  // Se é administrador e não tem contrato selecionado, redirecionar para AdminDashboard
  if (user.role === "admin" && !currentContract) {
    console.log("🔑 Admin sem contrato, redirecionando para /admin");
    return <Navigate to="/admin" replace />;
  }

  // Se não tem contrato selecionado (qualquer role), redirecionar para seleção
  if (!currentContract) {
    console.log("📋 Sem contrato selecionado, redirecionando para seleção");
    return <Navigate to="/contract-selection" replace />;
  }

  // Para outros roles, mostrar o conteúdo normal
  return <>{children}</>;
};
