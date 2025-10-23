import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Activity, serviceGroups, activityTypes, EditLog } from "@/data/mockData";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, History } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ActivityEditModalProps {
  activity: Activity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (activity: Activity, editLog: EditLog) => void;
}

export const ActivityEditModal = ({ activity, open, onOpenChange, onSave }: ActivityEditModalProps) => {
  const { currentUser } = useUser();
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Activity>>({});

  useEffect(() => {
    if (activity) {
      setFormData({
        title: activity.title,
        groupId: activity.groupId,
        typeId: activity.typeId,
        startDate: activity.startDate,
        endDate: activity.endDate,
        observations: activity.observations,
      });
    }
  }, [activity]);

  const canEdit = () => {
    if (!activity) return false;

    // Admins e fiscais podem editar qualquer atividade
    if (currentUser.role === "admin" || currentUser.role === "fiscal") {
      return true;
    }

    // Colaboradores só podem editar suas próprias atividades se estiverem pendentes
    if (currentUser.role === "colaborador") {
      return activity.collaboratorId === currentUser.id && activity.status === "pending";
    }

    // Líderes podem editar atividades do seu grupo que estão pendentes
    if (currentUser.role === "lider") {
      return activity.status === "pending";
    }

    return false;
  };

  const handleSave = () => {
    if (!activity || !canEdit()) return;

    const changes: { field: string; oldValue: any; newValue: any }[] = [];

    // Detectar mudanças
    if (formData.title !== activity.title) {
      changes.push({ field: "title", oldValue: activity.title, newValue: formData.title });
    }
    if (formData.groupId !== activity.groupId) {
      const oldGroup = serviceGroups.find(g => g.id === activity.groupId)?.name;
      const newGroup = serviceGroups.find(g => g.id === formData.groupId)?.name;
      changes.push({ field: "groupId", oldValue: oldGroup, newValue: newGroup });
    }
    if (formData.typeId !== activity.typeId) {
      const oldType = activityTypes.find(t => t.id === activity.typeId)?.name;
      const newType = activityTypes.find(t => t.id === formData.typeId)?.name;
      changes.push({ field: "typeId", oldValue: oldType, newValue: newType });
    }
    if (formData.startDate !== activity.startDate) {
      changes.push({ field: "startDate", oldValue: activity.startDate, newValue: formData.startDate });
    }
    if (formData.endDate !== activity.endDate) {
      changes.push({ field: "endDate", oldValue: activity.endDate, newValue: formData.endDate });
    }
    if (formData.observations !== activity.observations) {
      changes.push({ field: "observations", oldValue: activity.observations, newValue: formData.observations });
    }

    if (changes.length === 0) {
      toast({ title: "Nenhuma alteração detectada" });
      return;
    }

    const editLog: EditLog = {
      id: `edit-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      editDate: new Date().toISOString(),
      changes,
    };

    const updatedActivity: Activity = {
      ...activity,
      ...formData,
      editHistory: [...(activity.editHistory || []), editLog],
    };

    onSave(updatedActivity, editLog);
    onOpenChange(false);

    toast({
      title: "Atividade atualizada",
      description: `${changes.length} alteração(ões) salva(s) com sucesso`,
    });
  };

  if (!activity) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Editar Atividade
          </DialogTitle>
          <DialogDescription>
            {canEdit()
              ? "Edite os campos abaixo. Todas as alterações serão registradas no histórico."
              : "Você não tem permissão para editar esta atividade."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário de edição */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título da Atividade</Label>
              <Input
                id="title"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={!canEdit()}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="group">Grupo de Serviço</Label>
                <Select
                  value={formData.groupId}
                  onValueChange={(value) => setFormData({ ...formData, groupId: value })}
                  disabled={!canEdit()}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: group.color }}
                          />
                          {group.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Atividade</Label>
                <Select
                  value={formData.typeId}
                  onValueChange={(value) => setFormData({ ...formData, typeId: value })}
                  disabled={!canEdit()}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {activityTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Data/Hora Início</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate?.slice(0, 16) || ""}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  disabled={!canEdit()}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Data/Hora Fim</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate?.slice(0, 16) || ""}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  disabled={!canEdit()}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                value={formData.observations || ""}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                disabled={!canEdit()}
                rows={4}
              />
            </div>

            {canEdit() && (
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave}>Salvar Alterações</Button>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
              </div>
            )}
          </div>

          {/* Histórico de edições */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <h3 className="font-semibold">Histórico de Edições</h3>
            </div>

            {activity.editHistory && activity.editHistory.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activity.editHistory.map((log) => (
                  <Card key={log.id} className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{log.userName}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(log.editDate), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </span>
                      </div>

                      <Separator />

                      <div className="space-y-1">
                        {log.changes.map((change, index) => (
                          <div key={index} className="text-xs">
                            <span className="font-medium">{change.field}:</span>
                            <div className="ml-2 text-muted-foreground">
                              <span className="line-through">{change.oldValue}</span>
                              {" → "}
                              <span className="text-foreground">{change.newValue}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                Nenhuma edição registrada
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};