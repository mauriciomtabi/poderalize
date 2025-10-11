import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateDespesaData } from "@/hooks/useDespesas";

interface DespesaFormProps {
  onSubmit: (despesa: CreateDespesaData) => Promise<void>;
  onCancel: () => void;
}

export const DespesaForm = ({ onSubmit, onCancel }: DespesaFormProps) => {
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    categoria: '',
    data: new Date().toISOString().split('T')[0],
    observacoes: ''
  });

  const categorias = [
    "Infraestrutura",
    "Marketing",
    "Impostos",
    "Fornecedores",
    "Manutenção",
    "Viagens",
    "Software/Ferramentas",
    "Outros"
  ];

  const handleSubmit = async () => {
    if (!formData.descricao || !formData.valor || !formData.categoria) {
      return;
    }

    await onSubmit({
      descricao: formData.descricao,
      valor: parseFloat(formData.valor),
      categoria: formData.categoria,
      data: formData.data,
      observacoes: formData.observacoes || undefined,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="descricao">Descrição *</Label>
        <Input
          id="descricao"
          value={formData.descricao}
          onChange={(e) => setFormData({...formData, descricao: e.target.value})}
          placeholder="Ex: Aluguel do escritório"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="valor">Valor (R$) *</Label>
          <Input
            id="valor"
            type="number"
            step="0.01"
            value={formData.valor}
            onChange={(e) => setFormData({...formData, valor: e.target.value})}
            placeholder="0.00"
          />
        </div>
        <div>
          <Label htmlFor="categoria">Categoria *</Label>
          <Select
            value={formData.categoria}
            onValueChange={(value) => setFormData({...formData, categoria: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {categorias.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="data">Data *</Label>
        <Input
          id="data"
          type="date"
          value={formData.data}
          onChange={(e) => setFormData({...formData, data: e.target.value})}
        />
      </div>

      <div>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={formData.observacoes}
          onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
          placeholder="Detalhes adicionais (opcional)"
          rows={3}
        />
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={handleSubmit}>Salvar Despesa</Button>
      </div>
    </div>
  );
};
