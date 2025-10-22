import { useState } from "react";
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
import { Plus, Settings, Calendar } from "lucide-react";

const Index = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
              <Button variant="outline" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
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
            <ActivityTimeline />
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
    </div>
  );
};

export default Index;
