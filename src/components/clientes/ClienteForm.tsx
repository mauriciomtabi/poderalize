import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CreateClienteData, Cliente } from "@/hooks/useClientes";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { AvatarUpload } from "@/components/ui/avatar-upload";

interface ClienteFormProps {
  onSubmit: (clienteData: CreateClienteData) => void;
  onCancel: () => void;
  initialData?: Cliente;
}

export const ClienteForm = ({ onSubmit, onCancel, initialData }: ClienteFormProps) => {
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(initialData?.avatar_url);
  const [novoCliente, setNovoCliente] = useState({
    nome: initialData?.nome || "",
    empresa: initialData?.empresa || "",
    email: initialData?.email || "",
    telefone: initialData?.telefone || "",
    valor_fechamento: initialData?.valor_fechamento?.toString() || "",
    data_fechamento: initialData?.data_fechamento || new Date().toISOString().split('T')[0],
    fonte_original: initialData?.fonte_original || "",
    observacoes: initialData?.observacoes || "",
    
    // Presença Digital
    site: initialData?.site || "",
    instagram: initialData?.instagram || "",
    facebook: initialData?.facebook || "",
    outras_redes_sociais: initialData?.outras_redes_sociais || "",
    
    // Faturamento
    faturamento_atual: initialData?.faturamento_atual?.toString() || "",
    faturamento_desejado: initialData?.faturamento_desejado?.toString() || "",
    
    // Comportamento e Potencial
    nivel_consciencia: initialData?.nivel_consciencia || "",
    etapa_jornada: initialData?.etapa_jornada || "",
    indicador_potencial: initialData?.indicador_potencial || "",
    equipe_atual: initialData?.equipe_atual || "",
    observacoes_comportamento: initialData?.observacoes_comportamento || "",
  });

  const [date, setDate] = useState<Date>(
    initialData?.data_fechamento ? parseISO(initialData.data_fechamento) : new Date()
  );

  useEffect(() => {
    if (initialData) {
      setNovoCliente({
        nome: initialData.nome || "",
        empresa: initialData.empresa || "",
        email: initialData.email || "",
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

  const handleAddCliente = () => {
    if (!novoCliente.nome || !novoCliente.empresa || !novoCliente.email) {
      toast.error("Preencha todos os campos obrigatórios (Nome, Empresa e Email)");
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
    };

    onSubmit(clienteData);
  };

  return (
    <div className="space-y-6">
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
            <Select onValueChange={(value) => setNovoCliente({...novoCliente, fonte_original: value})}>
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
            <Label htmlFor="valor_fechamento">Valor do Fechamento (R$)</Label>
            <Input
              id="valor_fechamento"
              type="number"
              step="0.01"
              value={novoCliente.valor_fechamento}
              onChange={(e) => setNovoCliente({...novoCliente, valor_fechamento: e.target.value})}
              placeholder="2600.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
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
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="button" onClick={handleAddCliente}>
          {initialData ? 'Salvar Alterações' : 'Adicionar Cliente'}
        </Button>
      </div>
    </div>
  );
};
