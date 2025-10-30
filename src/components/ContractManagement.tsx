import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContractModal } from "./ContractModal";
import { Contract } from "@/data/mockData";
import { useContracts } from "@/hooks/useContracts";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Edit2, Eye, Users, DollarSign, Settings, ArrowRight } from "lucide-react";

export const ContractManagement = () => {
  const navigate = useNavigate();
  const { selectContract } = useAuth();
  const { contracts, createContract, updateContract, isLoading: contractsLoading } = useContracts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateContract = () => {
    setEditingContract(undefined);
    setIsModalOpen(true);
  };

  const handleEditContract = (contract: Contract) => {
    setEditingContract(contract);
    setIsModalOpen(true);
  };

  const handleAccessContract = (contractId: string) => {
    // Selecionar o contrato no contexto
    selectContract(contractId);
    
    // Redirecionar para a página principal
    navigate("/");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingContract(undefined);
  };

  const handleSubmitContract = async (data: Omit<Contract, "id" | "createdAt">) => {
    setIsSubmitting(true);
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (editingContract) {
        // Atualizar contrato existente
        updateContract(editingContract.id, data);
        console.log("Contrato atualizado:", { id: editingContract.id, ...data });
      } else {
        // Criar novo contrato
        const newContract = createContract(data);
        console.log("Contrato criado:", newContract);
      }
      
      handleCloseModal();
    } catch (error) {
      console.error("Erro ao salvar contrato:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBillingTypeLabel = (type: string) => {
    switch (type) {
      case "HH": return "Horas Homem";
      case "BPO": return "Business Process Outsourcing";
      case "ENTREGAVEL": return "Entregável";
      default: return type;
    }
  };

  const getBillingTypeColor = (type: string) => {
    switch (type) {
      case "HH": return "bg-blue-100 text-blue-800";
      case "BPO": return "bg-green-100 text-green-800";
      case "ENTREGAVEL": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (contractsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando contratos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Contratos</h2>
          <p className="text-muted-foreground">
            Gerencie contratos, grupos de trabalho e linhas de serviço
          </p>
        </div>
        <Button onClick={handleCreateContract}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Contrato
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contracts.map((contract) => (
          <Card key={contract.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{contract.name}</CardTitle>
                  <Badge className={getBillingTypeColor(contract.billingType)}>
                    {getBillingTypeLabel(contract.billingType)}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditContract(contract)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{contract.serviceGroups.length} grupos</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span>{contract.serviceLines.length} linhas</span>
                </div>
              </div>

              {contract.contractUsers && contract.contractUsers.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Pessoas Atribuídas:</h4>
                  <div className="flex flex-wrap gap-1">
                    {contract.contractUsers.slice(0, 3).map((contractUser) => (
                      <Badge key={contractUser.id} variant="secondary" className="text-xs">
                        {contractUser.role === "colaborador" && "👤"}
                        {contractUser.role === "lider" && "👨‍💼"}
                        {contractUser.role === "fiscal" && "👩‍💼"}
                        {contractUser.role}
                      </Badge>
                    ))}
                    {contract.contractUsers.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{contract.contractUsers.length - 3} mais
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Grupos de Trabalho:</h4>
                <div className="flex flex-wrap gap-1">
                  {contract.serviceGroups.slice(0, 3).map((group) => (
                    <Badge key={group.id} variant="outline" className="text-xs">
                      <div
                        className="w-2 h-2 rounded-full mr-1"
                        style={{ backgroundColor: group.color }}
                      />
                      {group.name}
                    </Badge>
                  ))}
                  {contract.serviceGroups.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{contract.serviceGroups.length - 3} mais
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Configurações:</h4>
                <div className="flex flex-wrap gap-1">
                  {contract.config.evidenceRequired && (
                    <Badge variant="secondary" className="text-xs">Evidências</Badge>
                  )}
                  {contract.config.documentsRequired && (
                    <Badge variant="secondary" className="text-xs">Documentos</Badge>
                  )}
                  {contract.config.unitRequired && (
                    <Badge variant="secondary" className="text-xs">Unidade</Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {contract.config.evaluationType === "numeric" ? "Numérico" : "Estrelas"}
                  </Badge>
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span>Criado em {new Date(contract.createdAt).toLocaleDateString('pt-BR')}</span>
                  <Badge variant={contract.status === "active" ? "default" : "secondary"}>
                    {contract.status === "active" ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <Button 
                  onClick={() => handleAccessContract(contract.id)}
                  className="w-full"
                  size="sm"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Acessar Contrato
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ContractModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        contract={editingContract}
        onSubmit={handleSubmitContract}
        isLoading={isSubmitting}
      />
    </div>
  );
};
