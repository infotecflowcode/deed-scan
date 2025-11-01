import { useState, useEffect, useCallback } from "react";
import { User, UserRole } from "@/types/auth";
import { createClient } from '@supabase/supabase-js';

const STORAGE_KEY = "users";

// Cliente Supabase para operações administrativas
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tiufkakigpzihtpxklis.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpdWZrYWtpZ3B6aWh0cHhrbGlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMTA1NTMsImV4cCI6MjA3NjY4NjU1M30.srcIVIllnckUS94QOT_0BYe1AOLUorex1GUP9C1o_hs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar usuários do Supabase
  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Buscar usuários do Supabase usando a chave anônima
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Erro ao carregar usuários do Supabase:", error);
        // Fallback para localStorage se Supabase falhar
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const storedUsers: User[] = JSON.parse(stored);
          setUsers(storedUsers);
        }
        return;
      }

      // Função helper para mapear profile_type do banco para role do frontend
      const mapProfileTypeToRole = (profileType: string): UserRole => {
        const profileTypeMap: Record<string, UserRole> = {
          'colaborador': 'colaborador',
          'lider': 'lider',
          'fiscal': 'fiscal',
          'administrador': 'admin', // Mapear 'administrador' para 'admin'
        };
        return profileTypeMap[profileType] || 'colaborador';
      };

      // Converter profiles do Supabase para formato User
      const supabaseUsers: User[] = profiles.map(profile => ({
        id: profile.user_id,
        name: profile.name,
        email: profile.email,
        password: '', // Senha não é retornada por segurança
        role: mapProfileTypeToRole(profile.profile_type), // Mapear profile_type do banco para role do frontend
        cpf: profile.cpf || undefined,
        cargo: profile.cargo || undefined,
        contracts: [], // Será preenchido separadamente se necessário
        isActive: profile.is_active,
        lastLogin: profile.updated_at,
      }));

      setUsers(supabaseUsers);
      
      // Salvar no localStorage como backup
      saveUsers(supabaseUsers);
      
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      // Fallback para localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const storedUsers: User[] = JSON.parse(stored);
        setUsers(storedUsers);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salvar usuários no localStorage (backup)
  const saveUsers = useCallback((newUsers: User[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsers));
      setUsers(newUsers);
    } catch (error) {
      console.error("Erro ao salvar usuários:", error);
    }
  }, []);

  // Adicionar novo usuário no Supabase
  const addUser = useCallback(async (userData: Omit<User, "id">) => {
    try {
      // Chamar Edge Function para criar usuário no Supabase
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: userData.email,
          password: userData.password,
          name: userData.name,
          role: userData.role,
          cpf: userData.cpf || null,
          cargo: userData.cargo || null,
        }
      });

      if (error) {
        console.error("Erro ao criar usuário:", error);
        throw new Error(error.message || 'Erro ao criar usuário');
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro ao criar usuário');
      }

      // Atualizar lista local com o novo usuário
      const newUser: User = {
        id: data.data.user.id,
        name: data.data.user.name,
        email: data.data.user.email,
        password: '', // Não armazenar senha localmente
        role: data.data.user.role as UserRole,
        cpf: data.data.user.cpf || undefined,
        cargo: data.data.user.cargo || undefined,
        contracts: [],
        isActive: data.data.user.is_active,
        lastLogin: data.data.user.created_at,
      };

      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      saveUsers(updatedUsers);

      return newUser;
    } catch (error) {
      console.error("Erro ao adicionar usuário:", error);
      throw error;
    }
  }, [users, saveUsers]);

  // Função helper para mapear role do frontend para profile_type do banco
  const mapRoleToProfileType = (role: UserRole): string => {
    const roleMap: Record<UserRole, string> = {
      'colaborador': 'colaborador',
      'lider': 'lider',
      'fiscal': 'fiscal',
      'admin': 'administrador', // Mapear 'admin' para 'administrador'
    };
    return roleMap[role] || role;
  };

  // Atualizar usuário existente
  const updateUser = useCallback(async (userId: string, updates: Partial<User>) => {
    try {
      // Separar senha dos outros updates
      const { password, ...otherUpdates } = updates;
      
      // Se uma nova senha foi fornecida, atualizar via Edge Function
      if (password && password.trim() !== '') {
        const { data: passwordData, error: passwordError } = await supabase.functions.invoke(
          'admin-update-user-password',
          {
            body: {
              target_user_id: userId,
              new_password: password.trim(),
            }
          }
        );

        if (passwordError) {
          console.error("Erro ao atualizar senha:", passwordError);
          throw new Error(passwordError.message || 'Erro ao atualizar senha');
        }

        if (!passwordData || !passwordData.success) {
          throw new Error(passwordData?.error || 'Erro ao atualizar senha');
        }
      }

      // Atualizar outros campos no Supabase
      const updatePayload: any = {
        updated_at: new Date().toISOString(),
      };

      if (otherUpdates.name !== undefined) updatePayload.name = otherUpdates.name;
      if (otherUpdates.email !== undefined) updatePayload.email = otherUpdates.email;
      // Mapear role para profile_type correto do banco
      if (otherUpdates.role !== undefined) {
        const mappedProfileType = mapRoleToProfileType(otherUpdates.role);
        updatePayload.profile_type = mappedProfileType;
        console.log('Atualizando profile_type:', {
          roleRecebido: otherUpdates.role,
          profileTypeMapeado: mappedProfileType,
          userId
        });
      }
      if (otherUpdates.cpf !== undefined) updatePayload.cpf = otherUpdates.cpf || null;
      if (otherUpdates.cargo !== undefined) updatePayload.cargo = otherUpdates.cargo || null;
      if (otherUpdates.isActive !== undefined) updatePayload.is_active = otherUpdates.isActive;

      // Só fazer update se houver campos para atualizar
      if (Object.keys(updatePayload).length > 1) {
        console.log('Payload de atualização:', updatePayload);
        const { data, error } = await supabase
          .from('user_profiles')
          .update(updatePayload)
          .eq('user_id', userId)
          .select();

        if (error) {
          console.error("Erro ao atualizar usuário no Supabase:", error);
          throw new Error(error.message);
        }

        console.log('Usuário atualizado com sucesso:', data);
      } else {
        console.warn('Nenhum campo para atualizar além de updated_at');
      }

      // Atualizar lista local (sem incluir senha por segurança)
      const updatedUsers = users.map(user =>
        user.id === userId ? { ...user, ...otherUpdates } : user
      );
      setUsers(updatedUsers);
      saveUsers(updatedUsers);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      throw error;
    }
  }, [users, saveUsers]);

  // Remover usuário (soft delete)
  const removeUser = useCallback(async (userId: string) => {
    try {
      // Soft delete no Supabase
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) {
        console.error("Erro ao remover usuário no Supabase:", error);
        throw new Error(error.message);
      }

      // Remover da lista local
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      saveUsers(updatedUsers);
    } catch (error) {
      console.error("Erro ao remover usuário:", error);
      throw error;
    }
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
