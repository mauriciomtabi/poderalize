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
import { format, addMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFollowUps } from "@/hooks/useFollowUps";
import { toast } from "sonner";

const formSchema = z.object({
  dataAgendada: z.date(),
  horaAgendada: z.string().min(1, "Hora é obrigatória"),
  tipo: z.enum(['ligacao', 'whatsapp', 'email', 'reuniao']),
  observacoes: z.string().optional(),
  templateMensagem: z.string().optional()
});

interface ScheduleFollowUpDialogProps {
  leadId: string;
  leadName: string;
  onSuccess?: () => void;
}

const followUpTypeLabels = {
  'ligacao': 'Ligação',
  'whatsapp': 'WhatsApp',
  'email': 'E-mail',
  'reuniao': 'Reunião'
};

export const ScheduleFollowUpDialog = ({ leadId, leadName, onSuccess }: ScheduleFollowUpDialogProps) => {
  const [open, setOpen] = useState(false);
  const { addFollowUp } = useFollowUps();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dataAgendada: new Date(),
      horaAgendada: '',
      tipo: 'ligacao',
      observacoes: '',
      templateMensagem: ''
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Combinar data e hora
      const [hours, minutes] = values.horaAgendada.split(':');
      const scheduledDateTime = new Date(values.dataAgendada);
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      await addFollowUp({
        leadId,
        leadNome: leadName,
        dataAgendada: scheduledDateTime.toISOString(),
        tipo: values.tipo,
        observacoes: values.observacoes,
        templateMensagem: values.templateMensagem
      });
      
      toast.success("Follow-up agendado com sucesso!");
      form.reset();
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error scheduling follow-up:', error);
      toast.error("Erro ao agendar follow-up");
    }
  };

  // Gerar opções de horário (8:00 às 18:00, intervalos de 30 minutos)
  const timeOptions = [];
  for (let hour = 8; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (hour === 18 && minute > 0) break; // Parar em 18:00
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(timeString);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Clock className="h-4 w-4 mr-2" />
          Agendar Follow-up
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agendar Follow-up - {leadName}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dataAgendada"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data</FormLabel>
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
                              format(field.value, "dd/MM/yyyy", { locale: ptBR })
                            ) : (
                              <span>Selecione</span>
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
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="horaAgendada"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a hora" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[200px]">
                        {timeOptions.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Follow-up</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(followUpTypeLabels).map(([value, label]) => (
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
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Adicione observações sobre este follow-up..."
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="templateMensagem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template de Mensagem (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite um template de mensagem para usar no follow-up..."
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Agendar Follow-up
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};