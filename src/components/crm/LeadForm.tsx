import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LeadAdvanced } from "@/types/crm";
import { useToast } from "@/hooks/use-toast";
import { AvatarUpload } from "@/components/ui/avatar-upload";

interface LeadFormProps {
  onSubmit: (leadData: Partial<LeadAdvanced>) => void;
  initialData?: Partial<LeadAdvanced>;
}

// Lead data for shared storage
export interface LeadData {
  id: string;
  nome: string;
  empresa: string;
  email: string;
  telefone: string;
  fonte: string;
  valor: number;
  observacoes: string;
  site?: string;
  instagram?: string;
  facebook?: string;
  outrasRedesSociais?: string;
  faturamentoAtual?: number;
  faturamentoDesejado?: number;
  doresIdentificadas: string[];
  nivelConsciencia?: string;
  etapaJornada?: string;
  indicadorPotencial?: string;
  equipeAtual?: string;
  status: string;
  probabilidade: number;
  dataContato: string;
}

export const LeadForm = ({ onSubmit, initialData }: LeadFormProps) => {
  const { toast } = useToast();
  const STORAGE_KEY = 'lead-form-draft';
  
  // Load from localStorage if no initialData (new lead form)
  const getInitialFormData = () => {
    if (initialData) {
      return {
        nome: initialData?.nome || "",
        empresa: initialData?.empresa || "",
        email: initialData?.email || "",
        cnpj: initialData?.cnpj || "",
        telefone: initialData?.telefone || "",
        fonte: initialData?.fonte || "",
        valor: initialData?.valor?.toString() || "",
        probabilidade: "25",
        produtoInteresse: "",
        observacoes: initialData?.observacoes || "",
        site: "",
        instagram: "",
        facebook: "",
        outrasRedesSociais: "",
        faturamentoAtual: "",
        faturamentoDesejado: "",
        doresIdentificadas: [] as string[],
        nivelConsciencia: "",
        etapaJornada: "",
        indicadorPotencial: "",
        equipeAtual: "",
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
      fonte: "",
      valor: "",
      probabilidade: "25",
      produtoInteresse: "",
      observacoes: "",
      site: "",
      instagram: "",
      facebook: "",
      outrasRedesSociais: "",
      faturamentoAtual: "",
      faturamentoDesejado: "",
      doresIdentificadas: [] as string[],
      nivelConsciencia: "",
      etapaJornada: "",
      indicadorPotencial: "",
      equipeAtual: "",
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
  
  const [novoLead, setNovoLead] = useState(getInitialFormData());

  // Save to localStorage whenever form data changes (only if not editing)
  useEffect(() => {
    if (!initialData) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          ...novoLead,
          avatar_url: avatarUrl
        }));
      } catch (error) {
        console.error('Error saving form draft:', error);
      }
    }
  }, [novoLead, avatarUrl, initialData]);

  // Função para salvar lead também na página de Leads
  const saveToLeadsPage = (leadData: LeadData) => {
    try {
      const existingLeads = JSON.parse(localStorage.getItem('leads-page-data') || '[]');
      const updatedLeads = [...existingLeads, leadData];
      localStorage.setItem('leads-page-data', JSON.stringify(updatedLeads));
    } catch (error) {
      console.error('Erro ao salvar lead:', error);
    }
  };

  const fonteOptions = [
    "Website", "LinkedIn", "Facebook", "Instagram", "Google Ads", 
    "Indicação", "Evento", "Cold Call", "E-mail Marketing", "CRM"
  ];

  const doresOptions = [
    "Falta de leads qualificados",
    "Baixo ROI em marketing",
    "Concorrência acirrada", 
    "Falta de presença digital",
    "Equipe sem capacitação",
    "Processos desorganizados",
    "Dificuldade em reter clientes",
    "Margem de lucro baixa"
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

  const handleAddLead = () => {
    if (!novoLead.nome || !novoLead.empresa || !novoLead.email || !novoLead.produtoInteresse) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios (Nome, Empresa, Email e Produto de Interesse)",
        variant: "destructive"
      });
      return;
    }

    // Criar lead para a página de Leads
    const newLeadForLeadsPage: LeadData = {
      id: Math.random().toString(36).substr(2, 9),
      ...novoLead,
      valor: parseFloat(novoLead.valor) || 0,
      faturamentoAtual: parseFloat(novoLead.faturamentoAtual) || undefined,
      faturamentoDesejado: parseFloat(novoLead.faturamentoDesejado) || undefined,
      status: "novo",
      probabilidade: 25,
      dataContato: new Date().toISOString().split('T')[0]
    };

    // Criar lead para o CRM
    const leadDataForCRM: Partial<LeadAdvanced> = {
      nome: novoLead.nome,
      empresa: novoLead.empresa,
      email: novoLead.email,
      cnpj: novoLead.cnpj || undefined,
      telefone: novoLead.telefone,
      fonte: novoLead.fonte,
      valor: parseFloat(novoLead.valor) || 0,
      observacoes: novoLead.observacoes,
      avatar_url: avatarUrl,
    };

    // Salvar na página de Leads
    saveToLeadsPage(newLeadForLeadsPage);

    // Clear localStorage draft after successful submission
    if (!initialData) {
      localStorage.removeItem(STORAGE_KEY);
    }

    // Submeter para o CRM
    onSubmit(leadDataForCRM);
    
    toast({
      title: "Lead criado",
      description: "Lead adicionado ao funil e salvo com sucesso!",
    });
  };


  return (
    <div className="space-y-6">
      {/* Avatar Upload */}
      <div className="flex justify-center py-4">
        <AvatarUpload
          currentAvatarUrl={avatarUrl}
          onAvatarChange={(url) => setAvatarUrl(url || undefined)}
          fallbackText={novoLead.nome ? novoLead.nome.substring(0, 2).toUpperCase() : "LE"}
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
              value={novoLead.nome}
              onChange={(e) => setNovoLead({...novoLead, nome: e.target.value})}
              placeholder="Nome do contato"
            />
          </div>
          <div>
            <Label htmlFor="empresa">Empresa *</Label>
            <Input
              id="empresa"
              value={novoLead.empresa}
              onChange={(e) => setNovoLead({...novoLead, empresa: e.target.value})}
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
              value={novoLead.email}
              onChange={(e) => setNovoLead({...novoLead, email: e.target.value})}
              placeholder="email@empresa.com"
            />
          </div>
          <div>
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              value={novoLead.cnpj}
              onChange={(e) => setNovoLead({...novoLead, cnpj: e.target.value})}
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
                value={novoLead.telefone}
                onChange={(e) => setNovoLead({...novoLead, telefone: e.target.value})}
                placeholder="11 99999-9999"
                className="rounded-l-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fonte">Fonte</Label>
            <Select onValueChange={(value) => setNovoLead({...novoLead, fonte: value})}>
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
          <div>
            <Label htmlFor="valor">Valor (R$)</Label>
            <Input
              id="valor"
              type="number"
              value={novoLead.valor}
              onChange={(e) => setNovoLead({...novoLead, valor: e.target.value})}
              placeholder="50000"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="probabilidade">Probabilidade (%)</Label>
            <Input
              id="probabilidade"
              type="number"
              min="0"
              max="100"
              value={novoLead.probabilidade}
              onChange={(e) => setNovoLead({...novoLead, probabilidade: e.target.value})}
              placeholder="25"
            />
          </div>
          <div>
            <Label htmlFor="produtoInteresse">Produto de Interesse *</Label>
            <Input
              id="produtoInteresse"
              value={novoLead.produtoInteresse}
              onChange={(e) => setNovoLead({...novoLead, produtoInteresse: e.target.value})}
              placeholder="Qual produto/serviço tem interesse"
            />
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
              value={novoLead.site}
              onChange={(e) => setNovoLead({...novoLead, site: e.target.value})}
              placeholder="www.empresa.com.br"
            />
          </div>
          <div>
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              value={novoLead.instagram}
              onChange={(e) => setNovoLead({...novoLead, instagram: e.target.value})}
              placeholder="@empresa"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="facebook">Facebook</Label>
            <Input
              id="facebook"
              value={novoLead.facebook}
              onChange={(e) => setNovoLead({...novoLead, facebook: e.target.value})}
              placeholder="facebook.com/empresa"
            />
          </div>
          <div>
            <Label htmlFor="outrasRedesSociais">Outras Redes Sociais (LinkedIn, TikTok, etc.)</Label>
            <Input
              id="outrasRedesSociais"
              value={novoLead.outrasRedesSociais}
              onChange={(e) => setNovoLead({...novoLead, outrasRedesSociais: e.target.value})}
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
            <Label htmlFor="faturamentoAtual">Faturamento Mensal Atual</Label>
            <Input
              id="faturamentoAtual"
              type="number"
              value={novoLead.faturamentoAtual}
              onChange={(e) => setNovoLead({...novoLead, faturamentoAtual: e.target.value})}
              placeholder="50000"
            />
          </div>
          <div>
            <Label htmlFor="faturamentoDesejado">Faturamento Mensal Desejado</Label>
            <Input
              id="faturamentoDesejado"
              type="number"
              value={novoLead.faturamentoDesejado}
              onChange={(e) => setNovoLead({...novoLead, faturamentoDesejado: e.target.value})}
              placeholder="100000"
            />
          </div>
        </div>
      </div>

      {/* Comportamento e Potencial */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">COMPORTAMENTO E POTENCIAL</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Dores identificadas</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-3">
              {doresOptions.map((dor) => (
                <label key={dor} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={novoLead.doresIdentificadas.includes(dor)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNovoLead({
                          ...novoLead,
                          doresIdentificadas: [...novoLead.doresIdentificadas, dor]
                        });
                      } else {
                        setNovoLead({
                          ...novoLead,
                          doresIdentificadas: novoLead.doresIdentificadas.filter(d => d !== dor)
                        });
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{dor}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <Label htmlFor="nivelConsciencia">Nível de Consciência</Label>
            <Select onValueChange={(value) => setNovoLead({...novoLead, nivelConsciencia: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha uma opção" />
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="etapaJornada">Etapa da Jornada</Label>
            <Select onValueChange={(value) => setNovoLead({...novoLead, etapaJornada: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha uma opção" />
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
          
          <div>
            <Label htmlFor="equipeAtual">Equipe Atual</Label>
            <Input
              id="equipeAtual"
              value={novoLead.equipeAtual}
              onChange={(e) => setNovoLead({...novoLead, equipeAtual: e.target.value})}
              placeholder="Exemplo: 3 colaboradores fixos e 2 freelancers"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="indicadorPotencial">Indicador de Potencial</Label>
            <Select onValueChange={(value) => setNovoLead({...novoLead, indicadorPotencial: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha uma opção" />
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
        </div>
      </div>

      {/* Observações */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">OBSERVAÇÕES</h3>
        <div>
          <Label htmlFor="observacoes">Observações Gerais</Label>
          <Textarea
            id="observacoes"
            value={novoLead.observacoes}
            onChange={(e) => setNovoLead({...novoLead, observacoes: e.target.value})}
            placeholder="Detalhes sobre o lead..."
            rows={4}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" onClick={handleAddLead} className="btn-primary">
          Adicionar
        </Button>
      </div>
    </div>
  );
};