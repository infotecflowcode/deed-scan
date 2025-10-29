import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContractModal } from "./ContractModal";
import { Contract, contracts } from "@/data/mockData";
import { Plus, Edit2, Eye, Users, DollarSign, Settings } from "lucide-react";

export const ContractManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateContract = () => {
    setEditingContract(undefined);
    setIsModalOpen(true);
  };

  const handleEditContract = (contract: Contract) => {
    setEditingContract(contract);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingContract(undefined);
  };

  const handleSubmitContract = async (data: Omit<Contract, "id" | "createdAt">) => {
    setIsLoading(true);
    try {
      // Simular chamada à API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Dados do contrato:", data);
      
      // Aqui você faria a chamada real para a API
      // await createContract(data);
      
      handleCloseModal();
    } catch (error) {
      console.error("Erro ao salvar contrato:", error);
    } finally {
      setIsLoading(false);
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
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Criado em {new Date(contract.createdAt).toLocaleDateString('pt-BR')}</span>
                  <Badge variant={contract.status === "active" ? "default" : "secondary"}>
                    {contract.status === "active" ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
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
        isLoading={isLoading}
      />
    </div>
  );
};
