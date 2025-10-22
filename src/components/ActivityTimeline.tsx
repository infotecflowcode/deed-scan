import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActivityCard } from "@/components/ActivityCard";
import { Activity, serviceGroups } from "@/data/mockData";
import { Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface ActivityTimelineProps {
  activities: Activity[];
  onViewDetails: (activity: Activity) => void;
  onApprove: (activity: Activity) => void;
  canApprove: boolean;
}

export const ActivityTimeline = ({
  activities,
  onViewDetails,
  onApprove,
  canApprove,
}: ActivityTimelineProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = activity.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || activity.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const convertToCardFormat = (activity: Activity) => {
    const group = serviceGroups.find(g => g.id === activity.groupId);
    const startDate = new Date(activity.startDate);
    const endDate = new Date(activity.endDate);
    const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));

    return {
      title: activity.title,
      collaborator: activity.collaboratorName,
      date: format(startDate, "dd/MM/yyyy HH:mm"),
      duration: `${Math.floor(duration / 60)}h ${duration % 60}min`,
      status: activity.status,
      photoCount: activity.photos.length,
      docCount: activity.documents.length,
      groupColor: group?.color || "#000",
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar atividades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="approved">Aprovado</SelectItem>
            <SelectItem value="rejected">Reprovado</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Exportar Excel
        </Button>
      </div>

      <div className="space-y-4">
        {filteredActivities.map((activity) => {
          const cardProps = convertToCardFormat(activity);
          return (
            <ActivityCard
              key={activity.id}
              {...cardProps}
              onView={() => onViewDetails(activity)}
              onApprove={canApprove && activity.status === "pending" ? () => onApprove(activity) : undefined}
            />
          );
        })}
      </div>

      {filteredActivities.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Nenhuma atividade encontrada
        </div>
      )}
    </div>
  );
};
