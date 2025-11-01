import React, { useState } from 'react';
import { useUserProfile, useAllUserProfiles } from '../hooks/useUserProfile';
import { useContracts } from '../hooks/useContracts';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Loader2, UserPlus, Eye, EyeOff, Trash2, Edit } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ProfileType } from '../lib/types/supabase';
import { ContractModal } from './ContractModal';
import type { Contract } from '../data/mockData';

export const UserManagement: React.FC = () => {
  const { isAdmin } = useUserProfile();
  const { profiles, loading, error, refetch } = useAllUserProfiles();
  const { contracts, updateContract, isLoading: contractsLoading } = useContracts();
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    name: '',
    profile_type: 'colaborador' as ProfileType
  });

  // Função para obter os contratos de um usuário
  const getUserContracts = (userId: string): Contract[] => {
    return contracts.filter(contract => 
      contract.contractUsers?.some(cu => cu.userId === userId)
    );
  };

  // Função para abrir o modal de edição do contrato
  const handleContractClick = (contract: Contract) => {
    setEditingContract(contract);
    setContractModalOpen(true);
  };

  // Handler para submeter alterações do contrato
  const handleContractSubmit = async (data: Omit<Contract, "id" | "createdAt">) => {
    if (!editingContract) return;
    
    setIsLoading(true);
    try {
      updateContract(editingContract.id, data);
      setMessage('Contrato atualizado com sucesso!');
      setContractModalOpen(false);
      setEditingContract(null);
    } catch (error) {
      setMessage(`Erro ao atualizar contrato: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar se o usuário é administrador
  if (!isAdmin()) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertDescription>
              Acesso negado. Apenas administradores podem gerenciar usuários.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            name: newUser.name,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        // Criar perfil do usuário usando Edge Function
        const response = await fetch(
          `https://tiufkakigpzihtpxklis.supabase.co/functions/v1/create-user-profile`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: authData.user.id,
              name: newUser.name,
              email: newUser.email,
              profile_type: newUser.profile_type,
            }),
          }
        );

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Erro ao criar perfil');
        }

        setMessage('Usuário criado com sucesso!');
        setNewUser({ email: '', password: '', name: '', profile_type: 'colaborador' });
        setIsCreating(false);
        refetch();
      }
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      setMessage(`Erro ao criar usuário: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) {
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Excluir perfil do usuário
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', userId);

      if (profileError) {
        throw profileError;
      }

      setMessage('Usuário excluído com sucesso!');
      refetch();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      setMessage(`Erro ao excluir usuário: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getProfileTypeColor = (type: string) => {
    switch (type) {
      case 'administrador':
        return 'bg-red-100 text-red-800';
      case 'lider':
        return 'bg-blue-100 text-blue-800';
      case 'fiscal':
        return 'bg-green-100 text-green-800';
      case 'colaborador':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Carregando usuários...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <CardDescription>
                Cadastre e gerencie usuários do sistema
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsCreating(!isCreating)}
              disabled={isLoading}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {isCreating ? 'Cancelar' : 'Novo Usuário'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert variant={message.includes('Erro') ? 'destructive' : 'default'} className="mb-4">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {isCreating && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Criar Novo Usuário</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Nome completo"
                        value={newUser.name}
                        onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@exemplo.com"
                        value={newUser.email}
                        onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Senha</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Senha temporária"
                          value={newUser.password}
                          onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                          required
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profile_type">Tipo de Perfil</Label>
                      <select
                        id="profile_type"
                        value={newUser.profile_type}
                        onChange={(e) => setNewUser(prev => ({ ...prev, profile_type: e.target.value as ProfileType }))}
                        className="w-full p-2 border rounded-md"
                        disabled={isLoading}
                      >
                        <option value="colaborador">Colaborador</option>
                        <option value="lider">Líder</option>
                        <option value="fiscal">Fiscal</option>
                        <option value="administrador">Administrador</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      type="submit"
                      disabled={isLoading || !newUser.name || !newUser.email || !newUser.password}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Criando...
                        </>
                      ) : (
                        'Criar Usuário'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreating(false)}
                      disabled={isLoading}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Usuários Cadastrados ({profiles.length})</h3>
            
            {profiles.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhum usuário cadastrado
              </p>
            ) : (
              <div className="grid gap-4">
                {profiles.map((profile) => {
                  const userContracts = getUserContracts(profile.user_id);
                  return (
                    <Card key={profile.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold">{profile.name}</h4>
                              <Badge className={getProfileTypeColor(profile.profile_type)}>
                                {profile.profile_type}
                              </Badge>
                              {profile.is_active ? (
                                <Badge variant="outline" className="text-green-600">
                                  Ativo
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-red-600">
                                  Inativo
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{profile.email}</p>
                            
                            {/* Exibir contratos do usuário */}
                            {userContracts.length > 0 ? (
                              <div className="mt-2">
                                <p className="text-xs text-muted-foreground mb-1">Contratos:</p>
                                <div className="flex flex-wrap gap-2">
                                  {userContracts.map((contract) => (
                                    <Badge
                                      key={contract.id}
                                      variant="secondary"
                                      className="cursor-pointer hover:bg-blue-200 transition-colors"
                                      onClick={() => handleContractClick(contract)}
                                    >
                                      {contract.name}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground italic">
                                Nenhum contrato associado
                              </p>
                            )}
                            
                            <p className="text-xs text-muted-foreground">
                              Criado em: {new Date(profile.created_at || '').toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {/* Implementar edição */}}
                              disabled={isLoading}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteUser(profile.user_id)}
                              disabled={isLoading}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de edição de contrato */}
      <ContractModal
        isOpen={contractModalOpen}
        onClose={() => {
          setContractModalOpen(false);
          setEditingContract(null);
        }}
        contract={editingContract || undefined}
        onSubmit={handleContractSubmit}
        isLoading={isLoading || contractsLoading}
        defaultTab="groups-services" // Abrir na aba de grupos e serviços (linhas de serviço)
      />
    </div>
  );
};
