import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateCartaoData } from "@/hooks/useCartoes";

interface CartaoFormProps {
  onSubmit: (cartao: CreateCartaoData) => Promise<void>;
  onCancel: () => void;
}

export const CartaoForm = ({ onSubmit, onCancel }: CartaoFormProps) => {
  const [formData, setFormData] = useState({
    nome: '',
    bandeira: '',
    ultimos_digitos: '',
    limite: '',
    dia_fechamento: '10',
    dia_vencimento: '15',
    cor: '#3B82F6',
    ativo: true,
  });

  const bandeiras = [
    "Visa",
    "Mastercard",
    "Elo",
    "American Express",
    "Hipercard",
    "Diners",
    "Outros"
  ];

  const handleSubmit = async () => {
    if (!formData.nome || !formData.bandeira) {
      return;
    }

    await onSubmit({
      nome: formData.nome,
      bandeira: formData.bandeira,
      ultimos_digitos: formData.ultimos_digitos || undefined,
      limite: parseFloat(formData.limite) || 0,
      dia_fechamento: parseInt(formData.dia_fechamento),
      dia_vencimento: parseInt(formData.dia_vencimento),
      cor: formData.cor,
      ativo: formData.ativo,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="nome">Nome do Cartão *</Label>
        <Input
          id="nome"
          value={formData.nome}
          onChange={(e) => setFormData({...formData, nome: e.target.value})}
          placeholder="Ex: Nubank Mastercard"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="bandeira">Bandeira *</Label>
          <Select
            value={formData.bandeira}
            onValueChange={(value) => setFormData({...formData, bandeira: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {bandeiras.map(band => (
                <SelectItem key={band} value={band.toLowerCase()}>{band}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="ultimos_digitos">Últimos 4 Dígitos</Label>
          <Input
            id="ultimos_digitos"
            value={formData.ultimos_digitos}
            onChange={(e) => setFormData({...formData, ultimos_digitos: e.target.value})}
            placeholder="1234"
            maxLength={4}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="limite">Limite (R$)</Label>
        <Input
          id="limite"
          type="number"
          step="0.01"
          value={formData.limite}
          onChange={(e) => setFormData({...formData, limite: e.target.value})}
          placeholder="0.00"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dia_fechamento">Dia de Fechamento</Label>
          <Select
            value={formData.dia_fechamento}
            onValueChange={(value) => setFormData({...formData, dia_fechamento: value})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({length: 28}, (_, i) => i + 1).map(day => (
                <SelectItem key={day} value={day.toString()}>
                  Dia {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="dia_vencimento">Dia de Vencimento</Label>
          <Select
            value={formData.dia_vencimento}
            onValueChange={(value) => setFormData({...formData, dia_vencimento: value})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({length: 28}, (_, i) => i + 1).map(day => (
                <SelectItem key={day} value={day.toString()}>
                  Dia {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={handleSubmit}>Cadastrar Cartão</Button>
      </div>
    </div>
  );
};
