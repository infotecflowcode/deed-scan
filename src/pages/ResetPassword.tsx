import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, KeyRound, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Processar tokens do Supabase quando vierem via hash (email de recuperação)
  useEffect(() => {
    const processRecoveryTokens = async () => {
      // O Supabase passa o token via hash (#access_token=...&refresh_token=...&type=recovery)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const type = hashParams.get("type");
      
      if (type === "recovery" && accessToken && refreshToken) {
        try {
          // Processar a sessão com os tokens de recuperação
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error("Erro ao processar token de recuperação:", error);
            setError("Link inválido ou expirado. Solicite uma nova recuperação de senha.");
          } else {
            console.log("Sessão de recuperação estabelecida com sucesso");
            // Limpar hash da URL após processar
            window.history.replaceState(null, "", window.location.pathname);
          }
        } catch (err) {
          console.error("Erro ao processar tokens:", err);
          setError("Erro ao processar o link de recuperação. Tente novamente.");
        }
      } else if (!hashParams.has("access_token")) {
        // Verificar se é acesso direto sem token
        const isDirectAccess = window.location.hash === "" || !window.location.hash.includes("access_token");
        if (isDirectAccess) {
          // Não mostrar erro imediatamente, pode ser que o usuário esteja testando
          // O erro será mostrado apenas ao tentar submeter
        }
      }
    };

    processRecoveryTokens();
  }, []);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 6) {
      return "A senha deve ter pelo menos 6 caracteres";
    }
    // Pode adicionar mais validações aqui (maiúsculas, números, etc.)
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Validações
    if (!password) {
      setError("Digite a nova senha");
      return;
    }

    if (!confirmPassword) {
      setError("Confirme a nova senha");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    setIsLoading(true);

    try {
      // O Supabase automaticamente usa o token da URL para atualizar a senha
      const { data, error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message || "Erro ao atualizar senha. O link pode ter expirado.");
        setIsLoading(false);
        return;
      }

      // Sucesso!
      setIsSuccess(true);
      setMessage("Senha redefinida com sucesso! Redirecionando para o login...");

      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Erro ao redefinir senha:", err);
      setError("Erro ao redefinir senha. Tente novamente ou solicite um novo link.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <KeyRound className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Redefinir Senha</CardTitle>
          <CardDescription>
            Digite sua nova senha abaixo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isSuccess ? (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {message}
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {message && (
                <Alert className="mb-4">
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nova Senha *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite sua nova senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      minLength={6}
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
                  <p className="text-xs text-muted-foreground">
                    Mínimo de 6 caracteres
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirme sua nova senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
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
                  disabled={isLoading || !password || !confirmPassword}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redefinindo...
                    </>
                  ) : (
                    "Redefinir Senha"
                  )}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <Button
                  variant="link"
                  onClick={() => navigate("/login")}
                  disabled={isLoading}
                  className="text-sm"
                >
                  Voltar para o login
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

