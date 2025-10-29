import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, KeyRound } from "lucide-react";

export default function Login() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { login, resetPassword, error, availableContracts, selectContract } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    const result = await login(credentials);
    
    if (result.success) {
      setMessage("Login realizado com sucesso!");
      // Verificar se o usuário tem acesso a múltiplos contratos
      if (availableContracts.length > 1) {
        navigate("/contract-selection");
      } else if (availableContracts.length === 1) {
        // Selecionar automaticamente o único contrato disponível
        selectContract(availableContracts[0].id);
        navigate("/");
      } else {
        navigate("/");
      }
    } else {
      setMessage(result.error || "Erro no login");
    }
    
    setIsLoading(false);
  };


  const handleResetPassword = async () => {
    if (!credentials.email) {
      setMessage("Digite um email para recuperar a senha");
      return;
    }

    setIsLoading(true);
    setMessage("");

    const result = await resetPassword(credentials.email);
    
    if (result.success) {
      setMessage("Email de recuperação enviado! Verifique sua caixa de entrada.");
    } else {
      setMessage(result.error || "Erro ao enviar email de recuperação");
    }
    
    setIsLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">CDA+</CardTitle>
          <CardDescription>
            Sistema de Controle de Atividades
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(error || message) && (
            <Alert variant={error ? "destructive" : "default"} className="mb-4">
              <AlertDescription>{error || message}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={credentials.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha"
                  value={credentials.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !credentials.email || !credentials.password}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <div className="text-center mt-4">
            <Button
              variant="link"
              onClick={handleResetPassword}
              disabled={isLoading || !credentials.email}
              className="text-sm"
            >
              <KeyRound className="mr-2 h-4 w-4" />
              Esqueci minha senha
            </Button>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p className="mb-2">Acesso restrito</p>
            <p className="text-xs">
              Apenas administradores podem cadastrar novos usuários.
              <br />
              Entre em contato com o administrador do sistema.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
