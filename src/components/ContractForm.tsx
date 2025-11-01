import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit2, Save, X, ArrowUp, ArrowDown } from "lucide-react";
import { Contract, ServiceGroup, ServiceLine, ContractConfig, DynamicField, EvaluationCriteria, ContractUser, ActivityType, Scope, Status, Unit, WorkShift, DynamicTable } from "@/data/mockData";
import { ContractDynamicFields } from "./ContractDynamicFields";
import { ContractDynamicTables } from "./ContractDynamicTables";
import { ContractEvaluationCriteria } from "./ContractEvaluationCriteria";
import { ContractPeople } from "./ContractPeople";
import { useUsers } from "@/hooks/useUsers";

interface ContractFormProps {
  contract?: Contract;
  onSubmit: (data: Omit<Contract, "id" | "createdAt">) => void;
  onCancel: () => void;
  isLoading?: boolean;
  defaultTab?: string; // Tab padrão para abrir
}

export const ContractForm = ({ contract, onSubmit, onCancel, isLoading = false, defaultTab }: ContractFormProps) => {
  const { users } = useUsers();
  
  const [formData, setFormData] = useState({
    name: "",
    billingType: "HH" as "HH" | "BPO" | "ENTREGAVEL",
    config: {
      evidenceRequired: true,
      documentsRequired: true,
      resourcesRequired: false,
      unitRequired: true,
      demandRequesterRequired: false,
      controlPlannedDates: true,
      evaluationType: "numeric" as "numeric" | "stars",
      evaluationResult: "average" as "average" | "sum",
    } as ContractConfig,
  });

  const [serviceGroups, setServiceGroups] = useState<ServiceGroup[]>([]);
  const [serviceLines, setServiceLines] = useState<ServiceLine[]>([]);
  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>([]);
  const [dynamicTables, setDynamicTables] = useState<DynamicTable[]>([]);
  const [evaluationCriteria, setEvaluationCriteria] = useState<EvaluationCriteria[]>([]);
  const [contractUsers, setContractUsers] = useState<ContractUser[]>([]);
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [scopes, setScopes] = useState<Scope[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [workShifts, setWorkShifts] = useState<WorkShift[]>([]);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editingLine, setEditingLine] = useState<string | null>(null);
  const [editingActivityType, setEditingActivityType] = useState<string | null>(null);
  const [editingScope, setEditingScope] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [editingUnit, setEditingUnit] = useState<string | null>(null);
  const [editingWorkShift, setEditingWorkShift] = useState<string | null>(null);
  const [lineSortBy, setLineSortBy] = useState<"code" | "name" | "none">("none");
  const [lineSortOrder, setLineSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    if (contract) {
      setFormData({
        name: contract.name,
        billingType: contract.billingType,
        config: contract.config,
      });
      setServiceGroups(contract.serviceGroups || []);
      setServiceLines(contract.serviceLines || []);
      setDynamicFields(contract.dynamicFields || []);
      setDynamicTables(contract.dynamicTables || []);
      setEvaluationCriteria(contract.evaluationCriteria || []);
      setContractUsers(contract.contractUsers || []);
      setActivityTypes(contract.activityTypes || []);
      setScopes(contract.scopes || []);
      setStatuses(contract.statuses || []);
      setUnits(contract.units || []);
      setWorkShifts(contract.workShifts || []);
    }
  }, [contract]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && serviceGroups.length > 0) {
      onSubmit({
        name: formData.name,
        billingType: formData.billingType,
        serviceGroups,
        serviceLines,
        dynamicFields,
        dynamicTables,
        evaluationCriteria,
        contractUsers,
        activityTypes,
        scopes,
        statuses,
        units,
        workShifts,
        config: formData.config,
        status: "active",
      });
    }
  };

  const addServiceGroup = () => {
    const newGroup: ServiceGroup = {
      id: `group-${Date.now()}`,
      name: "",
      color: "#3B82F6",
    };
    setServiceGroups([...serviceGroups, newGroup]);
    setEditingGroup(newGroup.id);
  };

  const updateServiceGroup = (id: string, updates: Partial<ServiceGroup>) => {
    setServiceGroups(groups =>
      groups.map(group => group.id === id ? { ...group, ...updates } : group)
    );
  };

  const deleteServiceGroup = (id: string) => {
    setServiceGroups(groups => groups.filter(group => group.id !== id));
    setServiceLines(lines => lines.filter(line => line.groupId !== id));
  };

  const addServiceLine = (groupId: string) => {
    const newLine: ServiceLine = {
      id: `line-${Date.now()}`,
      name: "",
      description: "",
      code: "",
      value: 0,
      groupId,
    };
    setServiceLines([...serviceLines, newLine]);
    setEditingLine(newLine.id);
  };

  const updateServiceLine = (id: string, updates: Partial<ServiceLine>) => {
    setServiceLines(lines =>
      lines.map(line => line.id === id ? { ...line, ...updates } : line)
    );
  };

  const deleteServiceLine = (id: string) => {
    setServiceLines(lines => lines.filter(line => line.id !== id));
  };

  const getServiceLinesForGroup = (groupId: string) => {
    let lines = serviceLines.filter(line => line.groupId === groupId);
    
    // Aplicar ordenação se solicitado
    if (lineSortBy !== "none") {
      lines = [...lines].sort((a, b) => {
        let comparison = 0;
        
        if (lineSortBy === "code") {
          comparison = (a.code || "").localeCompare(b.code || "", undefined, { numeric: true, sensitivity: 'base' });
        } else if (lineSortBy === "name") {
          comparison = (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: 'base' });
        }
        
        return lineSortOrder === "asc" ? comparison : -comparison;
      });
    }
    
    return lines;
  };

  // Funções para ActivityType
  const addActivityType = () => {
    const newType: ActivityType = {
      id: `type-${Date.now()}`,
      name: "",
      description: "",
      color: "#3B82F6",
      contractId: "",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setActivityTypes([...activityTypes, newType]);
    setEditingActivityType(newType.id);
  };

  const updateActivityType = (id: string, updates: Partial<ActivityType>) => {
    setActivityTypes(types =>
      types.map(type => type.id === id ? { ...type, ...updates, updatedAt: new Date().toISOString() } : type)
    );
  };

  const deleteActivityType = (id: string) => {
    setActivityTypes(types => types.filter(type => type.id !== id));
  };

  // Funções para Scope
  const addScope = () => {
    const newScope: Scope = {
      id: `scope-${Date.now()}`,
      name: "",
      description: "",
      color: "#10B981",
      contractId: "",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setScopes([...scopes, newScope]);
    setEditingScope(newScope.id);
  };

  const updateScope = (id: string, updates: Partial<Scope>) => {
    setScopes(scopes =>
      scopes.map(scope => scope.id === id ? { ...scope, ...updates, updatedAt: new Date().toISOString() } : scope)
    );
  };

  const deleteScope = (id: string) => {
    setScopes(scopes => scopes.filter(scope => scope.id !== id));
  };

  // Funções para Status
  const addStatus = () => {
    const newStatus: Status = {
      id: `status-${Date.now()}`,
      name: "",
      description: "",
      color: "#F59E0B",
      contractId: "",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setStatuses([...statuses, newStatus]);
    setEditingStatus(newStatus.id);
  };

  const updateStatus = (id: string, updates: Partial<Status>) => {
    setStatuses(statuses =>
      statuses.map(status => status.id === id ? { ...status, ...updates, updatedAt: new Date().toISOString() } : status)
    );
  };

  const deleteStatus = (id: string) => {
    setStatuses(statuses => statuses.filter(status => status.id !== id));
  };

  // Funções para Unit
  const addUnit = () => {
    const newUnit: Unit = {
      id: `unit-${Date.now()}`,
      name: "",
      code: "",
      description: "",
      contractId: "",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUnits([...units, newUnit]);
    setEditingUnit(newUnit.id);
  };

  const updateUnit = (id: string, updates: Partial<Unit>) => {
    setUnits(units =>
      units.map(unit => unit.id === id ? { ...unit, ...updates, updatedAt: new Date().toISOString() } : unit)
    );
  };

  const deleteUnit = (id: string) => {
    setUnits(units => units.filter(unit => unit.id !== id));
  };

  // Funções para WorkShift
  const addWorkShift = () => {
    const newWorkShift: WorkShift = {
      id: `shift-${Date.now()}`,
      name: "",
      description: "",
      color: "#3B82F6",
      contractId: "",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setWorkShifts([...workShifts, newWorkShift]);
    setEditingWorkShift(newWorkShift.id);
  };

  const updateWorkShift = (id: string, updates: Partial<WorkShift>) => {
    setWorkShifts(workShifts =>
      workShifts.map(workShift => workShift.id === id ? { ...workShift, ...updates, updatedAt: new Date().toISOString() } : workShift)
    );
  };

  const deleteWorkShift = (id: string) => {
    setWorkShifts(workShifts => workShifts.filter(workShift => workShift.id !== id));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nome do Contrato</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Ex: Projeto de Modernização"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="billingType">Tipo de Faturamento</Label>
          <Select
            value={formData.billingType}
            onValueChange={(value: "HH" | "BPO" | "ENTREGAVEL") => 
              setFormData(prev => ({ ...prev, billingType: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="HH">Horas Homem (HH)</SelectItem>
              <SelectItem value="BPO">Business Process Outsourcing (BPO)</SelectItem>
              <SelectItem value="ENTREGAVEL">Entregável</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue={defaultTab || "contract-attributes"} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="contract-attributes">Atributos dos Contratos</TabsTrigger>
          <TabsTrigger value="groups-services">Grupos e Serviços</TabsTrigger>
          <TabsTrigger value="task-attributes">Atributos das Tarefas</TabsTrigger>
          <TabsTrigger value="additional-info">Informações adicionais</TabsTrigger>
          <TabsTrigger value="access-profiles">Perfil de Acesso</TabsTrigger>
        </TabsList>

        <TabsContent value="contract-attributes" className="space-y-4">
          <h3 className="text-lg font-medium">Configurações do Contrato</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Campos Obrigatórios</CardTitle>
                <CardDescription>
                  Configure quais campos são obrigatórios no cadastro de atividades
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="evidenceRequired">Evidências obrigatórias</Label>
                  <Switch
                    id="evidenceRequired"
                    checked={formData.config.evidenceRequired}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({
                        ...prev,
                        config: { ...prev.config, evidenceRequired: checked }
                      }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="documentsRequired">Documentos obrigatórios</Label>
                  <Switch
                    id="documentsRequired"
                    checked={formData.config.documentsRequired}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({
                        ...prev,
                        config: { ...prev.config, documentsRequired: checked }
                      }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="resourcesRequired">Recursos utilizados obrigatório</Label>
                  <Switch
                    id="resourcesRequired"
                    checked={formData.config.resourcesRequired}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({
                        ...prev,
                        config: { ...prev.config, resourcesRequired: checked }
                      }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="unitRequired">Unidade obrigatória</Label>
                  <Switch
                    id="unitRequired"
                    checked={formData.config.unitRequired}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({
                        ...prev,
                        config: { ...prev.config, unitRequired: checked }
                      }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="demandRequesterRequired">Exigir requisitante da demanda</Label>
                  <Switch
                    id="demandRequesterRequired"
                    checked={formData.config.demandRequesterRequired}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({
                        ...prev,
                        config: { ...prev.config, demandRequesterRequired: checked }
                      }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="controlPlannedDates">Controlar datas previstas início/fim</Label>
                  <Switch
                    id="controlPlannedDates"
                    checked={formData.config.controlPlannedDates}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({
                        ...prev,
                        config: { ...prev.config, controlPlannedDates: checked }
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Avaliação</CardTitle>
                <CardDescription>
                  Configure como as atividades serão avaliadas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="evaluationType">Tipo de avaliação</Label>
                  <Select
                    value={formData.config.evaluationType}
                    onValueChange={(value: "numeric" | "stars") =>
                      setFormData(prev => ({
                        ...prev,
                        config: { ...prev.config, evaluationType: value }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="numeric">Numérico</SelectItem>
                      <SelectItem value="stars">Estrelas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="evaluationResult">Resultado de avaliação</Label>
                  <Select
                    value={formData.config.evaluationResult}
                    onValueChange={(value: "average" | "sum") =>
                      setFormData(prev => ({
                        ...prev,
                        config: { ...prev.config, evaluationResult: value }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="average">Média</SelectItem>
                      <SelectItem value="sum">Somatório</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="groups-services" className="space-y-4">
          <div className="space-y-6">
            {/* Grupos de Trabalho */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Grupos de Trabalho</h3>
                <Button type="button" onClick={addServiceGroup} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Grupo
                </Button>
              </div>

              <div className="space-y-3">
                {serviceGroups.map((group) => (
                  <Card key={group.id}>
                    <CardContent className="p-4">
                      {editingGroup === group.id ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <Label htmlFor={`group-name-${group.id}`}>Nome</Label>
                              <Input
                                id={`group-name-${group.id}`}
                                value={group.name}
                                onChange={(e) => updateServiceGroup(group.id, { name: e.target.value })}
                                placeholder="Nome do grupo"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`group-color-${group.id}`}>Cor</Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  id={`group-color-${group.id}`}
                                  type="color"
                                  value={group.color}
                                  onChange={(e) => updateServiceGroup(group.id, { color: e.target.value })}
                                  className="w-16 h-10"
                                />
                                <Input
                                  value={group.color}
                                  onChange={(e) => updateServiceGroup(group.id, { color: e.target.value })}
                                  placeholder="#3B82F6"
                                  className="flex-1"
                                />
                              </div>
                            </div>
                            <div className="flex items-end gap-2">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => setEditingGroup(null)}
                              >
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteServiceGroup(group.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: group.color }}
                            />
                            <span className="font-medium">{group.name}</span>
                            <Badge variant="secondary">
                              {getServiceLinesForGroup(group.id).length} linhas
                            </Badge>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingGroup(group.id)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Linhas de Serviço */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Linhas de Serviço</h3>
                <div className="flex items-center gap-4">
                  {/* Controles de Ordenação */}
                  <div className="flex items-center gap-2">
                    <Label htmlFor="sort-by" className="text-sm">Ordenar por:</Label>
                    <Select
                      value={lineSortBy}
                      onValueChange={(value: "code" | "name" | "none") => {
                        setLineSortBy(value);
                        if (value === "none") {
                          setLineSortOrder("asc");
                        }
                      }}
                    >
                      <SelectTrigger className="w-32 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma</SelectItem>
                        <SelectItem value="code">Código</SelectItem>
                        <SelectItem value="name">Nome</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {lineSortBy !== "none" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setLineSortOrder(lineSortOrder === "asc" ? "desc" : "asc")}
                        className="h-8"
                      >
                        {lineSortOrder === "asc" ? (
                          <ArrowUp className="w-4 h-4" />
                        ) : (
                          <ArrowDown className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    Total: {serviceLines.length} linhas
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {serviceGroups.map((group) => (
                  <Card key={group.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: group.color }}
                          />
                          <CardTitle className="text-base">{group.name}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {/* Botão para adicionar nova linha - sempre no topo */}
                        {!editingLine && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => addServiceLine(group.id)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Linha
                          </Button>
                        )}

                        {/* Formulário de edição/nova linha - sempre no topo, acima das linhas existentes */}
                        {editingLine && serviceLines.find(l => l.id === editingLine && l.groupId === group.id) && (
                          <div className="border rounded-lg p-3 border-primary bg-primary/5">
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <Label htmlFor={`line-code-${editingLine}`}>Código</Label>
                                  <Input
                                    id={`line-code-${editingLine}`}
                                    value={serviceLines.find(l => l.id === editingLine)?.code || ""}
                                    onChange={(e) => updateServiceLine(editingLine, { code: e.target.value })}
                                    placeholder="Ex: 2.1"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`line-name-${editingLine}`}>Nome</Label>
                                  <Input
                                    id={`line-name-${editingLine}`}
                                    value={serviceLines.find(l => l.id === editingLine)?.name || ""}
                                    onChange={(e) => updateServiceLine(editingLine, { name: e.target.value })}
                                    placeholder="Nome da linha de serviço"
                                  />
                                </div>
                              </div>
                              <div>
                                <Label htmlFor={`line-description-${editingLine}`}>Descrição</Label>
                                <Textarea
                                  id={`line-description-${editingLine}`}
                                  value={serviceLines.find(l => l.id === editingLine)?.description || ""}
                                  onChange={(e) => updateServiceLine(editingLine, { description: e.target.value })}
                                  placeholder="Descrição da linha de serviço"
                                  rows={2}
                                />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <Label htmlFor={`line-value-${editingLine}`}>Valor (R$)</Label>
                                  <Input
                                    id={`line-value-${editingLine}`}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={serviceLines.find(l => l.id === editingLine)?.value || 0}
                                    onChange={(e) => updateServiceLine(editingLine, { value: parseFloat(e.target.value) || 0 })}
                                    placeholder="0.00"
                                  />
                                </div>
                                <div className="flex items-end gap-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => {
                                      const line = serviceLines.find(l => l.id === editingLine);
                                      // Só salvar se tiver código e nome
                                      if (line && line.code && line.name) {
                                        setEditingLine(null);
                                      }
                                    }}
                                    className="flex-1"
                                    disabled={!serviceLines.find(l => l.id === editingLine)?.code || !serviceLines.find(l => l.id === editingLine)?.name}
                                  >
                                    <Save className="w-4 h-4 mr-2" />
                                    Salvar
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                      deleteServiceLine(editingLine);
                                      setEditingLine(null);
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Linhas existentes (não em edição) */}
                        {getServiceLinesForGroup(group.id)
                          .filter(line => editingLine !== line.id)
                          .map((line) => (
                            <div key={line.id} className="border rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    {/* Código antes do nome */}
                                    {line.code && (
                                      <Badge variant="outline" className="font-mono">{line.code}</Badge>
                                    )}
                                    <span className="font-medium">{line.name}</span>
                                    <Badge variant="secondary">
                                      R$ {line.value.toFixed(2)}
                                    </Badge>
                                  </div>
                                  {line.description && (
                                    <p className="text-sm text-muted-foreground">{line.description}</p>
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingLine(line.id)}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        
                        {/* Mensagem quando não há linhas */}
                        {getServiceLinesForGroup(group.id).filter(line => editingLine !== line.id).length === 0 && !editingLine && (
                          <div className="text-center py-4 text-muted-foreground">
                            Nenhuma linha de serviço cadastrada
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="task-attributes" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tipo de Atividade */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Tipo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {activityTypes.map((type) => (
                    <div key={type.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: type.color }}
                        />
                        <span className="text-sm">{type.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingActivityType(type.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteActivityType(type.id)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <Input
                    placeholder="Novo Tipo ..."
                    value={editingActivityType ? activityTypes.find(t => t.id === editingActivityType)?.name || "" : ""}
                    onChange={(e) => {
                      if (editingActivityType) {
                        updateActivityType(editingActivityType, { name: e.target.value });
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && editingActivityType) {
                        setEditingActivityType(null);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (editingActivityType) {
                        setEditingActivityType(null);
                      } else {
                        addActivityType();
                      }
                    }}
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {statuses.map((status) => (
                    <div key={status.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: status.color }}
                        />
                        <span className="text-sm">{status.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingStatus(status.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteStatus(status.id)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <Input
                    placeholder="Descrição ..."
                    value={editingStatus ? statuses.find(s => s.id === editingStatus)?.name || "" : ""}
                    onChange={(e) => {
                      if (editingStatus) {
                        updateStatus(editingStatus, { name: e.target.value });
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && editingStatus) {
                        setEditingStatus(null);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (editingStatus) {
                        setEditingStatus(null);
                      } else {
                        addStatus();
                      }
                    }}
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Escopo */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Escopo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {scopes.map((scope) => (
                    <div key={scope.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: scope.color }}
                        />
                        <span className="text-sm">{scope.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingScope(scope.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteScope(scope.id)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <Input
                    placeholder="Novo Escopo..."
                    value={editingScope ? scopes.find(s => s.id === editingScope)?.name || "" : ""}
                    onChange={(e) => {
                      if (editingScope) {
                        updateScope(editingScope, { name: e.target.value });
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && editingScope) {
                        setEditingScope(null);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (editingScope) {
                        setEditingScope(null);
                      } else {
                        addScope();
                      }
                    }}
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Unidade */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Unidade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {units.map((unit) => (
                    <div key={unit.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{unit.name}</span>
                        {unit.code && (
                          <Badge variant="outline" className="text-xs">
                            {unit.code}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingUnit(unit.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteUnit(unit.id)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <Input
                    placeholder="Nova Unidade de Negócios..."
                    value={editingUnit ? units.find(u => u.id === editingUnit)?.name || "" : ""}
                    onChange={(e) => {
                      if (editingUnit) {
                        updateUnit(editingUnit, { name: e.target.value });
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && editingUnit) {
                        setEditingUnit(null);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (editingUnit) {
                        setEditingUnit(null);
                      } else {
                        addUnit();
                      }
                    }}
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Jornada de Trabalho */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Jornada</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {workShifts.map((workShift) => (
                    <div key={workShift.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: workShift.color }}
                        />
                        <span className="text-sm">{workShift.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingWorkShift(workShift.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteWorkShift(workShift.id)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <Input
                    placeholder="Nova Jornada..."
                    value={editingWorkShift ? workShifts.find(ws => ws.id === editingWorkShift)?.name || "" : ""}
                    onChange={(e) => {
                      if (editingWorkShift) {
                        updateWorkShift(editingWorkShift, { name: e.target.value });
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && editingWorkShift) {
                        setEditingWorkShift(null);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (editingWorkShift) {
                        setEditingWorkShift(null);
                      } else {
                        addWorkShift();
                      }
                    }}
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Critérios de Avaliação - Seção separada */}
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Critérios de Avaliação</CardTitle>
                <CardDescription>
                  Define os critérios usados pelos fiscais na etapa de aprovação das atividades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContractEvaluationCriteria
                  criteria={evaluationCriteria}
                  onCriteriaChange={setEvaluationCriteria}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="additional-info" className="space-y-4">
          <div className="space-y-6">
            <div>
              <ContractDynamicFields
                fields={dynamicFields}
                onFieldsChange={setDynamicFields}
                dynamicTables={dynamicTables}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="access-profiles" className="space-y-4">
          <h3 className="text-lg font-medium">Pessoas</h3>
          <ContractPeople
            contractUsers={contractUsers}
            onUsersChange={setContractUsers}
            availableUsers={users}
            serviceGroups={serviceGroups}
            serviceLines={serviceLines}
          />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading || !formData.name.trim() || serviceGroups.length === 0}
        >
          {isLoading ? "Salvando..." : contract ? "Atualizar" : "Criar"} Contrato
        </Button>
      </div>
    </form>
  );
};
