import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Building2, 
  Users, 
  Activity, 
  TrendingUp, 
  Calendar,
  Filter,
  Search,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { contracts, ServiceGroup, ActivityType, EvaluationCriteria } from '@/data/mockData';
import type { Contract } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { CommentSystem } from '@/components/CommentSystem';
import { DynamicFieldEditor } from '@/components/DynamicFieldEditor';
import { useServiceGroups } from '@/hooks/useServiceGroups';
import { useActivityTypes } from '@/hooks/useActivityTypes';
import { useEvaluationCriteria } from '@/hooks/useEvaluationCriteria';
import { useUsers } from '@/hooks/useUsers';
import { ServiceGroupForm } from '@/components/forms/ServiceGroupForm';
import { ActivityTypeForm } from '@/components/forms/ActivityTypeForm';
import { EvaluationCriteriaForm } from '@/components/forms/EvaluationCriteriaForm';
import { UserForm } from '@/components/forms/UserForm';
import { ContractManagement } from '@/components/ContractManagement';
import { AppHeader } from '@/components/AppHeader';
import { User, UserRole } from '@/types/auth';

interface Activity {
  id: string;
  title: string;
  collaboratorName: string;
  contractId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

interface ContractStats {
  totalActivities: number;
  completedActivities: number;
  pendingActivities: number;
  approvedActivities: number;
  totalValue: number;
}

const AdminDashboard: React.FC = () => {
  const { user, currentContract } = useAuth();
  const { toast } = useToast();
  
  // Hooks para gerenciar dados
  const { groups, isLoading: groupsLoading, addGroup, updateGroup, removeGroup } = useServiceGroups();
  const { types, isLoading: typesLoading, addType, updateType, removeType } = useActivityTypes();
  const { criteria, isLoading: criteriaLoading, addCriterion, updateCriterion, removeCriterion } = useEvaluationCriteria();
  const { users, isLoading: usersLoading, addUser, updateUser, removeUser } = useUsers();
  
  // Estados para dashboard
  const [selectedContract, setSelectedContract] = useState<Contract | null>(currentContract);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [contractStats, setContractStats] = useState<ContractStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateContract, setShowCreateContract] = useState(false);
  const [newContract, setNewContract] = useState({
    name: '',
    billingType: 'HH' as 'HH' | 'BPO' | 'ENTREGAVEL',
    description: ''
  });
  
  // Estados para modais de configuração
  const [editingGroup, setEditingGroup] = useState<ServiceGroup | null>(null);
  const [editingType, setEditingType] = useState<ActivityType | null>(null);
  const [editingCriterion, setEditingCriterion] = useState<EvaluationCriteria | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para controlar abertura dos modais
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [isCriterionModalOpen, setIsCriterionModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // Mock data para atividades
  const mockActivities: Activity[] = [
    {
      id: '1',
      title: 'Desenvolvimento de API REST',
      collaboratorName: 'Swellen',
      contractId: '1',
      status: 'completed',
      createdAt: '2025-01-15T10:00:00Z',
      updatedAt: '2025-01-15T15:30:00Z'
    },
    {
      id: '2',
      title: 'Configuração de servidor',
      collaboratorName: 'João',
      contractId: '1',
      status: 'approved',
      createdAt: '2025-01-16T09:00:00Z',
      updatedAt: '2025-01-16T14:00:00Z'
    },
    {
      id: '3',
      title: 'Suporte técnico - Turno 1',
      collaboratorName: 'Swellen',
      contractId: '2',
      status: 'in_progress',
      createdAt: '2025-01-17T08:00:00Z',
      updatedAt: '2025-01-17T12:00:00Z'
    },
    {
      id: '4',
      title: 'Manutenção preventiva - Equipamento A',
      collaboratorName: 'Leo',
      contractId: '4',
      status: 'pending',
      createdAt: '2025-01-18T07:00:00Z',
      updatedAt: '2025-01-18T07:00:00Z'
    }
  ];

  useEffect(() => {
    if (selectedContract) {
      loadContractData(selectedContract.id);
    }
  }, [selectedContract]);

  const loadContractData = async (contractId: string) => {
    setIsLoading(true);
    try {
      // Simular carregamento de dados
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filtrar atividades por contrato
      const contractActivities = mockActivities.filter(activity => activity.contractId === contractId);
      setActivities(contractActivities);
      
      // Calcular estatísticas
      const stats: ContractStats = {
        totalActivities: contractActivities.length,
        completedActivities: contractActivities.filter(a => a.status === 'completed').length,
        pendingActivities: contractActivities.filter(a => a.status === 'pending').length,
        approvedActivities: contractActivities.filter(a => a.status === 'approved').length,
        totalValue: contractActivities.length * 1500 // Mock value
      };
      setContractStats(stats);
    } catch (error) {
      console.error('Erro ao carregar dados do contrato:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateContract = async () => {
    try {
      // Aqui você implementaria a criação do contrato via Edge Function
      console.log('Criando contrato:', newContract);
      
      // Simular criação
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowCreateContract(false);
      setNewContract({ name: '', billingType: 'HH', description: '' });
      
      // Recarregar lista de contratos
      // Em uma implementação real, você atualizaria a lista aqui
    } catch (error) {
      console.error('Erro ao criar contrato:', error);
    }
  };

  // Handlers para grupos de serviço
  const handleAddGroup = async (data: Omit<ServiceGroup, "id" | "contractId">) => {
    setIsSubmitting(true);
    try {
      addGroup(data);
      toast({ title: "Grupo adicionado com sucesso!" });
      setEditingGroup(null);
      setIsGroupModalOpen(false);
    } catch (error) {
      toast({ title: "Erro ao adicionar grupo", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateGroup = async (data: Omit<ServiceGroup, "id" | "contractId">) => {
    if (!editingGroup) return;
    setIsSubmitting(true);
    try {
      updateGroup(editingGroup.id, data);
      toast({ title: "Grupo atualizado com sucesso!" });
      setEditingGroup(null);
      setIsGroupModalOpen(false);
    } catch (error) {
      toast({ title: "Erro ao atualizar grupo", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGroup = (id: string) => {
    removeGroup(id);
    toast({ title: "Grupo removido com sucesso!" });
  };

  // Handlers para tipos de atividade
  const handleAddType = async (data: Omit<ActivityType, "id" | "contractId">) => {
    setIsSubmitting(true);
    try {
      addType(data);
      toast({ title: "Tipo adicionado com sucesso!" });
      setEditingType(null);
      setIsTypeModalOpen(false);
    } catch (error) {
      toast({ title: "Erro ao adicionar tipo", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateType = async (data: Omit<ActivityType, "id" | "contractId">) => {
    if (!editingType) return;
    setIsSubmitting(true);
    try {
      updateType(editingType.id, data);
      toast({ title: "Tipo atualizado com sucesso!" });
      setEditingType(null);
      setIsTypeModalOpen(false);
    } catch (error) {
      toast({ title: "Erro ao atualizar tipo", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteType = (id: string) => {
    removeType(id);
    toast({ title: "Tipo removido com sucesso!" });
  };

  // Handlers para critérios de avaliação
  const handleAddCriterion = async (data: Omit<EvaluationCriteria, "id" | "contractId">) => {
    setIsSubmitting(true);
    try {
      addCriterion(data);
      toast({ title: "Critério adicionado com sucesso!" });
      setEditingCriterion(null);
      setIsCriterionModalOpen(false);
    } catch (error) {
      toast({ title: "Erro ao adicionar critério", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCriterion = async (data: Omit<EvaluationCriteria, "id" | "contractId">) => {
    if (!editingCriterion) return;
    setIsSubmitting(true);
    try {
      updateCriterion(editingCriterion.id, data);
      toast({ title: "Critério atualizado com sucesso!" });
      setEditingCriterion(null);
      setIsCriterionModalOpen(false);
    } catch (error) {
      toast({ title: "Erro ao atualizar critério", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCriterion = (id: string) => {
    removeCriterion(id);
    toast({ title: "Critério removido com sucesso!" });
  };

  // Handlers para usuários
  const handleAddUser = async (data: Omit<User, "id">) => {
    setIsSubmitting(true);
    try {
      await addUser(data);
      toast({ 
        title: "Usuário adicionado com sucesso!", 
        description: `Usuário ${data.name} foi criado no Supabase.` 
      });
      setEditingUser(null);
      setIsUserModalOpen(false);
    } catch (error) {
      console.error("Erro ao adicionar usuário:", error);
      toast({ 
        title: "Erro ao adicionar usuário", 
        description: error.message || "Erro desconhecido ao criar usuário",
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (data: Omit<User, "id">) => {
    if (!editingUser) return;
    setIsSubmitting(true);
    try {
      await updateUser(editingUser.id, data);
      toast({ 
        title: "Usuário atualizado com sucesso!", 
        description: `Usuário ${data.name} foi atualizado no Supabase.` 
      });
      setEditingUser(null);
      setIsUserModalOpen(false);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      toast({ 
        title: "Erro ao atualizar usuário", 
        description: error.message || "Erro desconhecido ao atualizar usuário",
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await removeUser(id);
      toast({ 
        title: "Usuário removido com sucesso!", 
        description: "Usuário foi desativado no Supabase." 
      });
    } catch (error) {
      console.error("Erro ao remover usuário:", error);
      toast({ 
        title: "Erro ao remover usuário", 
        description: error.message || "Erro desconhecido ao remover usuário",
        variant: "destructive" 
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      approved: 'default',
      in_progress: 'secondary',
      pending: 'outline',
      rejected: 'destructive'
    } as const;

    const labels = {
      completed: 'Concluída',
      approved: 'Aprovada',
      in_progress: 'Em Andamento',
      pending: 'Pendente',
      rejected: 'Rejeitada'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.collaboratorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || activity.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (user?.role !== 'admin') {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Acesso negado. Apenas administradores podem acessar esta página.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader 
        showContractInfo={false}
        showBackButton={true}
        backTo="/"
        backLabel="Voltar ao Dashboard"
      />

      <main className="container mx-auto px-4 py-8">


      {/* Seleção de Contrato e Conteúdo */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full max-w-6xl grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="contracts">Contratos</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visão Geral do Sistema</CardTitle>
              <CardDescription>
                Estatísticas e informações gerais do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{contracts.length}</div>
                    <p className="text-sm text-muted-foreground">Total de Contratos</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">
                      {contracts.reduce((total, contract) => total + contract.serviceGroups.length, 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">Grupos de Trabalho</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">
                      {contracts.reduce((total, contract) => total + contract.serviceLines.length, 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">Linhas de Serviço</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{users.length}</div>
                    <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{types.length}</div>
                    <p className="text-sm text-muted-foreground">Tipos de Atividade</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-4">
          <ContractManagement />
        </TabsContent>


        {/* USUÁRIOS */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Usuários</h2>
            <Button onClick={() => {
              setEditingUser(null);
              setIsUserModalOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          </div>

          <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? "Editar Usuário" : "Cadastrar Usuário"}
                </DialogTitle>
              </DialogHeader>
              <UserForm
                user={editingUser}
                onSubmit={editingUser ? handleUpdateUser : handleAddUser}
                onCancel={() => {
                  setEditingUser(null);
                  setIsUserModalOpen(false);
                }}
                isLoading={isSubmitting}
              />
            </DialogContent>
          </Dialog>
          
          {usersLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Carregando usuários...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum usuário cadastrado ainda.</p>
              <p className="text-sm">Clique em "Novo Usuário" para começar.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="border rounded-lg p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.name}</span>
                        {!user.isActive && (
                          <Badge variant="secondary" className="text-xs">Inativo</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{user.email}</span>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs capitalize">{user.role}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingUser(user);
                        setIsUserModalOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      </main>

      <CommentSystem enabled={true} />
    </div>
  );
};

export default AdminDashboard;
