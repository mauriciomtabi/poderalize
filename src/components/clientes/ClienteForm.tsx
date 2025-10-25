import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CreateClienteData, Cliente } from "@/hooks/useClientes";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Save, Calculator, DollarSign, CheckCircle2, TrendingUp } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ServicosRecorrentesForm } from "./ServicosRecorrentesForm";
import { ServicosUnicosForm } from "./ServicosUnicosForm";
import { useServicosUnicosSync } from "@/hooks/useServicosUnicosSync";
import { useAuth } from "@/hooks/useAuth";

interface ClienteFormProps {
  onSubmit: (clienteData: CreateClienteData) => void;
  onCancel: () => void;
  initialData?: Cliente;
}

export const ClienteForm = ({ onSubmit, onCancel, initialData }: ClienteFormProps) => {
  const STORAGE_KEY = 'cliente-form-draft';
  const SCROLL_KEY = 'cliente-form-scroll';
  const isRestoringScroll = useRef(false);
  const { syncServicosUnicos } = useServicosUnicosSync();
  const { user } = useAuth();
  
  // Load from localStorage if no initialData (new client form)
  const getInitialFormData = () => {
    if (initialData) {
      return {
        nome: initialData.nome || "",
        empresa: initialData.empresa || "",
        email: initialData.email || "",
        cnpj: initialData.cnpj || "",
        telefone: initialData.telefone || "",
        valor_fechamento: initialData.valor_fechamento?.toString() || "",
        data_fechamento: initialData.data_fechamento || new Date().toISOString().split('T')[0],
        fonte_original: initialData.fonte_original || "",
        observacoes: initialData.observacoes || "",
        site: initialData.site || "",
        instagram: initialData.instagram || "",
        facebook: initialData.facebook || "",
        outras_redes_sociais: initialData.outras_redes_sociais || "",
        faturamento_atual: initialData.faturamento_atual?.toString() || "",
        faturamento_desejado: initialData.faturamento_desejado?.toString() || "",
        nivel_consciencia: initialData.nivel_consciencia || "",
        etapa_jornada: initialData.etapa_jornada || "",
        indicador_potencial: initialData.indicador_potencial || "",
        equipe_atual: initialData.equipe_atual || "",
        observacoes_comportamento: initialData.observacoes_comportamento || "",
        pagamento_mensal: initialData.pagamento_mensal || false,
        dia_pagamento: initialData.dia_pagamento?.toString() || "",
      };
    }
    
    // Try to load from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading form draft:', error);
    }
    
    return {
      nome: "",
      empresa: "",
      email: "",
      cnpj: "",
      telefone: "",
      valor_fechamento: "",
      data_fechamento: new Date().toISOString().split('T')[0],
      fonte_original: "",
      observacoes: "",
      site: "",
      instagram: "",
      facebook: "",
      outras_redes_sociais: "",
      faturamento_atual: "",
      faturamento_desejado: "",
      nivel_consciencia: "",
      etapa_jornada: "",
      indicador_potencial: "",
      equipe_atual: "",
      observacoes_comportamento: "",
      pagamento_mensal: false,
      dia_pagamento: "",
    };
  };

  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(() => {
    if (initialData?.avatar_url) return initialData.avatar_url;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        return data.avatar_url;
      }
    } catch (error) {
      console.error('Error loading avatar from draft:', error);
    }
    return undefined;
  });
  
  const [novoCliente, setNovoCliente] = useState(getInitialFormData());
  const [servicosRecorrentes, setServicosRecorrentes] = useState(initialData?.servicos_recorrentes || {});
  const [servicosUnicos, setServicosUnicos] = useState(initialData?.servicos_unicos || {});
  const [totalServicosRecorrentes, setTotalServicosRecorrentes] = useState(0);

  // Função para calcular totais de permuta e dinheiro
  const calculatePaymentTotals = () => {
    let totalPermuta = 0;
    let totalDinheiro = 0;

    // Serviços Únicos
    Object.values(servicosUnicos || {}).forEach((servico) => {
      if (servico?.selecionado) {
        if (servico.modo_pagamento === 'dinheiro') {
          totalDinheiro += servico.valor || 0;
        } else if (servico.modo_pagamento === 'permuta') {
          totalPermuta += servico.valor_permuta || 0;
        } else if (servico.modo_pagamento === 'dinheiro_permuta') {
          totalDinheiro += servico.valor_dinheiro || 0;
          totalPermuta += servico.valor_permuta || 0;
        }
      }
    });

    // Serviços Recorrentes
    Object.values(servicosRecorrentes || {}).forEach((servico: any) => {
      if (servico?.ativo) {
        if (servico.modo_pagamento === 'dinheiro' || !servico.modo_pagamento) {
          totalDinheiro += servico.valor || 0;
        } else if (servico.modo_pagamento === 'permuta') {
          totalPermuta += servico.valor_permuta || 0;
        } else if (servico.modo_pagamento === 'dinheiro_permuta') {
          totalDinheiro += servico.valor_dinheiro || 0;
          totalPermuta += servico.valor_permuta || 0;
        }
      }
    });

    return { totalPermuta, totalDinheiro };
  };

  const { totalPermuta, totalDinheiro } = calculatePaymentTotals();

  const [date, setDate] = useState<Date>(() => {
    if (initialData?.data_fechamento) return parseISO(initialData.data_fechamento);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.data_fechamento) return parseISO(data.data_fechamento);
      }
    } catch (error) {
      console.error('Error loading date from draft:', error);
    }
    return new Date();
  });

  // Save to localStorage whenever form data changes (only if not editing)
  useEffect(() => {
    if (!initialData) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          ...novoCliente,
          avatar_url: avatarUrl,
          servicos_recorrentes: servicosRecorrentes,
          servicos_unicos: servicosUnicos,
        }));
      } catch (error) {
        console.error('Error saving form draft:', error);
      }
    }
  }, [novoCliente, avatarUrl, servicosRecorrentes, servicosUnicos, initialData]);

  // Auto-calculate valor_fechamento from servicos recorrentes
  useEffect(() => {
    if (totalServicosRecorrentes > 0) {
      setNovoCliente(prev => ({
        ...prev,
        valor_fechamento: totalServicosRecorrentes.toString()
      }));
    }
  }, [totalServicosRecorrentes]);

  // Save scroll position periodically
  useEffect(() => {
    if (initialData) return;

    const saveScroll = () => {
      const scrollContainer = document.getElementById('cliente-add-content')?.querySelector('.overflow-y-auto');
      if (scrollContainer && !isRestoringScroll.current) {
        const scrollTop = scrollContainer.scrollTop;
        localStorage.setItem(SCROLL_KEY, scrollTop.toString());
      }
    };

    const scrollContainer = document.getElementById('cliente-add-content')?.querySelector('.overflow-y-auto');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', saveScroll, { passive: true });
      
      return () => {
        scrollContainer.removeEventListener('scroll', saveScroll);
      };
    }
  }, [initialData]);

  // Restore scroll position - multiple attempts to ensure it works
  useEffect(() => {
    if (initialData) return;

    const restoreScroll = () => {
      try {
        const savedScroll = localStorage.getItem(SCROLL_KEY);
        const scrollContainer = document.getElementById('cliente-add-content')?.querySelector('.overflow-y-auto');
        
        if (savedScroll && scrollContainer) {
          isRestoringScroll.current = true;
          const scrollValue = parseInt(savedScroll, 10);
          
          // Multiple restore attempts with increasing delays
          const attempts = [0, 50, 100, 200, 300, 500];
          attempts.forEach(delay => {
            setTimeout(() => {
              const container = document.getElementById('cliente-add-content')?.querySelector('.overflow-y-auto');
              if (container) {
                container.scrollTop = scrollValue;
              }
            }, delay);
          });
          
          setTimeout(() => {
            isRestoringScroll.current = false;
          }, 600);
        }
      } catch (error) {
        console.error('Error restoring scroll:', error);
      }
    };

    // Use requestAnimationFrame for better timing
    requestAnimationFrame(() => {
      requestAnimationFrame(restoreScroll);
    });
  }, [initialData]);

  useEffect(() => {
    if (initialData) {
      setNovoCliente({
        nome: initialData.nome || "",
        empresa: initialData.empresa || "",
        email: initialData.email || "",
        cnpj: initialData.cnpj || "",
        telefone: initialData.telefone || "",
        valor_fechamento: initialData.valor_fechamento?.toString() || "",
        data_fechamento: initialData.data_fechamento || new Date().toISOString().split('T')[0],
        fonte_original: initialData.fonte_original || "",
        observacoes: initialData.observacoes || "",
        site: initialData.site || "",
        instagram: initialData.instagram || "",
        facebook: initialData.facebook || "",
        outras_redes_sociais: initialData.outras_redes_sociais || "",
        faturamento_atual: initialData.faturamento_atual?.toString() || "",
        faturamento_desejado: initialData.faturamento_desejado?.toString() || "",
        nivel_consciencia: initialData.nivel_consciencia || "",
        etapa_jornada: initialData.etapa_jornada || "",
        indicador_potencial: initialData.indicador_potencial || "",
        equipe_atual: initialData.equipe_atual || "",
        observacoes_comportamento: initialData.observacoes_comportamento || "",
        pagamento_mensal: initialData.pagamento_mensal || false,
        dia_pagamento: initialData.dia_pagamento?.toString() || "",
      });
      setDate(initialData.data_fechamento ? parseISO(initialData.data_fechamento) : new Date());
    }
  }, [initialData]);

  const fonteOptions = [
    "Website", "LinkedIn", "Facebook", "Instagram", "Google Ads", 
    "Indicação", "Evento", "Cold Call", "E-mail Marketing", "CRM"
  ];

  const nivelConscienciaOptions = [
    "Inconsciente",
    "Consciente do problema",
    "Consciente da solução",
    "Consciente do produto",
    "Pronto para comprar"
  ];

  const etapaJornadaOptions = ["Descoberta", "Consideração", "Decisão", "Fidelização"];

  const indicadorPotencialOptions = [
    "Alto",
    "Médio-Alto", 
    "Médio",
    "Baixo"
  ];

  const handleAddCliente = async () => {
    if (!novoCliente.nome || !novoCliente.empresa || !novoCliente.email) {
      toast.error("Preencha todos os campos obrigatórios (Nome, Empresa e Email)");
      return;
    }

    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    // Parse numeric values correctly, handling empty strings
    const parseNumericValue = (value: string): number | undefined => {
      if (!value || value.trim() === '') return undefined;
      const parsed = Number(value);
      return isNaN(parsed) ? undefined : parsed;
    };

    const clienteData: CreateClienteData = {
      nome: novoCliente.nome,
      empresa: novoCliente.empresa,
      email: novoCliente.email,
      cnpj: novoCliente.cnpj || undefined,
      telefone: novoCliente.telefone || undefined,
      valor_fechamento: parseNumericValue(novoCliente.valor_fechamento),
      data_fechamento: novoCliente.data_fechamento,
      observacoes: novoCliente.observacoes || undefined,
      avatar_url: avatarUrl,
      site: novoCliente.site || undefined,
      instagram: novoCliente.instagram || undefined,
      facebook: novoCliente.facebook || undefined,
      outras_redes_sociais: novoCliente.outras_redes_sociais || undefined,
      faturamento_atual: parseNumericValue(novoCliente.faturamento_atual),
      faturamento_desejado: parseNumericValue(novoCliente.faturamento_desejado),
      fonte_original: novoCliente.fonte_original || undefined,
      nivel_consciencia: novoCliente.nivel_consciencia || undefined,
      etapa_jornada: novoCliente.etapa_jornada || undefined,
      indicador_potencial: novoCliente.indicador_potencial || undefined,
      equipe_atual: novoCliente.equipe_atual || undefined,
      observacoes_comportamento: novoCliente.observacoes_comportamento || undefined,
      pagamento_mensal: novoCliente.pagamento_mensal || false,
      dia_pagamento: novoCliente.dia_pagamento ? parseInt(novoCliente.dia_pagamento) : undefined,
      servicos_recorrentes: servicosRecorrentes,
      servicos_unicos: servicosUnicos,
    };

    // Clear localStorage draft and scroll position after successful submission
    if (!initialData) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SCROLL_KEY);
    }

    onSubmit(clienteData);
  };

  const handleCancel = () => {
    // Only clear draft if user explicitly confirms
    if (!initialData) {
      const hasDraft = localStorage.getItem(STORAGE_KEY);
      if (hasDraft) {
        if (window.confirm("Você tem dados não salvos. Deseja descartar o rascunho?")) {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(SCROLL_KEY);
          onCancel();
        }
        return;
      }
    }
    onCancel();
  };

  const handleDiscardDraft = () => {
    if (window.confirm("Tem certeza que deseja descartar o rascunho?")) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SCROLL_KEY);
      toast.success("Rascunho descartado");
      onCancel();
    }
  };

  return (
    <div className="space-y-6 px-6 pb-6">
      {/* Draft Indicator */}
      {!initialData && (
        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2">
            <Save className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-blue-600 dark:text-blue-400">
              Rascunho salvo automaticamente. Você pode sair e voltar depois!
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDiscardDraft}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            Descartar
          </Button>
        </div>
      )}

      {/* Avatar Upload */}
      <div className="flex justify-center py-4">
        <AvatarUpload
          currentAvatarUrl={avatarUrl}
          onAvatarChange={(url) => setAvatarUrl(url || undefined)}
          fallbackText={novoCliente.nome ? novoCliente.nome.substring(0, 2).toUpperCase() : "CL"}
        />
      </div>

      {/* Dados Básicos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">DADOS BÁSICOS</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={novoCliente.nome}
              onChange={(e) => setNovoCliente({...novoCliente, nome: e.target.value})}
              placeholder="Nome do contato"
            />
          </div>
          <div>
            <Label htmlFor="empresa">Empresa *</Label>
            <Input
              id="empresa"
              value={novoCliente.empresa}
              onChange={(e) => setNovoCliente({...novoCliente, empresa: e.target.value})}
              placeholder="Nome da empresa"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={novoCliente.email}
              onChange={(e) => setNovoCliente({...novoCliente, email: e.target.value})}
              placeholder="email@empresa.com"
            />
          </div>
          <div>
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              value={novoCliente.cnpj}
              onChange={(e) => setNovoCliente({...novoCliente, cnpj: e.target.value})}
              placeholder="00.000.000/0000-00"
              maxLength={18}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="telefone">Telefone</Label>
            <div className="flex">
              <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted">
                🇧🇷 +55
              </div>
              <Input
                id="telefone"
                value={novoCliente.telefone}
                onChange={(e) => setNovoCliente({...novoCliente, telefone: e.target.value})}
                placeholder="11 99999-9999"
                className="rounded-l-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fonte">Fonte Original</Label>
            <Select 
              value={novoCliente.fonte_original}
              onValueChange={(value) => setNovoCliente({...novoCliente, fonte_original: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Como nos conheceu?" />
              </SelectTrigger>
              <SelectContent>
                {fonteOptions.map((fonte) => (
                  <SelectItem key={fonte} value={fonte}>
                    {fonte}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Presença Digital */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">PRESENÇA DIGITAL</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="site">Site</Label>
            <Input
              id="site"
              value={novoCliente.site}
              onChange={(e) => setNovoCliente({...novoCliente, site: e.target.value})}
              placeholder="www.empresa.com.br"
            />
          </div>
          <div>
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              value={novoCliente.instagram}
              onChange={(e) => setNovoCliente({...novoCliente, instagram: e.target.value})}
              placeholder="@empresa"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="facebook">Facebook</Label>
            <Input
              id="facebook"
              value={novoCliente.facebook}
              onChange={(e) => setNovoCliente({...novoCliente, facebook: e.target.value})}
              placeholder="facebook.com/empresa"
            />
          </div>
          <div>
            <Label htmlFor="outras_redes_sociais">Outras Redes Sociais (LinkedIn, TikTok, etc.)</Label>
            <Input
              id="outras_redes_sociais"
              value={novoCliente.outras_redes_sociais}
              onChange={(e) => setNovoCliente({...novoCliente, outras_redes_sociais: e.target.value})}
              placeholder="LinkedIn, TikTok, YouTube..."
            />
          </div>
        </div>
      </div>

      {/* Faturamento */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">FATURAMENTO</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="faturamento_atual">Faturamento Mensal Atual</Label>
            <Input
              id="faturamento_atual"
              type="number"
              step="0.01"
              value={novoCliente.faturamento_atual}
              onChange={(e) => setNovoCliente({...novoCliente, faturamento_atual: e.target.value})}
              placeholder="50000.00"
            />
          </div>
          <div>
            <Label htmlFor="faturamento_desejado">Faturamento Mensal Desejado</Label>
            <Input
              id="faturamento_desejado"
              type="number"
              step="0.01"
              value={novoCliente.faturamento_desejado}
              onChange={(e) => setNovoCliente({...novoCliente, faturamento_desejado: e.target.value})}
              placeholder="100000.00"
            />
          </div>
        </div>
      </div>

      {/* Comportamento e Potencial */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">COMPORTAMENTO E POTENCIAL</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nivel_consciencia">Nível de Consciência</Label>
            <Select 
              value={novoCliente.nivel_consciencia}
              onValueChange={(value) => setNovoCliente({...novoCliente, nivel_consciencia: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o nível" />
              </SelectTrigger>
              <SelectContent>
                {nivelConscienciaOptions.map((opcao) => (
                  <SelectItem key={opcao} value={opcao}>
                    {opcao}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="etapa_jornada">Etapa da Jornada</Label>
            <Select
              value={novoCliente.etapa_jornada}
              onValueChange={(value) => setNovoCliente({...novoCliente, etapa_jornada: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a etapa" />
              </SelectTrigger>
              <SelectContent>
                {etapaJornadaOptions.map((etapa) => (
                  <SelectItem key={etapa} value={etapa}>
                    {etapa}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="indicador_potencial">Indicador de Potencial</Label>
            <Select
              value={novoCliente.indicador_potencial}
              onValueChange={(value) => setNovoCliente({...novoCliente, indicador_potencial: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o potencial" />
              </SelectTrigger>
              <SelectContent>
                {indicadorPotencialOptions.map((indicador) => (
                  <SelectItem key={indicador} value={indicador}>
                    {indicador}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="equipe_atual">Equipe Atual</Label>
            <Input
              id="equipe_atual"
              value={novoCliente.equipe_atual}
              onChange={(e) => setNovoCliente({...novoCliente, equipe_atual: e.target.value})}
              placeholder="Exemplo: 3 colaboradores fixos e 2 freelancers"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="observacoes_comportamento">Observações</Label>
          <Textarea
            id="observacoes_comportamento"
            value={novoCliente.observacoes_comportamento}
            onChange={(e) => setNovoCliente({...novoCliente, observacoes_comportamento: e.target.value})}
            placeholder="Observações sobre comportamento e potencial..."
            rows={3}
          />
        </div>
      </div>

      {/* Fechamento e Serviços */}
      <div className="space-y-6 border-2 border-primary/20 rounded-lg p-6 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            FECHAMENTO E SERVIÇOS
          </h3>
          {totalServicosRecorrentes > 0 && (
            <Badge variant="default">
              <TrendingUp className="h-3 w-3 mr-1" />
              {Object.values(servicosRecorrentes).filter((s: any) => s.ativo).length} serviços ativos
            </Badge>
          )}
        </div>

        {/* Serviços Recorrentes */}
        <ServicosRecorrentesForm 
          value={servicosRecorrentes}
          onChange={setServicosRecorrentes}
          onTotalChange={setTotalServicosRecorrentes}
        />

        {/* Dados do Fechamento */}
        <div className="space-y-4 mt-6 p-4 bg-background/50 rounded-lg border-2 border-primary/30">
          <h4 className="font-semibold text-primary flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Dados do Fechamento
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Valor do Fechamento */}
            <div className="space-y-2">
              <Label htmlFor="valor_fechamento">Valor do Fechamento (R$)</Label>
              {totalServicosRecorrentes > 0 && (
                <div className="flex items-center gap-2 mb-1">
                  <Calculator className="h-3 w-3 text-green-600 dark:text-green-400" />
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Calculado: R$ {totalServicosRecorrentes.toFixed(2)}
                  </span>
                </div>
              )}
              <Input
                id="valor_fechamento"
                type="number"
                step="0.01"
                value={novoCliente.valor_fechamento}
                onChange={(e) => setNovoCliente({...novoCliente, valor_fechamento: e.target.value})}
                placeholder="2600.00"
                className={totalServicosRecorrentes > 0 ? "border-green-500" : ""}
              />
            </div>

            {/* Valor Total da Permuta */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                Valor Total da Permuta (R$)
              </Label>
              <div className="text-xs text-muted-foreground mb-1">
                Soma de todas as permutas
              </div>
              <Input
                type="text"
                value={new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(totalPermuta)}
                readOnly
                disabled
                className="bg-yellow-50 dark:bg-yellow-950 border-yellow-300 cursor-not-allowed font-semibold"
              />
            </div>

            {/* Valor Total Dinheiro */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                Valor Total Dinheiro (R$)
              </Label>
              <div className="text-xs text-muted-foreground mb-1">
                Soma de pagamentos em dinheiro
              </div>
              <Input
                type="text"
                value={new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(totalDinheiro)}
                readOnly
                disabled
                className="bg-green-50 dark:bg-green-950 border-green-300 cursor-not-allowed font-semibold"
              />
            </div>
          </div>

          {/* Data do Fechamento */}
          <div className="space-y-2">
            <Label>Data do Fechamento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: ptBR }) : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    if (newDate) {
                      setDate(newDate);
                      setNovoCliente({
                        ...novoCliente,
                        data_fechamento: newDate.toISOString().split('T')[0]
                      });
                    }
                  }}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Card de Resumo Geral */}
          {(totalPermuta > 0 || totalDinheiro > 0) && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border-2 border-primary/20">
              <h5 className="font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Resumo Financeiro Geral
              </h5>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Dinheiro</div>
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(totalDinheiro)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Permuta</div>
                  <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(totalPermuta)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Total Geral</div>
                  <div className="text-lg font-bold text-primary">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(totalDinheiro + totalPermuta)}
                  </div>
                </div>
              </div>
              {totalPermuta > 0 && totalDinheiro > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Percentual Permuta: {((totalPermuta / (totalDinheiro + totalPermuta)) * 100).toFixed(1)}%
                </div>
              )}
            </div>
          )}

          {/* Pagamento Mensal Recorrente */}
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="pagamento_mensal"
                checked={novoCliente.pagamento_mensal}
                onCheckedChange={(checked) => 
                  setNovoCliente({
                    ...novoCliente, 
                    pagamento_mensal: checked as boolean,
                    dia_pagamento: checked ? novoCliente.dia_pagamento : ""
                  })
                }
              />
              <Label htmlFor="pagamento_mensal" className="font-semibold cursor-pointer">
                Pagamento Mensal Recorrente
              </Label>
            </div>

            {novoCliente.pagamento_mensal && (
              <div>
                <Label htmlFor="dia_pagamento">Dia do Pagamento (1-31)</Label>
                <Select
                  value={novoCliente.dia_pagamento}
                  onValueChange={(value) => 
                    setNovoCliente({...novoCliente, dia_pagamento: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o dia" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 31}, (_, i) => i + 1).map(dia => (
                      <SelectItem key={dia} value={dia.toString()}>
                        Dia {dia}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Serviços Únicos */}
      <ServicosUnicosForm 
        value={servicosUnicos}
        onChange={setServicosUnicos}
      />

      {/* Observações */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">OBSERVAÇÕES</h3>
        <div>
          <Label htmlFor="observacoes">Observações Gerais</Label>
          <Textarea
            id="observacoes"
            value={novoCliente.observacoes}
            onChange={(e) => setNovoCliente({...novoCliente, observacoes: e.target.value})}
            placeholder="Detalhes sobre o cliente..."
            rows={4}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancelar
        </Button>
        <Button type="button" onClick={handleAddCliente}>
          {initialData ? 'Salvar Alterações' : 'Adicionar Cliente'}
        </Button>
      </div>
    </div>
  );
};
