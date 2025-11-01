import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useContracts } from "@/hooks/useContracts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, Clock, DollarSign, Loader2 } from "lucide-react";

export default function ContractSelection() {
  const { user, selectContract, currentContract } = useAuth();
  const { contracts, isLoading } = useContracts();
  const navigate = useNavigate();

  // Filtrar contratos baseado no usuário logado
  const availableContracts = useMemo(() => {
    if (!user) return [];
    
    // Se for admin, mostrar todos os contratos ativos
    if (user.role === "admin") {
      return contracts.filter(contract => contract.status === "active");
    }
    
    // Para outros roles, verificar se o usuário está nos contractUsers do contrato
    return contracts.filter(contract => {
      const isActive = contract.status === "active";
      const hasUserInContract = contract.contractUsers?.some(
        contractUser => contractUser.userId === user.id
      );
      
      return isActive && hasUserInContract;
    });
  }, [contracts, user?.id, user?.role]); // Dependências mais específicas

  useEffect(() => {
    // Se não há usuário logado, redirecionar para login
    if (!user) {
      navigate("/login");
      return;
    }
  }, [user, navigate]);

  // Seleção automática se houver apenas 1 contrato disponível
  useEffect(() => {
    if (!isLoading && availableContracts.length === 1 && !currentContract) {
      // Selecionar automaticamente o único contrato disponível
      selectContract(availableContracts[0].id);
      // Redirecionar para a página principal
      navigate("/");
    }
  }, [isLoading, availableContracts, currentContract, selectContract, navigate]);

  const handleSelectContract = (contractId: string) => {
    // Selecionar o contrato no contexto
    selectContract(contractId);
    
    // Redirecionar para a página principal
    navigate("/");
  };

  const getBillingTypeIcon = (type: string) => {
    switch (type) {
      case "HH":
        return <Clock className="h-4 w-4" />;
      case "BPO":
        return <Building2 className="h-4 w-4" />;
      case "ENTREGAVEL":
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Building2 className="h-4 w-4" />;
    }
  };

  const getBillingTypeLabel = (type: string) => {
    switch (type) {
      case "HH":
        return "Horas/Homem";
      case "BPO":
        return "BPO";
      case "ENTREGAVEL":
        return "Entregável";
      default:
        return type;
    }
  };

  if (!user) {
    return null;
  }

  // Mostrar loading enquanto carrega os contratos
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando contratos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Selecione um Contrato
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Olá, <span className="font-semibold text-blue-600">{user.name}</span>! 
            Escolha o contrato que deseja acessar para continuar.
          </p>
        </div>

        {/* Contracts Grid */}
        <div className="max-w-7xl mx-auto">
          {availableContracts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {availableContracts.map((contract) => (
                <Card 
                  key={contract.id} 
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg bg-white/80 backdrop-blur-sm"
                  onClick={() => handleSelectContract(contract.id)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 pr-4">
                        <CardTitle className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {contract.name}
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-500 font-mono">
                          ID: {contract.id.slice(-8)}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={contract.status === "active" ? "default" : "secondary"}
                        className={`ml-2 ${
                          contract.status === "active" 
                            ? "bg-green-100 text-green-800 border-green-200" 
                            : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                      >
                        {contract.status === "active" ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {/* Billing Type */}
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                          {getBillingTypeIcon(contract.billingType)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {getBillingTypeLabel(contract.billingType)}
                          </p>
                          <p className="text-xs text-gray-500">Tipo de Cobrança</p>
                        </div>
                      </div>

                      {/* Contract Stats - Apenas para administradores */}
                      {user.role === "admin" && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">
                              {contract.serviceGroups?.length || 0}
                            </p>
                            <p className="text-xs text-blue-600 font-medium">Grupos</p>
                          </div>
                          <div className="text-center p-3 bg-indigo-50 rounded-lg">
                            <p className="text-2xl font-bold text-indigo-600">
                              {contract.serviceLines?.length || 0}
                            </p>
                            <p className="text-xs text-indigo-600 font-medium">Linhas</p>
                          </div>
                        </div>
                      )}

                      {/* Creation Date */}
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                          Criado em <span className="font-medium">
                            {new Date(contract.createdAt).toLocaleDateString("pt-BR")}
                          </span>
                        </p>
                      </div>

                      {/* Action Button */}
                      <Button 
                        className={`w-full h-12 font-semibold transition-all duration-200 ${
                          currentContract?.id === contract.id 
                            ? "bg-green-600 hover:bg-green-700 text-white" 
                            : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectContract(contract.id);
                        }}
                      >
                        {currentContract?.id === contract.id ? (
                          <>
                            <div className="w-2 h-2 bg-green-300 rounded-full mr-2"></div>
                            Contrato Atual
                          </>
                        ) : (
                          "Selecionar Contrato"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Nenhum contrato disponível
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Você não tem acesso a nenhum contrato ativo no momento. 
                Entre em contato com o administrador.
              </p>
              <Button 
                variant="outline" 
                onClick={() => navigate("/login")}
                className="px-8 py-3"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Login
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/login")}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Trocar Usuário
          </Button>
        </div>
      </div>
    </div>
  );
}
