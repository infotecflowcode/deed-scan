export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  cpf?: string; // CPF do usuário
  cargo?: string; // Cargo do usuário
  contracts: string[]; // IDs dos contratos que o usuário tem acesso
  isActive: boolean;
  lastLogin?: string;
}

export type UserRole = "colaborador" | "lider" | "fiscal" | "admin";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface Contract {
  id: string;
  name: string;
  billingType: "HH" | "BPO" | "ENTREGAVEL";
  serviceLines: {
    id: string;
    name: string;
    description: string;
  }[];
  createdAt: string;
  status: "active" | "inactive";
}
