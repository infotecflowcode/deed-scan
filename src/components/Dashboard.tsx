import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, serviceGroups } from "@/data/mockData";
import { useUser } from "@/contexts/UserContext";
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
  BarChart3
} from "lucide-react";

interface DashboardProps {
  activities: Activity[];
}

export const Dashboard = ({ activities }: DashboardProps) => {
  const { currentUser } = useUser();

  // Filtrar atividades por usuário se for colaborador
  const userActivities = currentUser.role === "colaborador"
    ? activities.filter(a => a.collaboratorId === currentUser.id)
    : activities;

  // Estatísticas gerais
  const totalActivities = userActivities.length;
  const pendingActivities = userActivities.filter(a => a.status === "pending").length;
  const approvedActivities = userActivities.filter(a => a.status === "approved").length;
  const rejectedActivities = userActivities.filter(a => a.status === "rejected").length;

  // Dados para gráficos
  const statusData = [
    { name: "Pendente", value: pendingActivities, color: "#eab308" },
    { name: "Aprovado", value: approvedActivities, color: "#22c55e" },
    { name: "Rejeitado", value: rejectedActivities, color: "#ef4444" },
  ];

  const groupData = serviceGroups.map(group => ({
    name: group.name.split(' ').slice(0, 2).join(' '), // Encurtar nomes
    count: userActivities.filter(a => a.groupId === group.id).length,
    color: group.color,
  })).filter(g => g.count > 0);

  // Métricas por período (últimos 7 dias)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const dailyData = last7Days.map(date => ({
    date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    atividades: userActivities.filter(a =>
      a.startDate.startsWith(date)
    ).length,
  }));

  // Cards KPI baseados no tipo de usuário
  const getKPICards = () => {
    const baseCards = [
      {
        title: "Total de Atividades",
        value: totalActivities,
        icon: BarChart3,
        color: "text-blue-600",
        bg: "bg-blue-50",
      },
      {
        title: "Pendentes",
        value: pendingActivities,
        icon: Clock,
        color: "text-yellow-600",
        bg: "bg-yellow-50",
      },
      {
        title: "Aprovadas",
        value: approvedActivities,
        icon: CheckCircle2,
        color: "text-green-600",
        bg: "bg-green-50",
      },
    ];

    if (currentUser.role === "colaborador") {
      return [
        ...baseCards,
        {
          title: "Taxa de Aprovação",
          value: totalActivities > 0 ? `${Math.round((approvedActivities / totalActivities) * 100)}%` : "0%",
          icon: TrendingUp,
          color: "text-purple-600",
          bg: "bg-purple-50",
        },
      ];
    }

    if (currentUser.role === "fiscal" || currentUser.role === "admin") {
      return [
        ...baseCards,
        {
          title: "Rejeitadas",
          value: rejectedActivities,
          icon: AlertTriangle,
          color: "text-red-600",
          bg: "bg-red-50",
        },
      ];
    }

    return baseCards;
  };

  const getDashboardTitle = () => {
    switch (currentUser.role) {
      case "colaborador":
        return "Painel do Operador";
      case "fiscal":
        return "Painel de Fiscalização";
      case "admin":
        return "Painel Administrativo";
      case "lider":
        return "Painel de Liderança";
      default:
        return "Dashboard";
    }
  };

  const kpiCards = getKPICards();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">{getDashboardTitle()}</h2>
        <p className="text-muted-foreground">
          {currentUser.role === "colaborador"
            ? "Acompanhe suas atividades e performance"
            : "Visão geral das operações da plataforma"
          }
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold">{card.value}</p>
                </div>
                <div className={`p-2 rounded-lg ${card.bg}`}>
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por Status */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Status das Atividades</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Atividades por Grupo */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Atividades por Área</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={groupData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Tendência dos Últimos 7 Dias */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Atividades - Últimos 7 Dias</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="atividades"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Alertas e Insights específicos por role */}
      {(currentUser.role === "fiscal" || currentUser.role === "admin") && rejectedActivities > 0 && (
        <Card className="p-4 border-l-4 border-l-red-500 bg-red-50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h4 className="font-semibold text-red-800">Atenção - Atividades Rejeitadas</h4>
          </div>
          <p className="text-sm text-red-700 mt-1">
            {rejectedActivities} atividade(s) foram rejeitadas e podem necessitar de ação corretiva.
          </p>
        </Card>
      )}

      {currentUser.role === "colaborador" && pendingActivities > 3 && (
        <Card className="p-4 border-l-4 border-l-yellow-500 bg-yellow-50">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            <h4 className="font-semibold text-yellow-800">Atividades Pendentes</h4>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            Você tem {pendingActivities} atividades aguardando aprovação.
          </p>
        </Card>
      )}
    </div>
  );
};