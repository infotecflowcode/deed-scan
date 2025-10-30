import { useState, useEffect, useCallback } from "react";
import { Contract } from "@/data/mockData";
import { contracts as initialContracts } from "@/data/mockData";

const STORAGE_KEY = "contracts";

export const useContracts = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar contratos do localStorage
  const loadContracts = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const storedContracts: Contract[] = JSON.parse(stored);
        setContracts(storedContracts);
      } else {
        // Carregar dados iniciais
        setContracts(initialContracts);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialContracts));
      }
    } catch (error) {
      console.error("Erro ao carregar contratos:", error);
      setContracts(initialContracts);
    } finally {
      setIsLoading(false);
    }
  };

  // Salvar contratos no localStorage
  const saveContracts = useCallback((newContracts: Contract[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newContracts));
      setContracts(newContracts);
    } catch (error) {
      console.error("Erro ao salvar contratos:", error);
    }
  }, []);

  // Criar novo contrato
  const createContract = useCallback((contractData: Omit<Contract, "id" | "createdAt">) => {
    const newContract: Contract = {
      ...contractData,
      id: `contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    
    const updatedContracts = [...contracts, newContract];
    saveContracts(updatedContracts);
    return newContract;
  }, [contracts, saveContracts]);

  // Atualizar contrato existente
  const updateContract = useCallback((contractId: string, updates: Partial<Contract>) => {
    const updatedContracts = contracts.map(contract =>
      contract.id === contractId ? { ...contract, ...updates } : contract
    );
    saveContracts(updatedContracts);
  }, [contracts, saveContracts]);

  // Remover contrato
  const removeContract = useCallback((contractId: string) => {
    const updatedContracts = contracts.filter(contract => contract.id !== contractId);
    saveContracts(updatedContracts);
  }, [contracts, saveContracts]);

  // Obter contrato por ID
  const getContractById = useCallback((contractId: string) => {
    return contracts.find(contract => contract.id === contractId);
  }, [contracts]);

  // Carregar contratos na inicialização
  useEffect(() => {
    loadContracts();
  }, []); // Removido loadContracts das dependências para evitar loop

  return {
    contracts,
    isLoading,
    createContract,
    updateContract,
    removeContract,
    getContractById,
    loadContracts,
  };
};
