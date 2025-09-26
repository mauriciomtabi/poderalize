import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { LeadAdvanced } from "@/types/crm";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const leadSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
  empresa: z.string().trim().min(1, "Empresa é obrigatória").max(100, "Empresa deve ter no máximo 100 caracteres"),
  email: z.string().trim().email("Email inválido").max(255, "Email deve ter no máximo 255 caracteres"),
  telefone: z.string().trim().max(20, "Telefone deve ter no máximo 20 caracteres"),
  fonte: z.string().trim().min(1, "Fonte é obrigatória"),
  valor: z.number().min(0, "Valor deve ser positivo").max(9999999, "Valor muito alto"),
  observacoes: z.string().max(1000, "Observações devem ter no máximo 1000 caracteres").optional()
});

interface LeadFormProps {
  onSubmit: (leadData: Partial<LeadAdvanced>) => void;
  initialData?: Partial<LeadAdvanced>;
}

export const LeadForm = ({ onSubmit, initialData }: LeadFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nome: initialData?.nome || "",
    empresa: initialData?.empresa || "",
    email: initialData?.email || "",
    telefone: initialData?.telefone || "",
    fonte: initialData?.fonte || "",
    valor: initialData?.valor?.toString() || "",
    observacoes: initialData?.observacoes || "",
    
    // Presença Digital
    site: "",
    instagram: "",
    facebook: "",
    outrasRedesSociais: "",
    
    // Faturamento
    faturamentoAtual: "",
    faturamentoDesejado: "",
    
    // Comportamento e Potencial
    doresIdentificadas: [] as string[],
    nivelConsciencia: "",
    etapaJornada: "",
    indicadorPotencial: "",
    equipeAtual: "",
    
    // CRM específico
    travaEmocional: "inseguranca_financeira" as const,
    tipoDiscurso: "tecnico" as const,
    necessidadeOculta: ["Aumentar vendas"],
    produtoInteresse: "Consultoria",
    ofertaAtrativa: "Análise gratuita",
    gatilhosFuncionais: ["ROI garantido"]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const fonteOptions = [
    "Website", "LinkedIn", "Facebook", "Instagram", "Google Ads", 
    "Indicação", "Evento", "Cold Call", "E-mail Marketing", "CRM"
  ];

  const doresOptions = [
    "Baixa visibilidade online", "Poucas vendas", "Dificuldade para gerar leads",
    "Marca não reconhecida", "Concorrência forte", "Falta de estratégia digital",
    "Equipe sem capacitação", "Processos desorganizados"
  ];

  const nivelConscienciaOptions = [
    "Inconsciente (não sabe que tem um problema)",
    "Consciente do problema",
    "Consciente da solução",
    "Consciente do produto/serviço",
    "Totalmente consciente (pronto para comprar)"
  ];

  const etapaJornadaOptions = ["Descoberta", "Consideração", "Decisão", "Fidelização"];

  const indicadorPotencialOptions = [
    "Lead com alto potencial (com verba, decisão e clareza)",
    "Lead com médio potencial (interessado, mas travado)",
    "Lead com baixo potencial (curioso, mas distante do perfil ideal)"
  ];

  const travaEmocionalOptions = [
    { value: "inseguranca_financeira", label: "Insegurança Financeira" },
    { value: "medo_dar_errado", label: "Medo de dar errado" },
    { value: "falta_apoio", label: "Falta de apoio" },
    { value: "falta_tempo", label: "Falta de tempo" },
    { value: "desconfianca", label: "Desconfiança" }
  ];

  const tipoDiscursoOptions = [
    { value: "tecnico", label: "Técnico" },
    { value: "emocional", label: "Emocional" },
    { value: "inspirador", label: "Inspirador" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate basic fields
    try {
      const basicData = {
        nome: formData.nome,
        empresa: formData.empresa,
        email: formData.email,
        telefone: formData.telefone,
        fonte: formData.fonte,
        valor: parseFloat(formData.valor) || 0,
        observacoes: formData.observacoes
      };

      leadSchema.parse(basicData);

      const leadData: Partial<LeadAdvanced> = {
        ...basicData,
        travaEmocional: formData.travaEmocional,
        tipoDiscurso: formData.tipoDiscurso,
        necessidadeOculta: formData.necessidadeOculta,
        produtoInteresse: formData.produtoInteresse,
        ofertaAtrativa: formData.ofertaAtrativa,
        gatilhosFuncionais: formData.gatilhosFuncionais
      };

      onSubmit(leadData);
      toast({
        title: "Lead criado",
        description: "Lead adicionado ao funil com sucesso!",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  const addDor = (dor: string) => {
    if (!formData.doresIdentificadas.includes(dor)) {
      setFormData({
        ...formData,
        doresIdentificadas: [...formData.doresIdentificadas, dor]
      });
    }
  };

  const removeDor = (dor: string) => {
    setFormData({
      ...formData,
      doresIdentificadas: formData.doresIdentificadas.filter(d => d !== dor)
    });
  };

  const addNecessidadeOculta = (necessidade: string) => {
    if (necessidade.trim() && !formData.necessidadeOculta.includes(necessidade.trim())) {
      setFormData({
        ...formData,
        necessidadeOculta: [...formData.necessidadeOculta, necessidade.trim()]
      });
    }
  };

  const removeNecessidadeOculta = (necessidade: string) => {
    setFormData({
      ...formData,
      necessidadeOculta: formData.necessidadeOculta.filter(n => n !== necessidade)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dados Básicos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">Dados Básicos</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
              placeholder="Nome do contato"
              className={errors.nome ? "border-red-500" : ""}
            />
            {errors.nome && <p className="text-sm text-red-500 mt-1">{errors.nome}</p>}
          </div>
          <div>
            <Label htmlFor="empresa">Empresa *</Label>
            <Input
              id="empresa"
              value={formData.empresa}
              onChange={(e) => setFormData({...formData, empresa: e.target.value})}
              placeholder="Nome da empresa"
              className={errors.empresa ? "border-red-500" : ""}
            />
            {errors.empresa && <p className="text-sm text-red-500 mt-1">{errors.empresa}</p>}
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
                value={formData.telefone}
                onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                placeholder="11 99999-9999"
                className="rounded-l-none"
              />
            </div>
            {errors.telefone && <p className="text-sm text-red-500 mt-1">{errors.telefone}</p>}
          </div>
          <div>
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="email@empresa.com"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fonte">Fonte do Lead *</Label>
            <Select value={formData.fonte} onValueChange={(value) => setFormData({...formData, fonte: value})}>
              <SelectTrigger className={errors.fonte ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecione a fonte" />
              </SelectTrigger>
              <SelectContent>
                {fonteOptions.map((fonte) => (
                  <SelectItem key={fonte} value={fonte}>{fonte}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.fonte && <p className="text-sm text-red-500 mt-1">{errors.fonte}</p>}
          </div>
          <div>
            <Label htmlFor="valor">Valor Estimado (R$)</Label>
            <Input
              id="valor"
              type="number"
              value={formData.valor}
              onChange={(e) => setFormData({...formData, valor: e.target.value})}
              placeholder="50000"
              min="0"
              className={errors.valor ? "border-red-500" : ""}
            />
            {errors.valor && <p className="text-sm text-red-500 mt-1">{errors.valor}</p>}
          </div>
        </div>
      </div>

      {/* Análise Comportamental */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">Análise Comportamental</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Trava Emocional</Label>
            <Select 
              value={formData.travaEmocional} 
              onValueChange={(value: any) => setFormData({...formData, travaEmocional: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {travaEmocionalOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Tipo de Discurso</Label>
            <Select 
              value={formData.tipoDiscurso} 
              onValueChange={(value: any) => setFormData({...formData, tipoDiscurso: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tipoDiscursoOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Produto de Interesse</Label>
            <Input
              value={formData.produtoInteresse}
              onChange={(e) => setFormData({...formData, produtoInteresse: e.target.value})}
              placeholder="Consultoria, Mentoria, etc."
            />
          </div>
          <div>
            <Label>Oferta Atrativa</Label>
            <Input
              value={formData.ofertaAtrativa}
              onChange={(e) => setFormData({...formData, ofertaAtrativa: e.target.value})}
              placeholder="Diagnóstico gratuito, desconto, etc."
            />
          </div>
        </div>

        <div>
          <Label>Necessidades Ocultas</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.necessidadeOculta.map((necessidade) => (
              <Badge key={necessidade} variant="secondary" className="cursor-pointer">
                {necessidade}
                <X 
                  className="h-3 w-3 ml-1" 
                  onClick={() => removeNecessidadeOculta(necessidade)}
                />
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Digite uma necessidade e pressione Enter"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addNecessidadeOculta(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Observações */}
      <div>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={formData.observacoes}
          onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
          placeholder="Observações adicionais sobre o lead..."
          rows={3}
          maxLength={1000}
          className={errors.observacoes ? "border-red-500" : ""}
        />
        {errors.observacoes && <p className="text-sm text-red-500 mt-1">{errors.observacoes}</p>}
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="btn-primary">
          Adicionar Lead ao Funil
        </Button>
      </div>
    </form>
  );
};