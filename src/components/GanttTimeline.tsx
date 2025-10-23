import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, serviceGroups } from "@/data/mockData";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface GanttTimelineProps {
  activities: Activity[];
  onViewDetails: (activity: Activity) => void;
  onApprove: (activity: Activity) => void;
  canApprove: boolean;
}

export const GanttTimeline = ({ activities, onViewDetails }: GanttTimelineProps) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getGroupColor = (groupId: string) => {
    const group = serviceGroups.find(g => g.id === groupId);
    return group?.color || "#6B7280";
  };

  const getActivityPosition = (activity: Activity) => {
    const startDate = new Date(activity.startDate);
    const endDate = new Date(activity.endDate);

    const dayIndex = weekDays.findIndex(day => isSameDay(day, startDate));
    if (dayIndex === -1) return null;

    const startHour = startDate.getHours();
    const endHour = endDate.getHours();
    const duration = endHour - startHour;

    return {
      dayIndex,
      startHour,
      duration: Math.max(duration, 1),
      left: (startHour / 24) * 100,
      width: (duration / 24) * 100,
    };
  };

  const nextWeek = () => {
    setCurrentWeek(addDays(currentWeek, 7));
  };

  const prevWeek = () => {
    setCurrentWeek(addDays(currentWeek, -7));
  };

  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="space-y-4">
      {/* Header do Timeline */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Timeline Gantt</h2>
          <p className="text-muted-foreground">
            Visualização de atividades por período e horário
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">
            {format(weekStart, "dd MMM", { locale: ptBR })} - {format(weekEnd, "dd MMM yyyy", { locale: ptBR })}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={prevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Timeline Grid */}
      <Card className="p-4 overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header dos dias */}
          <div className="grid grid-cols-8 gap-2 mb-4 sticky top-0 bg-background z-10">
            <div className="font-medium text-sm text-muted-foreground p-2">
              Colaborador
            </div>
            {weekDays.map((day, index) => (
              <div key={index} className="text-center p-2 border-l">
                <div className="font-medium text-sm">
                  {format(day, "EEE", { locale: ptBR })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(day, "dd/MM")}
                </div>
              </div>
            ))}
          </div>

          {/* Linhas por colaborador */}
          {Array.from(new Set(activities.map(a => a.collaboratorName))).map((collaborator) => {
            const collaboratorActivities = activities.filter(a => a.collaboratorName === collaborator);

            return (
              <div key={collaborator} className="grid grid-cols-8 gap-2 mb-2 border-b pb-2">
                {/* Nome do colaborador */}
                <div className="p-2 font-medium text-sm flex items-center">
                  {collaborator}
                </div>

                {/* Dias da semana */}
                {weekDays.map((day, dayIndex) => {
                  const dayActivities = collaboratorActivities.filter(activity => {
                    const activityDate = new Date(activity.startDate);
                    return isSameDay(activityDate, day);
                  });

                  return (
                    <div key={dayIndex} className="relative min-h-[60px] border-l p-1">
                      {/* Grid de horas de fundo */}
                      <div className="absolute inset-0 grid grid-cols-24 opacity-10">
                        {timeSlots.map(hour => (
                          <div key={hour} className="border-r border-gray-200" />
                        ))}
                      </div>

                      {/* Atividades do dia */}
                      {dayActivities.map((activity, actIndex) => {
                        const position = getActivityPosition(activity);
                        if (!position || position.dayIndex !== dayIndex) return null;

                        const statusColor = {
                          approved: "bg-green-100 border-green-300 text-green-800",
                          rejected: "bg-red-100 border-red-300 text-red-800",
                          pending: "bg-yellow-100 border-yellow-300 text-yellow-800"
                        }[activity.status];

                        return (
                          <div
                            key={activity.id}
                            className={`absolute top-${actIndex * 20 + 2} h-4 rounded text-xs px-2 border cursor-pointer hover:shadow-md transition-all ${statusColor}`}
                            style={{
                              left: `${position.left}%`,
                              width: `${Math.max(position.width, 15)}%`,
                              backgroundColor: getGroupColor(activity.groupId) + "20",
                              borderColor: getGroupColor(activity.groupId),
                            }}
                            onClick={() => onViewDetails(activity)}
                            title={`${activity.title} - ${format(new Date(activity.startDate), "HH:mm")} às ${format(new Date(activity.endDate), "HH:mm")}`}
                          >
                            <div className="truncate font-medium" style={{ color: getGroupColor(activity.groupId) }}>
                              {activity.title.substring(0, 20)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Escala de tempo */}
        <div className="grid grid-cols-8 gap-2 mt-4 pt-2 border-t">
          <div></div>
          {weekDays.map((day, index) => (
            <div key={index} className="text-xs text-muted-foreground border-l pl-2">
              <div className="grid grid-cols-4 gap-1">
                <span>06h</span>
                <span>12h</span>
                <span>18h</span>
                <span>24h</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Legenda */}
      <div className="flex items-center gap-6 text-sm">
        <span className="font-medium">Status:</span>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-100 border border-green-300" />
          <span>Aprovado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-300" />
          <span>Pendente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-100 border border-red-300" />
          <span>Rejeitado</span>
        </div>
      </div>
    </div>
  );
};