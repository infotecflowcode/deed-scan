import { useState } from "react";
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
import { Upload, X, FileText } from "lucide-react";
import { toast } from "sonner";

export const ActivityForm = ({ onSubmit }: { onSubmit?: (data: any) => void }) => {
  const [photos, setPhotos] = useState<File[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    collaborator: "",
    group: "",
    type: "",
    contract: "",
    serviceLine: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    observations: "",
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (new Date(`${formData.endDate} ${formData.endTime}`) <= new Date(`${formData.startDate} ${formData.startTime}`)) {
      toast.error("A data/hora de fim deve ser posterior à de início");
      return;
    }

    const data = {
      ...formData,
      photos,
      documents,
    };
    
    toast.success("Atividade registrada com sucesso!");
    onSubmit?.(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Título da atividade"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="collaborator">Colaborador *</Label>
          <Select
            value={formData.collaborator}
            onValueChange={(value) => setFormData({ ...formData, collaborator: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o colaborador" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="joao">João Silva</SelectItem>
              <SelectItem value="maria">Maria Santos</SelectItem>
              <SelectItem value="pedro">Pedro Oliveira</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="group">Grupo de Serviço *</Label>
          <Select
            value={formData.group}
            onValueChange={(value) => setFormData({ ...formData, group: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o grupo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manutencao">Manutenção</SelectItem>
              <SelectItem value="limpeza">Limpeza</SelectItem>
              <SelectItem value="seguranca">Segurança</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Tipo de Atividade *</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="preventiva">Preventiva</SelectItem>
              <SelectItem value="corretiva">Corretiva</SelectItem>
              <SelectItem value="instalacao">Instalação</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contract">Contrato *</Label>
          <Select
            value={formData.contract}
            onValueChange={(value) => setFormData({ ...formData, contract: value, serviceLine: "" })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o contrato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="projeto-modernizacao">Projeto Modernização IT</SelectItem>
              <SelectItem value="suporte-operacional">Suporte Operacional</SelectItem>
              <SelectItem value="desenvolvimento-web">Desenvolvimento Web</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="serviceLine">Linha de Serviço *</Label>
          <Select
            value={formData.serviceLine}
            onValueChange={(value) => setFormData({ ...formData, serviceLine: value })}
            disabled={!formData.contract}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a linha de serviço" />
            </SelectTrigger>
            <SelectContent>
              {formData.contract === "projeto-modernizacao" && (
                <>
                  <SelectItem value="desenvolvimento">Desenvolvimento de Software</SelectItem>
                  <SelectItem value="infraestrutura">Infraestrutura de TI</SelectItem>
                  <SelectItem value="consultoria">Consultoria Técnica</SelectItem>
                </>
              )}
              {formData.contract === "suporte-operacional" && (
                <>
                  <SelectItem value="helpdesk">Help Desk</SelectItem>
                  <SelectItem value="monitoramento">Monitoramento</SelectItem>
                  <SelectItem value="backup">Backup e Recovery</SelectItem>
                </>
              )}
              {formData.contract === "desenvolvimento-web" && (
                <>
                  <SelectItem value="frontend">Frontend Development</SelectItem>
                  <SelectItem value="backend">Backend Development</SelectItem>
                  <SelectItem value="devops">DevOps</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
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

      <div className="space-y-4">
        <div>
          <Label>Fotos *</Label>
          <Card className="p-4 border-2 border-dashed mt-2">
            <input
              type="file"
              accept="image/*"
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
                Clique ou arraste fotos aqui
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
                Adicionar documentos
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
        <Button type="button" variant="outline">
          Cancelar
        </Button>
        <Button type="submit">Registrar Atividade</Button>
      </div>
    </form>
  );
};
