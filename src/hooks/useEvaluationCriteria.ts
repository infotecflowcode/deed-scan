import { useState, useEffect, useCallback } from "react";
import { EvaluationCriteria, evaluationCriteria as initialCriteria } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";

const STORAGE_KEY = "evaluation_criteria";

export const useEvaluationCriteria = () => {
  const { currentContract } = useAuth();
  const [criteria, setCriteria] = useState<EvaluationCriteria[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar critérios do localStorage
  const loadCriteria = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const allCriteria: EvaluationCriteria[] = JSON.parse(stored);
        const contractCriteria = allCriteria.filter(
          criterion => criterion.contractId === currentContract?.id
        );
        setCriteria(contractCriteria);
      } else {
        // Carregar dados iniciais do mockData
        const contractCriteria = initialCriteria.map((criterion: EvaluationCriteria) => ({
          ...criterion,
          contractId: currentContract?.id || "",
        }));
        setCriteria(contractCriteria);
        saveCriteria(contractCriteria);
      }
    } catch (error) {
      console.error("Erro ao carregar critérios de avaliação:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentContract?.id]);

  // Salvar critérios no localStorage
  const saveCriteria = useCallback((newCriteria: EvaluationCriteria[]) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let allCriteria: EvaluationCriteria[] = stored ? JSON.parse(stored) : [];
      
      // Remover critérios antigos do contrato atual
      allCriteria = allCriteria.filter(criterion => criterion.contractId !== currentContract?.id);
      
      // Adicionar novos critérios
      allCriteria.push(...newCriteria);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allCriteria));
      setCriteria(newCriteria);
    } catch (error) {
      console.error("Erro ao salvar critérios de avaliação:", error);
    }
  }, [currentContract?.id]);

  // Adicionar novo critério
  const addCriterion = useCallback((criterionData: Omit<EvaluationCriteria, "id" | "contractId">) => {
    const newCriterion: EvaluationCriteria = {
      ...criterionData,
      id: `criterion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contractId: currentContract?.id || "",
    };
    
    const updatedCriteria = [...criteria, newCriterion];
    saveCriteria(updatedCriteria);
    return newCriterion;
  }, [criteria, saveCriteria, currentContract?.id]);

  // Atualizar critério existente
  const updateCriterion = useCallback((criterionId: string, updates: Partial<EvaluationCriteria>) => {
    const updatedCriteria = criteria.map(criterion =>
      criterion.id === criterionId ? { ...criterion, ...updates } : criterion
    );
    saveCriteria(updatedCriteria);
  }, [criteria, saveCriteria]);

  // Remover critério
  const removeCriterion = useCallback((criterionId: string) => {
    const updatedCriteria = criteria.filter(criterion => criterion.id !== criterionId);
    saveCriteria(updatedCriteria);
  }, [criteria, saveCriteria]);

  // Carregar critérios quando o contrato muda
  useEffect(() => {
    if (currentContract?.id) {
      loadCriteria();
    } else {
      setCriteria([]);
      setIsLoading(false);
    }
  }, [currentContract?.id, loadCriteria]);

  return {
    criteria,
    isLoading,
    addCriterion,
    updateCriterion,
    removeCriterion,
    loadCriteria,
  };
};
