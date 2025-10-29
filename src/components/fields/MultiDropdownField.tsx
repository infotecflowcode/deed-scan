import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DynamicField } from "@/types/field";
import { Check, ChevronDown, X } from "lucide-react";

interface MultiDropdownFieldProps {
  field: DynamicField;
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  disabled?: boolean;
}

export const MultiDropdownField = ({ field, value = [], onChange, error, disabled }: MultiDropdownFieldProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>(value);

  useEffect(() => {
    setSelectedValues(value);
  }, [value]);

  const handleOptionToggle = (optionValue: string) => {
    const newValues = selectedValues.includes(optionValue)
      ? selectedValues.filter(v => v !== optionValue)
      : [...selectedValues, optionValue];
    
    setSelectedValues(newValues);
    onChange(newValues);
  };

  const handleRemoveOption = (optionValue: string) => {
    const newValues = selectedValues.filter(v => v !== optionValue);
    setSelectedValues(newValues);
    onChange(newValues);
  };

  const getSelectedLabels = () => {
    return selectedValues.map(value => {
      const option = field.options?.find(opt => opt.value === value);
      return option?.label || value;
    });
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={field.id}>
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className={`w-full justify-between ${error ? "border-red-500" : ""}`}
            disabled={disabled}
          >
            <span className="truncate">
              {selectedValues.length === 0 
                ? field.placeholder || "Selecione as opções"
                : `${selectedValues.length} opção(ões) selecionada(s)`
              }
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <div className="max-h-60 overflow-auto">
            {field.options?.map((option) => (
              <div
                key={option.id}
                className="flex items-center space-x-2 p-2 hover:bg-muted cursor-pointer"
                onClick={() => handleOptionToggle(option.value)}
              >
                <Checkbox
                  checked={selectedValues.includes(option.value)}
                  onChange={() => handleOptionToggle(option.value)}
                />
                <span className="flex-1">{option.label}</span>
                {selectedValues.includes(option.value) && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Mostrar opções selecionadas */}
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {getSelectedLabels().map((label, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {label}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => handleRemoveOption(selectedValues[index])}
              />
            </Badge>
          ))}
        </div>
      )}

      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};
