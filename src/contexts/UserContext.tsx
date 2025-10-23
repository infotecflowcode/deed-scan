import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "colaborador" | "lider" | "fiscal" | "admin";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface UserContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const mockUsers: User[] = [
  { id: "1", name: "Swellen", email: "swellen@example.com", role: "colaborador" },
  { id: "2", name: "João", email: "joao@example.com", role: "lider" },
  { id: "3", name: "Leo", email: "leo@example.com", role: "fiscal" },
  { id: "4", name: "Hemmely", email: "hemmely@example.com", role: "admin" },
];

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
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

export { mockUsers };
