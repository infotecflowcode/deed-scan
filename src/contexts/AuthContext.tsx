import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, LoginCredentials, AuthState } from "@/types/auth";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { contracts, type Contract } from "@/data/mockData";

// Mapeamento de usuários para contratos (baseado nos emails)
const getUserContracts = (email: string): string[] => {
  const contractMap: Record<string, string[]> = {
    'swellen@example.com': ['1', '2'], // Colaborador - Projeto Modernização IT, Suporte Operacional
    'joao@example.com': ['1', '2', '3'], // Líder - Projeto Modernização IT, Suporte Operacional, Desenvolvimento Web
    'leo@example.com': ['1', '4'], // Fiscal - Projeto Modernização IT, Manutenção Offshore
    'hemmely@example.com': ['1', '2', '3', '4'], // Admin - Todos os contratos
  }
  
  return contractMap[email] || []
}

// Função helper para obter role baseado no email
const getUserRoleByEmail = (email: string): 'colaborador' | 'lider' | 'fiscal' | 'admin' => {
  const emailRoleMap: Record<string, 'colaborador' | 'lider' | 'fiscal' | 'admin'> = {
    'swellen@example.com': 'colaborador',
    'joao@example.com': 'lider',
    'leo@example.com': 'fiscal',
    'hemmely@example.com': 'admin'
  };
  return emailRoleMap[email] || 'colaborador';
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  selectContract: (contractId: string) => void;
  currentContract: Contract | null;
  availableContracts: Contract[];
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data - em produção viria de uma API
const mockUsers: User[] = [
  {
    id: "1",
    name: "Swellen",
    email: "swellen@example.com",
    password: "123456",
    role: "colaborador",
    contracts: ["1", "2"],
    isActive: true,
  },
  {
    id: "2",
    name: "João",
    email: "joao@example.com",
    password: "123456",
    role: "lider",
    contracts: ["1", "2", "3"],
    isActive: true,
  },
  {
    id: "3",
    name: "Leo",
    email: "leo@example.com",
    password: "123456",
    role: "fiscal",
    contracts: ["1", "4"],
    isActive: true,
  },
  {
    id: "4",
    name: "Hemmely",
    email: "hemmely@example.com",
    password: "123456",
    role: "admin",
    contracts: ["1", "2", "3", "4"],
    isActive: true,
  },
];


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });
  
  const [currentContract, setCurrentContract] = useState<Contract | null>(null);

  // Verificar sessão do Supabase na inicialização
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao verificar sessão:', error);
          setAuthState(prev => ({ ...prev, isLoading: false }));
          return;
        }

        if (session?.user) {
          // Converter usuário do Supabase para formato do sistema
          const userContracts = getUserContracts(session.user.email || '');
          
          // Obter role baseado no email
          const userRole = getUserRoleByEmail(session.user.email || '');
          
          const user: User = {
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuário',
            email: session.user.email || '',
            password: '', // Senha não é armazenada no frontend
            role: userRole, // Profile type do banco de dados
            contracts: userContracts, // Contratos baseados no email
            isActive: true,
            lastLogin: session.user.last_sign_in_at || new Date().toISOString(),
          };

          setAuthState(prev => ({
            ...prev,
            user,
            isAuthenticated: true,
            isLoading: false,
          }));

          // Carregar contrato salvo
          const savedContract = localStorage.getItem("auth_contract");
          if (savedContract) {
            const contract = JSON.parse(savedContract);
            setCurrentContract(contract);
          }
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    getSession();

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const userContracts = getUserContracts(session.user.email || '');
          
          // Obter role baseado no email
          const userRole = getUserRoleByEmail(session.user.email || '');
          
          const user: User = {
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuário',
            email: session.user.email || '',
            password: '', // Senha não é armazenada no frontend
            role: userRole, // Profile type do banco de dados
            contracts: userContracts, // Contratos baseados no email
            isActive: true,
            lastLogin: session.user.last_sign_in_at || new Date().toISOString(),
          };

          setAuthState(prev => ({
            ...prev,
            user,
            isAuthenticated: true,
            isLoading: false,
          }));

          // Carregar contrato salvo
          const savedContract = localStorage.getItem("auth_contract");
          if (savedContract) {
            const contract = JSON.parse(savedContract);
            setCurrentContract(contract);
          }
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          setCurrentContract(null);
          localStorage.removeItem("auth_contract");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message,
        }));
        return { success: false, error: error.message };
      }

      if (data.user) {
        const userContracts = getUserContracts(data.user.email || '');
        
        // Obter role baseado no email
        const userRole = getUserRoleByEmail(data.user.email || '');
        
        const user: User = {
          id: data.user.id,
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Usuário',
          email: data.user.email || '',
          password: '', // Senha não é armazenada no frontend
          role: userRole, // Profile type do banco de dados
          contracts: userContracts, // Contratos baseados no email
          isActive: true,
          lastLogin: data.user.last_sign_in_at || new Date().toISOString(),
        };

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return { success: true };
      }

      return { success: false, error: "Erro desconhecido" };
    } catch (error) {
      const errorMessage = "Erro interno do servidor";
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
    
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    setCurrentContract(null);
    localStorage.removeItem("auth_contract");
  };

  const selectContract = (contractId: string) => {
    const contract = contracts.find(c => c.id === contractId);
    if (contract) {
      setCurrentContract(contract);
      localStorage.setItem("auth_contract", JSON.stringify(contract));
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      if (error) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message,
        }));
        return { success: false, error: error.message };
      }

      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: true };
    } catch (error) {
      const errorMessage = "Erro interno do servidor";
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: "Erro interno do servidor" };
    }
  };

  const availableContracts = authState.user 
    ? contracts.filter(contract => 
        authState.user!.contracts.includes(contract.id) && contract.status === "active"
      )
    : [];

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    selectContract,
    currentContract,
    availableContracts,
    signUp,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
