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

interface ClienteFormProps {
  onSubmit: (clienteData: CreateClienteData) => void;
  onCancel: () => void;
  initialData?: Cliente;
}

export const ClienteForm = ({ onSubmit, onCancel, initialData }: ClienteFormProps) => {
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
      });
      setDate(initialData.data_fechamento ? parseISO(initialData.data_fechamento) : new Date());
    }
  }, [initialData]);

  const fonteOptions = [
    "Website", "LinkedIn", "Facebook", "Instagram", "Google Ads", 
    "Indicação", "Evento", "Cold Call", "E-mail Marketing", "CRM"
  ];

  const handleAddCliente = () => {
    if (!novoCliente.nome || !novoCliente.empresa || !novoCliente.email) {
      toast.error("Preencha todos os campos obrigatórios (Nome, Empresa e Email)");
      return;
    }

    const clienteData: CreateClienteData = {
      nome: novoCliente.nome,
      empresa: novoCliente.empresa,
      email: novoCliente.email,
      telefone: novoCliente.telefone || undefined,
      valor_fechamento: parseFloat(novoCliente.valor_fechamento) || undefined,
      data_fechamento: novoCliente.data_fechamento,
      observacoes: novoCliente.observacoes || undefined,
      site: novoCliente.site || undefined,
      instagram: novoCliente.instagram || undefined,
      facebook: novoCliente.facebook || undefined,
      outras_redes_sociais: novoCliente.outras_redes_sociais || undefined,
      faturamento_atual: parseFloat(novoCliente.faturamento_atual) || undefined,
      faturamento_desejado: parseFloat(novoCliente.faturamento_desejado) || undefined,
      fonte_original: novoCliente.fonte_original || undefined,
    };

    onSubmit(clienteData);
  };

  return (
    <div className="space-y-6">
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
              value={novoCliente.valor_fechamento}
              onChange={(e) => setNovoCliente({...novoCliente, valor_fechamento: e.target.value})}
              placeholder="50000"
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
              value={novoCliente.faturamento_atual}
              onChange={(e) => setNovoCliente({...novoCliente, faturamento_atual: e.target.value})}
              placeholder="50000"
            />
          </div>
          <div>
            <Label htmlFor="faturamento_desejado">Faturamento Mensal Desejado</Label>
            <Input
              id="faturamento_desejado"
              type="number"
              value={novoCliente.faturamento_desejado}
              onChange={(e) => setNovoCliente({...novoCliente, faturamento_desejado: e.target.value})}
              placeholder="100000"
            />
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
