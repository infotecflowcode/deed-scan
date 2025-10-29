import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, Clock, DollarSign } from "lucide-react";

export default function ContractSelection() {
  const { user, availableContracts, selectContract, currentContract } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Se não há usuário logado, redirecionar para login
    if (!user) {
      navigate("/login");
      return;
    }

    // Se há apenas um contrato, selecionar automaticamente
    if (availableContracts.length === 1) {
      selectContract(availableContracts[0].id);
      navigate("/");
    }
  }, [user, availableContracts, selectContract, navigate]);

  const handleSelectContract = (contractId: string) => {
    selectContract(contractId);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Selecione um Contrato
          </h1>
          <p className="text-gray-600">
            Olá, <strong>{user.name}</strong>! Escolha o contrato que deseja acessar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableContracts.map((contract) => (
            <Card 
              key={contract.id} 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
              onClick={() => handleSelectContract(contract.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{contract.name}</CardTitle>
                    <CardDescription className="mt-1">
                      Código: {contract.code}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={contract.status === "active" ? "default" : "secondary"}
                    className="ml-2"
                  >
                    {contract.status === "active" ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {getBillingTypeIcon(contract.billingType)}
                    <span>{getBillingTypeLabel(contract.billingType)}</span>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Criado em: {new Date(contract.createdAt).toLocaleDateString("pt-BR")}
                  </div>

                  <Button 
                    className="w-full" 
                    variant={currentContract?.id === contract.id ? "default" : "outline"}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectContract(contract.id);
                    }}
                  >
                    {currentContract?.id === contract.id ? "Contrato Atual" : "Selecionar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {availableContracts.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum contrato disponível</h3>
              <p className="text-muted-foreground mb-4">
                Você não tem acesso a nenhum contrato ativo no momento.
              </p>
              <Button 
                variant="outline" 
                onClick={() => navigate("/login")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Login
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="text-center mt-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/login")}
            className="text-muted-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Trocar Usuário
          </Button>
        </div>
      </div>
    </div>
  );
}
