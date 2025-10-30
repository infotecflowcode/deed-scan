import { useState, useEffect, useCallback } from "react";
import { ActivityType, activityTypes as initialTypes } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";

const STORAGE_KEY = "activity_types";

export const useActivityTypes = () => {
  const { currentContract } = useAuth();
  const [types, setTypes] = useState<ActivityType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar tipos do localStorage
  const loadTypes = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const allTypes: ActivityType[] = JSON.parse(stored);
        const contractTypes = allTypes.filter(
          type => type.contractId === currentContract?.id
        );
        setTypes(contractTypes);
      } else {
        // Carregar dados iniciais do mockData
        const contractTypes = initialTypes.map((type: ActivityType) => ({
          ...type,
          contractId: currentContract?.id || "",
        }));
        setTypes(contractTypes);
        saveTypes(contractTypes);
      }
    } catch (error) {
      console.error("Erro ao carregar tipos de atividade:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentContract?.id]);

  // Salvar tipos no localStorage
  const saveTypes = useCallback((newTypes: ActivityType[]) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let allTypes: ActivityType[] = stored ? JSON.parse(stored) : [];
      
      // Remover tipos antigos do contrato atual
      allTypes = allTypes.filter(type => type.contractId !== currentContract?.id);
      
      // Adicionar novos tipos
      allTypes.push(...newTypes);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allTypes));
      setTypes(newTypes);
    } catch (error) {
      console.error("Erro ao salvar tipos de atividade:", error);
    }
  }, [currentContract?.id]);

  // Adicionar novo tipo
  const addType = useCallback((typeData: Omit<ActivityType, "id" | "contractId">) => {
    const newType: ActivityType = {
      ...typeData,
      id: `type_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contractId: currentContract?.id || "",
    };
    
    const updatedTypes = [...types, newType];
    saveTypes(updatedTypes);
    return newType;
  }, [types, saveTypes, currentContract?.id]);

  // Atualizar tipo existente
  const updateType = useCallback((typeId: string, updates: Partial<ActivityType>) => {
    const updatedTypes = types.map(type =>
      type.id === typeId ? { ...type, ...updates } : type
    );
    saveTypes(updatedTypes);
  }, [types, saveTypes]);

  // Remover tipo
  const removeType = useCallback((typeId: string) => {
    const updatedTypes = types.filter(type => type.id !== typeId);
    saveTypes(updatedTypes);
  }, [types, saveTypes]);

  // Carregar tipos quando o contrato muda
  useEffect(() => {
    if (currentContract?.id) {
      loadTypes();
    } else {
      setTypes([]);
      setIsLoading(false);
    }
  }, [currentContract?.id, loadTypes]);

  return {
    types,
    isLoading,
    addType,
    updateType,
    removeType,
    loadTypes,
  };
};
