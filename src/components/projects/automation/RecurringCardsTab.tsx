import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Trash2, Plus, Tag, Users, Calendar, Clock, Edit, Building2, Check, ChevronsUpDown, X, CheckCircle2 } from "lucide-react";
import { useRecurringCards, RecurringCard } from "@/hooks/useRecurringCards";
import { useProjects } from "@/contexts/ProjectsContext";
import { useClientes } from "@/hooks/useClientes";
import { format } from "date-fns";
import type { Priority } from "@/types/projects";
import { cn } from "@/lib/utils";

// Helper function to format UTC dates without timezone conversion
const formatUTC = (date: Date, formatStr: string) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  
  return formatStr
    .replace('yyyy', String(year))
    .replace('MM', month)
    .replace('dd', day)
    .replace('HH', hours)
    .replace('mm', minutes);
};

interface RecurringCardsTabProps {
  boardId: string | null;
}
export const RecurringCardsTab = ({
  boardId
}: RecurringCardsTabProps) => {
  const {
    state
  } = useProjects();
  const {
    cards,
    isLoading,
    createCard,
    updateCard,
    deleteCard,
    toggleEnabled
  } = useRecurringCards(boardId);
  const { clientes } = useClientes();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [clientePopoverOpen, setClientePopoverOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    list_id: "",
    frequency: "daily" as "daily" | "weekly" | "biweekly" | "monthly",
    day_of_week: 1,
    day_of_month: 1,
    time_of_day: "09:00",
    days_of_week: [] as number[],
    start_date: new Date().toISOString().split('T')[0],
    end_date: "", // YYYY-MM-DD format or empty for no end date
    // Card properties
    priority: "medium" as Priority,
    label_ids: [] as string[],
    assignee_ids: [] as string[],
    client_id: "" as string,
    due_date_offset: 0,
    // Days from creation
    start_date_offset: 0,
    // Days from creation
    estimated_hours: 0
  });
  const handleSubmit = async () => {
    if (!boardId || !formData.title || !formData.list_id) return;
    if (formData.frequency === 'daily' && formData.days_of_week.length === 0) return;
    const now = new Date();
    const [hours, minutes] = formData.time_of_day.split(':').map(Number);

    // Monte a data/hora local escolhida (sem UTC) para gerar o próximo agendamento correto
    let nextCreation = new Date(`${formData.start_date}T${formData.time_of_day}`);

    if (formData.frequency === 'daily') {
      // Encontrar a próxima ocorrência baseada nos dias selecionados (usando timezone local)
      const sortedDays = [...formData.days_of_week].sort((a, b) => a - b);

      // Se a data/hora inicial está no futuro e é um dia válido, usa-a
      if (nextCreation > now && sortedDays.includes(nextCreation.getDay())) {
        // ok
      } else {
        // Procurar o próximo dia válido a partir da data de início
        for (let i = 0; i < 7; i++) {
          const testDate = new Date(`${formData.start_date}T${formData.time_of_day}`);
          testDate.setDate(testDate.getDate() + i + 1);
          if (sortedDays.includes(testDate.getDay())) {
            nextCreation = testDate;
            break;
          }
        }
      }
    } else if (formData.frequency === 'weekly' || formData.frequency === 'biweekly') {
      const currentDay = nextCreation.getDay();
      const targetDay = formData.day_of_week;

      // Calcular dias até a próxima ocorrência
      const daysUntilNext = (targetDay - currentDay + 7) % 7 || 7;
      nextCreation.setDate(nextCreation.getDate() + daysUntilNext);

      // Quinzenal: somar mais 7 dias
      if (formData.frequency === 'biweekly') {
        nextCreation.setDate(nextCreation.getDate() + 7);
      }

      // Se ainda ficou no passado, avança mais um período
      if (nextCreation < now) {
        nextCreation.setDate(nextCreation.getDate() + (formData.frequency === 'biweekly' ? 14 : 7));
      }
    } else if (formData.frequency === 'monthly') {
      // Ajustar para o dia do mês desejado mantendo hora local
      const targetDay = formData.day_of_month;
      nextCreation.setDate(targetDay);
      if (nextCreation < now) {
        nextCreation.setMonth(nextCreation.getMonth() + 1);
        nextCreation.setDate(targetDay);
      }
    }
    const cardData = {
      board_id: boardId,
      list_id: formData.list_id,
      title: formData.title,
      description: formData.description,
      frequency: formData.frequency,
      day_of_week: (formData.frequency === 'weekly' || formData.frequency === 'biweekly') ? formData.day_of_week : undefined,
      day_of_month: formData.frequency === 'monthly' ? formData.day_of_month : undefined,
      time_of_day: formData.time_of_day,
      next_creation_at: nextCreation.toISOString(),
      end_date: formData.end_date ? new Date(`${formData.end_date}T23:59:59`).toISOString() : undefined,
      start_date: new Date(`${formData.start_date}T00:00:00`).toISOString(),
      days_of_week: formData.frequency === 'daily' ? formData.days_of_week : undefined,
      template_config: {
        priority: formData.priority,
        label_ids: formData.label_ids,
        assignee_ids: formData.assignee_ids,
        client_id: formData.client_id || undefined,
        due_date_offset: formData.due_date_offset,
        start_date_offset: formData.start_date_offset,
        estimated_hours: formData.estimated_hours > 0 ? formData.estimated_hours : undefined,
        utc_days_of_week: formData.frequency === 'daily' ? formData.days_of_week.map((localDay) => {
          const base = new Date(`1970-01-04T${formData.time_of_day}`); // 1970-01-04 is Sunday
          base.setDate(base.getDate() + localDay);
          return base.getUTCDay();
        }) : undefined
      },
      enabled: true
    };
    if (editingId) {
      await updateCard(editingId, cardData);
    } else {
      await createCard(cardData);
    }
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      list_id: "",
      frequency: "daily",
      day_of_week: 1,
      day_of_month: 1,
      time_of_day: "09:00",
      days_of_week: [],
      start_date: new Date().toISOString().split('T')[0],
      end_date: "",
      priority: "medium",
      label_ids: [],
      assignee_ids: [],
      client_id: "",
      due_date_offset: 0,
      start_date_offset: 0,
      estimated_hours: 0
    });
  };
  const handleEdit = (card: RecurringCard) => {
    const config = typeof card.template_config === 'object' && card.template_config !== null ? card.template_config as Record<string, any> : {};

    // Preferir start_date salvo; fallback para next_creation_at
    const toInput = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    const startDate = card.start_date ? toInput(new Date(card.start_date)) : toInput(new Date(card.next_creation_at));
    const endDate = card.end_date ? toInput(new Date(card.end_date)) : "";
    setEditingId(card.id);
    setShowForm(true);
    setFormData({
      title: card.title,
      description: card.description || "",
      list_id: card.list_id,
      frequency: card.frequency,
      day_of_week: card.day_of_week || 1,
      day_of_month: card.day_of_month || 1,
      time_of_day: card.time_of_day || "09:00",
      days_of_week: card.days_of_week || [],
      start_date: startDate,
      end_date: endDate,
      priority: config.priority as Priority || "medium",
      label_ids: Array.isArray(config.label_ids) ? config.label_ids : [],
      assignee_ids: Array.isArray(config.assignee_ids) ? config.assignee_ids : [],
      client_id: typeof config.client_id === 'string' ? config.client_id : "",
      due_date_offset: typeof config.due_date_offset === 'number' ? config.due_date_offset : 0,
      start_date_offset: typeof config.start_date_offset === 'number' ? config.start_date_offset : 0,
      estimated_hours: typeof config.estimated_hours === 'number' ? config.estimated_hours : 0
    });
  };
  const frequencyLabels = {
    daily: "Diário",
    weekly: "Semanal",
    biweekly: "Quinzenal",
    monthly: "Mensal"
  };
  const weekDays = [{
    value: 0,
    label: "Domingo"
  }, {
    value: 1,
    label: "Segunda"
  }, {
    value: 2,
    label: "Terça"
  }, {
    value: 3,
    label: "Quarta"
  }, {
    value: 4,
    label: "Quinta"
  }, {
    value: 5,
    label: "Sexta"
  }, {
    value: 6,
    label: "Sábado"
  }];
  const priorityLabels = {
    low: "Baixa",
    medium: "Média",
    high: "Alta",
    urgent: "Urgente"
  };
  const priorityColors = {
    low: "bg-blue-500",
    medium: "bg-yellow-500",
    high: "bg-orange-500",
    urgent: "bg-red-500"
  };
  const toggleLabel = (labelId: string) => {
    setFormData(prev => ({
      ...prev,
      label_ids: prev.label_ids.includes(labelId) ? prev.label_ids.filter(id => id !== labelId) : [...prev.label_ids, labelId]
    }));
  };
  const toggleAssignee = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      assignee_ids: prev.assignee_ids.includes(memberId) ? prev.assignee_ids.filter(id => id !== memberId) : [...prev.assignee_ids, memberId]
    }));
  };
  return <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Crie cards automaticamente em intervalos regulares
        </p>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Novo Card Recorrente
        </Button>
      </div>

      {showForm && <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Editar" : "Novo"} Card Recorrente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Card</Label>
              <Input id="title" value={formData.title} onChange={e => setFormData({
            ...formData,
            title: e.target.value
          })} placeholder="Ex: Reunião semanal da equipe" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea id="description" value={formData.description} onChange={e => setFormData({
            ...formData,
            description: e.target.value
          })} placeholder="Detalhes do card..." rows={3} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="list">Lista</Label>
              <Select value={formData.list_id} onValueChange={value => setFormData({
            ...formData,
            list_id: value
          })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma lista" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {state.currentBoard?.lists.map(list => <SelectItem key={list.id} value={list.id}>
                        {list.title}
                      </SelectItem>)}
                  </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Data de Início</Label>
                <Input id="start_date" type="date" value={formData.start_date} onChange={e => setFormData({
              ...formData,
              start_date: e.target.value
            })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">Data de Término (opcional)</Label>
                <Input id="end_date" type="date" value={formData.end_date} min={formData.start_date} onChange={e => setFormData({
              ...formData,
              end_date: e.target.value
            })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequência</Label>
                <Select value={formData.frequency} onValueChange={(value: any) => setFormData({
              ...formData,
              frequency: value
            })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="biweekly">Quinzenal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Horário</Label>
                <Input id="time" type="time" value={formData.time_of_day} onChange={e => setFormData({
              ...formData,
              time_of_day: e.target.value
            })} />
              </div>
            </div>

            {formData.frequency === 'daily' && <div className="space-y-2">
                <Label>Dias da Semana</Label>
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map(day => <Button key={day.value} type="button" variant={formData.days_of_week.includes(day.value) ? "default" : "outline"} size="sm" className="h-10 text-xs" onClick={() => {
              const newDays = formData.days_of_week.includes(day.value) ? formData.days_of_week.filter(d => d !== day.value) : [...formData.days_of_week, day.value].sort();
              setFormData({
                ...formData,
                days_of_week: newDays
              });
            }}>
                      {day.label.substring(0, 3)}
                    </Button>)}
                </div>
                {formData.days_of_week.length === 0 && <p className="text-xs text-destructive">Selecione pelo menos um dia</p>}
              </div>}

            {(formData.frequency === 'weekly' || formData.frequency === 'biweekly') && <div className="space-y-2">
                <Label htmlFor="day_of_week">Dia da Semana</Label>
                <Select value={String(formData.day_of_week)} onValueChange={value => setFormData({
            ...formData,
            day_of_week: Number(value)
          })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {weekDays.map(day => <SelectItem key={day.value} value={String(day.value)}>
                        {day.label}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>}

            {formData.frequency === 'monthly' && <div className="space-y-2">
                <Label htmlFor="day_of_month">Dia do Mês</Label>
                <Input id="day_of_month" type="number" min="1" max="31" value={formData.day_of_month} onChange={e => setFormData({
            ...formData,
            day_of_month: Number(e.target.value)
          })} />
              </div>}

            <div className="border-t pt-4 space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Propriedades do Card
              </h3>

              

              {state.currentBoard && state.currentBoard.labels.length > 0 && <div className="space-y-2">
                  <Label>Etiquetas</Label>
                  <div className="flex flex-wrap gap-2">
                    {state.currentBoard.labels.map(label => <Badge key={label.id} variant={formData.label_ids.includes(label.id) ? "default" : "outline"} className="cursor-pointer" style={formData.label_ids.includes(label.id) ? {
                backgroundColor: label.color,
                borderColor: label.color
              } : {}} onClick={() => toggleLabel(label.id)}>
                        {label.name}
                      </Badge>)}
                  </div>
                </div>}

              {state.currentBoard && state.currentBoard.members.length > 0 && <div className="space-y-2">
                  <Label>Membros</Label>
                  <div className="flex flex-wrap gap-2">
                    {state.currentBoard.members.map(member => <Badge key={member.id} variant={formData.assignee_ids.includes(member.id) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleAssignee(member.id)}>
                        <Users className="h-3 w-3 mr-1" />
                        {member.name}
                      </Badge>)}
                  </div>
                </div>}

              <div className="space-y-2">
                <Label>Cliente (opcional)</Label>
                <Popover open={clientePopoverOpen} onOpenChange={setClientePopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={clientePopoverOpen}
                      className="w-full justify-between"
                    >
                      {formData.client_id
                        ? clientes.find((cliente) => cliente.id === formData.client_id)?.nome
                        : "Selecione um cliente..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 bg-popover z-50" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar cliente..." />
                      <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {clientes.map((cliente) => (
                          <CommandItem
                            key={cliente.id}
                            value={cliente.nome}
                            onSelect={() => {
                              setFormData({ ...formData, client_id: cliente.id });
                              setClientePopoverOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.client_id === cliente.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{cliente.nome}</span>
                              <span className="text-xs text-muted-foreground">{cliente.empresa}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                {formData.client_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData({ ...formData, client_id: "" })}
                    className="h-6 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Remover cliente
                  </Button>
                )}
              </div>

              
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => {
            setShowForm(false);
            setEditingId(null);
          }}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.title || !formData.list_id || formData.frequency === 'daily' && formData.days_of_week.length === 0}>
                {editingId ? "Salvar" : "Criar"}
              </Button>
            </div>
          </CardContent>
        </Card>}

      <div className="space-y-3">
        {isLoading ? <p className="text-sm text-muted-foreground text-center py-8">Carregando...</p> : cards.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum card recorrente criado ainda
          </p> : cards.map(card => <Card key={card.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{card.title}</CardTitle>
                      {card.last_created_at && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Executado
                        </Badge>
                      )}
                    </div>
                    {card.description && <CardDescription className="mt-1">{card.description}</CardDescription>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={card.enabled} onCheckedChange={checked => toggleEnabled(card.id, checked)} />
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(card)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteCard(card.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span>Frequência: {frequencyLabels[card.frequency]}</span>
                    
                  </div>
                  {card.frequency === 'daily' && card.days_of_week && card.days_of_week.length > 0 && <p>
                      Dias: {card.days_of_week.sort((a, b) => a - b).map(day => weekDays.find(d => d.value === day)?.label.substring(0, 3)).join(', ')}
                    </p>}
                  {card.frequency === 'weekly' && card.day_of_week !== null && card.day_of_week !== undefined && <p>Dia: {weekDays.find(d => d.value === card.day_of_week)?.label}</p>}
                  {card.frequency === 'monthly' && card.day_of_month && <p>Dia do mês: {card.day_of_month}</p>}
                  <p>Horário: {card.time_of_day || '09:00'}</p>
                  
                  {card.template_config && <>
                      {Array.isArray(card.template_config.label_ids) && card.template_config.label_ids.length > 0 && (() => {
                const selectedLabels = state.currentBoard?.labels.filter(l => card.template_config.label_ids.includes(l.id)) || [];
                return selectedLabels.length > 0 && <div className="flex items-center gap-1 flex-wrap">
                            <Tag className="h-3 w-3" />
                            {selectedLabels.map(label => <Badge key={label.id} variant="outline" className="text-xs" style={{
                    backgroundColor: label.color,
                    borderColor: label.color,
                    color: 'white'
                  }}>
                                {label.name}
                              </Badge>)}
                          </div>;
              })()}
                      {Array.isArray(card.template_config.assignee_ids) && card.template_config.assignee_ids.length > 0 && (() => {
                const selectedMembers = state.currentBoard?.members.filter(m => card.template_config.assignee_ids.includes(m.id)) || [];
                return selectedMembers.length > 0 && <div className="flex items-center gap-1 flex-wrap">
                            <Users className="h-3 w-3" />
                            {selectedMembers.map(member => <Badge key={member.id} variant="outline" className="text-xs">
                                {member.name}
                              </Badge>)}
                          </div>;
              })()}
                      {card.template_config.client_id && (() => {
                const selectedCliente = clientes.find(c => c.id === card.template_config.client_id);
                return selectedCliente && <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            <Badge variant="outline" className="text-xs">
                              {selectedCliente.nome}
                            </Badge>
                          </div>;
              })()}
                      {card.template_config.estimated_hours > 0 && <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {card.template_config.estimated_hours}h estimadas
                        </div>}
                    </>}
                  
                  <div className="pt-1 border-t space-y-1">
                    <p>Início: {card.start_date ? format(new Date(card.start_date), 'dd/MM/yyyy') : format(new Date(card.created_at), 'dd/MM/yyyy')}</p>
                    <p>Próxima criação: {formatUTC(new Date(card.next_creation_at), 'dd/MM/yyyy HH:mm')}</p>
                    {card.end_date && (
                      <p className="text-muted-foreground">Término: {format(new Date(card.end_date), 'dd/MM/yyyy')}</p>
                    )}
                    {card.last_created_at && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span className="font-medium">Última execução: {formatUTC(new Date(card.last_created_at), 'dd/MM/yyyy HH:mm')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>)}
      </div>
    </div>;
};