import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ServicoRecorrente } from "@/hooks/useClientes";
import { usePlanos, TipoPlano } from "@/hooks/usePlanos";

interface ServicosRecorrentesFormProps {
  value: ServicoRecorrente;
  onChange: (servicos: ServicoRecorrente) => void;
  onTotalChange: (total: number) => void;
}

export const ServicosRecorrentesForm = ({ value, onChange, onTotalChange }: ServicosRecorrentesFormProps) => {
  const [servicos, setServicos] = useState<ServicoRecorrente>(value || {});
  const { planos } = usePlanos();

  // Helper to format currency
  const formatCurrency = (value?: number) => {
    if (!value) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Calculate total whenever services change
  useEffect(() => {
    const total = [
      servicos.social_media?.ativo ? (servicos.social_media?.valor || 0) : 0,
      servicos.trafego_pago?.ativo ? (servicos.trafego_pago?.valor || 0) : 0,
      servicos.treinamento_vendas?.ativo ? (servicos.treinamento_vendas?.valor || 0) : 0,
      servicos.google_ads?.ativo ? (servicos.google_ads?.valor || 0) : 0,
      servicos.assinatura_jornada?.ativo ? (servicos.assinatura_jornada?.valor || 0) : 0,
    ].reduce((sum, val) => sum + val, 0);
    
    onTotalChange(total);
  }, [servicos, onTotalChange]);

  const updateServico = (tipo: keyof ServicoRecorrente, updates: any) => {
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

  const handleSelectPlano = (tipoServico: keyof ServicoRecorrente, planoId: string) => {
    if (planoId === 'personalizado') {
      return;
    }

    const planoSelecionado = planos.find(p => p.id === planoId);
    if (!planoSelecionado) return;

    const configuracoes = planoSelecionado.configuracoes;
    
    let updates: any = {
      plano: planoSelecionado.descricao || planoSelecionado.nome,
      modo_pagamento: planoSelecionado.modo_pagamento_padrao,
      valor: planoSelecionado.valor_sugerido || 0,
    };

    // Configurações específicas por tipo
    if (tipoServico === 'social_media') {
      updates = {
        ...updates,
        qtde_feed: configuracoes.qtde_feed || 0,
        qtde_reels: configuracoes.qtde_reels || 0,
        qtde_stories_semanais: configuracoes.stories_semanais || 0,
      };
    } else if (tipoServico === 'trafego_pago') {
      updates = {
        ...updates,
        qtde_campanhas: configuracoes.qtde_campanhas || 0,
      };
    } else if (tipoServico === 'google_ads') {
      updates = {
        ...updates,
        qtde_campanhas: configuracoes.qtde_campanhas || 0,
      };
    } else if (tipoServico === 'treinamento_vendas') {
      updates = {
        ...updates,
        periodo: configuracoes.periodo || '',
      };
    } else if (tipoServico === 'assinatura_jornada') {
      updates = {
        ...updates,
        periodo: configuracoes.periodo || '',
      };
    }

    updateServico(tipoServico, updates);
  };

  const getPlanosByTipo = (tipo: TipoPlano) => {
    return planos.filter(p => p.tipo === tipo && p.ativo);
  };

  const activeCount = [
    servicos.social_media?.ativo,
    servicos.trafego_pago?.ativo,
    servicos.treinamento_vendas?.ativo,
    servicos.google_ads?.ativo,
    servicos.assinatura_jornada?.ativo,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-primary">SERVIÇOS RECORRENTES</h3>
        {activeCount > 0 && (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            {activeCount} {activeCount === 1 ? 'serviço ativo' : 'serviços ativos'}
          </Badge>
        )}
      </div>

      {/* Social Mídia */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="social-media-toggle" className="text-base font-semibold">Social Mídia</Label>
          <Switch
            id="social-media-toggle"
            checked={servicos.social_media?.ativo || false}
            onCheckedChange={(checked) => updateServico('social_media', { ativo: checked })}
          />
        </div>
        
        {servicos.social_media?.ativo && (
          <div className="space-y-3 pt-2 border-t">
            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <Label htmlFor="sm-plano-template">Aplicar Plano Padrão (Opcional)</Label>
              <Select
                onValueChange={(value) => handleSelectPlano('social_media', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um plano ou personalize" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personalizado">
                    ✏️ Personalizado
                  </SelectItem>
                  {getPlanosByTipo('social_media').map(plano => (
                    <SelectItem key={plano.id} value={plano.id}>
                      {plano.nome} - {formatCurrency(plano.valor_sugerido)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Selecione um plano para preencher automaticamente os campos abaixo
              </p>
            </div>
            <div>
              <Label htmlFor="sm-plano">Descrição do Plano</Label>
              <Textarea
                id="sm-plano"
                value={servicos.social_media?.plano || ""}
                onChange={(e) => updateServico('social_media', { plano: e.target.value })}
                placeholder="Descrição do plano para o cliente"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="sm-modo">Modo de Pagamento</Label>
                <Select
                  value={servicos.social_media?.modo_pagamento || 'dinheiro'}
                  onValueChange={(value: 'dinheiro' | 'permuta' | 'dinheiro_permuta') =>
                    updateServico('social_media', { modo_pagamento: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="permuta">Permuta</SelectItem>
                    <SelectItem value="dinheiro_permuta">Dinheiro + Permuta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {servicos.social_media?.modo_pagamento === 'dinheiro_permuta' ? (
              <>
                <div>
                  <Label htmlFor="sm-valor-permuta">Valor da Permuta (R$)</Label>
                  <Input
                    id="sm-valor-permuta"
                    type="number"
                    step="0.01"
                    value={servicos.social_media?.valor_permuta || ""}
                    onChange={(e) => {
                      const valorPermuta = parseFloat(e.target.value) || 0;
                      const valorDinheiro = servicos.social_media?.valor_dinheiro || 0;
                      updateServico('social_media', { 
                        valor_permuta: valorPermuta,
                        valor: valorPermuta + valorDinheiro
                      });
                    }}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="sm-valor-dinheiro">Valor Dinheiro (R$)</Label>
                  <Input
                    id="sm-valor-dinheiro"
                    type="number"
                    step="0.01"
                    value={servicos.social_media?.valor_dinheiro || ""}
                    onChange={(e) => {
                      const valorDinheiro = parseFloat(e.target.value) || 0;
                      const valorPermuta = servicos.social_media?.valor_permuta || 0;
                      updateServico('social_media', { 
                        valor_dinheiro: valorDinheiro,
                        valor: valorPermuta + valorDinheiro
                      });
                    }}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="sm-valor">Valor Total (R$)</Label>
                  <Input
                    id="sm-valor"
                    type="text"
                    value={formatCurrency(servicos.social_media?.valor || 0)}
                    readOnly
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Calculado: Permuta + Dinheiro
                  </p>
                </div>
                <div>
                  <Label htmlFor="sm-desc-permuta">Descrição da Permuta</Label>
                  <Textarea
                    id="sm-desc-permuta"
                    value={servicos.social_media?.descricao_permuta || ""}
                    onChange={(e) => updateServico('social_media', { descricao_permuta: e.target.value })}
                    placeholder="Descreva o que será permutado"
                    rows={2}
                  />
                </div>
              </>
            ) : servicos.social_media?.modo_pagamento === 'permuta' ? (
              <>
                <div>
                  <Label htmlFor="sm-valor-permuta">Valor da Permuta (R$)</Label>
                  <Input
                    id="sm-valor-permuta"
                    type="number"
                    step="0.01"
                    value={servicos.social_media?.valor_permuta || ""}
                    onChange={(e) => {
                      const valorPermuta = parseFloat(e.target.value) || 0;
                      updateServico('social_media', { 
                        valor_permuta: valorPermuta,
                        valor: valorPermuta
                      });
                    }}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="sm-valor">Valor Total (R$)</Label>
                  <Input
                    id="sm-valor"
                    type="text"
                    value={formatCurrency(servicos.social_media?.valor || 0)}
                    readOnly
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Calculado: igual ao valor da permuta
                  </p>
                </div>
                <div>
                  <Label htmlFor="sm-desc-permuta">Descrição da Permuta</Label>
                  <Textarea
                    id="sm-desc-permuta"
                    value={servicos.social_media?.descricao_permuta || ""}
                    onChange={(e) => updateServico('social_media', { descricao_permuta: e.target.value })}
                    placeholder="Descreva o que será permutado"
                    rows={2}
                  />
                </div>
              </>
            ) : (
              <div>
                <Label htmlFor="sm-valor">Valor Total (R$)</Label>
                <Input
                  id="sm-valor"
                  type="number"
                  step="0.01"
                  value={servicos.social_media?.valor || ""}
                  onChange={(e) => updateServico('social_media', { valor: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="sm-feed">Qtde Feed</Label>
                <Input
                  id="sm-feed"
                  type="number"
                  value={servicos.social_media?.qtde_feed || ""}
                  onChange={(e) => updateServico('social_media', { qtde_feed: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="sm-reels">Qtde Reels</Label>
                <Input
                  id="sm-reels"
                  type="number"
                  value={servicos.social_media?.qtde_reels || ""}
                  onChange={(e) => updateServico('social_media', { qtde_reels: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="sm-stories">Stories Semanais</Label>
                <Input
                  id="sm-stories"
                  type="number"
                  value={servicos.social_media?.qtde_stories_semanais || ""}
                  onChange={(e) => updateServico('social_media', { qtde_stories_semanais: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Tráfego Pago */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="trafego-toggle" className="text-base font-semibold">Tráfego Pago</Label>
          <Switch
            id="trafego-toggle"
            checked={servicos.trafego_pago?.ativo || false}
            onCheckedChange={(checked) => updateServico('trafego_pago', { ativo: checked })}
          />
        </div>
        
        {servicos.trafego_pago?.ativo && (
          <div className="space-y-3 pt-2 border-t">
            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <Label htmlFor="tp-plano-template">Aplicar Plano Padrão (Opcional)</Label>
              <Select
                onValueChange={(value) => handleSelectPlano('trafego_pago', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um plano ou personalize" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personalizado">
                    ✏️ Personalizado
                  </SelectItem>
                  {getPlanosByTipo('trafego_pago').map(plano => (
                    <SelectItem key={plano.id} value={plano.id}>
                      {plano.nome} - {formatCurrency(plano.valor_sugerido)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Selecione um plano para preencher automaticamente os campos abaixo
              </p>
            </div>
            <div>
              <Label htmlFor="tp-plano">Descrição do Plano</Label>
              <Textarea
                id="tp-plano"
                value={servicos.trafego_pago?.plano || ""}
                onChange={(e) => updateServico('trafego_pago', { plano: e.target.value })}
                placeholder="Descrição do plano para o cliente"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="tp-modo">Modo de Pagamento</Label>
                <Select
                  value={servicos.trafego_pago?.modo_pagamento || 'dinheiro'}
                  onValueChange={(value: 'dinheiro' | 'permuta' | 'dinheiro_permuta') =>
                    updateServico('trafego_pago', { modo_pagamento: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="permuta">Permuta</SelectItem>
                    <SelectItem value="dinheiro_permuta">Dinheiro + Permuta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {servicos.trafego_pago?.modo_pagamento === 'dinheiro_permuta' ? (
              <>
                <div>
                  <Label htmlFor="tp-valor-permuta">Valor da Permuta (R$)</Label>
                  <Input
                    id="tp-valor-permuta"
                    type="number"
                    step="0.01"
                    value={servicos.trafego_pago?.valor_permuta || ""}
                    onChange={(e) => {
                      const valorPermuta = parseFloat(e.target.value) || 0;
                      const valorDinheiro = servicos.trafego_pago?.valor_dinheiro || 0;
                      updateServico('trafego_pago', { 
                        valor_permuta: valorPermuta,
                        valor: valorPermuta + valorDinheiro
                      });
                    }}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="tp-valor-dinheiro">Valor Dinheiro (R$)</Label>
                  <Input
                    id="tp-valor-dinheiro"
                    type="number"
                    step="0.01"
                    value={servicos.trafego_pago?.valor_dinheiro || ""}
                    onChange={(e) => {
                      const valorDinheiro = parseFloat(e.target.value) || 0;
                      const valorPermuta = servicos.trafego_pago?.valor_permuta || 0;
                      updateServico('trafego_pago', { 
                        valor_dinheiro: valorDinheiro,
                        valor: valorPermuta + valorDinheiro
                      });
                    }}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="tp-valor">Valor Total (R$)</Label>
                  <Input
                    id="tp-valor"
                    type="text"
                    value={formatCurrency(servicos.trafego_pago?.valor || 0)}
                    readOnly
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Calculado: Permuta + Dinheiro
                  </p>
                </div>
                <div>
                  <Label htmlFor="tp-desc-permuta">Descrição da Permuta</Label>
                  <Textarea
                    id="tp-desc-permuta"
                    value={servicos.trafego_pago?.descricao_permuta || ""}
                    onChange={(e) => updateServico('trafego_pago', { descricao_permuta: e.target.value })}
                    placeholder="Descreva o que será permutado"
                    rows={2}
                  />
                </div>
              </>
            ) : servicos.trafego_pago?.modo_pagamento === 'permuta' ? (
              <>
                <div>
                  <Label htmlFor="tp-valor-permuta">Valor da Permuta (R$)</Label>
                  <Input
                    id="tp-valor-permuta"
                    type="number"
                    step="0.01"
                    value={servicos.trafego_pago?.valor_permuta || ""}
                    onChange={(e) => {
                      const valorPermuta = parseFloat(e.target.value) || 0;
                      updateServico('trafego_pago', { 
                        valor_permuta: valorPermuta,
                        valor: valorPermuta
                      });
                    }}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="tp-valor">Valor Total (R$)</Label>
                  <Input
                    id="tp-valor"
                    type="text"
                    value={formatCurrency(servicos.trafego_pago?.valor || 0)}
                    readOnly
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Calculado: igual ao valor da permuta
                  </p>
                </div>
                <div>
                  <Label htmlFor="tp-desc-permuta">Descrição da Permuta</Label>
                  <Textarea
                    id="tp-desc-permuta"
                    value={servicos.trafego_pago?.descricao_permuta || ""}
                    onChange={(e) => updateServico('trafego_pago', { descricao_permuta: e.target.value })}
                    placeholder="Descreva o que será permutado"
                    rows={2}
                  />
                </div>
              </>
            ) : (
              <div>
                <Label htmlFor="tp-valor">Valor Total (R$)</Label>
                <Input
                  id="tp-valor"
                  type="number"
                  step="0.01"
                  value={servicos.trafego_pago?.valor || ""}
                  onChange={(e) => updateServico('trafego_pago', { valor: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
            )}

            <div>
              <Label htmlFor="tp-campanhas">Qtde Campanhas</Label>
              <Input
                id="tp-campanhas"
                type="number"
                value={servicos.trafego_pago?.qtde_campanhas || ""}
                onChange={(e) => updateServico('trafego_pago', { qtde_campanhas: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
          </div>
        )}
      </Card>

      {/* Treinamento de Vendas */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="treinamento-toggle" className="text-base font-semibold">Treinamento de Vendas</Label>
          <Switch
            id="treinamento-toggle"
            checked={servicos.treinamento_vendas?.ativo || false}
            onCheckedChange={(checked) => updateServico('treinamento_vendas', { ativo: checked })}
          />
        </div>
        
        {servicos.treinamento_vendas?.ativo && (
          <div className="space-y-3 pt-2 border-t">
            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <Label htmlFor="tv-plano-template">Aplicar Plano Padrão (Opcional)</Label>
              <Select
                onValueChange={(value) => handleSelectPlano('treinamento_vendas', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um plano ou personalize" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personalizado">
                    ✏️ Personalizado
                  </SelectItem>
                  {getPlanosByTipo('treinamento_vendas').map(plano => (
                    <SelectItem key={plano.id} value={plano.id}>
                      {plano.nome} - {formatCurrency(plano.valor_sugerido)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Selecione um plano para preencher automaticamente os campos abaixo
              </p>
            </div>
            <div>
              <Label htmlFor="tv-plano">Descrição do Plano</Label>
              <Textarea
                id="tv-plano"
                value={servicos.treinamento_vendas?.plano || ""}
                onChange={(e) => updateServico('treinamento_vendas', { plano: e.target.value })}
                placeholder="Descrição do plano para o cliente"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="tv-modo">Modo de Pagamento</Label>
                <Select
                  value={servicos.treinamento_vendas?.modo_pagamento || 'dinheiro'}
                  onValueChange={(value: 'dinheiro' | 'permuta' | 'dinheiro_permuta') =>
                    updateServico('treinamento_vendas', { modo_pagamento: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="permuta">Permuta</SelectItem>
                    <SelectItem value="dinheiro_permuta">Dinheiro + Permuta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {servicos.treinamento_vendas?.modo_pagamento === 'dinheiro_permuta' ? (
              <>
                <div>
                  <Label htmlFor="tv-valor-permuta">Valor da Permuta (R$)</Label>
                  <Input
                    id="tv-valor-permuta"
                    type="number"
                    step="0.01"
                    value={servicos.treinamento_vendas?.valor_permuta || ""}
                    onChange={(e) => {
                      const valorPermuta = parseFloat(e.target.value) || 0;
                      const valorDinheiro = servicos.treinamento_vendas?.valor_dinheiro || 0;
                      updateServico('treinamento_vendas', { 
                        valor_permuta: valorPermuta,
                        valor: valorPermuta + valorDinheiro
                      });
                    }}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="tv-valor-dinheiro">Valor Dinheiro (R$)</Label>
                  <Input
                    id="tv-valor-dinheiro"
                    type="number"
                    step="0.01"
                    value={servicos.treinamento_vendas?.valor_dinheiro || ""}
                    onChange={(e) => {
                      const valorDinheiro = parseFloat(e.target.value) || 0;
                      const valorPermuta = servicos.treinamento_vendas?.valor_permuta || 0;
                      updateServico('treinamento_vendas', { 
                        valor_dinheiro: valorDinheiro,
                        valor: valorPermuta + valorDinheiro
                      });
                    }}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="tv-valor">Valor Total (R$)</Label>
                  <Input
                    id="tv-valor"
                    type="text"
                    value={formatCurrency(servicos.treinamento_vendas?.valor || 0)}
                    readOnly
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Calculado: Permuta + Dinheiro
                  </p>
                </div>
                <div>
                  <Label htmlFor="tv-desc-permuta">Descrição da Permuta</Label>
                  <Textarea
                    id="tv-desc-permuta"
                    value={servicos.treinamento_vendas?.descricao_permuta || ""}
                    onChange={(e) => updateServico('treinamento_vendas', { descricao_permuta: e.target.value })}
                    placeholder="Descreva o que será permutado"
                    rows={2}
                  />
                </div>
              </>
            ) : servicos.treinamento_vendas?.modo_pagamento === 'permuta' ? (
              <>
                <div>
                  <Label htmlFor="tv-valor-permuta">Valor da Permuta (R$)</Label>
                  <Input
                    id="tv-valor-permuta"
                    type="number"
                    step="0.01"
                    value={servicos.treinamento_vendas?.valor_permuta || ""}
                    onChange={(e) => {
                      const valorPermuta = parseFloat(e.target.value) || 0;
                      updateServico('treinamento_vendas', { 
                        valor_permuta: valorPermuta,
                        valor: valorPermuta
                      });
                    }}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="tv-valor">Valor Total (R$)</Label>
                  <Input
                    id="tv-valor"
                    type="text"
                    value={formatCurrency(servicos.treinamento_vendas?.valor || 0)}
                    readOnly
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Calculado: igual ao valor da permuta
                  </p>
                </div>
                <div>
                  <Label htmlFor="tv-desc-permuta">Descrição da Permuta</Label>
                  <Textarea
                    id="tv-desc-permuta"
                    value={servicos.treinamento_vendas?.descricao_permuta || ""}
                    onChange={(e) => updateServico('treinamento_vendas', { descricao_permuta: e.target.value })}
                    placeholder="Descreva o que será permutado"
                    rows={2}
                  />
                </div>
              </>
            ) : (
              <div>
                <Label htmlFor="tv-valor">Valor Total (R$)</Label>
                <Input
                  id="tv-valor"
                  type="number"
                  step="0.01"
                  value={servicos.treinamento_vendas?.valor || ""}
                  onChange={(e) => updateServico('treinamento_vendas', { valor: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
            )}

            <div>
              <Label htmlFor="tv-periodo">Período</Label>
              <Select
                value={servicos.treinamento_vendas?.periodo || ""}
                onValueChange={(value) => updateServico('treinamento_vendas', { periodo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semanal">Semanal</SelectItem>
                  <SelectItem value="Quinzenal">Quinzenal</SelectItem>
                  <SelectItem value="Mensal">Mensal</SelectItem>
                  <SelectItem value="Único">Único</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </Card>

      {/* Google Ads */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="google-toggle" className="text-base font-semibold">Google Ads</Label>
          <Switch
            id="google-toggle"
            checked={servicos.google_ads?.ativo || false}
            onCheckedChange={(checked) => updateServico('google_ads', { ativo: checked })}
          />
        </div>
        
        {servicos.google_ads?.ativo && (
          <div className="space-y-3 pt-2 border-t">
            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <Label htmlFor="ga-plano-template">Aplicar Plano Padrão (Opcional)</Label>
              <Select
                onValueChange={(value) => handleSelectPlano('google_ads', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um plano ou personalize" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personalizado">
                    ✏️ Personalizado
                  </SelectItem>
                  {getPlanosByTipo('google_ads').map(plano => (
                    <SelectItem key={plano.id} value={plano.id}>
                      {plano.nome} - {formatCurrency(plano.valor_sugerido)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Selecione um plano para preencher automaticamente os campos abaixo
              </p>
            </div>
            <div>
              <Label htmlFor="ga-plano">Descrição do Plano</Label>
              <Textarea
                id="ga-plano"
                value={servicos.google_ads?.plano || ""}
                onChange={(e) => updateServico('google_ads', { plano: e.target.value })}
                placeholder="Descrição do plano para o cliente"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ga-modo">Modo de Pagamento</Label>
                <Select
                  value={servicos.google_ads?.modo_pagamento || 'dinheiro'}
                  onValueChange={(value: 'dinheiro' | 'permuta' | 'dinheiro_permuta') =>
                    updateServico('google_ads', { modo_pagamento: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="permuta">Permuta</SelectItem>
                    <SelectItem value="dinheiro_permuta">Dinheiro + Permuta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {servicos.google_ads?.modo_pagamento === 'dinheiro_permuta' ? (
              <>
                <div>
                  <Label htmlFor="ga-valor-permuta">Valor da Permuta (R$)</Label>
                  <Input
                    id="ga-valor-permuta"
                    type="number"
                    step="0.01"
                    value={servicos.google_ads?.valor_permuta || ""}
                    onChange={(e) => {
                      const valorPermuta = parseFloat(e.target.value) || 0;
                      const valorDinheiro = servicos.google_ads?.valor_dinheiro || 0;
                      updateServico('google_ads', { 
                        valor_permuta: valorPermuta,
                        valor: valorPermuta + valorDinheiro
                      });
                    }}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="ga-valor-dinheiro">Valor Dinheiro (R$)</Label>
                  <Input
                    id="ga-valor-dinheiro"
                    type="number"
                    step="0.01"
                    value={servicos.google_ads?.valor_dinheiro || ""}
                    onChange={(e) => {
                      const valorDinheiro = parseFloat(e.target.value) || 0;
                      const valorPermuta = servicos.google_ads?.valor_permuta || 0;
                      updateServico('google_ads', { 
                        valor_dinheiro: valorDinheiro,
                        valor: valorPermuta + valorDinheiro
                      });
                    }}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="ga-valor">Valor Total (R$)</Label>
                  <Input
                    id="ga-valor"
                    type="text"
                    value={formatCurrency(servicos.google_ads?.valor || 0)}
                    readOnly
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Calculado: Permuta + Dinheiro
                  </p>
                </div>
                <div>
                  <Label htmlFor="ga-desc-permuta">Descrição da Permuta</Label>
                  <Textarea
                    id="ga-desc-permuta"
                    value={servicos.google_ads?.descricao_permuta || ""}
                    onChange={(e) => updateServico('google_ads', { descricao_permuta: e.target.value })}
                    placeholder="Descreva o que será permutado"
                    rows={2}
                  />
                </div>
              </>
            ) : servicos.google_ads?.modo_pagamento === 'permuta' ? (
              <>
                <div>
                  <Label htmlFor="ga-valor-permuta">Valor da Permuta (R$)</Label>
                  <Input
                    id="ga-valor-permuta"
                    type="number"
                    step="0.01"
                    value={servicos.google_ads?.valor_permuta || ""}
                    onChange={(e) => {
                      const valorPermuta = parseFloat(e.target.value) || 0;
                      updateServico('google_ads', { 
                        valor_permuta: valorPermuta,
                        valor: valorPermuta
                      });
                    }}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="ga-valor">Valor Total (R$)</Label>
                  <Input
                    id="ga-valor"
                    type="text"
                    value={formatCurrency(servicos.google_ads?.valor || 0)}
                    readOnly
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Calculado: igual ao valor da permuta
                  </p>
                </div>
                <div>
                  <Label htmlFor="ga-desc-permuta">Descrição da Permuta</Label>
                  <Textarea
                    id="ga-desc-permuta"
                    value={servicos.google_ads?.descricao_permuta || ""}
                    onChange={(e) => updateServico('google_ads', { descricao_permuta: e.target.value })}
                    placeholder="Descreva o que será permutado"
                    rows={2}
                  />
                </div>
              </>
            ) : (
              <div>
                <Label htmlFor="ga-valor">Valor Total (R$)</Label>
                <Input
                  id="ga-valor"
                  type="number"
                  step="0.01"
                  value={servicos.google_ads?.valor || ""}
                  onChange={(e) => updateServico('google_ads', { valor: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Assinatura Jornada Poderalize */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="assinatura-toggle" className="text-base font-semibold">Assinatura Jornada Poderalize</Label>
          <Switch
            id="assinatura-toggle"
            checked={servicos.assinatura_jornada?.ativo || false}
            onCheckedChange={(checked) => updateServico('assinatura_jornada', { ativo: checked })}
          />
        </div>
        
        {servicos.assinatura_jornada?.ativo && (
          <div className="space-y-3 pt-2 border-t">
            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <Label htmlFor="aj-plano-template">Aplicar Plano Padrão (Opcional)</Label>
              <Select
                onValueChange={(value) => handleSelectPlano('assinatura_jornada', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um plano ou personalize" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personalizado">
                    ✏️ Personalizado
                  </SelectItem>
                  {getPlanosByTipo('assinatura_jornada').map(plano => (
                    <SelectItem key={plano.id} value={plano.id}>
                      {plano.nome} - {formatCurrency(plano.valor_sugerido)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Selecione um plano para preencher automaticamente os campos abaixo
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="aj-modo">Modo de Pagamento</Label>
                <Select
                  value={servicos.assinatura_jornada?.modo_pagamento || 'dinheiro'}
                  onValueChange={(value: 'dinheiro' | 'permuta' | 'dinheiro_permuta') =>
                    updateServico('assinatura_jornada', { modo_pagamento: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="permuta">Permuta</SelectItem>
                    <SelectItem value="dinheiro_permuta">Dinheiro + Permuta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {servicos.assinatura_jornada?.modo_pagamento === 'dinheiro_permuta' ? (
              <>
                <div>
                  <Label htmlFor="aj-valor-permuta">Valor da Permuta (R$)</Label>
                  <Input
                    id="aj-valor-permuta"
                    type="number"
                    step="0.01"
                    value={servicos.assinatura_jornada?.valor_permuta || ""}
                    onChange={(e) => {
                      const valorPermuta = parseFloat(e.target.value) || 0;
                      const valorDinheiro = servicos.assinatura_jornada?.valor_dinheiro || 0;
                      updateServico('assinatura_jornada', { 
                        valor_permuta: valorPermuta,
                        valor: valorPermuta + valorDinheiro
                      });
                    }}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="aj-valor-dinheiro">Valor Dinheiro (R$)</Label>
                  <Input
                    id="aj-valor-dinheiro"
                    type="number"
                    step="0.01"
                    value={servicos.assinatura_jornada?.valor_dinheiro || ""}
                    onChange={(e) => {
                      const valorDinheiro = parseFloat(e.target.value) || 0;
                      const valorPermuta = servicos.assinatura_jornada?.valor_permuta || 0;
                      updateServico('assinatura_jornada', { 
                        valor_dinheiro: valorDinheiro,
                        valor: valorPermuta + valorDinheiro
                      });
                    }}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="aj-valor">Valor Total (R$)</Label>
                  <Input
                    id="aj-valor"
                    type="text"
                    value={formatCurrency(servicos.assinatura_jornada?.valor || 0)}
                    readOnly
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Calculado: Permuta + Dinheiro
                  </p>
                </div>
                <div>
                  <Label htmlFor="aj-desc-permuta">Descrição da Permuta</Label>
                  <Textarea
                    id="aj-desc-permuta"
                    value={servicos.assinatura_jornada?.descricao_permuta || ""}
                    onChange={(e) => updateServico('assinatura_jornada', { descricao_permuta: e.target.value })}
                    placeholder="Descreva o que será permutado"
                    rows={2}
                  />
                </div>
              </>
            ) : servicos.assinatura_jornada?.modo_pagamento === 'permuta' ? (
              <>
                <div>
                  <Label htmlFor="aj-valor-permuta">Valor da Permuta (R$)</Label>
                  <Input
                    id="aj-valor-permuta"
                    type="number"
                    step="0.01"
                    value={servicos.assinatura_jornada?.valor_permuta || ""}
                    onChange={(e) => {
                      const valorPermuta = parseFloat(e.target.value) || 0;
                      updateServico('assinatura_jornada', { 
                        valor_permuta: valorPermuta,
                        valor: valorPermuta
                      });
                    }}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="aj-valor">Valor Total (R$)</Label>
                  <Input
                    id="aj-valor"
                    type="text"
                    value={formatCurrency(servicos.assinatura_jornada?.valor || 0)}
                    readOnly
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Calculado: igual ao valor da permuta
                  </p>
                </div>
                <div>
                  <Label htmlFor="aj-desc-permuta">Descrição da Permuta</Label>
                  <Textarea
                    id="aj-desc-permuta"
                    value={servicos.assinatura_jornada?.descricao_permuta || ""}
                    onChange={(e) => updateServico('assinatura_jornada', { descricao_permuta: e.target.value })}
                    placeholder="Descreva o que será permutado"
                    rows={2}
                  />
                </div>
              </>
            ) : (
              <div>
                <Label htmlFor="aj-valor">Valor Total (R$)</Label>
                <Input
                  id="aj-valor"
                  type="number"
                  step="0.01"
                  value={servicos.assinatura_jornada?.valor || ""}
                  onChange={(e) => updateServico('assinatura_jornada', { valor: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};