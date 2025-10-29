import { useState, useEffect } from "react";
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
import { useServiceGroups } from "@/hooks/useServiceGroups";
import { useActivityTypes } from "@/hooks/useActivityTypes";
import { useDynamicFields } from "@/hooks/useDynamicFields";
import { DynamicForm } from "@/components/DynamicForm";
import { Activity } from "@/data/mockData";

export const ActivityForm = ({ onSubmit }: { onSubmit?: (data: any) => void }) => {
  const { user, currentContract } = useAuth();
  const { groups, isLoading: groupsLoading } = useServiceGroups();
  const { types, isLoading: typesLoading } = useActivityTypes();
  const { fields, isLoading: fieldsLoading } = useDynamicFields();
  
  const [photos, setPhotos] = useState<File[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);
  const [dynamicFieldsData, setDynamicFieldsData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
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

  // Inicializar dados do usuário logado
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        // Preencher automaticamente com dados do usuário logado
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
      
      // Criar atividade
      const newActivity: Omit<Activity, "id"> = {
        title: formData.title,
        collaboratorId: user?.id || "",
        collaboratorName: user?.name || "",
        groupId: formData.groupId,
        groupName: groups.find(g => g.id === formData.groupId)?.name || "",
        typeId: formData.typeId,
        typeName: types.find(t => t.id === formData.typeId)?.name || "",
        contractId: currentContract?.id || "",
        contractName: currentContract?.name || "",
        serviceLineId: formData.serviceLineId,
        serviceLineName: "", // TODO: Buscar nome da linha de serviço
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        status: formData.status,
        scope: formData.scope,
        workShift: formData.workShift,
        unit: formData.unit,
        observations: formData.observations,
        photos: photos.map(file => ({
          id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          url: URL.createObjectURL(file),
          uploadedAt: new Date().toISOString(),
        })),
        documents: documents.map(file => ({
          id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          url: URL.createObjectURL(file),
          uploadedAt: new Date().toISOString(),
        })),
        dynamicFields: Object.entries(dynamicFieldsData).map(([fieldId, value]) => ({
          fieldId,
          value,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        editHistory: [],
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

  if (groupsLoading || typesLoading || fieldsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Carregando formulário...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações do Colaborador (preenchido automaticamente) */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Colaborador</h3>
        <p className="text-sm text-muted-foreground">
          {user?.name} ({user?.email}) - {user?.role}
        </p>
      </div>

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
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a jornada" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="diurno">Diurno</SelectItem>
              <SelectItem value="noturno">Noturno</SelectItem>
              <SelectItem value="madrugada">Madrugada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">Unidade/Gerência *</Label>
          <Input
            id="unit"
            required
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            placeholder="Local de atuação"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="groupId">Grupo de Trabalho *</Label>
          <Select
            value={formData.groupId}
            onValueChange={(value) => setFormData({ ...formData, groupId: value, serviceLineId: "" })}
            disabled={groups.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={groups.length === 0 ? "Nenhum grupo disponível" : "Selecione o grupo"} />
            </SelectTrigger>
            <SelectContent>
              {groups.length === 0 ? (
                <SelectItem value="" disabled>
                  Nenhum grupo de trabalho cadastrado para este contrato
                </SelectItem>
              ) : (
                groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {groups.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhum grupo de trabalho foi cadastrado para este contrato. 
              Acesse as configurações para cadastrar grupos.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="serviceLineId">Linha de Serviço *</Label>
          <Select
            value={formData.serviceLineId}
            onValueChange={(value) => setFormData({ ...formData, serviceLineId: value })}
            disabled={!formData.groupId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a linha de serviço" />
            </SelectTrigger>
            <SelectContent>
              {/* TODO: Implementar linhas de serviço baseadas no grupo selecionado */}
              <SelectItem value="linha1">Linha de Serviço 1</SelectItem>
              <SelectItem value="linha2">Linha de Serviço 2</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="typeId">Tipo de Atividade *</Label>
          <Select
            value={formData.typeId}
            onValueChange={(value) => setFormData({ ...formData, typeId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {types.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="scope">Escopo da Atividade *</Label>
          <Input
            id="scope"
            required
            value={formData.scope}
            onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
            placeholder="Escopo da atividade"
          />
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
      {fields.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Campos Adicionais</h3>
          <DynamicForm
            fields={fields}
            values={dynamicFieldsData}
            onChange={setDynamicFieldsData}
          />
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
