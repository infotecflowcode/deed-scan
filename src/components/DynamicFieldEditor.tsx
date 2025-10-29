import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DynamicField, FieldType, FieldOption } from "@/types/field";
import { useDynamicFields } from "@/hooks/useDynamicFields";
import { getFieldTypeConfig, FIELD_TYPES } from "@/lib/fieldTypes";
import { Plus, Trash2, Edit, GripVertical, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DynamicFieldEditorProps {
  onFieldsChange?: (fields: DynamicField[]) => void;
}

export const DynamicFieldEditor = ({ onFieldsChange }: DynamicFieldEditorProps) => {
  const { allFields, addField, updateField, removeField, reorderFields } = useDynamicFields();
  const { toast } = useToast();
  const [editingField, setEditingField] = useState<DynamicField | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Estado do formulário de edição
  const [formData, setFormData] = useState({
    name: "",
    label: "",
    type: "text" as FieldType,
    required: false,
    placeholder: "",
    description: "",
    options: [] as FieldOption[],
    min: undefined as number | undefined,
    max: undefined as number | undefined,
    step: undefined as number | undefined,
    validation: {
      minLength: undefined as number | undefined,
      maxLength: undefined as number | undefined,
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      label: "",
      type: "text",
      required: false,
      placeholder: "",
      description: "",
      options: [],
      min: undefined,
      max: undefined,
      step: undefined,
      validation: {
        minLength: undefined,
        maxLength: undefined,
      },
    });
    setEditingField(null);
    setIsCreating(false);
  };

  const startCreating = () => {
    resetForm();
    setIsCreating(true);
  };

  const startEditing = (field: DynamicField) => {
    setFormData({
      name: field.name,
      label: field.label,
      type: field.type,
      required: field.required,
      placeholder: field.placeholder || "",
      description: field.description || "",
      options: field.options || [],
      min: field.min,
      max: field.max,
      step: field.step,
      validation: {
        minLength: field.validation?.minLength,
        maxLength: field.validation?.maxLength,
      },
    });
    setEditingField(field);
    setIsCreating(true);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.label.trim()) {
      toast({
        title: "Erro",
        description: "Nome e label são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if ((formData.type === "dropdown" || formData.type === "multidropdown") && formData.options.length === 0) {
      toast({
        title: "Erro",
        description: "Campos de seleção precisam ter pelo menos uma opção",
        variant: "destructive",
      });
      return;
    }

    const fieldData = {
      name: formData.name.trim(),
      label: formData.label.trim(),
      type: formData.type,
      required: formData.required,
      placeholder: formData.placeholder.trim() || undefined,
      description: formData.description.trim() || undefined,
      options: formData.options.length > 0 ? formData.options : undefined,
      min: formData.min,
      max: formData.max,
      step: formData.step,
      validation: {
        minLength: formData.validation.minLength,
        maxLength: formData.validation.maxLength,
      },
      order: allFields.length,
      isActive: true,
    };

    if (editingField) {
      updateField(editingField.id, fieldData);
      toast({
        title: "Sucesso",
        description: "Campo atualizado com sucesso",
      });
    } else {
      addField(fieldData);
      toast({
        title: "Sucesso",
        description: "Campo criado com sucesso",
      });
    }

    resetForm();
    onFieldsChange?.(allFields);
  };

  const handleAddOption = () => {
    const newOption: FieldOption = {
      id: `option_${Date.now()}`,
      label: "",
      value: "",
    };
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, newOption],
    }));
  };

  const handleUpdateOption = (index: number, field: keyof FieldOption, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) =>
        i === index ? { ...option, [field]: value } : option
      ),
    }));
  };

  const handleRemoveOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handleTypeChange = (type: FieldType) => {
    const config = getFieldTypeConfig(type);
    setFormData(prev => ({
      ...prev,
      type,
      options: config.defaultOptions || [],
      validation: config.defaultValidation || {},
    }));
  };

  const toggleFieldActive = (field: DynamicField) => {
    updateField(field.id, { isActive: !field.isActive });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Campos Dinâmicos</h2>
          <p className="text-muted-foreground">
            Configure campos personalizados para o formulário de atividades
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showPreview ? "Ocultar Preview" : "Mostrar Preview"}
          </Button>
          <Button onClick={startCreating}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Campo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de Campos */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Campos Configurados</h3>
          {allFields.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  Nenhum campo configurado ainda.
                </p>
                <Button onClick={startCreating} className="mt-4">
                  Criar Primeiro Campo
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {allFields.map((field) => (
                <Card key={field.id} className={!field.isActive ? "opacity-50" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={field.isActive ? "default" : "secondary"}>
                            {getFieldTypeConfig(field.type).label}
                          </Badge>
                          <span className="font-medium">{field.label}</span>
                          {field.required && (
                            <span className="text-red-500 text-sm">*</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {field.description || field.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFieldActive(field)}
                        >
                          {field.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEditing(field)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeField(field.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Formulário de Edição */}
        {isCreating && (
          <Card>
            <CardHeader>
              <CardTitle>
                {editingField ? "Editar Campo" : "Novo Campo"}
              </CardTitle>
              <CardDescription>
                Configure as propriedades do campo dinâmico
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome do Campo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="ex: cliente_nome"
                  />
                </div>
                <div>
                  <Label htmlFor="label">Label</Label>
                  <Input
                    id="label"
                    value={formData.label}
                    onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="ex: Nome do Cliente"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="type">Tipo do Campo</Label>
                <Select value={formData.type} onValueChange={handleTypeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(FIELD_TYPES).map((config) => (
                      <SelectItem key={config.type} value={config.type}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="placeholder">Placeholder</Label>
                  <Input
                    id="placeholder"
                    value={formData.placeholder}
                    onChange={(e) => setFormData(prev => ({ ...prev, placeholder: e.target.value }))}
                    placeholder="Texto de ajuda"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="required"
                    checked={formData.required}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, required: !!checked }))}
                  />
                  <Label htmlFor="required">Campo obrigatório</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição do campo (opcional)"
                />
              </div>

              {/* Opções para dropdown e multidropdown */}
              {(formData.type === "dropdown" || formData.type === "multidropdown") && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Opções</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddOption}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Opção
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.options.map((option, index) => (
                      <div key={option.id} className="flex gap-2">
                        <Input
                          placeholder="Label da opção"
                          value={option.label}
                          onChange={(e) => handleUpdateOption(index, "label", e.target.value)}
                        />
                        <Input
                          placeholder="Valor"
                          value={option.value}
                          onChange={(e) => handleUpdateOption(index, "value", e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveOption(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Validações para campos numéricos */}
              {(formData.type === "number" || formData.type === "currency") && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="min">Valor Mínimo</Label>
                    <Input
                      id="min"
                      type="number"
                      value={formData.min || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, min: e.target.value ? Number(e.target.value) : undefined }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max">Valor Máximo</Label>
                    <Input
                      id="max"
                      type="number"
                      value={formData.max || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, max: e.target.value ? Number(e.target.value) : undefined }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="step">Incremento</Label>
                    <Input
                      id="step"
                      type="number"
                      value={formData.step || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, step: e.target.value ? Number(e.target.value) : undefined }))}
                    />
                  </div>
                </div>
              )}

              {/* Validações para campos de texto */}
              {formData.type === "text" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minLength">Tamanho Mínimo</Label>
                    <Input
                      id="minLength"
                      type="number"
                      value={formData.validation.minLength || ""}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        validation: { 
                          ...prev.validation, 
                          minLength: e.target.value ? Number(e.target.value) : undefined 
                        } 
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxLength">Tamanho Máximo</Label>
                    <Input
                      id="maxLength"
                      type="number"
                      value={formData.validation.maxLength || ""}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        validation: { 
                          ...prev.validation, 
                          maxLength: e.target.value ? Number(e.target.value) : undefined 
                        } 
                      }))}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  {editingField ? "Atualizar" : "Criar"} Campo
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
