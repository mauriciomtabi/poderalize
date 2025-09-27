import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateInteractionData, InteractionType } from "@/types/crm";
import { useLeadInteractions } from "@/hooks/useLeadInteractions";
import { toast } from "sonner";

const formSchema = z.object({
  interactionType: z.string().min(1, "Tipo de interação é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  interactionDate: z.date()
});

interface InteractionFormProps {
  leadId: string;
  leadName: string;
  onSuccess?: () => void;
}

const interactionTypeLabels: Record<InteractionType, string> = {
  'ligacao': 'Ligação',
  'whatsapp': 'WhatsApp',
  'email_enviado': 'E-mail Enviado',
  'email_recebido': 'E-mail Recebido', 
  'reuniao': 'Reunião',
  'proposta_enviada': 'Proposta Enviada',
  'negociacao': 'Negociação',
  'fechamento': 'Fechamento',
  'contato_inicial': 'Contato Inicial',
  'follow_up': 'Follow-up'
};

export const InteractionForm = ({ leadId, leadName, onSuccess }: InteractionFormProps) => {
  const [open, setOpen] = useState(false);
  const { addInteraction } = useLeadInteractions();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      interactionType: '',
      description: '',
      interactionDate: new Date()
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const interactionData: CreateInteractionData = {
        leadId,
        interactionType: values.interactionType as InteractionType,
        description: values.description,
        interactionDate: values.interactionDate.toISOString()
      };

      await addInteraction(interactionData);
      
      toast.success("Interação registrada com sucesso!");
      form.reset();
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating interaction:', error);
      toast.error("Erro ao registrar interação");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <MessageCircle className="h-4 w-4 mr-2" />
          Registrar Contato
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Interação - {leadName}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="interactionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Interação</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de interação" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(interactionTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva os detalhes da interação..."
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interactionDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data da Interação</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione a data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Registrar Interação
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};