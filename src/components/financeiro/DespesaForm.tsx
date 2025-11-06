import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateDespesaData } from "@/hooks/useDespesas";
import { useContas } from "@/hooks/useContas";
import { useCartoes } from "@/hooks/useCartoes";

interface DespesaFormProps {
  onSubmit: (despesa: CreateDespesaData) => Promise<void>;
  onCancel: () => void;
}

export const DespesaForm = ({ onSubmit, onCancel }: DespesaFormProps) => {
  const { contas } = useContas();
  const { cartoes } = useCartoes();
  
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    categoria: '',
    data: new Date().toISOString().split('T')[0],
    observacoes: '',
    forma_pagamento: 'dinheiro',
    conta_id: null as string | null,
    cartao_credito_id: null as string | null,
    parcelas: 1,
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

    if (formData.forma_pagamento === 'cartao_credito' && !formData.cartao_credito_id) {
      return;
    }

    await onSubmit({
      descricao: formData.descricao,
      valor: parseFloat(formData.valor),
      categoria: formData.categoria,
      data: formData.data,
      observacoes: formData.observacoes || undefined,
      forma_pagamento: formData.forma_pagamento,
      conta_id: formData.conta_id,
      cartao_credito_id: formData.cartao_credito_id,
      parcelas: formData.parcelas,
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
        <Label htmlFor="forma_pagamento">Forma de Pagamento *</Label>
        <Select
          value={formData.forma_pagamento}
          onValueChange={(value) => setFormData({
            ...formData, 
            forma_pagamento: value,
            conta_id: value === 'cartao_credito' ? null : formData.conta_id,
            cartao_credito_id: value !== 'cartao_credito' ? null : formData.cartao_credito_id,
            parcelas: value !== 'cartao_credito' ? 1 : formData.parcelas,
          })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dinheiro">Dinheiro</SelectItem>
            <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
            <SelectItem value="pix">PIX</SelectItem>
            <SelectItem value="debito">Débito</SelectItem>
            <SelectItem value="transferencia">Transferência</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.forma_pagamento !== 'cartao_credito' && (
        <div>
          <Label htmlFor="conta_id">Conta Bancária</Label>
          <Select
            value={formData.conta_id || ''}
            onValueChange={(value) => setFormData({...formData, conta_id: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a conta" />
            </SelectTrigger>
            <SelectContent>
              {contas.filter(c => c.ativa).map(conta => (
                <SelectItem key={conta.id} value={conta.id}>
                  {conta.nome} - {conta.banco}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {formData.forma_pagamento === 'cartao_credito' && (
        <>
          <div>
            <Label htmlFor="cartao_credito_id">Cartão de Crédito *</Label>
            <Select
              value={formData.cartao_credito_id || ''}
              onValueChange={(value) => setFormData({...formData, cartao_credito_id: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cartão" />
              </SelectTrigger>
              <SelectContent>
                {cartoes.filter(c => c.ativo).map(cartao => (
                  <SelectItem key={cartao.id} value={cartao.id}>
                    {cartao.nome} {cartao.ultimos_digitos ? `•••• ${cartao.ultimos_digitos}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="parcelas">Número de Parcelas</Label>
            <Select
              value={formData.parcelas.toString()}
              onValueChange={(value) => setFormData({...formData, parcelas: parseInt(value)})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({length: 12}, (_, i) => i + 1).map(num => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}x de R$ {(parseFloat(formData.valor || '0') / num).toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}

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
