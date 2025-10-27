import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Activity, serviceGroups } from "@/data/mockData";
import { useUser } from "@/contexts/UserContext";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EvidenceReportExportProps {
  activities: Activity[];
}

export const EvidenceReportExport = ({ activities }: EvidenceReportExportProps) => {
  const { currentUser } = useUser();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<"pdf" | "csv">("pdf");
  const [isExporting, setIsExporting] = useState(false);

  // Apenas admin/fiscal podem exportar relatórios
  if (currentUser.role === "colaborador") {
    return null;
  }

  const handleActivityToggle = (activityId: string) => {
    setSelectedActivities(prev =>
      prev.includes(activityId)
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    );
  };

  const handleSelectAll = () => {
    if (selectedActivities.length === activities.length) {
      setSelectedActivities([]);
    } else {
      setSelectedActivities(activities.map(a => a.id));
    }
  };

  const generatePDFReport = (activitiesToExport: Activity[]) => {
    // Simular geração de PDF
    const pdfContent = activitiesToExport.map(activity => {
      const group = serviceGroups.find(g => g.id === activity.groupId);
      const startDate = new Date(activity.startDate);
      const endDate = new Date(activity.endDate);
      const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));

      return {
        titulo: activity.title,
        colaborador: activity.collaboratorName,
        grupo: group?.name || "N/A",
        data_inicio: format(startDate, "dd/MM/yyyy HH:mm", { locale: ptBR }),
        data_fim: format(endDate, "dd/MM/yyyy HH:mm", { locale: ptBR }),
        duracao: `${duration}h`,
        status: activity.status,
        observacoes: activity.observations || "N/A",
        fotos: activity.photos.length,
        documentos: activity.documents.length,
        aprovacao: activity.approval ? {
          aprovador: activity.approval.approverName,
          data_aprovacao: format(new Date(activity.approval.approvalDate), "dd/MM/yyyy HH:mm", { locale: ptBR }),
          notas: activity.approval.criteriaScores?.map(score =>
            `${score.criteriaId}: ${score.score} - ${score.comment}`
          ).join("; ") || "N/A",
          motivo_rejeicao: activity.approval.rejectionReason || "N/A"
        } : null
      };
    });

    // Em uma implementação real, aqui seria usado uma biblioteca como jsPDF
    const blob = new Blob([JSON.stringify(pdfContent, null, 2)], {
      type: "application/json"
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio_evidencias_${format(new Date(), "yyyy-MM-dd_HH-mm")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateCSVReport = (activitiesToExport: Activity[]) => {
    const headers = [
      "ID",
      "Título",
      "Colaborador",
      "Grupo",
      "Data Início",
      "Data Fim",
      "Duração (h)",
      "Status",
      "Observações",
      "Fotos",
      "Documentos",
      "Aprovador",
      "Data Aprovação",
      "Motivo Rejeição"
    ];

    const csvContent = [
      headers.join(","),
      ...activitiesToExport.map(activity => {
        const group = serviceGroups.find(g => g.id === activity.groupId);
        const startDate = new Date(activity.startDate);
        const endDate = new Date(activity.endDate);
        const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));

        return [
          activity.id,
          `"${activity.title}"`,
          `"${activity.collaboratorName}"`,
          `"${group?.name || "N/A"}"`,
          format(startDate, "dd/MM/yyyy HH:mm", { locale: ptBR }),
          format(endDate, "dd/MM/yyyy HH:mm", { locale: ptBR }),
          duration,
          activity.status,
          `"${activity.observations || "N/A"}"`,
          activity.photos.length,
          activity.documents.length,
          `"${activity.approval?.approverName || "N/A"}"`,
          activity.approval ? format(new Date(activity.approval.approvalDate), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "N/A",
          `"${activity.approval?.rejectionReason || "N/A"}"`
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio_evidencias_${format(new Date(), "yyyy-MM-dd_HH-mm")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    if (selectedActivities.length === 0) {
      toast({
        title: "Nenhuma atividade selecionada",
        description: "Selecione pelo menos uma atividade para exportar.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);

    try {
      const activitiesToExport = activities.filter(a => selectedActivities.includes(a.id));

      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (exportFormat === "pdf") {
        generatePDFReport(activitiesToExport);
      } else {
        generateCSVReport(activitiesToExport);
      }

      toast({
        title: "Relatório exportado!",
        description: `Relatório de evidências em ${exportFormat.toUpperCase()} foi gerado com sucesso.`,
      });

      setOpen(false);
      setSelectedActivities([]);
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Houve um problema ao gerar o relatório.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Exportar Relatório
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Exportar Relatório de Evidências</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Formato de exportação */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Formato de Exportação</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="format-pdf"
                  checked={exportFormat === "pdf"}
                  onCheckedChange={() => setExportFormat("pdf")}
                />
                <Label htmlFor="format-pdf" className="flex items-center gap-2 cursor-pointer">
                  <FileText className="w-4 h-4 text-red-600" />
                  PDF (Relatório Detalhado)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="format-csv"
                  checked={exportFormat === "csv"}
                  onCheckedChange={() => setExportFormat("csv")}
                />
                <Label htmlFor="format-csv" className="flex items-center gap-2 cursor-pointer">
                  <FileSpreadsheet className="w-4 h-4 text-green-600" />
                  CSV (Planilha)
                </Label>
              </div>
            </div>
          </div>

          {/* Seleção de atividades */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Atividades para Exportar</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedActivities.length === activities.length ? "Desmarcar Todas" : "Selecionar Todas"}
              </Button>
            </div>

            <div className="border rounded-lg max-h-96 overflow-y-auto">
              {activities.map((activity) => {
                const group = serviceGroups.find(g => g.id === activity.groupId);
                const isSelected = selectedActivities.includes(activity.id);

                return (
                  <div
                    key={activity.id}
                    className={`flex items-center space-x-3 p-3 border-b last:border-b-0 ${
                      isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleActivityToggle(activity.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">{activity.title}</span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            activity.status === "approved" ? "bg-green-50 text-green-700 border-green-200" :
                            activity.status === "rejected" ? "bg-red-50 text-red-700 border-red-200" :
                            activity.status === "pending" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                            "bg-gray-50 text-gray-700 border-gray-200"
                          }`}
                        >
                          {activity.status === "approved" ? "Aprovado" :
                           activity.status === "rejected" ? "Rejeitado" :
                           activity.status === "pending" ? "Pendente" : activity.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {activity.collaboratorName} • {group?.name} • {format(new Date(activity.startDate), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>📷 {activity.photos.length}</span>
                      <span>📄 {activity.documents.length}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-sm text-muted-foreground">
              {selectedActivities.length} de {activities.length} atividades selecionadas
            </div>
          </div>

          {/* Informações do relatório */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">O relatório incluirá:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Dados completos das atividades selecionadas</li>
              <li>• Informações do colaborador e grupo de serviço</li>
              <li>• Datas, horários e duração das atividades</li>
              <li>• Status de aprovação e observações</li>
              <li>• Contagem de fotos e documentos anexados</li>
              <li>• Detalhes de aprovação/rejeição quando aplicável</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleExport} disabled={isExporting || selectedActivities.length === 0}>
            {isExporting ? "Exportando..." : `Exportar ${exportFormat.toUpperCase()}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};