import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Activity, serviceGroups } from "@/data/mockData";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CalendarViewProps {
  activities: Activity[];
  onViewDetails: (activity: Activity) => void;
  onApprove: (activity: Activity) => void;
  canApprove: boolean;
}

export const CalendarView = ({ activities, onViewDetails }: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const getActivitiesForDate = (date: Date) => {
    return activities.filter(activity => {
      const activityDate = new Date(activity.startDate);
      return isSameDay(activityDate, date);
    });
  };

  const getGroupColor = (groupId: string) => {
    const group = serviceGroups.find(g => g.id === groupId);
    return group?.color || "#6B7280";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-500";
      case "rejected": return "bg-red-500";
      case "pending": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const nextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(newDate);
    setSelectedMonth(newDate.getMonth());
    setSelectedYear(newDate.getFullYear());
  };

  const prevMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(newDate);
    setSelectedMonth(newDate.getMonth());
    setSelectedYear(newDate.getFullYear());
  };

  const handleMonthYearChange = () => {
    const newDate = new Date(selectedYear, selectedMonth, 1);
    setCurrentDate(newDate);
  };

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="space-y-4">
      {/* Header do calendário */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Visualização de Calendário</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="min-w-[200px] justify-center">
                <Calendar className="mr-2 h-4 w-4" />
                {format(currentDate, "MMMM yyyy", { locale: ptBR })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="center">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mês</label>
                  <Select
                    value={selectedMonth.toString()}
                    onValueChange={(value) => setSelectedMonth(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {format(new Date(2024, i, 1), "MMMM", { locale: ptBR })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Ano</label>
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) => setSelectedYear(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() - 2 + i;
                        return (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleMonthYearChange} className="w-full">
                  Aplicar
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Grade do calendário */}
      <Card className="p-4">
        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map(day => (
            <div key={day} className="text-center font-medium text-sm text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Dias do calendário */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            const dayActivities = getActivitiesForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border rounded-lg ${
                  !isCurrentMonth
                    ? "bg-muted/30 text-muted-foreground"
                    : "bg-background"
                } ${isToday ? "ring-2 ring-primary" : ""}`}
              >
                <div className={`text-sm font-medium mb-2 ${
                  isToday ? "text-primary" : ""
                }`}>
                  {format(day, "d")}
                </div>

                <div className="space-y-1">
                  {dayActivities.slice(0, 3).map((activity) => (
                    <div
                      key={activity.id}
                      className="text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: getGroupColor(activity.groupId) + "20" }}
                      onClick={() => onViewDetails(activity)}
                    >
                      <div className="flex items-center gap-1">
                        <div
                          className={`w-2 h-2 rounded-full ${getStatusColor(activity.status)}`}
                        />
                        <span className="truncate font-medium" style={{ color: getGroupColor(activity.groupId) }}>
                          {activity.title}
                        </span>
                      </div>
                      <div className="text-gray-600 truncate">
                        {activity.collaboratorName}
                      </div>
                    </div>
                  ))}

                  {dayActivities.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{dayActivities.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Legenda */}
      <div className="flex items-center gap-4 text-sm">
        <span className="font-medium">Status:</span>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Aprovado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span>Pendente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>Rejeitado</span>
        </div>
      </div>
    </div>
  );
};