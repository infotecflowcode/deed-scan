import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Activity } from "@/data/mockData";
import { evaluationCriteria } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApprovalModalProps {
  activity: Activity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (scores: CriteriaScore[], rejectionReason?: string) => void;
}

interface CriteriaScore {
  criteriaId: string;
  score: number;
  comment: string;
}

export const ApprovalModal = ({
  activity,
  open,
  onOpenChange,
  onApprove,
}: ApprovalModalProps) => {
  const { toast } = useToast();
  const [scores, setScores] = useState<CriteriaScore[]>(
    evaluationCriteria.map((c) => ({ criteriaId: c.id, score: 0, comment: "" }))
  );
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejection, setShowRejection] = useState(false);

  const updateScore = (criteriaId: string, score: number) => {
    setScores((prev) =>
      prev.map((s) => (s.criteriaId === criteriaId ? { ...s, score } : s))
    );
  };

  const updateComment = (criteriaId: string, comment: string) => {
    setScores((prev) =>
      prev.map((s) => (s.criteriaId === criteriaId ? { ...s, comment } : s))
    );
  };

  const averageScore =
    scores.reduce((acc, s) => acc + s.score, 0) / scores.length;

  const handleApprove = () => {
    const requiredCriteria = evaluationCriteria.filter((c) => c.required);
    const missingScores = requiredCriteria.filter(
      (c) => !scores.find((s) => s.criteriaId === c.id && s.score > 0)
    );

    if (missingScores.length > 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Avalie todos os critérios obrigatórios antes de aprovar.",
        variant: "destructive",
      });
      return;
    }

    onApprove(scores);
    resetForm();
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Justificativa obrigatória",
        description: "Informe o motivo da reprovação.",
        variant: "destructive",
      });
      return;
    }

    onApprove(scores, rejectionReason);
    resetForm();
  };

  const resetForm = () => {
    setScores(
      evaluationCriteria.map((c) => ({ criteriaId: c.id, score: 0, comment: "" }))
    );
    setRejectionReason("");
    setShowRejection(false);
    onOpenChange(false);
  };

  if (!activity) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Avaliar Atividade</DialogTitle>
          <DialogDescription>{activity.title}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Média em Tempo Real */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Média Geral</span>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-6 h-6 ${
                        star <= averageScore
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-lg">{averageScore.toFixed(1)}/5</span>
              </div>
            </div>
          </div>

          {/* Critérios de Avaliação */}
          {!showRejection && (
            <div className="space-y-5">
              {evaluationCriteria.map((criteria) => {
                const criteriaScore = scores.find((s) => s.criteriaId === criteria.id);
                return (
                  <div key={criteria.id} className="border-l-2 border-primary pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm">{criteria.name}</strong>
                        {criteria.required && (
                          <span className="text-xs text-destructive">*</span>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Máx: {criteria.maxScore}
                      </span>
                    </div>

                    {/* Estrelas Clicáveis */}
                    <div className="flex items-center gap-2 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-6 h-6 cursor-pointer transition-all ${
                            star <= (criteriaScore?.score || 0)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300 hover:text-yellow-200"
                          }`}
                          onClick={() => updateScore(criteria.id, star)}
                        />
                      ))}
                      {criteriaScore && criteriaScore.score > 0 && (
                        <span className="text-sm ml-2">{criteriaScore.score}/5</span>
                      )}
                    </div>

                    {/* Campo de Comentário */}
                    <Textarea
                      placeholder="Comentário (opcional)"
                      value={criteriaScore?.comment || ""}
                      onChange={(e) => updateComment(criteria.id, e.target.value)}
                      className="mt-2"
                      rows={2}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Campo de Reprovação */}
          {showRejection && (
            <div>
              <label className="text-sm font-semibold mb-2 block">
                Motivo da Reprovação <span className="text-destructive">*</span>
              </label>
              <Textarea
                placeholder="Descreva o motivo da reprovação..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={5}
              />
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex gap-3 pt-4 border-t">
            {!showRejection ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowRejection(true)}
                  className="flex-1"
                >
                  Reprovar
                </Button>
                <Button onClick={handleApprove} className="flex-1 bg-green-500 hover:bg-green-600">
                  Aprovar
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowRejection(false)}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  className="flex-1"
                >
                  Confirmar Reprovação
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
