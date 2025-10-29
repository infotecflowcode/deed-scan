import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';

export const TestAuth: React.FC = () => {
  const { user, isAuthenticated, login, logout, signUp, resetPassword, isLoading } = useAuth();
  const { profile, createProfile, hasProfile, isAdmin, isLeader, isFiscal, isCollaborator } = useUserProfile();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [profileType, setProfileType] = useState<'colaborador' | 'lider' | 'fiscal' | 'administrador'>('colaborador');
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login({ email, password });
    setMessage(result.success ? 'Login realizado com sucesso!' : `Erro: ${result.error}`);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signUp(email, password, name);
    setMessage(result.success ? 'Cadastro realizado! Verifique seu email.' : `Erro: ${result.error}`);
  };

  const handleCreateProfile = async () => {
    if (!user) return;
    
    try {
      await createProfile({
        name: user.name,
        email: user.email,
        profile_type: profileType,
      });
      setMessage('Perfil criado com sucesso!');
    } catch (error) {
      setMessage(`Erro ao criar perfil: ${error}`);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setMessage('Digite um email para recuperar a senha');
      return;
    }
    
    const result = await resetPassword(email);
    setMessage(result.success ? 'Email de recuperação enviado!' : `Erro: ${result.error}`);
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Teste de Autenticação - Supabase</CardTitle>
          <CardDescription>
            Teste as funcionalidades de autenticação integradas com Supabase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {!isAuthenticated ? (
            <div className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <h3 className="text-lg font-semibold">Login</h3>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full">
                  Entrar
                </Button>
              </form>

              <div className="border-t pt-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <h3 className="text-lg font-semibold">Cadastro</h3>
                  <Input
                    type="text"
                    placeholder="Nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button type="submit" className="w-full">
                    Cadastrar
                  </Button>
                </form>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold">Recuperar Senha</h3>
                <div className="flex space-x-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button onClick={handleResetPassword}>
                    Recuperar
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800">Usuário Logado</h3>
                <p><strong>ID:</strong> {user?.id}</p>
                <p><strong>Nome:</strong> {user?.name}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Role:</strong> {user?.role}</p>
              </div>

              {!hasProfile() ? (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">Criar Perfil</h3>
                  <div className="space-y-4">
                    <select
                      value={profileType}
                      onChange={(e) => setProfileType(e.target.value as any)}
                      className="w-full p-2 border rounded"
                    >
                      <option value="colaborador">Colaborador</option>
                      <option value="lider">Líder</option>
                      <option value="fiscal">Fiscal</option>
                      <option value="administrador">Administrador</option>
                    </select>
                    <Button onClick={handleCreateProfile} className="w-full">
                      Criar Perfil
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800">Perfil do Usuário</h3>
                  <p><strong>Tipo:</strong> {profile?.profile_type}</p>
                  <p><strong>Ativo:</strong> {profile?.is_active ? 'Sim' : 'Não'}</p>
                  <p><strong>Criado em:</strong> {profile?.created_at}</p>
                  
                  <div className="mt-4 space-y-2">
                    <p><strong>Permissões:</strong></p>
                    <div className="flex space-x-4 text-sm">
                      <span className={isAdmin() ? 'text-green-600 font-semibold' : 'text-gray-500'}>
                        Admin: {isAdmin() ? 'Sim' : 'Não'}
                      </span>
                      <span className={isLeader() ? 'text-green-600 font-semibold' : 'text-gray-500'}>
                        Líder: {isLeader() ? 'Sim' : 'Não'}
                      </span>
                      <span className={isFiscal() ? 'text-green-600 font-semibold' : 'text-gray-500'}>
                        Fiscal: {isFiscal() ? 'Sim' : 'Não'}
                      </span>
                      <span className={isCollaborator() ? 'text-green-600 font-semibold' : 'text-gray-500'}>
                        Colaborador: {isCollaborator() ? 'Sim' : 'Não'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <Button onClick={logout} variant="destructive" className="w-full">
                Sair
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
