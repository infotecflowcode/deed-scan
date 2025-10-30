import { useState, useEffect, useCallback } from "react";
import { Activity, activities as initialActivities } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";

const STORAGE_KEY = "activities";

export const useActivities = () => {
  const { currentContract, user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar atividades do localStorage
  const loadActivities = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const allActivities: Activity[] = JSON.parse(stored);
        // Filtrar atividades do contrato atual
        const contractActivities = allActivities.filter(
          activity => activity.contractId === currentContract?.id
        );
        setActivities(contractActivities);
      } else {
        // Carregar dados iniciais do mockData
        const contractActivities = initialActivities.filter(
          (activity: Activity) => activity.contractId === currentContract?.id
        );
        setActivities(contractActivities);
        saveActivities(contractActivities);
      }
    } catch (error) {
      console.error("Erro ao carregar atividades:", error);
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentContract?.id]);

  // Salvar atividades no localStorage
  const saveActivities = useCallback((newActivities: Activity[]) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let allActivities: Activity[] = stored ? JSON.parse(stored) : [];
      
      // Remover atividades antigas do contrato atual
      allActivities = allActivities.filter(activity => activity.contractId !== currentContract?.id);
      
      // Adicionar novas atividades
      allActivities.push(...newActivities);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allActivities));
      setActivities(newActivities);
    } catch (error) {
      console.error("Erro ao salvar atividades:", error);
    }
  }, [currentContract?.id]);

  // Adicionar nova atividade
  const addActivity = useCallback((activityData: Omit<Activity, "id">) => {
    const newActivity: Activity = {
      ...activityData,
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contractId: currentContract?.id || "",
    };
    
    const updatedActivities = [...activities, newActivity];
    saveActivities(updatedActivities);
    return newActivity;
  }, [activities, saveActivities, currentContract?.id]);

  // Atualizar atividade existente
  const updateActivity = useCallback((activityId: string, updates: Partial<Activity>) => {
    const updatedActivities = activities.map(activity =>
      activity.id === activityId ? { ...activity, ...updates } : activity
    );
    saveActivities(updatedActivities);
  }, [activities, saveActivities]);

  // Remover atividade
  const removeActivity = useCallback((activityId: string) => {
    const updatedActivities = activities.filter(activity => activity.id !== activityId);
    saveActivities(updatedActivities);
  }, [activities, saveActivities]);

  // Filtrar atividades por usuário (se for colaborador)
  const getUserActivities = useCallback(() => {
    if (user?.role === "colaborador") {
      return activities.filter(activity => activity.collaboratorId === user.id);
    }
    return activities;
  }, [activities, user]);

  // Carregar atividades quando o contrato muda
  useEffect(() => {
    if (currentContract?.id) {
      loadActivities();
    } else {
      setActivities([]);
      setIsLoading(false);
    }
  }, [currentContract?.id, loadActivities]);

  return {
    activities,
    isLoading,
    addActivity,
    updateActivity,
    removeActivity,
    getUserActivities,
    loadActivities,
  };
};
