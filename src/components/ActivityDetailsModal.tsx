import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Activity } from "@/data/mockData";
import { serviceGroups, activityTypes, evaluationCriteria } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, FileText, Image as ImageIcon, Star } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ActivityDetailsModalProps {
  activity: Activity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusLabels = {
  pending: "Pendente",
  approved: "Aprovada",
  rejected: "Reprovada",
};

const statusColors = {
  pending: "bg-yellow-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
};

export const ActivityDetailsModal = ({
  activity,
  open,
  onOpenChange,
}: ActivityDetailsModalProps) => {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  if (!activity) return null;

  const group = serviceGroups.find((g) => g.id === activity.groupId);
  const type = activityTypes.find((t) => t.id === activity.typeId);

  const startDate = new Date(activity.startDate);
  const endDate = new Date(activity.endDate);
  const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));

  const averageScore = activity.approval
    ? activity.approval.criteriaScores.reduce((acc, cs) => acc + cs.score, 0) / 
      activity.approval.criteriaScores.length
    : 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{activity.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Colaborador:</strong> {activity.collaboratorName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge style={{ backgroundColor: group?.color }}>{group?.name}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Tipo:</strong> {type?.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`${statusColors[activity.status]} text-white`}>
                  {statusLabels[activity.status]}
                </Badge>
              </div>
            </div>

            {/* Data e Hora */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <strong className="text-sm">Início:</strong>
                </div>
                <p className="text-sm ml-6">
                  {format(startDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <strong className="text-sm">Fim:</strong>
                </div>
                <p className="text-sm ml-6">
                  {format(endDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>Duração:</strong> {Math.floor(duration / 60)}h {duration % 60}min
              </span>
            </div>

            {/* Observações */}
            {activity.observations && (
              <div>
                <strong className="text-sm">Observações:</strong>
                <p className="text-sm text-muted-foreground mt-1">{activity.observations}</p>
              </div>
            )}

            {/* Galeria de Fotos */}
            {activity.photos.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  <strong className="text-sm">Fotos ({activity.photos.length})</strong>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {activity.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setLightboxImage(photo)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Documentos */}
            {activity.documents.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <strong className="text-sm">Documentos ({activity.documents.length})</strong>
                </div>
                <div className="space-y-2">
                  {activity.documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <span className="text-sm">{doc.name}</span>
                      <Button variant="outline" size="sm">
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seção de Aprovação */}
            {activity.status === "approved" && activity.approval && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Avaliação</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <strong className="text-sm">Aprovado por:</strong>
                    <p className="text-sm text-muted-foreground">{activity.approval.approverName}</p>
                  </div>
                  <div>
                    <strong className="text-sm">Data de Aprovação:</strong>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(activity.approval.approvalDate), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <strong className="text-sm">Média Geral:</strong>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= averageScore
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold">{averageScore.toFixed(1)}/5</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {activity.approval.criteriaScores.map((cs) => {
                    const criteria = evaluationCriteria.find((c) => c.id === cs.criteriaId);
                    return (
                      <div key={cs.criteriaId} className="border-l-2 border-primary pl-4">
                        <strong className="text-sm">{criteria?.name}</strong>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= cs.score
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm">{cs.score}/5</span>
                        </div>
                        {cs.comment && (
                          <p className="text-sm text-muted-foreground mt-1">{cs.comment}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activity.status === "rejected" && activity.approval?.rejectionReason && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-2 text-destructive">Reprovada</h3>
                <div className="bg-destructive/10 p-4 rounded-lg">
                  <strong className="text-sm">Motivo:</strong>
                  <p className="text-sm mt-1">{activity.approval.rejectionReason}</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <img
            src={lightboxImage}
            alt="Visualização"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </>
  );
};
