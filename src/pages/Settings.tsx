import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import { serviceGroups, activityTypes, evaluationCriteria, ServiceGroup, ActivityType, EvaluationCriteria } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UserSelector } from "@/components/UserSelector";
import { CommentSystem } from "@/components/CommentSystem";

export default function Settings() {
  const { toast } = useToast();
  const [groups, setGroups] = useState<ServiceGroup[]>(serviceGroups);
  const [types, setTypes] = useState<ActivityType[]>(activityTypes);
  const [criteria, setCriteria] = useState<EvaluationCriteria[]>(evaluationCriteria);
  const [newType, setNewType] = useState("");

  const handleAddType = () => {
    if (!newType.trim()) return;
    setTypes([...types, { id: String(types.length + 1), name: newType }]);
    setNewType("");
    toast({ title: "Tipo adicionado com sucesso!" });
  };

  const handleDeleteType = (id: string) => {
    setTypes(types.filter(t => t.id !== id));
    toast({ title: "Tipo removido com sucesso!" });
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
          <TabsList className="grid w-full max-w-3xl grid-cols-5">
            <TabsTrigger value="groups">Grupos</TabsTrigger>
            <TabsTrigger value="types">Tipos</TabsTrigger>
            <TabsTrigger value="criteria">Critérios</TabsTrigger>
            <TabsTrigger value="contracts">Contratos</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
          </TabsList>

          {/* GRUPOS DE SERVIÇO */}
          <TabsContent value="groups" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Grupos de Serviço</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Grupo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Grupo de Serviço</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Nome do Grupo</Label>
                      <Input placeholder="Ex: Manutenção" />
                    </div>
                    <div>
                      <Label>Cor</Label>
                      <Input type="color" defaultValue="#3B82F6" />
                    </div>
                    <Button className="w-full">Salvar</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
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
                    <Button variant="ghost" size="icon">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* TIPOS DE ATIVIDADE */}
          <TabsContent value="types" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Tipos de Atividade</h2>
            </div>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Novo tipo de atividade..."
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddType()}
              />
              <Button onClick={handleAddType}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {types.map((type) => (
                <div
                  key={type.id}
                  className="border rounded-lg p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <span>{type.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteType(type.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* CRITÉRIOS DE AVALIAÇÃO */}
          <TabsContent value="criteria" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Critérios de Avaliação</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Critério
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Critério</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Nome do Critério</Label>
                      <Input placeholder="Ex: Qualidade do Trabalho" />
                    </div>
                    <div>
                      <Label>Nota Máxima</Label>
                      <Input type="number" defaultValue={5} min={1} max={10} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="required" />
                      <Label htmlFor="required">Obrigatório</Label>
                    </div>
                    <Button className="w-full">Salvar</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
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
                      <Button variant="ghost" size="icon">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* CONTRATOS */}
          <TabsContent value="contracts" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Contratos</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Contrato
                  </Button>
                </DialogTrigger>
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
                            {serviceGroups.map((group) => (
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
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Usuário
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cadastrar Usuário</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Nome</Label>
                      <Input placeholder="Nome completo" />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input type="email" placeholder="email@example.com" />
                    </div>
                    <div>
                      <Label>Perfil</Label>
                      <select className="w-full border rounded-md p-2">
                        <option>Colaborador</option>
                        <option>Líder</option>
                        <option>Fiscal</option>
                        <option>Admin</option>
                      </select>
                    </div>
                    <Button className="w-full">Enviar Convite</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="text-center py-8 text-muted-foreground">
              <p>Lista de usuários será implementada aqui</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <CommentSystem enabled={true} />
    </div>
  );
}