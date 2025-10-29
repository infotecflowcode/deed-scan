import { useState, useEffect, useCallback } from "react";
import { ServiceGroup } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";

const STORAGE_KEY = "service_groups";

export const useServiceGroups = () => {
  const { currentContract } = useAuth();
  const [groups, setGroups] = useState<ServiceGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar grupos do localStorage
  const loadGroups = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const allGroups: ServiceGroup[] = JSON.parse(stored);
        const contractGroups = allGroups.filter(
          group => group.contractId === currentContract?.id
        );
        setGroups(contractGroups);
      } else {
        // Carregar dados iniciais do mockData
        const { serviceGroups: initialGroups } = require("@/data/mockData");
        const contractGroups = initialGroups.map((group: ServiceGroup) => ({
          ...group,
          contractId: currentContract?.id || "",
        }));
        setGroups(contractGroups);
        saveGroups(contractGroups);
      }
    } catch (error) {
      console.error("Erro ao carregar grupos de serviço:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentContract?.id]);

  // Salvar grupos no localStorage
  const saveGroups = useCallback((newGroups: ServiceGroup[]) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let allGroups: ServiceGroup[] = stored ? JSON.parse(stored) : [];
      
      // Remover grupos antigos do contrato atual
      allGroups = allGroups.filter(group => group.contractId !== currentContract?.id);
      
      // Adicionar novos grupos
      allGroups.push(...newGroups);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allGroups));
      setGroups(newGroups);
    } catch (error) {
      console.error("Erro ao salvar grupos de serviço:", error);
    }
  }, [currentContract?.id]);

  // Adicionar novo grupo
  const addGroup = useCallback((groupData: Omit<ServiceGroup, "id" | "contractId">) => {
    const newGroup: ServiceGroup = {
      ...groupData,
      id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contractId: currentContract?.id || "",
    };
    
    const updatedGroups = [...groups, newGroup];
    saveGroups(updatedGroups);
    return newGroup;
  }, [groups, saveGroups, currentContract?.id]);

  // Atualizar grupo existente
  const updateGroup = useCallback((groupId: string, updates: Partial<ServiceGroup>) => {
    const updatedGroups = groups.map(group =>
      group.id === groupId ? { ...group, ...updates } : group
    );
    saveGroups(updatedGroups);
  }, [groups, saveGroups]);

  // Remover grupo
  const removeGroup = useCallback((groupId: string) => {
    const updatedGroups = groups.filter(group => group.id !== groupId);
    saveGroups(updatedGroups);
  }, [groups, saveGroups]);

  // Carregar grupos quando o contrato muda
  useEffect(() => {
    if (currentContract?.id) {
      loadGroups();
    } else {
      setGroups([]);
      setIsLoading(false);
    }
  }, [currentContract?.id, loadGroups]);

  return {
    groups,
    isLoading,
    addGroup,
    updateGroup,
    removeGroup,
    loadGroups,
  };
};
