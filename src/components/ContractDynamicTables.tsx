import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DynamicTable, DynamicTableValue } from "@/data/mockData";
import { Plus, Trash2, Save, Edit2, Upload } from "lucide-react";

interface ContractDynamicTablesProps {
  tables: DynamicTable[];
  onTablesChange: (tables: DynamicTable[]) => void;
}

export const ContractDynamicTables = ({ tables, onTablesChange }: ContractDynamicTablesProps) => {
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [newTableName, setNewTableName] = useState("");
  const [bulkText, setBulkText] = useState("");

  const editingTable = useMemo(() => tables.find(t => t.id === editingTableId) || null, [tables, editingTableId]);

  const addTable = () => {
    const id = `table-${Date.now()}`;
    const newTable: DynamicTable = { id, name: "", values: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    onTablesChange([...tables, newTable]);
    setEditingTableId(id);
  };

  const updateTable = (id: string, updates: Partial<DynamicTable>) => {
    onTablesChange(tables.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t));
  };

  const deleteTable = (id: string) => {
    onTablesChange(tables.filter(t => t.id !== id));
    if (editingTableId === id) setEditingTableId(null);
  };

  const addValue = (tableId: string) => {
    const newVal: DynamicTableValue = { id: `val-${Date.now()}`, label: "", value: "" };
    onTablesChange(tables.map(t => t.id === tableId ? { ...t, values: [...t.values, newVal] } : t));
  };

  const updateValue = (tableId: string, index: number, key: keyof DynamicTableValue, value: string) => {
    onTablesChange(tables.map(t => t.id === tableId ? {
      ...t,
      values: t.values.map((v, i) => i === index ? { ...v, [key]: value } : v)
    } : t));
  };

  const removeValue = (tableId: string, index: number) => {
    onTablesChange(tables.map(t => t.id === tableId ? {
      ...t,
      values: t.values.filter((_, i) => i !== index)
    } : t));
  };

  const applyBulkValues = (tableId: string) => {
    const lines = bulkText.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    if (lines.length === 0) return;
    const newValues: DynamicTableValue[] = lines.map(line => ({ id: `val-${crypto.randomUUID?.() || Date.now()}`, label: line, value: line }));
    onTablesChange(tables.map(t => t.id === tableId ? { ...t, values: [...t.values, ...newValues] } : t));
    setBulkText("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Tabelas Dinâmicas</h3>
          <p className="text-sm text-muted-foreground">Crie listas reutilizáveis (ex: Navio, Equipamento)</p>
        </div>
        <Button type="button" size="sm" onClick={addTable}>
          <Plus className="w-4 h-4 mr-2" /> Nova Tabela
        </Button>
      </div>

      {tables.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            Nenhuma tabela criada ainda.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tables.map((table) => (
            <Card key={table.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  {editingTableId === table.id ? (
                    <div className="flex-1">
                      <Label htmlFor={`tbl-${table.id}`}>Nome da Tabela</Label>
                      <Input id={`tbl-${table.id}`} value={table.name} onChange={(e) => updateTable(table.id, { name: e.target.value })} placeholder="Ex: Navio" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{table.name || "(sem nome)"}</CardTitle>
                      <Badge variant="secondary">{table.values.length} valores</Badge>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {editingTableId === table.id ? (
                      <Button type="button" size="sm" onClick={() => setEditingTableId(null)}>
                        <Save className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button type="button" size="sm" variant="outline" onClick={() => setEditingTableId(table.id)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    )}
                    <Button type="button" size="sm" variant="destructive" onClick={() => deleteTable(table.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Insira as opções desta tabela. Você pode adicionar manualmente ou colar uma lista.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Valores</Label>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => addValue(table.id)}>
                      <Plus className="w-3 h-3 mr-1" /> Adicionar valor
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setBulkText((prev) => prev)}>
                      <Upload className="w-3 h-3 mr-1" /> Colar em bloco
                    </Button>
                  </div>
                </div>

                {bulkText !== undefined && (
                  <div className="space-y-2">
                    <Textarea
                      placeholder={"Cole uma lista (um por linha) e clique em Aplicar"}
                      value={bulkText}
                      onChange={(e) => setBulkText(e.target.value)}
                      rows={3}
                    />
                    <div className="flex justify-end">
                      <Button type="button" size="sm" onClick={() => applyBulkValues(table.id)} disabled={!bulkText.trim()}>
                        Aplicar
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {table.values.map((v, idx) => (
                    <div key={v.id} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <Input placeholder="Label" value={v.label} onChange={(e) => updateValue(table.id, idx, "label", e.target.value)} />
                      <Input placeholder="Valor" value={v.value} onChange={(e) => updateValue(table.id, idx, "value", e.target.value)} />
                      <div className="flex items-center justify-end">
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeValue(table.id, idx)} className="h-8 w-8">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {table.values.length === 0 && (
                    <p className="text-sm text-muted-foreground">Nenhum valor adicionado.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};



