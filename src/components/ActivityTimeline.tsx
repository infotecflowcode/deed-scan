import { useState } from "react";
import { ActivityCard } from "./ActivityCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Search } from "lucide-react";

const mockActivities = [
  {
    id: "1",
    title: "Manutenção Preventiva - Ar Condicionado",
    collaborator: "João Silva",
    date: "20/10/2025 08:00",
    duration: "2h 30min",
    status: "approved" as const,
    photoCount: 5,
    docCount: 2,
    groupColor: "#3b82f6",
  },
  {
    id: "2",
    title: "Limpeza Geral - Sala de Reuniões",
    collaborator: "Maria Santos",
    date: "20/10/2025 14:00",
    duration: "1h 15min",
    status: "pending" as const,
    photoCount: 3,
    docCount: 0,
    groupColor: "#10b981",
  },
  {
    id: "3",
    title: "Instalação de Equipamentos",
    collaborator: "Pedro Oliveira",
    date: "19/10/2025 09:30",
    duration: "3h 45min",
    status: "pending" as const,
    photoCount: 8,
    docCount: 1,
    groupColor: "#f59e0b",
  },
];

export const ActivityTimeline = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredActivities = mockActivities.filter((activity) => {
    const matchesSearch = activity.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || activity.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        {filteredActivities.map((activity) => (
          <ActivityCard
            key={activity.id}
            {...activity}
            onView={() => console.log("View", activity.id)}
            onEdit={() => console.log("Edit", activity.id)}
            onApprove={() => console.log("Approve", activity.id)}
          />
        ))}
      </div>

      {filteredActivities.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Nenhuma atividade encontrada
        </div>
      )}
    </div>
  );
};
