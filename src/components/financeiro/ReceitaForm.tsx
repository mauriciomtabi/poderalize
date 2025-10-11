import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateReceitaData } from "@/hooks/useReceitas";

interface ReceitaFormProps {
  onSubmit: (receita: CreateReceitaData) => Promise<void>;
  onCancel: () => void;
}

export const ReceitaForm = ({ onSubmit, onCancel }: ReceitaFormProps) => {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [observacoes, setObservacoes] = useState("");

  const categorias = [
    "Serviços",
    "Produtos",
    "Consultoria",
    "Comissões",
    "Investimentos",
    "Outros"
  ];

  const handleSubmit = async () => {
    if (!descricao || !valor || !categoria || !data) {
      return;
    }

    const receitaData: CreateReceitaData = {
      descricao,
      valor: parseFloat(valor),
      categoria,
      data,
      observacoes: observacoes || undefined,
    };

    await onSubmit(receitaData);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="descricao">Descrição *</Label>
        <Input
          id="descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Ex: Pagamento de projeto X"
        />
      </div>

      <div>
        <Label htmlFor="valor">Valor (R$) *</Label>
        <Input
          id="valor"
          type="number"
          step="0.01"
          min="0"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="0.00"
        />
      </div>

      <div>
        <Label htmlFor="categoria">Categoria *</Label>
        <Select value={categoria} onValueChange={setCategoria}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {categorias.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="data">Data *</Label>
        <Input
          id="data"
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Informações adicionais (opcional)"
          rows={3}
        />
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit}>
          Salvar Receita
        </Button>
      </div>
    </div>
  );
};
