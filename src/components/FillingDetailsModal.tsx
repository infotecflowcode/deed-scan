import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Mail, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Employee {
  id: string;
  name: string;
  email: string;
  filled: boolean;
}

interface FillingDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  employees: Employee[];
}

export const FillingDetailsModal = ({ open, onOpenChange, date, employees }: FillingDetailsModalProps) => {
  const { toast } = useToast();
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [emailMessage, setEmailMessage] = useState("Olá! Você ainda não registrou sua atividade para hoje. Por favor, acesse o sistema e registre suas atividades.");
  const [sendingEmail, setSendingEmail] = useState(false);

  const filledEmployees = employees.filter(emp => emp.filled);
  const notFilledEmployees = employees.filter(emp => !emp.filled);

  const handleEmployeeToggle = (employeeId: string) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmployees.length === notFilledEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(notFilledEmployees.map(emp => emp.id));
    }
  };

  const handleSendEmail = async () => {
    if (selectedEmployees.length === 0) {
      toast({
        title: "Nenhum funcionário selecionado",
        description: "Selecione pelo menos um funcionário para enviar o lembrete.",
        variant: "destructive"
      });
      return;
    }

    setSendingEmail(true);

    try {
      // Simular envio de email
      await new Promise(resolve => setTimeout(resolve, 2000));

      const selectedNames = notFilledEmployees
        .filter(emp => selectedEmployees.includes(emp.id))
        .map(emp => emp.name);

      toast({
        title: "Lembretes enviados!",
        description: `Email enviado para ${selectedNames.join(", ")}`,
      });

      setSelectedEmployees([]);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao enviar emails",
        description: "Houve um problema ao enviar os lembretes.",
        variant: "destructive"
      });
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Preenchimento do dia {date.toLocaleDateString("pt-BR")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="text-sm">
              <span className="font-medium">Total de funcionários: {employees.length}</span>
            </div>
            <div className="flex gap-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                {filledEmployees.length} preencheram
              </Badge>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                <XCircle className="w-3 h-3 mr-1" />
                {notFilledEmployees.length} não preencheram
              </Badge>
            </div>
          </div>

          {/* Funcionários que preencheram */}
          {filledEmployees.length > 0 && (
            <div>
              <h3 className="font-medium text-green-700 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Funcionários que preencheram ({filledEmployees.length})
              </h3>
              <div className="space-y-2">
                {filledEmployees.map((employee) => (
                  <div key={employee.id} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{employee.name}</span>
                    <span className="text-xs text-muted-foreground">({employee.email})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Funcionários que não preencheram */}
          {notFilledEmployees.length > 0 && (
            <div>
              <h3 className="font-medium text-red-700 mb-3 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Funcionários que não preencheram
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="select-all"
                    checked={selectedEmployees.length === notFilledEmployees.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="select-all" className="text-sm font-medium">
                    Selecionar todos ({notFilledEmployees.length})
                  </Label>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {notFilledEmployees.map((employee) => (
                    <div key={employee.id} className="flex items-center gap-2 p-2 bg-red-50 rounded">
                      <Checkbox
                        id={employee.id}
                        checked={selectedEmployees.includes(employee.id)}
                        onCheckedChange={() => handleEmployeeToggle(employee.id)}
                      />
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm flex-1">{employee.name}</span>
                      <span className="text-xs text-muted-foreground">({employee.email})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seção de envio de email */}
              <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                <Label htmlFor="email-message" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Mensagem do lembrete
                </Label>
                <Textarea
                  id="email-message"
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Digite a mensagem que será enviada por email..."
                  rows={3}
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {selectedEmployees.length} funcionário(s) selecionado(s)
                  </span>
                  <Button
                    onClick={handleSendEmail}
                    disabled={selectedEmployees.length === 0 || sendingEmail}
                    className="gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    {sendingEmail ? "Enviando..." : "Enviar Lembretes"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};