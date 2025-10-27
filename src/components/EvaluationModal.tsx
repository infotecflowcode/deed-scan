import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Star, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EvaluationType {
  id: string;
  name: string;
  type: "numerico" | "estrelas" | "sim-nao" | "percentual";
  required: boolean;
  evaluationMethods: {
    note: boolean;
    observations: boolean;
    attachments: boolean;
    justification: boolean;
  };
}

interface EvaluationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractName: string;
  evaluationTypes: EvaluationType[];
  onSubmit: (evaluations: any[]) => void;
}

export const EvaluationModal = ({
  open,
  onOpenChange,
  contractName,
  evaluationTypes,
  onSubmit
}: EvaluationModalProps) => {
  const { toast } = useToast();
  const [evaluations, setEvaluations] = useState<Record<string, any>>({});
  const [files, setFiles] = useState<Record<string, File[]>>({});

  const handleNoteChange = (evalId: string, value: number) => {
    setEvaluations(prev => ({
      ...prev,
      [evalId]: { ...prev[evalId], note: value }
    }));
  };

  const handleObservationChange = (evalId: string, value: string) => {
    setEvaluations(prev => ({
      ...prev,
      [evalId]: { ...prev[evalId], observation: value }
    }));
  };

  const handleStarRating = (evalId: string, rating: number) => {
    setEvaluations(prev => ({
      ...prev,
      [evalId]: { ...prev[evalId], stars: rating }
    }));
  };

  const handleBooleanChange = (evalId: string, value: boolean) => {
    setEvaluations(prev => ({
      ...prev,
      [evalId]: { ...prev[evalId], value: value }
    }));
  };

  const handleFileUpload = (evalId: string, newFiles: File[]) => {
    setFiles(prev => ({
      ...prev,
      [evalId]: [...(prev[evalId] || []), ...newFiles]
    }));
  };

  const removeFile = (evalId: string, fileIndex: number) => {
    setFiles(prev => ({
      ...prev,
      [evalId]: prev[evalId]?.filter((_, index) => index !== fileIndex) || []
    }));
  };

  const handleSubmit = () => {
    const evaluationResults = evaluationTypes.map(evalType => ({
      evaluationTypeId: evalType.id,
      ...evaluations[evalType.id],
      files: files[evalType.id] || []
    }));

    onSubmit(evaluationResults);
    toast({
      title: "Avaliação enviada!",
      description: "A avaliação foi registrada com sucesso.",
    });
    onOpenChange(false);
  };

  const renderEvaluationInput = (evalType: EvaluationType) => {
    const currentEval = evaluations[evalType.id] || {};

    return (
      <div key={evalType.id} className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{evalType.name}</h3>
          {evalType.required && (
            <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
          )}
        </div>

        {/* Nota/Estrelas */}
        {evalType.evaluationMethods.note && (
          <div>
            {evalType.type === "numerico" && (
              <div>
                <Label className="text-sm">Nota (1-10)</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={currentEval.note || ""}
                  onChange={(e) => handleNoteChange(evalType.id, parseInt(e.target.value))}
                  className="w-24"
                />
              </div>
            )}

            {evalType.type === "estrelas" && (
              <div>
                <Label className="text-sm">Avaliação por Estrelas</Label>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-6 h-6 cursor-pointer ${
                        star <= (currentEval.stars || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                      onClick={() => handleStarRating(evalType.id, star)}
                    />
                  ))}
                </div>
              </div>
            )}

            {evalType.type === "sim-nao" && (
              <div>
                <Label className="text-sm">Avaliação</Label>
                <div className="flex gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={currentEval.value === true}
                      onCheckedChange={() => handleBooleanChange(evalType.id, true)}
                    />
                    <Label className="text-sm">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={currentEval.value === false}
                      onCheckedChange={() => handleBooleanChange(evalType.id, false)}
                    />
                    <Label className="text-sm">Não</Label>
                  </div>
                </div>
              </div>
            )}

            {evalType.type === "percentual" && (
              <div>
                <Label className="text-sm">Percentual (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={currentEval.note || ""}
                  onChange={(e) => handleNoteChange(evalType.id, parseInt(e.target.value))}
                  className="w-24"
                />
              </div>
            )}
          </div>
        )}

        {/* Observações */}
        {evalType.evaluationMethods.observations && (
          <div>
            <Label className="text-sm">Observações</Label>
            <Textarea
              value={currentEval.observation || ""}
              onChange={(e) => handleObservationChange(evalType.id, e.target.value)}
              placeholder="Adicione suas observações..."
              rows={3}
            />
          </div>
        )}

        {/* Justificativa (para estrelas baixas) */}
        {evalType.evaluationMethods.justification &&
         evalType.type === "estrelas" &&
         currentEval.stars &&
         currentEval.stars < 3 && (
          <div>
            <Label className="text-sm text-red-600">Justificativa (obrigatória para menos de 3 estrelas)</Label>
            <Textarea
              value={currentEval.justification || ""}
              onChange={(e) => setEvaluations(prev => ({
                ...prev,
                [evalType.id]: { ...prev[evalType.id], justification: e.target.value }
              }))}
              placeholder="Por favor, justifique a avaliação baixa..."
              rows={2}
              required
            />
          </div>
        )}

        {/* Anexos */}
        {evalType.evaluationMethods.attachments && (
          <div>
            <Label className="text-sm">Anexos</Label>
            <div className="border-2 border-dashed rounded-lg p-4 mt-2">
              <input
                type="file"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    handleFileUpload(evalType.id, Array.from(e.target.files));
                  }
                }}
                className="hidden"
                id={`file-${evalType.id}`}
              />
              <label
                htmlFor={`file-${evalType.id}`}
                className="flex flex-col items-center cursor-pointer"
              >
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  Clique para adicionar arquivos
                </span>
              </label>
            </div>

            {files[evalType.id] && files[evalType.id].length > 0 && (
              <div className="space-y-2 mt-2">
                {files[evalType.id].map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(evalType.id, index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Avaliação - {contractName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-sm text-muted-foreground">
            Complete a avaliação para todos os critérios configurados para este contrato.
          </div>

          {evaluationTypes.map(renderEvaluationInput)}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              Enviar Avaliação
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};