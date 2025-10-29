import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ContractForm } from "./ContractForm";
import { Contract } from "@/data/mockData";

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract?: Contract;
  onSubmit: (data: Omit<Contract, "id" | "createdAt">) => void;
  isLoading?: boolean;
}

export const ContractModal = ({ isOpen, onClose, contract, onSubmit, isLoading = false }: ContractModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {contract ? "Editar Contrato" : "Criar Novo Contrato"}
          </DialogTitle>
          <DialogDescription>
            {contract 
              ? "Atualize as informações do contrato, grupos de trabalho e linhas de serviço."
              : "Configure um novo contrato com grupos de trabalho, linhas de serviço e suas configurações."
            }
          </DialogDescription>
        </DialogHeader>
        
        <ContractForm
          contract={contract}
          onSubmit={onSubmit}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};
