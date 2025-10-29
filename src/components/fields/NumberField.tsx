import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DynamicField } from "@/types/field";

interface NumberFieldProps {
  field: DynamicField;
  value: number | string;
  onChange: (value: number | string) => void;
  error?: string;
  disabled?: boolean;
}

export const NumberField = ({ field, value, onChange, error, disabled }: NumberFieldProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === "") {
      onChange("");
      return;
    }
    
    const numValue = parseInt(inputValue, 10);
    if (!isNaN(numValue)) {
      onChange(numValue);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={field.id}>
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={field.id}
        type="number"
        value={value || ""}
        onChange={handleChange}
        placeholder={field.placeholder}
        disabled={disabled}
        min={field.min}
        max={field.max}
        step={field.step || 1}
        className={error ? "border-red-500" : ""}
      />
      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};
