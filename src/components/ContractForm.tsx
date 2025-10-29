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
import { Plus, Trash2, Edit2, Save, X } from "lucide-react";
import { Contract, ServiceGroup, ServiceLine, ContractConfig, DynamicField, EvaluationCriteria } from "@/data/mockData";
import { ContractDynamicFields } from "./ContractDynamicFields";
import { ContractEvaluationCriteria } from "./ContractEvaluationCriteria";

interface ContractFormProps {
  contract?: Contract;
  onSubmit: (data: Omit<Contract, "id" | "createdAt">) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ContractForm = ({ contract, onSubmit, onCancel, isLoading = false }: ContractFormProps) => {
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
  const [evaluationCriteria, setEvaluationCriteria] = useState<EvaluationCriteria[]>([]);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editingLine, setEditingLine] = useState<string | null>(null);

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
      setEvaluationCriteria(contract.evaluationCriteria || []);
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
        evaluationCriteria,
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
    return serviceLines.filter(line => line.groupId === groupId);
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

      <Tabs defaultValue="groups" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="groups">Grupos de Trabalho</TabsTrigger>
          <TabsTrigger value="lines">Linhas de Serviço</TabsTrigger>
          <TabsTrigger value="fields">Campos Dinâmicos</TabsTrigger>
          <TabsTrigger value="criteria">Critérios de Avaliação</TabsTrigger>
          <TabsTrigger value="config">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="space-y-4">
          <div className="flex justify-between items-center">
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
        </TabsContent>

        <TabsContent value="lines" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Linhas de Serviço</h3>
            <div className="text-sm text-muted-foreground">
              Total: {serviceLines.length} linhas
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
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => addServiceLine(group.id)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Linha
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {getServiceLinesForGroup(group.id).map((line) => (
                      <div key={line.id} className="border rounded-lg p-3">
                        {editingLine === line.id ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <Label htmlFor={`line-name-${line.id}`}>Nome</Label>
                                <Input
                                  id={`line-name-${line.id}`}
                                  value={line.name}
                                  onChange={(e) => updateServiceLine(line.id, { name: e.target.value })}
                                  placeholder="Nome da linha de serviço"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`line-code-${line.id}`}>Código</Label>
                                <Input
                                  id={`line-code-${line.id}`}
                                  value={line.code}
                                  onChange={(e) => updateServiceLine(line.id, { code: e.target.value })}
                                  placeholder="Ex: DEV-001"
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor={`line-description-${line.id}`}>Descrição</Label>
                              <Textarea
                                id={`line-description-${line.id}`}
                                value={line.description}
                                onChange={(e) => updateServiceLine(line.id, { description: e.target.value })}
                                placeholder="Descrição da linha de serviço"
                                rows={2}
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <Label htmlFor={`line-value-${line.id}`}>Valor (R$)</Label>
                                <Input
                                  id={`line-value-${line.id}`}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={line.value}
                                  onChange={(e) => updateServiceLine(line.id, { value: parseFloat(e.target.value) || 0 })}
                                  placeholder="0.00"
                                />
                              </div>
                              <div className="flex items-end gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => setEditingLine(null)}
                                  className="flex-1"
                                >
                                  <Save className="w-4 h-4 mr-2" />
                                  Salvar
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteServiceLine(line.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{line.name}</span>
                                <Badge variant="outline">{line.code}</Badge>
                                <Badge variant="secondary">
                                  R$ {line.value.toFixed(2)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{line.description}</p>
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
                        )}
                      </div>
                    ))}
                    {getServiceLinesForGroup(group.id).length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        Nenhuma linha de serviço cadastrada
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="fields" className="space-y-4">
          <ContractDynamicFields
            fields={dynamicFields}
            onFieldsChange={setDynamicFields}
          />
        </TabsContent>

        <TabsContent value="criteria" className="space-y-4">
          <ContractEvaluationCriteria
            criteria={evaluationCriteria}
            onCriteriaChange={setEvaluationCriteria}
          />
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
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
