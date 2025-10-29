import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { ServiceGroup, ActivityType, EvaluationCriteria } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { UserSelector } from "@/components/UserSelector";
import { CommentSystem } from "@/components/CommentSystem";
import { DynamicFieldEditor } from "@/components/DynamicFieldEditor";
import { useServiceGroups } from "@/hooks/useServiceGroups";
import { useActivityTypes } from "@/hooks/useActivityTypes";
import { useEvaluationCriteria } from "@/hooks/useEvaluationCriteria";
import { useUsers } from "@/hooks/useUsers";
import { ServiceGroupForm } from "@/components/forms/ServiceGroupForm";
import { ActivityTypeForm } from "@/components/forms/ActivityTypeForm";
import { EvaluationCriteriaForm } from "@/components/forms/EvaluationCriteriaForm";
import { UserForm } from "@/components/forms/UserForm";
import { User, UserRole } from "@/types/auth";

export default function Settings() {
  const { toast } = useToast();
  
  // Hooks para gerenciar dados
  const { groups, isLoading: groupsLoading, addGroup, updateGroup, removeGroup } = useServiceGroups();
  const { types, isLoading: typesLoading, addType, updateType, removeType } = useActivityTypes();
  const { criteria, isLoading: criteriaLoading, addCriterion, updateCriterion, removeCriterion } = useEvaluationCriteria();
  const { users, isLoading: usersLoading, addUser, updateUser, removeUser } = useUsers();
  
  // Estados para modais
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
                <h1 className="text-2xl font-bold">Configurações</h1>
                <p className="text-sm text-muted-foreground">
                  Gerencie grupos, tipos, critérios e usuários
                </p>
              </div>
            </div>
            <UserSelector />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="groups" className="space-y-6">
          <TabsList className="grid w-full max-w-4xl grid-cols-6">
            <TabsTrigger value="groups">Grupos</TabsTrigger>
            <TabsTrigger value="types">Tipos</TabsTrigger>
            <TabsTrigger value="criteria">Critérios</TabsTrigger>
            <TabsTrigger value="fields">Campos Dinâmicos</TabsTrigger>
            <TabsTrigger value="contracts">Contratos</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
          </TabsList>

          {/* GRUPOS DE SERVIÇO */}
          <TabsContent value="groups" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Grupos de Serviço</h2>
              <Button onClick={() => {
                setEditingGroup(null);
                setIsGroupModalOpen(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Grupo
              </Button>
            </div>
            
            <Dialog open={isGroupModalOpen} onOpenChange={setIsGroupModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingGroup ? "Editar Grupo de Serviço" : "Adicionar Grupo de Serviço"}
                  </DialogTitle>
                </DialogHeader>
                <ServiceGroupForm
                  group={editingGroup}
                  onSubmit={editingGroup ? handleUpdateGroup : handleAddGroup}
                  onCancel={() => {
                    setEditingGroup(null);
                    setIsGroupModalOpen(false);
                  }}
                  isLoading={isSubmitting}
                />
              </DialogContent>
            </Dialog>
            
            {groupsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Carregando grupos...</span>
              </div>
            ) : groups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum grupo de serviço configurado ainda.</p>
                <p className="text-sm">Clique em "Novo Grupo" para começar.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="border rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: group.color }}
                      />
                      <span className="font-medium">{group.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setEditingGroup(group);
                          setIsGroupModalOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteGroup(group.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TIPOS DE ATIVIDADE */}
          <TabsContent value="types" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Tipos de Atividade</h2>
              <Button onClick={() => {
                setEditingType(null);
                setIsTypeModalOpen(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Tipo
              </Button>
            </div>
            
            <Dialog open={isTypeModalOpen} onOpenChange={setIsTypeModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingType ? "Editar Tipo de Atividade" : "Adicionar Tipo de Atividade"}
                  </DialogTitle>
                </DialogHeader>
                <ActivityTypeForm
                  type={editingType}
                  onSubmit={editingType ? handleUpdateType : handleAddType}
                  onCancel={() => {
                    setEditingType(null);
                    setIsTypeModalOpen(false);
                  }}
                  isLoading={isSubmitting}
                />
              </DialogContent>
            </Dialog>
            
            {typesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Carregando tipos...</span>
              </div>
            ) : types.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum tipo de atividade configurado ainda.</p>
                <p className="text-sm">Clique em "Novo Tipo" para começar.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {types.map((type) => (
                  <div
                    key={type.id}
                    className="border rounded-lg p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <span>{type.name}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingType(type);
                          setIsTypeModalOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteType(type.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
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

          {/* CAMPOS DINÂMICOS */}
          <TabsContent value="fields" className="space-y-4">
            <DynamicFieldEditor />
          </TabsContent>

          {/* CONTRATOS */}
          <TabsContent value="contracts" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Contratos</h2>
                             <Button onClick={() => {}}>
                 <Plus className="w-4 h-4 mr-2" />
                 Novo Contrato
               </Button>
               <Dialog open={false} onOpenChange={() => {}}>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Configurar Contrato</DialogTitle>
                  </DialogHeader>

                  <Tabs defaultValue="atributos" className="w-full">
                    <TabsList className="grid w-full grid-cols-6">
                      <TabsTrigger value="atributos">Atributos dos Contratos</TabsTrigger>
                      <TabsTrigger value="grupos">Grupos e Serviços</TabsTrigger>
                      <TabsTrigger value="tarefas">Atributos das Tarefas</TabsTrigger>
                      <TabsTrigger value="informacoes">Informações adicionais</TabsTrigger>
                      <TabsTrigger value="perfis">Perfis de Acesso</TabsTrigger>
                      <TabsTrigger value="usuarios">Usuários</TabsTrigger>
                    </TabsList>

                    <TabsContent value="atributos" className="space-y-6 mt-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Nome do Contrato</Label>
                            <Input placeholder="Ex: SMA - Santos 4" />
                          </div>
                          <div>
                            <Label>Código</Label>
                            <Input placeholder="Ex: SMA-004" />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="font-medium text-lg">Configurações de Evidências</h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                              <Label htmlFor="evidencias-obrigatorias">Armazenar imagens como evidências</Label>
                              <Checkbox id="evidencias-obrigatorias" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                              <Label htmlFor="insercao-evidencias">Inserção de evidências é obrigatória</Label>
                              <Checkbox id="insercao-evidencias" />
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                              <Label htmlFor="anexar-documentos">Anexar documentos às Atividades</Label>
                              <Checkbox id="anexar-documentos" />
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                              <Label htmlFor="recursos-obrigatorios">Cadastramento de recursos utilizados é obrigatório</Label>
                              <Checkbox id="recursos-obrigatorios" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                              <Label htmlFor="unidades-obrigatorias">Cadastramento de unidades organizacionais associadas é obrigatório</Label>
                              <Checkbox id="unidades-obrigatorias" defaultChecked />
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="grupos" className="space-y-6 mt-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-medium mb-4">Grupos de Serviços</h3>
                          <div className="space-y-2">
                            {groups.map((group) => (
                              <div key={group.id} className="p-3 border rounded-lg bg-gray-50">
                                {group.name}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium mb-4">Serviços</h3>
                          <div className="space-y-2">
                            <div className="p-3 border rounded-lg bg-gray-50">
                              SERVIÇOS DE ENGENHARIA NAVAL P/ CONF. LEGAL
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="tarefas" className="space-y-6 mt-6">
                      <div className="grid grid-cols-3 gap-6">
                        <div className="space-y-4">
                          <h3 className="font-medium">Tipo</h3>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-2 border rounded">
                              <span className="text-sm">Tipo padrão</span>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h3 className="font-medium">Status</h3>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-2 border rounded">
                              <span className="text-sm">Status padrão</span>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h3 className="font-medium">Avaliações da aprovação</h3>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-2 border rounded">
                              <div>
                                <span className="text-sm">Qualidade da entrega</span>
                                <span className="text-xs text-muted-foreground ml-2">[1 ... 5]</span>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="informacoes" className="space-y-6 mt-6">
                      <div className="text-center text-muted-foreground py-8">
                        Informações adicionais do contrato
                      </div>
                    </TabsContent>

                    <TabsContent value="perfis" className="space-y-6 mt-6">
                      <div className="text-center text-muted-foreground py-8">
                        Configurações de perfis de acesso
                      </div>
                    </TabsContent>

                    <TabsContent value="usuarios" className="space-y-6 mt-6">
                      <div className="text-center text-muted-foreground py-8">
                        Gestão de usuários do contrato
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex justify-end gap-2 pt-4 border-t mt-6">
                    <Button variant="outline">Cancelar</Button>
                    <Button>Salvar Contrato</Button>
                  </div>
                </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium">Projeto Modernização IT</h3>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">HH</Badge>
                      <Badge variant="secondary" className="text-xs">Ativo</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
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
}