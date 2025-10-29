import { useState, useEffect, useCallback } from "react";
import { User, UserRole } from "@/types/auth";

const STORAGE_KEY = "users";

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar usuários do localStorage
  const loadUsers = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const storedUsers: User[] = JSON.parse(stored);
        setUsers(storedUsers);
      } else {
        // Carregar dados iniciais
        const { mockUsers } = require("@/contexts/AuthContext");
        setUsers(mockUsers);
        saveUsers(mockUsers);
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salvar usuários no localStorage
  const saveUsers = useCallback((newUsers: User[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsers));
      setUsers(newUsers);
    } catch (error) {
      console.error("Erro ao salvar usuários:", error);
    }
  }, []);

  // Adicionar novo usuário
  const addUser = useCallback((userData: Omit<User, "id">) => {
    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    
    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);
    return newUser;
  }, [users, saveUsers]);

  // Atualizar usuário existente
  const updateUser = useCallback((userId: string, updates: Partial<User>) => {
    const updatedUsers = users.map(user =>
      user.id === userId ? { ...user, ...updates } : user
    );
    saveUsers(updatedUsers);
  }, [users, saveUsers]);

  // Remover usuário
  const removeUser = useCallback((userId: string) => {
    const updatedUsers = users.filter(user => user.id !== userId);
    saveUsers(updatedUsers);
  }, [users, saveUsers]);

  // Carregar usuários na inicialização
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return {
    users,
    isLoading,
    addUser,
    updateUser,
    removeUser,
    loadUsers,
  };
};
