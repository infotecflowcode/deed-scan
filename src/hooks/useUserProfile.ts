import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { UserProfile, UserProfileInsert, UserProfileUpdate, ProfileType } from '../lib/types/supabase'
import { useAuth } from '../contexts/AuthContext'

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Buscar perfil do usuário logado
  const fetchProfile = async () => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Usar Edge Function para buscar perfil
      const response = await fetch(
        `https://tiufkakigpzihtpxklis.supabase.co/functions/v1/get-user-profile?user_id=${user.id}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Erro ao buscar perfil')
      }

      setProfile(result.data)
    } catch (err) {
      console.error('Erro ao buscar perfil:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  // Criar perfil de usuário
  const createProfile = async (profileData: Omit<UserProfileInsert, 'user_id'>) => {
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    try {
      setError(null)

      // Usar Edge Function para criar perfil
      const response = await fetch(
        `https://tiufkakigpzihtpxklis.supabase.co/functions/v1/create-user-profile`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id,
            name: profileData.name,
            email: profileData.email,
            profile_type: profileData.profile_type,
          }),
        }
      )

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Erro ao criar perfil')
      }

      setProfile(result.data)
      return result.data
    } catch (err) {
      console.error('Erro ao criar perfil:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Atualizar perfil do usuário
  const updateProfile = async (updates: UserProfileUpdate) => {
    if (!user || !profile) {
      throw new Error('Usuário não autenticado ou perfil não encontrado')
    }

    try {
      setError(null)

      // Usar Edge Function para atualizar perfil
      const response = await fetch(
        `https://tiufkakigpzihtpxklis.supabase.co/functions/v1/update-user-profile`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            profile_id: profile.id,
            name: updates.name,
            email: updates.email,
            profile_type: updates.profile_type,
            is_active: updates.is_active,
          }),
        }
      )

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Erro ao atualizar perfil')
      }

      setProfile(result.data)
      return result.data
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Verificar se usuário tem perfil
  const hasProfile = () => {
    return profile !== null
  }

  // Verificar tipo de perfil
  const hasProfileType = (profileType: ProfileType) => {
    return profile?.profile_type === profileType
  }

  // Verificar se é administrador
  const isAdmin = () => {
    return hasProfileType('administrador')
  }

  // Verificar se é líder
  const isLeader = () => {
    return hasProfileType('lider')
  }

  // Verificar se é fiscal
  const isFiscal = () => {
    return hasProfileType('fiscal')
  }

  // Verificar se é colaborador
  const isCollaborator = () => {
    return hasProfileType('colaborador')
  }

  // Buscar perfil quando usuário muda
  useEffect(() => {
    fetchProfile()
  }, [user])

  return {
    profile,
    loading,
    error,
    fetchProfile,
    createProfile,
    updateProfile,
    hasProfile,
    hasProfileType,
    isAdmin,
    isLeader,
    isFiscal,
    isCollaborator,
    refetch: fetchProfile
  }
}

// Hook para buscar todos os perfis (apenas para administradores)
export const useAllUserProfiles = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAdmin } = useUserProfile()

  const fetchAllProfiles = async () => {
    if (!isAdmin()) {
      setError('Acesso negado: apenas administradores podem visualizar todos os perfis')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Usar Edge Function para buscar todos os perfis
      const response = await fetch(
        `https://tiufkakigpzihtpxklis.supabase.co/functions/v1/get-all-user-profiles`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Erro ao buscar perfis')
      }

      setProfiles(result.data || [])
    } catch (err) {
      console.error('Erro ao buscar perfis:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllProfiles()
  }, [])

  return {
    profiles,
    loading,
    error,
    fetchAllProfiles,
    refetch: fetchAllProfiles
  }
}
