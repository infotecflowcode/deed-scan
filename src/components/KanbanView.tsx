import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, serviceGroups } from "@/data/mockData";
import { useUser } from "@/contexts/UserContext";
import { Calendar, Clock, User, Camera, FileText, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface KanbanViewProps {
  activities: Activity[];
  onViewDetails: (activity: Activity) => void;
  onEdit?: (activity: Activity) => void;
  onApprove: (activity: Activity) => void;
  onDuplicate?: (activity: Activity) => void;
  canApprove: boolean;
}

const statusColumns = [
  { id: "pending", name: "Pendente", color: "bg-yellow-100 border-yellow-300" },
  { id: "in-review", name: "Em Revisão", color: "bg-blue-100 border-blue-300" },
  { id: "approved", name: "Aprovado", color: "bg-green-100 border-green-300" },
  { id: "rejected", name: "Rejeitado", color: "bg-red-100 border-red-300" },
  { id: "on-hold", name: "Em Espera", color: "bg-orange-100 border-orange-300" },
  { id: "cancelled", name: "Cancelado", color: "bg-gray-100 border-gray-300" },
];

export const KanbanView = ({
  activities,
  onViewDetails,
  onEdit,
  onApprove,
  onDuplicate,
  canApprove
}: KanbanViewProps) => {
  const { currentUser } = useUser();

  // Colaboradores só veem suas próprias atividades
  const userActivities = currentUser.role === "colaborador"
    ? activities.filter(a => a.collaboratorId === currentUser.id)
    : activities;

  const getGroupColor = (groupId: string) => {
    const group = serviceGroups.find(g => g.id === groupId);
    return group?.color || "#6B7280";
  };

  const getActivitiesByStatus = (status: string) => {
    return userActivities.filter(activity => activity.status === status);
  };

  const ActivityCard = ({ activity }: { activity: Activity }) => {
    const group = serviceGroups.find(g => g.id === activity.groupId);
    const startDate = new Date(activity.startDate);
    const endDate = new Date(activity.endDate);
    const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));

    return (
      <Card className="p-3 mb-3 cursor-pointer hover:shadow-md transition-shadow">
        <div className="space-y-2">
          {/* Header with title and dropdown */}
          <div className="flex items-start justify-between">
            <h4
              className="font-medium text-sm leading-tight cursor-pointer hover:text-primary"
              onClick={() => onViewDetails(activity)}
            >
              {activity.title}
            </h4>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewDetails(activity)}>
                  Ver detalhes
                </DropdownMenuItem>
                {onEdit && currentUser.role !== "colaborador" && (
                  <DropdownMenuItem onClick={() => onEdit(activity)}>
                    Editar
                  </DropdownMenuItem>
                )}
                {onDuplicate && (
                  <DropdownMenuItem onClick={() => onDuplicate(activity)}>
                    Duplicar atividade
                  </DropdownMenuItem>
                )}
                {canApprove && activity.status === "pending" && (
                  <DropdownMenuItem onClick={() => onApprove(activity)}>
                    Aprovar
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Group badge */}
          {group && (
            <Badge
              variant="outline"
              className="text-xs"
              style={{
                backgroundColor: group.color + "20",
                borderColor: group.color,
                color: group.color
              }}
            >
              {group.name.split(' ').slice(0, 2).join(' ')}
            </Badge>
          )}

          {/* Collaborator */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <User className="w-3 h-3" />
            <span>{activity.collaboratorName}</span>
          </div>

          {/* Date and duration */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{format(startDate, "dd/MM", { locale: ptBR })}</span>
            <Clock className="w-3 h-3 ml-2" />
            <span>{duration}h</span>
          </div>

          {/* Media indicators */}
          <div className="flex items-center gap-3 text-xs">
            {activity.photos.length > 0 && (
              <div className="flex items-center gap-1 text-blue-600">
                <Camera className="w-3 h-3" />
                <span>{activity.photos.length}</span>
              </div>
            )}
            {activity.documents.length > 0 && (
              <div className="flex items-center gap-1 text-green-600">
                <FileText className="w-3 h-3" />
                <span>{activity.documents.length}</span>
              </div>
            )}
          </div>

          {/* Status-specific info */}
          {activity.status === "rejected" && activity.approval?.rejectionReason && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
              {activity.approval.rejectionReason}
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Visualização Kanban</h2>
        <p className="text-muted-foreground">
          Acompanhe o fluxo das atividades organizadas por status
        </p>
      </div>

      <div className="grid grid-cols-6 gap-4 min-h-[600px]">
        {statusColumns.map((column) => {
          const columnActivities = getActivitiesByStatus(column.id);

          return (
            <div key={column.id} className="space-y-3">
              {/* Column header */}
              <div className={`p-3 rounded-lg border-2 ${column.color}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm">{column.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {columnActivities.length}
                  </Badge>
                </div>
              </div>

              {/* Column content */}
              <div className="space-y-2">
                {columnActivities.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}

                {columnActivities.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-8 border-2 border-dashed rounded-lg">
                    Nenhuma atividade
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};