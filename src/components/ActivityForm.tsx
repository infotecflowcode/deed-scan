import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Upload, X, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useDynamicFields } from "@/hooks/useDynamicFields";
import { useUsers } from "@/hooks/useUsers";
import { DynamicForm } from "@/components/DynamicForm";
import { Activity, ServiceLine } from "@/data/mockData";

export const ActivityForm = ({ onSubmit }: { onSubmit?: (data: any) => void }) => {
  const { user, currentContract } = useAuth();
  const { fields, isLoading: fieldsLoading } = useDynamicFields();
  
  // Debug: Log dos campos dinâmicos
  useEffect(() => {
    console.log("🔍 ActivityForm - Campos dinâmicos:", {
      fields,
      fieldsLoading,
      currentContract: currentContract?.id,
      dynamicFieldsFromContract: currentContract?.dynamicFields
    });
  }, [fields, fieldsLoading, currentContract]);
  const { users } = useUsers();
  
  const [photos, setPhotos] = useState<File[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);
  const [dynamicFieldsData, setDynamicFieldsData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    collaboratorId: "",
    groupId: "",
    typeId: "",
    serviceLineId: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    observations: "",
    status: "pending" as const,
    scope: "",
    workShift: "",
    unit: "",
  });

  // Buscar dados do contrato selecionado
  const activityTypes = currentContract?.activityTypes || [];
  const scopes = currentContract?.scopes || [];
  const statuses = currentContract?.statuses || [];
  const units = currentContract?.units || [];
  const workShifts = currentContract?.workShifts || [];

  // Lógica baseada em roles para filtrar dados disponíveis
  const availableCollaborators = useMemo(() => {
    if (!currentContract || !users) return [];
    
    // Buscar usuários atribuídos ao contrato atual
    const contractUserIds = currentContract.contractUsers
      .filter(cu => cu.isActive)
      .map(cu => cu.userId);
    
    return users.filter(u => 
      u.isActive && 
      contractUserIds.includes(u.id) && 
      (u.role === "colaborador" || u.role === "lider" || u.role === "admin")
    );
  }, [currentContract, users]);

  const availableGroups = useMemo(() => {
    if (!currentContract || !user) return [];
    
    // Se for colaborador, só pode ver seus grupos atribuídos
    if (user.role === "colaborador") {
      const userContract = currentContract.contractUsers.find(cu => cu.userId === user.id);
      
      if (!userContract) {
        return [];
      }
      
      return currentContract.serviceGroups.filter(group => 
        userContract.serviceGroups.includes(group.id)
      );
    }
    
    // Admin, Líder e Fiscal podem ver todos os grupos do contrato
    return currentContract.serviceGroups;
  }, [currentContract, user]);

  const availableServiceLines = useMemo(() => {
    if (!currentContract || !formData.groupId) return [];
    
    // Filtrar linhas de serviço do grupo selecionado
    const groupLines = currentContract.serviceLines.filter(line => 
      line.groupId === formData.groupId
    );
    
    // Se for colaborador, só pode ver suas linhas atribuídas
    if (user?.role === "colaborador") {
      const userContract = currentContract.contractUsers.find(cu => cu.userId === user.id);
      if (!userContract) return [];
      
      return groupLines.filter(line => 
        userContract.serviceLines.includes(line.id)
      );
    }
    
    // Líder e Fiscal podem ver todas as linhas do grupo
    return groupLines;
  }, [currentContract, formData.groupId, user]);

  // Inicializar dados do usuário logado
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        // Para colaborador, definir automaticamente como ele mesmo
        collaboratorId: user.role === "colaborador" ? user.id : prev.collaboratorId,
      }));
    }
  }, [user]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files);
      setPhotos([...photos, ...newPhotos]);
      toast.success(`${newPhotos.length} foto(s) adicionada(s)`);
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newDocs = Array.from(e.target.files);
      setDocuments([...documents, ...newDocs]);
      toast.success(`${newDocs.length} documento(s) adicionado(s)`);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validações obrigatórias
      if (!formData.title.trim()) {
        toast.error("Título da atividade é obrigatório");
        return;
      }
      
      if (!formData.collaboratorId) {
        toast.error("Colaborador é obrigatório");
        return;
      }
      
      if (!formData.groupId) {
        toast.error("Grupo de trabalho é obrigatório");
        return;
      }
      
      if (!formData.typeId) {
        toast.error("Tipo de atividade é obrigatório");
        return;
      }
      
      if (!formData.serviceLineId) {
        toast.error("Linha de serviço é obrigatória");
        return;
      }
      
      if (!formData.startDate || !formData.startTime) {
        toast.error("Data e hora de início são obrigatórias");
        return;
      }
      
      if (!formData.endDate || !formData.endTime) {
        toast.error("Data e hora de fim são obrigatórias");
        return;
      }
      
      // Validação de data/hora
      const startDateTime = new Date(`${formData.startDate} ${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate} ${formData.endTime}`);
      
      if (endDateTime <= startDateTime) {
        toast.error("A data/hora de fim deve ser posterior à de início");
        return;
      }
      
      // Validação de sobreposição (opcional - pode ser configurável)
      // TODO: Implementar validação de sobreposição se necessário
      
      // Buscar dados do colaborador selecionado
      const selectedCollaborator = users.find(u => u.id === formData.collaboratorId);
      const selectedGroup = availableGroups.find(g => g.id === formData.groupId);
      const selectedType = activityTypes.find(t => t.id === formData.typeId);
      const selectedServiceLine = availableServiceLines.find(sl => sl.id === formData.serviceLineId);

      // Criar atividade
      const newActivity: Omit<Activity, "id"> = {
        title: formData.title,
        collaboratorId: formData.collaboratorId,
        collaboratorName: selectedCollaborator?.name || "",
        groupId: formData.groupId,
        typeId: formData.typeId,
        contractId: currentContract?.id || "",
        serviceLineId: formData.serviceLineId,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        status: formData.status,
        observations: formData.observations,
        photos: photos.map(file => URL.createObjectURL(file)),
        documents: documents.map(file => ({
          name: file.name,
          url: URL.createObjectURL(file),
        })),
      };
      
      toast.success("Atividade registrada com sucesso!");
      onSubmit?.(newActivity);
      
    } catch (error) {
      console.error("Erro ao registrar atividade:", error);
      toast.error("Erro ao registrar atividade. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (fieldsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Carregando formulário...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Seleção de Colaborador baseada no role */}
      {user?.role === "colaborador" ? (
        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Colaborador</h3>
          <p className="text-sm text-muted-foreground">
            {user?.name} ({user?.email}) - {user?.role}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="collaboratorId">Colaborador *</Label>
          <Select
            value={formData.collaboratorId}
            onValueChange={(value) => setFormData({ ...formData, collaboratorId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o colaborador" />
            </SelectTrigger>
            <SelectContent>
              {availableCollaborators.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  Nenhum colaborador disponível para este contrato
                </div>
              ) : (
                availableCollaborators.map((collaborator) => (
                  <SelectItem key={collaborator.id} value={collaborator.id}>
                    {collaborator.name} ({collaborator.email}) - {collaborator.role}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {availableCollaborators.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhum colaborador foi atribuído a este contrato. 
              Acesse as configurações do contrato para atribuir colaboradores.
            </p>
          )}
        </div>
      )}

      {/* Campos Obrigatórios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título da Atividade *</Label>
          <Input
            id="title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Título da atividade"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="workShift">Jornada de Trabalho *</Label>
          <Select
            value={formData.workShift}
            onValueChange={(value) => setFormData({ ...formData, workShift: value })}
            disabled={workShifts.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={workShifts.length === 0 ? "Nenhuma jornada disponível" : "Selecione a jornada"} />
            </SelectTrigger>
            <SelectContent>
              {workShifts.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  Nenhuma jornada cadastrada para este contrato
                </div>
              ) : (
                workShifts.map((workShift) => (
                  <SelectItem key={workShift.id} value={workShift.id}>
                    {workShift.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {workShifts.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhuma jornada foi cadastrada para este contrato. 
              Acesse as configurações para cadastrar jornadas.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">Unidade/Gerência *</Label>
          <Select
            value={formData.unit}
            onValueChange={(value) => setFormData({ ...formData, unit: value })}
            disabled={units.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={units.length === 0 ? "Nenhuma unidade disponível" : "Selecione a unidade"} />
            </SelectTrigger>
            <SelectContent>
              {units.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  Nenhuma unidade cadastrada para este contrato
                </div>
              ) : (
                units.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.name} {unit.code && `(${unit.code})`}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {units.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhuma unidade foi cadastrada para este contrato. 
              Acesse as configurações para cadastrar unidades.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="groupId">Grupo de Trabalho *</Label>
          <Select
            value={formData.groupId}
            onValueChange={(value) => setFormData({ ...formData, groupId: value, serviceLineId: "" })}
            disabled={availableGroups.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={availableGroups.length === 0 ? "Nenhum grupo disponível" : "Selecione o grupo"} />
            </SelectTrigger>
            <SelectContent>
              {availableGroups.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  {user?.role === "colaborador" 
                    ? "Você não está atribuído a nenhum grupo de trabalho" 
                    : "Nenhum grupo de trabalho cadastrado para este contrato"
                  }
                </div>
              ) : (
                availableGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {availableGroups.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {user?.role === "colaborador" 
                ? "Você não está atribuído a nenhum grupo de trabalho. Entre em contato com seu líder."
                : "Nenhum grupo de trabalho foi cadastrado para este contrato. Acesse as configurações para cadastrar grupos."
              }
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="serviceLineId">Linha de Serviço *</Label>
          <Select
            value={formData.serviceLineId}
            onValueChange={(value) => setFormData({ ...formData, serviceLineId: value })}
            disabled={!formData.groupId || availableServiceLines.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={
                !formData.groupId 
                  ? "Selecione primeiro um grupo de trabalho" 
                  : availableServiceLines.length === 0 
                    ? "Nenhuma linha disponível" 
                    : "Selecione a linha de serviço"
              } />
            </SelectTrigger>
            <SelectContent>
              {!formData.groupId ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  Selecione primeiro um grupo de trabalho
                </div>
              ) : availableServiceLines.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  {user?.role === "colaborador" 
                    ? "Você não está atribuído a nenhuma linha de serviço deste grupo" 
                    : "Nenhuma linha de serviço cadastrada para este grupo"
                  }
                </div>
              ) : (
                availableServiceLines.map((line) => (
                  <SelectItem key={line.id} value={line.id}>
                    {line.name} - R$ {line.value.toFixed(2)}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {formData.groupId && availableServiceLines.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {user?.role === "colaborador" 
                ? "Você não está atribuído a nenhuma linha de serviço deste grupo. Entre em contato com seu líder."
                : "Nenhuma linha de serviço foi cadastrada para este grupo. Acesse as configurações para cadastrar linhas."
              }
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="typeId">Tipo de Atividade *</Label>
          <Select
            value={formData.typeId}
            onValueChange={(value) => setFormData({ ...formData, typeId: value })}
            disabled={activityTypes.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={activityTypes.length === 0 ? "Nenhum tipo disponível" : "Selecione o tipo"} />
            </SelectTrigger>
            <SelectContent>
              {activityTypes.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  Nenhum tipo de atividade cadastrado para este contrato
                </div>
              ) : (
                activityTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {activityTypes.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhum tipo de atividade foi cadastrado para este contrato. 
              Acesse as configurações para cadastrar tipos.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="scope">Escopo da Atividade *</Label>
          <Select
            value={formData.scope}
            onValueChange={(value) => setFormData({ ...formData, scope: value })}
            disabled={scopes.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={scopes.length === 0 ? "Nenhum escopo disponível" : "Selecione o escopo"} />
            </SelectTrigger>
            <SelectContent>
              {scopes.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  Nenhum escopo cadastrado para este contrato
                </div>
              ) : (
                scopes.map((scope) => (
                  <SelectItem key={scope.id} value={scope.id}>
                    {scope.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {scopes.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhum escopo foi cadastrado para este contrato. 
              Acesse as configurações para cadastrar escopos.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate">Data Início *</Label>
          <Input
            id="startDate"
            type="date"
            required
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="startTime">Hora Início *</Label>
          <Input
            id="startTime"
            type="time"
            required
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">Data Fim *</Label>
          <Input
            id="endDate"
            type="date"
            required
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endTime">Hora Fim *</Label>
          <Input
            id="endTime"
            type="time"
            required
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
          />
        </div>
      </div>

      {/* Campos Dinâmicos */}
      {fields.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Campos Adicionais</h3>
          <DynamicForm
            fields={fields}
            values={dynamicFieldsData}
            onChange={setDynamicFieldsData}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Campos Adicionais</h3>
          <div className="text-sm text-muted-foreground">
            Nenhum campo dinâmico configurado para este contrato.
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="observations">Observações</Label>
        <Textarea
          id="observations"
          value={formData.observations}
          onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
          placeholder="Observações sobre a atividade..."
          rows={3}
        />
      </div>

      {/* Evidências */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Evidências</h3>
        
        <div>
          <Label>Fotos *</Label>
          <Card className="p-4 border-2 border-dashed mt-2">
            <input
              type="file"
              accept="image/*,.pdf"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className="flex flex-col items-center justify-center cursor-pointer py-4"
            >
              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">
                Clique ou arraste fotos aqui (JPG, PNG, PDF)
              </span>
            </label>
          </Card>

          {photos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removePhoto(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label>Documentos (Opcional)</Label>
          <Card className="p-4 border-2 border-dashed mt-2">
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              multiple
              onChange={handleDocumentUpload}
              className="hidden"
              id="doc-upload"
            />
            <label
              htmlFor="doc-upload"
              className="flex flex-col items-center justify-center cursor-pointer py-4"
            >
              <FileText className="w-8 h-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">
                Adicionar documentos (PDF, DOC, XLS)
              </span>
            </label>
          </Card>

          {documents.length > 0 && (
            <div className="space-y-2 mt-4">
              {documents.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-sm">{doc.name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeDocument(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Registrando...
            </>
          ) : (
            "Registrar Atividade"
          )}
        </Button>
      </div>
    </form>
  );
};
