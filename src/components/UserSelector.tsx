import { User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser, mockUsers } from "@/contexts/UserContext";
import { Badge } from "@/components/ui/badge";

const roleColors = {
  colaborador: "bg-blue-500",
  lider: "bg-green-500",
  fiscal: "bg-yellow-500",
  admin: "bg-red-500",
};

const roleLabels = {
  colaborador: "Colaborador",
  lider: "Líder",
  fiscal: "Fiscal",
  admin: "Admin",
};

export const UserSelector = () => {
  const { currentUser, setCurrentUser } = useUser();

  return (
    <div className="flex items-center gap-2">
      <User className="w-4 h-4 text-muted-foreground" />
      <Select
        value={currentUser.id}
        onValueChange={(userId) => {
          const user = mockUsers.find((u) => u.id === userId);
          if (user) setCurrentUser(user);
        }}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {mockUsers.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              <div className="flex items-center gap-2">
                <span>{user.name}</span>
                <Badge className={`${roleColors[user.role]} text-white text-xs`}>
                  {roleLabels[user.role]}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
