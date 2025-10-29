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
      addUser(data);
      toast({ title: "Usuário adicionado com sucesso!" });
      setEditingUser(null);
      setIsUserModalOpen(false);
    } catch (error) {
      toast({ title: "Erro ao adicionar usuário", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (data: Omit<User, "id">) => {
    if (!editingUser) return;
    setIsSubmitting(true);
    try {
      updateUser(editingUser.id, data);
      toast({ title: "Usuário atualizado com sucesso!" });
      setEditingUser(null);
      setIsUserModalOpen(false);
    } catch (error) {
      toast({ title: "Erro ao atualizar usuário", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = (id: string) => {
    removeUser(id);
    toast({ title: "Usuário removido com sucesso!" });
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
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Dashboard Administrativo</h1>
                <p className="text-sm text-muted-foreground">
                  Gerencie contratos, atividades e usuários do sistema
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Dialog open={showCreateContract} onOpenChange={setShowCreateContract}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Contrato
                  </Button>
                </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Contrato</DialogTitle>
              <DialogDescription>
                Preencha os dados para criar um novo contrato no sistema.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="contract-name">Nome do Contrato</Label>
                <Input
                  id="contract-name"
                  value={newContract.name}
                  onChange={(e) => setNewContract({ ...newContract, name: e.target.value })}
                  placeholder="Ex: Projeto de Modernização"
                />
              </div>
              <div>
                <Label htmlFor="billing-type">Tipo de Cobrança</Label>
                <Select
                  value={newContract.billingType}
                  onValueChange={(value: 'HH' | 'BPO' | 'ENTREGAVEL') => 
                    setNewContract({ ...newContract, billingType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HH">Hora/Homem (HH)</SelectItem>
                    <SelectItem value="BPO">Business Process Outsourcing (BPO)</SelectItem>
                    <SelectItem value="ENTREGAVEL">Entregável</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newContract.description}
                  onChange={(e) => setNewContract({ ...newContract, description: e.target.value })}
                  placeholder="Descrição detalhada do contrato..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateContract(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateContract}>
                  Criar Contrato
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Contratos</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contracts.length}</div>
            <p className="text-xs text-muted-foreground">
              Contratos ativos no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              Usuários cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atividades Hoje</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockActivities.length}</div>
            <p className="text-xs text-muted-foreground">
              Atividades registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {contractStats?.totalValue.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor total dos contratos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Seleção de Contrato e Conteúdo */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full max-w-6xl grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="contracts">Contratos</TabsTrigger>
          <TabsTrigger value="activities">Atividades</TabsTrigger>
          <TabsTrigger value="criteria">Critérios</TabsTrigger>
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

        <TabsContent value="activities" className="space-y-4">
          {selectedContract ? (
            <>
              {/* Filtros */}
              <Card>
                <CardHeader>
                  <CardTitle>Atividades - {selectedContract.name}</CardTitle>
                  <CardDescription>
                    Gerencie as atividades do contrato selecionado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar atividades..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Filtrar por status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os status</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="in_progress">Em Andamento</SelectItem>
                        <SelectItem value="completed">Concluída</SelectItem>
                        <SelectItem value="approved">Aprovada</SelectItem>
                        <SelectItem value="rejected">Rejeitada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Estatísticas do Contrato */}
              {contractStats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{contractStats.totalActivities}</div>
                      <p className="text-sm text-muted-foreground">Total de Atividades</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-green-600">{contractStats.completedActivities}</div>
                      <p className="text-sm text-muted-foreground">Concluídas</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-yellow-600">{contractStats.pendingActivities}</div>
                      <p className="text-sm text-muted-foreground">Pendentes</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-blue-600">{contractStats.approvedActivities}</div>
                      <p className="text-sm text-muted-foreground">Aprovadas</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Lista de Atividades */}
              <Card>
                <CardHeader>
                  <CardTitle>Lista de Atividades</CardTitle>
                  <CardDescription>
                    {filteredActivities.length} atividades encontradas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredActivities.map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            {getStatusIcon(activity.status)}
                            <div>
                              <h3 className="font-medium">{activity.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                Por {activity.collaboratorName} • {new Date(activity.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(activity.status)}
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {filteredActivities.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          Nenhuma atividade encontrada
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Selecione um Contrato</h3>
                <p className="text-muted-foreground">
                  Escolha um contrato na aba "Contratos" para visualizar suas atividades
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>


        {/* CRITÉRIOS DE AVALIAÇÃO */}
        <TabsContent value="criteria" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Critérios de Avaliação</h2>
            <Button onClick={() => {
              setEditingCriterion(null);
              setIsCriterionModalOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Critério
            </Button>
          </div>
          
          <Dialog open={isCriterionModalOpen} onOpenChange={setIsCriterionModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCriterion ? "Editar Critério" : "Adicionar Critério"}
                </DialogTitle>
              </DialogHeader>
              <EvaluationCriteriaForm
                criterion={editingCriterion}
                onSubmit={editingCriterion ? handleUpdateCriterion : handleAddCriterion}
                onCancel={() => {
                  setEditingCriterion(null);
                  setIsCriterionModalOpen(false);
                }}
                isLoading={isSubmitting}
              />
            </DialogContent>
          </Dialog>
          
          {criteriaLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Carregando critérios...</span>
            </div>
          ) : criteria.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum critério de avaliação configurado ainda.</p>
              <p className="text-sm">Clique em "Novo Critério" para começar.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {criteria.map((criterion) => (
                <div
                  key={criterion.id}
                  className="border rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{criterion.name}</span>
                    {criterion.required && (
                      <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      Máx: {criterion.maxScore}
                    </span>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setEditingCriterion(criterion);
                          setIsCriterionModalOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteCriterion(criterion.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
