import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ServicoUnico } from "@/hooks/useClientes";

interface ServicosUnicosFormProps {
  value: ServicoUnico;
  onChange: (servicos: ServicoUnico) => void;
}

export const ServicosUnicosForm = ({ value, onChange }: ServicosUnicosFormProps) => {
  const [servicos, setServicos] = useState<ServicoUnico>(value || {});

  const updateServico = (tipo: keyof ServicoUnico, updates: any) => {
    const updated = {
      ...servicos,
      [tipo]: {
        ...servicos[tipo],
        ...updates
      }
    };
    setServicos(updated);
    onChange(updated);
  };

  const selectedCount = [
    servicos.criacao_site?.selecionado,
    servicos.identidade_visual?.selecionado,
    servicos.plataforma_vendas?.selecionado,
    servicos.outros?.selecionado,
  ].filter(Boolean).length;

  const totalValue = [
    servicos.criacao_site?.selecionado ? (servicos.criacao_site?.valor || 0) : 0,
    servicos.identidade_visual?.selecionado ? (servicos.identidade_visual?.valor || 0) : 0,
    servicos.plataforma_vendas?.selecionado ? (servicos.plataforma_vendas?.valor || 0) : 0,
    servicos.outros?.selecionado ? (servicos.outros?.valor || 0) : 0,
  ].reduce((sum, val) => sum + val, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-primary">SERVIÇOS ÚNICOS (SEM RECORRÊNCIA)</h3>
          <p className="text-sm text-muted-foreground">Estes valores não são somados ao valor do fechamento</p>
        </div>
        {selectedCount > 0 && (
          <div className="text-right">
            <Badge variant="secondary" className="mb-1">
              {selectedCount} {selectedCount === 1 ? 'serviço' : 'serviços'}
            </Badge>
            <p className="text-sm font-semibold">
              Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
            </p>
          </div>
        )}
      </div>

      {/* Criação de Site */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="site-check" className="text-base font-semibold cursor-pointer">
            Criação de Site
          </Label>
          <Switch
            id="site-check"
            checked={servicos.criacao_site?.selecionado || false}
            onCheckedChange={(checked) => updateServico('criacao_site', { selecionado: checked as boolean })}
          />
        </div>
        
        {servicos.criacao_site?.selecionado && (
          <div className="pt-2 border-t">
            <Label htmlFor="site-valor">Valor (R$)</Label>
            <Input
              id="site-valor"
              type="number"
              step="0.01"
              value={servicos.criacao_site?.valor || ""}
              onChange={(e) => updateServico('criacao_site', { valor: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
          </div>
        )}
      </Card>

      {/* Identidade Visual */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="identidade-check" className="text-base font-semibold cursor-pointer">
            Identidade Visual
          </Label>
          <Switch
            id="identidade-check"
            checked={servicos.identidade_visual?.selecionado || false}
            onCheckedChange={(checked) => updateServico('identidade_visual', { selecionado: checked as boolean })}
          />
        </div>
        
        {servicos.identidade_visual?.selecionado && (
          <div className="pt-2 border-t">
            <Label htmlFor="identidade-valor">Valor (R$)</Label>
            <Input
              id="identidade-valor"
              type="number"
              step="0.01"
              value={servicos.identidade_visual?.valor || ""}
              onChange={(e) => updateServico('identidade_visual', { valor: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
          </div>
        )}
      </Card>

      {/* Plataforma de Vendas Online */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="plataforma-check" className="text-base font-semibold cursor-pointer">
            Plataforma de Vendas On-line
          </Label>
          <Switch
            id="plataforma-check"
            checked={servicos.plataforma_vendas?.selecionado || false}
            onCheckedChange={(checked) => updateServico('plataforma_vendas', { selecionado: checked as boolean })}
          />
        </div>
        
        {servicos.plataforma_vendas?.selecionado && (
          <div className="pt-2 border-t">
            <Label htmlFor="plataforma-valor">Valor (R$)</Label>
            <Input
              id="plataforma-valor"
              type="number"
              step="0.01"
              value={servicos.plataforma_vendas?.valor || ""}
              onChange={(e) => updateServico('plataforma_vendas', { valor: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
          </div>
        )}
      </Card>

      {/* Outros */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="outros-check" className="text-base font-semibold cursor-pointer">
            Outros
          </Label>
          <Switch
            id="outros-check"
            checked={servicos.outros?.selecionado || false}
            onCheckedChange={(checked) => updateServico('outros', { selecionado: checked as boolean })}
          />
        </div>
        
        {servicos.outros?.selecionado && (
          <div className="space-y-3 pt-2 border-t">
            <div>
              <Label htmlFor="outros-desc">Descrição do Serviço</Label>
              <Input
                id="outros-desc"
                value={servicos.outros?.descricao || ""}
                onChange={(e) => updateServico('outros', { descricao: e.target.value })}
                placeholder="Ex: Landing pages, etc."
              />
            </div>
            <div>
              <Label htmlFor="outros-valor">Valor (R$)</Label>
              <Input
                id="outros-valor"
                type="number"
                step="0.01"
                value={servicos.outros?.valor || ""}
                onChange={(e) => updateServico('outros', { valor: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
