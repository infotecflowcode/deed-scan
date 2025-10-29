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
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Settings, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
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

  // Carregar atividades do localStorage
  useEffect(() => {
    const loadActivities = () => {
      try {
        const stored = localStorage.getItem("activities");
        if (stored) {
          const storedActivities: Activity[] = JSON.parse(stored);
          setActivities(storedActivities);
        } else {
          // Carregar dados iniciais
          const { activities: initialActivities } = require("@/data/mockData");
          setActivities(initialActivities);
          localStorage.setItem("activities", JSON.stringify(initialActivities));
        }
      } catch (error) {
        console.error("Erro ao carregar atividades:", error);
        setActivities([]);
      }
    };

    loadActivities();
  }, []);

  // Salvar atividades no localStorage
  const saveActivities = (newActivities: Activity[]) => {
    try {
      localStorage.setItem("activities", JSON.stringify(newActivities));
      setActivities(newActivities);
    } catch (error) {
      console.error("Erro ao salvar atividades:", error);
    }
  };

  // Adicionar nova atividade
  const handleAddActivity = (activityData: Omit<Activity, "id">) => {
    const newActivity: Activity = {
      ...activityData,
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    
    const updatedActivities = [...activities, newActivity];
    saveActivities(updatedActivities);
    setIsDialogOpen(false);
    
    toast({
      title: "Atividade registrada com sucesso!",
      description: "A atividade foi adicionada à sua lista.",
    });
  };

  const handleApprove = (activityId: string, scores: any[], rejectionReason?: string) => {
    const updatedActivities = activities.map(activity =>
      activity.id === activityId
        ? {
            ...activity,
            status: rejectionReason ? "rejected" : "approved",
            approval: {
              approverId: currentUser?.id || "",
              approverName: currentUser?.name || "",
              approvalDate: new Date().toISOString(),
              criteriaScores: scores,
              rejectionReason,
            },
          }
        : activity
    );
    
    saveActivities(updatedActivities);
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
    const updatedActivities = activities.map(activity =>
      activity.id === updatedActivity.id ? updatedActivity : activity
    );
    saveActivities(updatedActivities);
  };

  const handleDuplicate = (activity: Activity) => {
    const duplicatedActivity: Activity = {
      ...activity,
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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

    const updatedActivities = [...activities, duplicatedActivity];
    saveActivities(updatedActivities);
    
    toast({
      title: "Atividade duplicada",
      description: "Uma nova atividade foi criada baseada no modelo selecionado.",
    });
  };


  const filteredActivities = activities.filter(activity => {
    // Filter by user role
    if (currentUser?.role === "colaborador") {
      if (activity.collaboratorId !== currentUser.id) return false;
    }

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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">CDA</h1>
                <p className="text-sm text-muted-foreground">
                  Sistema de Controle de Atividades
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <UserSelector />
              {currentUser?.role === "admin" && (
                <Link to="/settings">
                  <Button variant="outline" size="icon">
                    <Settings className="w-4 h-4" />
                  </Button>
                </Link>
              )}
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
            </div>
          </div>
        </div>
      </header>

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
