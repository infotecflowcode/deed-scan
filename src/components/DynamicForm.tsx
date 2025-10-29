import { useState, useEffect } from "react";
import { DynamicField, FieldValue, FieldValidationError } from "@/types/field";
import { useDynamicFields } from "@/hooks/useDynamicFields";
import { TextField } from "./fields/TextField";
import { NumberField } from "./fields/NumberField";
import { CurrencyField } from "./fields/CurrencyField";
import { DateField } from "./fields/DateField";
import { DropdownField } from "./fields/DropdownField";
import { MultiDropdownField } from "./fields/MultiDropdownField";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface DynamicFormProps {
  fields: DynamicField[];
  values?: Record<string, any>;
  onChange?: (data: Record<string, any>) => void;
  initialData?: Record<string, any>;
  onSubmit?: (data: Record<string, any>) => void;
  onValidationChange?: (isValid: boolean, errors: FieldValidationError[]) => void;
  disabled?: boolean;
  className?: string;
}

export const DynamicForm = ({
  fields,
  values,
  onChange,
  initialData = {},
  onSubmit,
  onValidationChange,
  disabled = false,
  className = "",
}: DynamicFormProps) => {
  const { validateForm } = useDynamicFields();
  const [formData, setFormData] = useState<Record<string, any>>(values || initialData);
  const [errors, setErrors] = useState<FieldValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Atualizar dados quando values mudarem (modo controlado)
  useEffect(() => {
    if (values !== undefined) {
      setFormData(values);
    }
  }, [values]);

  // Atualizar dados iniciais quando mudarem (modo não controlado)
  useEffect(() => {
    if (values === undefined && initialData) {
      setFormData(initialData);
    }
  }, [initialData, values]);

  // Validar formulário quando dados ou campos mudarem
  useEffect(() => {
    const fieldValues: FieldValue[] = fields.map(field => ({
      fieldId: field.id,
      value: formData[field.id],
      type: field.type,
    }));

    const validationErrors = validateForm(fieldValues);
    setErrors(validationErrors);
    
    if (onValidationChange) {
      onValidationChange(validationErrors.length === 0, validationErrors);
    }
  }, [formData, fields, validateForm, onValidationChange]);

  const handleFieldChange = (fieldId: string, value: any) => {
    const newFormData = {
      ...formData,
      [fieldId]: value,
    };
    
    setFormData(newFormData);
    
    // Chamar onChange se fornecido (modo controlado)
    if (onChange) {
      onChange(newFormData);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (errors.length > 0 || !onSubmit) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: DynamicField) => {
    const value = formData[field.id];
    const fieldError = errors.find(e => e.fieldId === field.id)?.message;

    const commonProps = {
      field,
      value,
      onChange: (newValue: any) => handleFieldChange(field.id, newValue),
      error: fieldError,
      disabled: disabled || isSubmitting,
    };

    switch (field.type) {
      case "text":
        return <TextField {...commonProps} />;
      
      case "number":
        return <NumberField {...commonProps} />;
      
      case "currency":
        return <CurrencyField {...commonProps} />;
      
      case "date":
        return <DateField {...commonProps} />;
      
      case "dropdown":
        return <DropdownField {...commonProps} />;
      
      case "multidropdown":
        return <MultiDropdownField {...commonProps} />;
      
      default:
        return <TextField {...commonProps} />;
    }
  };

  if (fields.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nenhum campo dinâmico configurado para este contrato.</p>
      </div>
    );
  }

  const content = (
    <div className={`space-y-6 ${className}`}>
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>
            Por favor, corrija os erros abaixo antes de continuar.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((field) => (
          <div key={field.id} className="space-y-2">
            {renderField(field)}
          </div>
        ))}
      </div>

      {onSubmit && (
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={disabled || isSubmitting || errors.length > 0}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Salvar
          </button>
        </div>
      )}
    </div>
  );

  return onSubmit ? (
    <form onSubmit={handleSubmit}>
      {content}
    </form>
  ) : (
    content
  );
};
