import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Activity, serviceGroups } from "@/data/mockData";
import { Filter, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

export interface ActivityFiltersType {
  status: string[];
  groups: string[];
  collaborators: string[];
}

interface ActivityFiltersProps {
  activities: Activity[];
  filters: ActivityFiltersType;
  onFiltersChange: (filters: ActivityFiltersType) => void;
}

export const ActivityFilters = ({ activities, filters, onFiltersChange }: ActivityFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const statusOptions = [
    { value: "pending", label: "Pendente", color: "bg-yellow-500" },
    { value: "approved", label: "Aprovado", color: "bg-green-500" },
    { value: "rejected", label: "Rejeitado", color: "bg-red-500" },
  ];

  const groupOptions = serviceGroups.map(group => ({
    value: group.id,
    label: group.name,
    color: group.color,
  }));

  const collaboratorOptions = Array.from(
    new Set(activities.map(a => a.collaboratorName))
  ).map(name => ({
    value: name,
    label: name,
  }));

  const handleStatusChange = (status: string, checked: boolean) => {
    const newStatus = checked
      ? [...filters.status, status]
      : filters.status.filter(s => s !== status);

    onFiltersChange({ ...filters, status: newStatus });
  };

  const handleGroupChange = (groupId: string, checked: boolean) => {
    const newGroups = checked
      ? [...filters.groups, groupId]
      : filters.groups.filter(g => g !== groupId);

    onFiltersChange({ ...filters, groups: newGroups });
  };

  const handleCollaboratorChange = (collaborator: string, checked: boolean) => {
    const newCollaborators = checked
      ? [...filters.collaborators, collaborator]
      : filters.collaborators.filter(c => c !== collaborator);

    onFiltersChange({ ...filters, collaborators: newCollaborators });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      status: [],
      groups: [],
      collaborators: [],
    });
  };

  const hasActiveFilters =
    filters.status.length > 0 ||
    filters.groups.length > 0 ||
    filters.collaborators.length > 0;

  const activeFilterCount =
    filters.status.length +
    filters.groups.length +
    filters.collaborators.length;

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 px-1 min-w-5 h-5 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filtros</h4>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-8 px-2 text-xs"
                >
                  Limpar todos
                </Button>
              )}
            </div>

            {/* Status */}
            <div className="space-y-3">
              <h5 className="text-sm font-medium">Status</h5>
              <div className="space-y-2">
                {statusOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${option.value}`}
                      checked={filters.status.includes(option.value)}
                      onCheckedChange={(checked) =>
                        handleStatusChange(option.value, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`status-${option.value}`}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <div className={`w-3 h-3 rounded-full ${option.color}`} />
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Grupos */}
            <div className="space-y-3">
              <h5 className="text-sm font-medium">Grupos de Serviço</h5>
              <div className="space-y-2">
                {groupOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`group-${option.value}`}
                      checked={filters.groups.includes(option.value)}
                      onCheckedChange={(checked) =>
                        handleGroupChange(option.value, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`group-${option.value}`}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: option.color }}
                      />
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Colaboradores */}
            <div className="space-y-3">
              <h5 className="text-sm font-medium">Colaboradores</h5>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {collaboratorOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`collaborator-${option.value}`}
                      checked={filters.collaborators.includes(option.value)}
                      onCheckedChange={(checked) =>
                        handleCollaboratorChange(option.value, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`collaborator-${option.value}`}
                      className="text-sm cursor-pointer"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-1 flex-wrap">
          {filters.status.map(status => {
            const option = statusOptions.find(opt => opt.value === status);
            return (
              <Badge key={status} variant="secondary" className="gap-1">
                <div className={`w-2 h-2 rounded-full ${option?.color}`} />
                {option?.label}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleStatusChange(status, false)}
                />
              </Badge>
            );
          })}

          {filters.groups.map(groupId => {
            const option = groupOptions.find(opt => opt.value === groupId);
            return (
              <Badge key={groupId} variant="secondary" className="gap-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: option?.color }}
                />
                {option?.label}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleGroupChange(groupId, false)}
                />
              </Badge>
            );
          })}

          {filters.collaborators.map(collaborator => (
            <Badge key={collaborator} variant="secondary" className="gap-1">
              {collaborator}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleCollaboratorChange(collaborator, false)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};