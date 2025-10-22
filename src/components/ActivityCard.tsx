import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Image, FileText, Clock, CheckCircle } from "lucide-react";

interface ActivityCardProps {
  title: string;
  collaborator: string;
  date: string;
  duration: string;
  status: "pending" | "approved" | "rejected";
  photoCount: number;
  docCount: number;
  groupColor?: string;
  onView: () => void;
  onEdit?: () => void;
  onApprove?: () => void;
}

const statusConfig = {
  pending: { label: "Pendente", color: "bg-warning text-warning-foreground" },
  approved: { label: "Aprovado", color: "bg-success text-success-foreground" },
  rejected: { label: "Reprovado", color: "bg-destructive text-destructive-foreground" },
};

export const ActivityCard = ({
  title,
  collaborator,
  date,
  duration,
  status,
  photoCount,
  docCount,
  groupColor,
  onView,
  onEdit,
  onApprove,
}: ActivityCardProps) => {
  const statusInfo = statusConfig[status];

  return (
    <Card className="p-4 hover:shadow-lg transition-all duration-200 border-l-4" style={{ borderLeftColor: groupColor }}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{collaborator}</p>
        </div>
        <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{date}</span>
        </div>
        <span>•</span>
        <span>{duration}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          {photoCount > 0 && (
            <div className="flex items-center gap-1 text-primary">
              <Image className="w-4 h-4" />
              <span>{photoCount}</span>
            </div>
          )}
          {docCount > 0 && (
            <div className="flex items-center gap-1 text-primary">
              <FileText className="w-4 h-4" />
              <span>{docCount}</span>
            </div>
          )}
          {status === "approved" && (
            <div className="flex items-center gap-1 text-success">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs">Aprovado</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onView}>
            Ver
          </Button>
          {onEdit && status === "pending" && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              Editar
            </Button>
          )}
          {onApprove && status === "pending" && (
            <Button variant="default" size="sm" onClick={onApprove}>
              Aprovar
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
