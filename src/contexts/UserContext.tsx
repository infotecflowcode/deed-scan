import { createContext, useContext, ReactNode } from "react";
import { useAuth } from "./AuthContext";

interface UserContextType {
  currentUser: any; // Será substituído pelo user do AuthContext
  setCurrentUser: (user: any) => void; // Mantido para compatibilidade
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  // Manter compatibilidade com o código existente
  const setCurrentUser = () => {
    console.warn("setCurrentUser está deprecated. Use o AuthContext para gerenciar usuários.");
  };

  return (
    <UserContext.Provider value={{ currentUser: user, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
};
