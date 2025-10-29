import { FieldConfig, FieldOption } from "@/types/field";

export const FIELD_TYPES: Record<string, FieldConfig> = {
  dropdown: {
    type: "dropdown",
    label: "Lista Suspensa",
    icon: "ChevronDown",
    description: "Campo de seleção única com opções pré-definidas",
    defaultOptions: [
      { id: "1", label: "Opção 1", value: "opcao1" },
      { id: "2", label: "Opção 2", value: "opcao2" },
      { id: "3", label: "Opção 3", value: "opcao3" },
    ],
    defaultValidation: {
      required: true,
    },
  },
  multidropdown: {
    type: "multidropdown",
    label: "Lista Múltipla",
    icon: "CheckSquare",
    description: "Campo de seleção múltipla com opções pré-definidas",
    defaultOptions: [
      { id: "1", label: "Opção 1", value: "opcao1" },
      { id: "2", label: "Opção 2", value: "opcao2" },
      { id: "3", label: "Opção 3", value: "opcao3" },
    ],
    defaultValidation: {
      required: false,
    },
  },
  text: {
    type: "text",
    label: "Texto",
    icon: "Type",
    description: "Campo de texto livre",
    defaultValidation: {
      minLength: 0,
      maxLength: 255,
    },
  },
  number: {
    type: "number",
    label: "Número Inteiro",
    icon: "Hash",
    description: "Campo numérico para valores inteiros",
    defaultValidation: {
      min: 0,
      max: 999999,
    },
  },
  currency: {
    type: "currency",
    label: "Moeda (R$)",
    icon: "DollarSign",
    description: "Campo monetário em reais",
    defaultValidation: {
      min: 0,
      max: 999999.99,
    },
  },
  date: {
    type: "date",
    label: "Data",
    icon: "Calendar",
    description: "Campo de data",
    defaultValidation: {
      required: true,
    },
  },
};

export const getFieldTypeConfig = (type: string): FieldConfig => {
  return FIELD_TYPES[type] || FIELD_TYPES.text;
};

export const getFieldTypeIcon = (type: string): string => {
  return getFieldTypeConfig(type).icon;
};

export const getFieldTypeLabel = (type: string): string => {
  return getFieldTypeConfig(type).label;
};

export const getFieldTypeDescription = (type: string): string => {
  return getFieldTypeConfig(type).description;
};
