export type FieldType = 
  | "dropdown" 
  | "multidropdown" 
  | "text" 
  | "number" 
  | "currency" 
  | "date";

export interface FieldOption {
  id: string;
  label: string;
  value: string;
}

export interface DynamicField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  description?: string;
  options?: FieldOption[]; // Para dropdown e multidropdown
  min?: number; // Para number e currency
  max?: number; // Para number e currency
  step?: number; // Para number e currency
  defaultValue?: any;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    customMessage?: string;
  };
  order: number;
  isActive: boolean;
  contractId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FieldValue {
  fieldId: string;
  value: any;
  type: FieldType;
}

export interface DynamicFormData {
  [fieldId: string]: any;
}

export interface FieldValidationError {
  fieldId: string;
  message: string;
}

export interface FieldConfig {
  type: FieldType;
  label: string;
  icon: string;
  description: string;
  defaultOptions?: FieldOption[];
  defaultValidation?: any;
}
