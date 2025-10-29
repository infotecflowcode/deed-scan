import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "@/data/mockData";
import { useUser } from "@/contexts/UserContext";
import { useServiceGroups } from "@/hooks/useServiceGroups";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Shield,
  Wrench,
  BarChart3,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface DashboardProps {
  activities: Activity[];
}

export const Dashboard = ({ activities }: DashboardProps) => {
  const { currentUser } = useUser();
  const { groups: serviceGroups, isLoading: groupsLoading } = useServiceGroups();

  // Filtrar atividades por usuário se for colaborador
  const userActivities = currentUser.role === "colaborador"
    ? activities.filter(a => a.collaboratorId === currentUser.id)
    : activities;

  // Status cards data
  const statusCards = [
    { name: "Rascunho", count: 0, color: "bg-gray-100", textColor: "text-gray-600" },
    { name: "Completo", count: userActivities.filter(a => a.status === "approved").length, color: "bg-green-100", textColor: "text-green-600" },
    { name: "Não iniciado", count: 0, color: "bg-red-100", textColor: "text-red-600" },
    { name: "Pausa", count: 0, color: "bg-orange-100", textColor: "text-orange-600" },
    { name: "Andamento", count: userActivities.filter(a => a.status === "pending").length, color: "bg-blue-100", textColor: "text-blue-600" },
    { name: "Concluído", count: userActivities.filter(a => a.status === "approved").length, color: "bg-purple-100", textColor: "text-purple-600" },
  ];

  // Work groups data - usar grupos dinâmicos
  const workGroups = serviceGroups.map(group => ({
    name: group.name,
    count: userActivities.filter(a => a.groupId === group.id).length,
    color: group.color,
  }));

  // Responsible users data - only show for admin/fiscal roles
  const responsibleUsers = currentUser.role === "colaborador" ? [] : Array.from(
    new Set(activities.map(a => ({ id: a.collaboratorId, name: a.collaboratorName })))
  ).map(user => ({
    name: user.name,
    pending: activities.filter(a => a.collaboratorId === user.id && a.status === "pending").length,
    approved: activities.filter(a => a.collaboratorId === user.id && a.status === "approved").length,
    rejected: activities.filter(a => a.collaboratorId === user.id && a.status === "rejected").length,
    total: activities.filter(a => a.collaboratorId === user.id).length,
  }));

  const getDashboardTitle = () => {
    switch (currentUser.role) {
      case "colaborador":
        return "Dashboard - OUTUBRO/2025";
      case "fiscal":
        return "Dashboard - Fiscalização - OUTUBRO/2025";
      case "admin":
        return "Dashboard - Administrativo - OUTUBRO/2025";
      case "lider":
        return "Dashboard - Liderança - OUTUBRO/2025";
      default:
        return "Dashboard - OUTUBRO/2025";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold mb-2">{getDashboardTitle()}</h2>
        {currentUser.role === "admin" && (
          <Link to="/admin">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Painel Admin
            </Button>
          </Link>
        )}
      </div>

      {/* Status Cards Section */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statusCards.map((status, index) => (
          <Card key={index} className="p-4 text-center">
            <div className={`w-12 h-12 rounded-full ${status.color} mx-auto mb-2 flex items-center justify-center`}>
              <span className={`text-lg font-bold ${status.textColor}`}>
                {status.count}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-700">{status.name}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Work Groups Section */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">GRUPOS DE TRABALHO</h3>
          <div className="space-y-3">
            {groupsLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2 text-sm text-muted-foreground">Carregando grupos...</span>
              </div>
            ) : workGroups.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  Nenhum grupo de trabalho cadastrado para este contrato.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Acesse as configurações para cadastrar grupos.
                </p>
              </div>
            ) : (
              workGroups.map((group, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: group.color }}
                    />
                    <span className="text-sm">{group.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded">
                      {group.count}
                    </span>
                    <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      {group.count}
                    </span>
                    <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                      {group.count}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Responsible Users Section - Only for admin/fiscal */}
        {currentUser.role !== "colaborador" && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">RESPONSÁVEIS</h3>
            <div className="space-y-3">
              {responsibleUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="text-sm">{user.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded">
                      {user.pending}
                    </span>
                    <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      {user.total}
                    </span>
                    <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                      {user.approved}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* If collaborator, show personal stats instead */}
        {currentUser.role === "colaborador" && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">SUAS ATIVIDADES</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total de Atividades</span>
                <Badge variant="secondary">{userActivities.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Pendentes</span>
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  {userActivities.filter(a => a.status === "pending").length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Aprovadas</span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  {userActivities.filter(a => a.status === "approved").length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Rejeitadas</span>
                <Badge variant="outline" className="text-red-600 border-red-600">
                  {userActivities.filter(a => a.status === "rejected").length}
                </Badge>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};