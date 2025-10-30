import { useState, useEffect, useCallback } from "react";
import { DynamicField, FieldValue, FieldValidationError } from "@/types/field";
import { useAuth } from "@/contexts/AuthContext";

const STORAGE_KEY = "dynamic_fields";

export const useDynamicFields = () => {
  const { currentContract } = useAuth();
  const [fields, setFields] = useState<DynamicField[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar campos do localStorage e do contrato
  const loadFields = useCallback(() => {
    try {
      let contractFields: DynamicField[] = [];
      
      // 1. Buscar campos do contrato atual (se existir)
      if (currentContract?.dynamicFields && currentContract.dynamicFields.length > 0) {
        contractFields = [...currentContract.dynamicFields];
        console.log("🔍 Campos carregados do contrato:", contractFields);
      }
      
      // 2. Buscar campos do localStorage (se não há campos no contrato)
      if (contractFields.length === 0) {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const allFields: DynamicField[] = JSON.parse(stored);
          contractFields = allFields.filter(
            field => field.contractId === currentContract?.id
          );
          console.log("🔍 Campos carregados do localStorage:", contractFields);
        }
      }
      
      setFields(contractFields.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error("Erro ao carregar campos dinâmicos:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentContract?.id, currentContract?.dynamicFields]);

  // Salvar campos no localStorage
  const saveFields = useCallback((newFields: DynamicField[]) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let allFields: DynamicField[] = stored ? JSON.parse(stored) : [];
      
      // Remover campos antigos do contrato atual
      allFields = allFields.filter(field => field.contractId !== currentContract?.id);
      
      // Adicionar novos campos
      allFields.push(...newFields);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allFields));
      setFields(newFields.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error("Erro ao salvar campos dinâmicos:", error);
    }
  }, [currentContract?.id]);

  // Adicionar novo campo
  const addField = useCallback((field: Omit<DynamicField, "id" | "createdAt" | "updatedAt" | "contractId">) => {
    const newField: DynamicField = {
      ...field,
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contractId: currentContract?.id || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedFields = [...fields, newField];
    saveFields(updatedFields);
    return newField;
  }, [fields, saveFields, currentContract?.id]);

  // Atualizar campo existente
  const updateField = useCallback((fieldId: string, updates: Partial<DynamicField>) => {
    const updatedFields = fields.map(field =>
      field.id === fieldId
        ? { ...field, ...updates, updatedAt: new Date().toISOString() }
        : field
    );
    saveFields(updatedFields);
  }, [fields, saveFields]);

  // Remover campo
  const removeField = useCallback((fieldId: string) => {
    const updatedFields = fields.filter(field => field.id !== fieldId);
    saveFields(updatedFields);
  }, [fields, saveFields]);

  // Reordenar campos
  const reorderFields = useCallback((fieldIds: string[]) => {
    const updatedFields = fieldIds.map((fieldId, index) => {
      const field = fields.find(f => f.id === fieldId);
      return field ? { ...field, order: index, updatedAt: new Date().toISOString() } : null;
    }).filter(Boolean) as DynamicField[];
    
    saveFields(updatedFields);
  }, [fields, saveFields]);

  // Validar valor de campo
  const validateFieldValue = useCallback((field: DynamicField, value: any): FieldValidationError | null => {
    // Campo obrigatório vazio
    if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
      return {
        fieldId: field.id,
        message: `${field.label} é obrigatório`,
      };
    }

    // Se não tem valor e não é obrigatório, está válido
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return null;
    }

    // Validações específicas por tipo
    switch (field.type) {
      case "text":
        if (field.validation?.minLength && value.length < field.validation.minLength) {
          return {
            fieldId: field.id,
            message: `${field.label} deve ter pelo menos ${field.validation.minLength} caracteres`,
          };
        }
        if (field.validation?.maxLength && value.length > field.validation.maxLength) {
          return {
            fieldId: field.id,
            message: `${field.label} deve ter no máximo ${field.validation.maxLength} caracteres`,
          };
        }
        break;

      case "number":
      case "currency":
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          return {
            fieldId: field.id,
            message: `${field.label} deve ser um número válido`,
          };
        }
        if (field.min !== undefined && numValue < field.min) {
          return {
            fieldId: field.id,
            message: `${field.label} deve ser maior ou igual a ${field.min}`,
          };
        }
        if (field.max !== undefined && numValue > field.max) {
          return {
            fieldId: field.id,
            message: `${field.label} deve ser menor ou igual a ${field.max}`,
          };
        }
        break;

      case "date":
        const dateValue = new Date(value);
        if (isNaN(dateValue.getTime())) {
          return {
            fieldId: field.id,
            message: `${field.label} deve ser uma data válida`,
          };
        }
        break;
    }

    return null;
  }, []);

  // Validar todos os campos
  const validateForm = useCallback((formData: FieldValue[]): FieldValidationError[] => {
    const errors: FieldValidationError[] = [];
    
    formData.forEach(fieldValue => {
      const field = fields.find(f => f.id === fieldValue.fieldId);
      if (field) {
        const error = validateFieldValue(field, fieldValue.value);
        if (error) {
          errors.push(error);
        }
      }
    });

    return errors;
  }, [fields, validateFieldValue]);

  // Carregar campos quando o contrato muda
  useEffect(() => {
    if (currentContract?.id) {
      loadFields();
    } else {
      setFields([]);
      setIsLoading(false);
    }
  }, [currentContract?.id, loadFields]);

  return {
    fields: fields.filter(field => field.isActive),
    allFields: fields,
    isLoading,
    addField,
    updateField,
    removeField,
    reorderFields,
    validateFieldValue,
    validateForm,
    loadFields,
  };
};
