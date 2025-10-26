import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { usePlanos, TipoPlano, UpdatePlanoData } from "@/hooks/usePlanos";

interface EditPlanoDialogProps {
  planoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const tiposPlano = [
  { value: 'social_media', label: 'Social Mídia' },
  { value: 'trafego_pago', label: 'Tráfego Pago' },
  { value: 'treinamento_vendas', label: 'Treinamento de Vendas' },
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'assinatura_jornada', label: 'Assinatura Jornada Poderalize' },
  { value: 'criacao_site', label: 'Criação de Site' },
  { value: 'identidade_visual', label: 'Identidade Visual' },
  { value: 'plataforma_vendas', label: 'Plataforma de Vendas On-line' },
];

export function EditPlanoDialog({ planoId, open, onOpenChange }: EditPlanoDialogProps) {
  const { planos, updatePlano } = usePlanos();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<UpdatePlanoData>({
    nome: '',
    tipo: 'social_media',
    descricao: '',
    ativo: true,
    configuracoes: {},
    valor_sugerido: undefined,
    modo_pagamento_padrao: 'dinheiro',
  });

  useEffect(() => {
    const plano = planos.find(p => p.id === planoId);
    if (plano) {
      setFormData({
        nome: plano.nome,
        tipo: plano.tipo,
        descricao: plano.descricao,
        ativo: plano.ativo,
        configuracoes: plano.configuracoes,
        valor_sugerido: plano.valor_sugerido,
        modo_pagamento_padrao: plano.modo_pagamento_padrao,
      });
    }
  }, [planoId, planos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const success = await updatePlano(planoId, formData);
    if (success) {
      onOpenChange(false);
    }
    
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Plano</DialogTitle>
            <DialogDescription>
              Atualize as características do plano de serviço
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="nome">Nome do Plano *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Básico, Premium, Corporativo..."
                required
              />
            </div>

            <div>
              <Label htmlFor="tipo">Tipo de Serviço *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: TipoPlano) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tiposPlano.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descreva o que está incluído neste plano"
                rows={3}
              />
            </div>

            {formData.tipo === 'social_media' && (
              <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                <h4 className="font-semibold">Configurações - Social Mídia</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Qtde Feed</Label>
                    <Input
                      type="number"
                      value={formData.configuracoes?.qtde_feed || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        configuracoes: { ...formData.configuracoes, qtde_feed: parseInt(e.target.value) || 0 }
                      })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Qtde Reels</Label>
                    <Input
                      type="number"
                      value={formData.configuracoes?.qtde_reels || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        configuracoes: { ...formData.configuracoes, qtde_reels: parseInt(e.target.value) || 0 }
                      })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Stories/Semana</Label>
                    <Input
                      type="number"
                      value={formData.configuracoes?.stories_semanais || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        configuracoes: { ...formData.configuracoes, stories_semanais: parseInt(e.target.value) || 0 }
                      })}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.tipo === 'trafego_pago' && (
              <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                <h4 className="font-semibold">Configurações - Tráfego Pago</h4>
                <div>
                  <Label>Qtde de Campanhas</Label>
                  <Input
                    type="number"
                    value={formData.configuracoes?.qtde_campanhas || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      configuracoes: { ...formData.configuracoes, qtde_campanhas: parseInt(e.target.value) || 0 }
                    })}
                    placeholder="0"
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="valor">Valor Sugerido (R$)</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={formData.valor_sugerido || ''}
                onChange={(e) => setFormData({ ...formData, valor_sugerido: parseFloat(e.target.value) || undefined })}
                placeholder="0,00"
              />
            </div>

            <div>
              <Label>Modo de Pagamento Padrão</Label>
              <Select
                value={formData.modo_pagamento_padrao}
                onValueChange={(value: 'dinheiro' | 'permuta' | 'dinheiro_permuta') =>
                  setFormData({ ...formData, modo_pagamento_padrao: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="permuta">Permuta</SelectItem>
                  <SelectItem value="dinheiro_permuta">Dinheiro + Permuta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <Label htmlFor="ativo" className="cursor-pointer">Plano Ativo</Label>
              <Switch
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.nome}>
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
