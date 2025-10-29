import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DynamicField } from "@/types/field";
import { DollarSign } from "lucide-react";

interface CurrencyFieldProps {
  field: DynamicField;
  value: number | string;
  onChange: (value: number | string) => void;
  error?: string;
  disabled?: boolean;
}

export const CurrencyField = ({ field, value, onChange, error, disabled }: CurrencyFieldProps) => {
  const formatCurrency = (value: number | string): string => {
    if (value === "" || value === null || value === undefined) return "";
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numValue)) return "";
    return numValue.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const parseCurrency = (value: string): number => {
    // Remove tudo exceto números, vírgulas e pontos
    const cleanValue = value.replace(/[^\d,.-]/g, "");
    // Substitui vírgula por ponto para conversão
    const normalizedValue = cleanValue.replace(",", ".");
    const numValue = parseFloat(normalizedValue);
    return isNaN(numValue) ? 0 : numValue;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === "") {
      onChange("");
      return;
    }
    
    const numValue = parseCurrency(inputValue);
    onChange(numValue);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={field.id}>
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="relative">
        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          id={field.id}
          type="text"
          value={value ? formatCurrency(value) : ""}
          onChange={handleChange}
          placeholder={field.placeholder || "0,00"}
          disabled={disabled}
          className={`pl-10 ${error ? "border-red-500" : ""}`}
        />
      </div>
      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};
