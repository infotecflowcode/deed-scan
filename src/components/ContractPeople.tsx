import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Trash2, Edit2, Save, X, Users, UserCheck, UserX, Check, ChevronsUpDown } from "lucide-react";
import { ContractUser, ServiceGroup, ServiceLine } from "@/data/mockData";
import { User } from "@/types/auth";
import { cn } from "@/lib/utils";

interface ContractPeopleProps {
  contractUsers: ContractUser[];
  onUsersChange: (users: ContractUser[]) => void;
  availableUsers: User[];
  serviceGroups: ServiceGroup[];
  serviceLines: ServiceLine[];
}

export const ContractPeople = ({
  contractUsers,
  onUsersChange,
  availableUsers,
  serviceGroups,
  serviceLines,
}: ContractPeopleProps) => {
  const [selectedRole, setSelectedRole] = useState<"colaborador" | "lider" | "fiscal" | "todos">("colaborador");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedLines, setSelectedLines] = useState<string[]>([]);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [userSearchOpen, setUserSearchOpen] = useState(false);
  const [userSearchValue, setUserSearchValue] = useState("");

  // Filtrar usuários disponíveis por role e termo de busca
  const filteredUsers = availableUsers.filter(user => {
    // Se "todos" estiver selecionado, não filtrar por role
    const matchesRole = selectedRole === "todos" || user.role === selectedRole;
    const matchesSearch = user.name.toLowerCase().includes(userSearchValue.toLowerCase()) ||
                         user.email.toLowerCase().includes(userSearchValue.toLowerCase());
    const notAlreadyAssigned = !contractUsers.some(cu => cu.userId === user.id);
    return matchesRole && matchesSearch && notAlreadyAssigned;
  });

  // Obter usuários já atribuídos por role
  const getUsersByRole = (role: "colaborador" | "lider" | "fiscal") => {
    return contractUsers.filter(cu => cu.role === role);
  };

  // Obter nome do usuário selecionado
  const getSelectedUserName = () => {
    if (!selectedUser) return "";
    const user = availableUsers.find(u => u.id === selectedUser);
    return user ? `${user.name} (${user.email})` : "";
  };

  // Obter linhas de serviço para um grupo específico
  const getServiceLinesForGroup = (groupId: string) => {
    return serviceLines.filter(line => line.groupId === groupId);
  };

  // Adicionar usuário ao contrato
  const addUserToContract = () => {
    if (!selectedUser || selectedGroups.length === 0) return;

    const user = availableUsers.find(u => u.id === selectedUser);
    if (!user) return;

    // Se "todos" estiver selecionado, usar o role do próprio usuário
    // Caso contrário, usar o role selecionado (mas converter "todos" para o role do usuário)
    let finalRole: "colaborador" | "lider" | "fiscal" | "admin";
    
    if (selectedRole === "todos") {
      // Usar o role do próprio usuário, mas garantir que seja um dos valores válidos
      if (user.role === "admin") {
        finalRole = "admin";
      } else {
        finalRole = user.role as "colaborador" | "lider" | "fiscal";
      }
    } else {
      finalRole = selectedRole;
    }

    const newContractUser: ContractUser = {
      id: `contract-user-${Date.now()}`,
      userId: selectedUser,
      contractId: "", // Será preenchido pelo componente pai
      role: finalRole,
      serviceGroups: selectedGroups,
      serviceLines: finalRole === "fiscal" ? [] : selectedLines, // Fiscal não tem linhas de serviço
      isActive: true,
      assignedAt: new Date().toISOString(),
      assignedBy: "current-user", // Será preenchido pelo componente pai
    };

    onUsersChange([...contractUsers, newContractUser]);
    
    // Reset form
    setSelectedUser("");
    setSelectedGroups([]);
    setSelectedLines([]);
    setUserSearchValue("");
  };

  // Remover usuário do contrato
  const removeUserFromContract = (contractUserId: string) => {
    onUsersChange(contractUsers.filter(cu => cu.id !== contractUserId));
  };

  // Atualizar grupos e linhas de um usuário
  const updateUserAssignments = (contractUserId: string, groups: string[], lines: string[]) => {
    onUsersChange(contractUsers.map(cu => 
      cu.id === contractUserId 
        ? { ...cu, serviceGroups: groups, serviceLines: lines }
        : cu
    ));
    setEditingUser(null);
  };

  // Toggle grupo selecionado
  const toggleGroup = (groupId: string) => {
    if (selectedGroups.includes(groupId)) {
      setSelectedGroups(selectedGroups.filter(id => id !== groupId));
      // Remover linhas do grupo desmarcado
      const groupLines = getServiceLinesForGroup(groupId).map(line => line.id);
      setSelectedLines(selectedLines.filter(id => !groupLines.includes(id)));
    } else {
      setSelectedGroups([...selectedGroups, groupId]);
    }
  };

  // Toggle linha de serviço selecionada
  const toggleServiceLine = (lineId: string) => {
    if (selectedLines.includes(lineId)) {
      setSelectedLines(selectedLines.filter(id => id !== lineId));
    } else {
      setSelectedLines([...selectedLines, lineId]);
    }
  };

  // Obter nome do usuário
  const getUserName = (userId: string) => {
    const user = availableUsers.find(u => u.id === userId);
    return user?.name || "Usuário não encontrado";
  };

  // Obter email do usuário
  const getUserEmail = (userId: string) => {
    const user = availableUsers.find(u => u.id === userId);
    return user?.email || "";
  };

  // Obter avatar do usuário
  const getUserAvatar = (userId: string) => {
    return undefined; // Avatar não disponível na interface User
  };

  // Obter nome do grupo
  const getGroupName = (groupId: string) => {
    const group = serviceGroups.find(g => g.id === groupId);
    return group?.name || "Grupo não encontrado";
  };

  // Obter nome da linha de serviço
  const getServiceLineName = (lineId: string) => {
    const line = serviceLines.find(l => l.id === lineId);
    return line?.name || "Linha não encontrada";
  };

  return (
    <div className="space-y-6">
      {/* Adicionar Usuário */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Adicionar Pessoa ao Contrato</CardTitle>
          <CardDescription>
            Selecione o tipo de usuário e configure suas atribuições
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role">Tipo de Usuário</Label>
              <Select value={selectedRole} onValueChange={(value: "colaborador" | "lider" | "fiscal" | "todos") => {
                setSelectedRole(value);
                // Limpar seleção de usuário ao mudar o tipo
                setSelectedUser("");
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="colaborador">Colaborador</SelectItem>
                  <SelectItem value="lider">Líder</SelectItem>
                  <SelectItem value="fiscal">Fiscal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="user">Usuário</Label>
              <Popover open={userSearchOpen} onOpenChange={setUserSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={userSearchOpen}
                    className="w-full justify-between"
                  >
                    {selectedUser
                      ? getSelectedUserName()
                      : "Selecione um usuário..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar usuário..." value={userSearchValue} onValueChange={setUserSearchValue} />
                    <CommandList>
                      <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
                      <CommandGroup>
                        {filteredUsers.map((user) => (
                          <CommandItem
                            key={user.id}
                            value={`${user.name} ${user.email}`}
                            onSelect={() => {
                              setSelectedUser(user.id);
                              setUserSearchOpen(false);
                              setUserSearchValue("");
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedUser === user.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <Avatar className="w-6 h-6 shrink-0">
                                <AvatarImage src={undefined} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="truncate">{user.name}</span>
                                <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                              </div>
                              <Badge variant="outline" className="ml-auto text-xs shrink-0">
                                {user.role === "admin" ? "Admin" : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                              </Badge>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Seleção de Grupos */}
          <div>
            <Label>Grupos de Trabalho</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              {serviceGroups.map((group) => (
                <div key={group.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`group-${group.id}`}
                    checked={selectedGroups.includes(group.id)}
                    onCheckedChange={() => toggleGroup(group.id)}
                  />
                  <Label htmlFor={`group-${group.id}`} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: group.color }}
                    />
                    {group.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Seleção de Linhas de Serviço - Apenas para Colaborador e Líder */}
          {selectedGroups.length > 0 && selectedRole !== "fiscal" && (
            <div>
              <Label>Linhas de Serviço</Label>
              <div className="space-y-2 mt-2">
                {selectedGroups.map((groupId) => {
                  const groupLines = getServiceLinesForGroup(groupId);
                  return (
                    <div key={groupId} className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: serviceGroups.find(g => g.id === groupId)?.color }}
                        />
                        <span className="font-medium">{getGroupName(groupId)}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-5">
                        {groupLines.map((line) => (
                          <div key={line.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`line-${line.id}`}
                              checked={selectedLines.includes(line.id)}
                              onCheckedChange={() => toggleServiceLine(line.id)}
                            />
                            <Label htmlFor={`line-${line.id}`} className="text-sm">
                              {line.name} - R$ {line.value.toFixed(2)}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <Button 
            onClick={addUserToContract}
            disabled={!selectedUser || selectedGroups.length === 0}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar ao Contrato
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Usuários por Role */}
      <div className="space-y-4">
        {(["colaborador", "lider", "fiscal"] as const).map((role) => {
          const users = getUsersByRole(role);
          const roleLabels = {
            colaborador: "Colaboradores",
            lider: "Líderes", 
            fiscal: "Fiscais"
          };

          return (
            <Card key={role}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  {role === "colaborador" && <Users className="w-4 h-4" />}
                  {role === "lider" && <UserCheck className="w-4 h-4" />}
                  {role === "fiscal" && <UserX className="w-4 h-4" />}
                  {roleLabels[role]} ({users.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Nenhum {roleLabels[role].toLowerCase()} atribuído</p>
                ) : (
                  <div className="space-y-3">
                    {users.map((contractUser) => (
                      <div key={contractUser.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={getUserAvatar(contractUser.userId)} />
                              <AvatarFallback>{getUserName(contractUser.userId).charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{getUserName(contractUser.userId)}</p>
                              <p className="text-sm text-muted-foreground">{getUserEmail(contractUser.userId)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingUser(contractUser.id)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeUserFromContract(contractUser.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Grupos e Linhas Atribuídas */}
                        <div className="mt-3 space-y-2">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Grupos:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {contractUser.serviceGroups.map((groupId) => (
                                <Badge key={groupId} variant="secondary" className="text-xs">
                                  <div
                                    className="w-2 h-2 rounded-full mr-1"
                                    style={{ backgroundColor: serviceGroups.find(g => g.id === groupId)?.color }}
                                  />
                                  {getGroupName(groupId)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          {/* Linhas de Serviço - Apenas para Colaborador e Líder */}
                          {contractUser.role !== "fiscal" && contractUser.serviceLines.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Linhas de Serviço:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {contractUser.serviceLines.map((lineId) => (
                                  <Badge key={lineId} variant="outline" className="text-xs">
                                    {getServiceLineName(lineId)}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Modal de Edição (simplificado) */}
                        {editingUser === contractUser.id && (
                          <div className="mt-3 p-3 border rounded-lg bg-muted/50">
                            <p className="text-sm font-medium mb-2">Editar Atribuições</p>
                            <div className="space-y-2">
                              <div>
                                <Label className="text-xs">Grupos de Trabalho</Label>
                                <div className="grid grid-cols-2 gap-1 mt-1">
                                  {serviceGroups.map((group) => (
                                    <div key={group.id} className="flex items-center space-x-1">
                                      <Checkbox
                                        id={`edit-group-${group.id}`}
                                        checked={contractUser.serviceGroups.includes(group.id)}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            updateUserAssignments(
                                              contractUser.id,
                                              [...contractUser.serviceGroups, group.id],
                                              contractUser.role === "fiscal" ? [] : contractUser.serviceLines
                                            );
                                          } else {
                                            const groupLines = contractUser.role === "fiscal" ? [] : getServiceLinesForGroup(group.id).map(line => line.id);
                                            updateUserAssignments(
                                              contractUser.id,
                                              contractUser.serviceGroups.filter(id => id !== group.id),
                                              contractUser.role === "fiscal" ? [] : contractUser.serviceLines.filter(id => !groupLines.includes(id))
                                            );
                                          }
                                        }}
                                      />
                                      <Label htmlFor={`edit-group-${group.id}`} className="text-xs">
                                        {group.name}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Button size="sm" onClick={() => setEditingUser(null)}>
                                <Save className="w-3 h-3 mr-1" />
                                Salvar
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingUser(null)}>
                                <X className="w-3 h-3 mr-1" />
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
