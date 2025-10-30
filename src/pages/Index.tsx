import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ActivityForm } from "@/components/ActivityForm";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { ActivityDetailsModal } from "@/components/ActivityDetailsModal";
import { ApprovalModal } from "@/components/ApprovalModal";
import { UserSelector } from "@/components/UserSelector";
import { CommentSystem } from "@/components/CommentSystem";
import { CalendarView } from "@/components/CalendarView";
import { GanttTimeline } from "@/components/GanttTimeline";
import { KanbanView } from "@/components/KanbanView";
import { EvidenceReportExport } from "@/components/EvidenceReportExport";
import { ActivityFilters, ActivityFiltersType } from "@/components/ActivityFilters";
import { ActivityEditModal } from "@/components/ActivityEditModal";
import { EditLog, Activity } from "@/data/mockData";
import { Dashboard } from "@/components/Dashboard";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useActivities } from "@/hooks/useActivities";
import { Plus, Settings, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const { user: currentUser, currentContract } = useAuth();
  const { activities, addActivity, updateActivity, getUserActivities, isLoading: activitiesLoading } = useActivities();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [filters, setFilters] = useState<ActivityFiltersType>({
    status: [],
    groups: [],
    collaborators: [],
  });
  const [editOpen, setEditOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  // Adicionar nova atividade
  const handleAddActivity = (activityData: Omit<Activity, "id">) => {
    addActivity(activityData);
    setIsDialogOpen(false);
    
    toast({
      title: "Atividade registrada com sucesso!",
      description: "A atividade foi adicionada à sua lista.",
    });
  };

  const handleApprove = (activityId: string, scores: any[], rejectionReason?: string) => {
    const activity = activities.find(a => a.id === activityId);
    if (activity) {
      updateActivity(activityId, {
        status: (rejectionReason ? "rejected" : "approved") as "approved" | "rejected",
        approval: {
          approverId: currentUser?.id || "",
          approverName: currentUser?.name || "",
          approvalDate: new Date().toISOString(),
          criteriaScores: scores,
          rejectionReason,
        },
      });
    }
    
    setApprovalOpen(false);
    toast({
      title: rejectionReason ? "Atividade reprovada" : "Atividade aprovada",
      description: rejectionReason ? "A atividade foi reprovada com sucesso." : "A atividade foi aprovada com sucesso.",
    });
  };

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setEditOpen(true);
  };

  const handleSaveEdit = (updatedActivity: Activity, editLog: EditLog) => {
    updateActivity(updatedActivity.id, updatedActivity);
  };

  const handleDuplicate = (activity: Activity) => {
    const duplicatedActivity: Omit<Activity, "id"> = {
      ...activity,
      title: `${activity.title} (Cópia)`,
      status: "pending",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // +8 hours
      approval: undefined,
      editHistory: [],
      photos: [],
      documents: [],
      observations: "",
    };

    addActivity(duplicatedActivity);
    
    toast({
      title: "Atividade duplicada",
      description: "Uma nova atividade foi criada baseada no modelo selecionado.",
    });
  };


  // Usar atividades filtradas por usuário se for colaborador
  const userActivities = getUserActivities();
  
  const filteredActivities = userActivities.filter(activity => {
    // Filter by status
    if (filters.status.length > 0) {
      if (!filters.status.includes(activity.status)) return false;
    }

    // Filter by groups
    if (filters.groups.length > 0) {
      if (!filters.groups.includes(activity.groupId)) return false;
    }

    // Filter by collaborators
    if (filters.collaborators.length > 0) {
      if (!filters.collaborators.includes(activity.collaboratorName)) return false;
    }

    return true;
  });

  // Se não há contrato selecionado, mostrar mensagem
  if (!currentContract) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Nenhum contrato selecionado</h2>
          <p className="text-muted-foreground mb-4">
            Selecione um contrato para acessar o sistema de atividades.
          </p>
          <Link to="/contract-selection">
            <Button>Selecionar Contrato</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Se está carregando, mostrar loading
  if (activitiesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando atividades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader 
        showContractInfo={true}
        customActions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nova Atividade
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Nova Atividade</DialogTitle>
                <DialogDescription>
                  Preencha os dados da atividade e adicione as evidências necessárias.
                </DialogDescription>
              </DialogHeader>
              <ActivityForm onSubmit={handleAddActivity} />
            </DialogContent>
          </Dialog>
        }
      />

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full max-w-4xl grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="listagem">Listagem</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="calendar">Calendário</TabsTrigger>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <Dashboard activities={filteredActivities} />
          </TabsContent>

          <TabsContent value="listagem" className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Atividades Recentes</h2>
                <p className="text-muted-foreground">
                  Visualize e gerencie todas as atividades registradas
                </p>
              </div>
              <div className="flex items-center gap-2">
                <EvidenceReportExport activities={filteredActivities} />
                <ActivityFilters
                  activities={activities}
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              </div>
            </div>
            <ActivityTimeline
              activities={filteredActivities}
              onViewDetails={(activity) => {
                setSelectedActivity(activity);
                setDetailsOpen(true);
              }}
              onEdit={handleEdit}
              onApprove={(activity) => {
                setSelectedActivity(activity);
                setApprovalOpen(true);
              }}
              canApprove={currentUser?.role === "fiscal" || currentUser?.role === "admin"}
            />
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <div className="flex items-center justify-end gap-2 mb-4">
              <EvidenceReportExport activities={filteredActivities} />
              <ActivityFilters
                activities={activities}
                filters={filters}
                onFiltersChange={setFilters}
              />
            </div>
            <GanttTimeline
              activities={filteredActivities}
              onViewDetails={(activity) => {
                setSelectedActivity(activity);
                setDetailsOpen(true);
              }}
              onApprove={(activity) => {
                setSelectedActivity(activity);
                setApprovalOpen(true);
              }}
              canApprove={currentUser?.role === "fiscal" || currentUser?.role === "admin"}
            />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <div className="flex items-center justify-end gap-2 mb-4">
              <EvidenceReportExport activities={filteredActivities} />
              <ActivityFilters
                activities={activities}
                filters={filters}
                onFiltersChange={setFilters}
              />
            </div>
            <CalendarView
              activities={filteredActivities}
              onViewDetails={(activity) => {
                setSelectedActivity(activity);
                setDetailsOpen(true);
              }}
              onApprove={(activity) => {
                setSelectedActivity(activity);
                setApprovalOpen(true);
              }}
              canApprove={currentUser?.role === "fiscal" || currentUser?.role === "admin"}
            />
          </TabsContent>

          <TabsContent value="kanban" className="space-y-4">
            <div className="flex items-center justify-end gap-2 mb-4">
              <EvidenceReportExport activities={filteredActivities} />
              <ActivityFilters
                activities={activities}
                filters={filters}
                onFiltersChange={setFilters}
              />
            </div>
            <KanbanView
              activities={filteredActivities}
              onViewDetails={(activity) => {
                setSelectedActivity(activity);
                setDetailsOpen(true);
              }}
              onEdit={handleEdit}
              onApprove={(activity) => {
                setSelectedActivity(activity);
                setApprovalOpen(true);
              }}
              onDuplicate={handleDuplicate}
              canApprove={currentUser?.role === "fiscal" || currentUser?.role === "admin"}
            />
          </TabsContent>
        </Tabs>
      </main>

      <ActivityDetailsModal
        activity={selectedActivity}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />

      <ApprovalModal
        activity={selectedActivity}
        open={approvalOpen}
        onOpenChange={setApprovalOpen}
        onApprove={(scores, rejectionReason) => {
          if (selectedActivity) {
            handleApprove(selectedActivity.id, scores, rejectionReason);
          }
        }}
      />

      <ActivityEditModal
        activity={editingActivity}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={handleSaveEdit}
      />

      <CommentSystem enabled={true} />
    </div>
  );
};

export default Index;
