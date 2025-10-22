import { useState } from "react";
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
import { useUser } from "@/contexts/UserContext";
import { Activity, activities as mockActivities } from "@/data/mockData";
import { Plus, Settings, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const { currentUser } = useUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [approvalOpen, setApprovalOpen] = useState(false);

  const handleApprove = (activityId: string, scores: any[], rejectionReason?: string) => {
    setActivities(prev =>
      prev.map(activity =>
        activity.id === activityId
          ? {
              ...activity,
              status: rejectionReason ? "rejected" : "approved",
              approval: {
                approverId: currentUser.id,
                approverName: currentUser.name,
                approvalDate: new Date().toISOString(),
                criteriaScores: scores,
                rejectionReason,
              },
            }
          : activity
      )
    );
    setApprovalOpen(false);
    toast({
      title: rejectionReason ? "Atividade reprovada" : "Atividade aprovada",
      description: rejectionReason ? "A atividade foi reprovada com sucesso." : "A atividade foi aprovada com sucesso.",
    });
  };

  const filteredActivities = activities.filter(activity => {
    if (currentUser.role === "colaborador") {
      return activity.collaboratorId === currentUser.id;
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
              {currentUser.role === "admin" && (
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
                  <ActivityForm onSubmit={() => setIsDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="timeline" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="calendar">Calendário</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Atividades Recentes</h2>
              <p className="text-muted-foreground">
                Visualize e gerencie todas as atividades registradas
              </p>
            </div>
            <ActivityTimeline
              activities={filteredActivities}
              onViewDetails={(activity) => {
                setSelectedActivity(activity);
                setDetailsOpen(true);
              }}
              onApprove={(activity) => {
                setSelectedActivity(activity);
                setApprovalOpen(true);
              }}
              canApprove={currentUser.role === "fiscal" || currentUser.role === "admin"}
            />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Visualização de Calendário</h3>
              <p className="text-muted-foreground">
                Em breve: visualize suas atividades em formato de calendário
              </p>
            </div>
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
    </div>
  );
};

export default Index;
