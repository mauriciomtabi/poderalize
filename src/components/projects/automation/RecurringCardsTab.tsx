import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus } from "lucide-react";
import { useRecurringCards } from "@/hooks/useRecurringCards";
import { useProjects } from "@/contexts/ProjectsContext";
import { format } from "date-fns";

interface RecurringCardsTabProps {
  boardId: string | null;
}

export const RecurringCardsTab = ({ boardId }: RecurringCardsTabProps) => {
  const { state } = useProjects();
  const { cards, isLoading, createCard, deleteCard, toggleEnabled } = useRecurringCards(boardId);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    list_id: "",
    frequency: "daily" as "daily" | "weekly" | "monthly",
    day_of_week: 1,
    day_of_month: 1,
    time_of_day: "09:00",
    days_of_week: [] as number[], // For daily: which days to repeat
  });

  const handleSubmit = async () => {
    if (!boardId || !formData.title || !formData.list_id) return;
    if (formData.frequency === 'daily' && formData.days_of_week.length === 0) return;

    const now = new Date();
    const [hours, minutes] = formData.time_of_day.split(':').map(Number);
    
    let nextCreation = new Date();
    nextCreation.setHours(hours, minutes, 0, 0);

    if (formData.frequency === 'daily') {
      // Find next occurrence based on selected days
      const sortedDays = [...formData.days_of_week].sort((a, b) => a - b);
      const currentDay = nextCreation.getDay();
      
      // Find next day from the selected days
      let nextDay = sortedDays.find(day => day > currentDay);
      
      // If no day found after current day, wrap to first day of next week
      if (nextDay === undefined) {
        nextDay = sortedDays[0];
        const daysToAdd = (7 - currentDay + nextDay) % 7;
        nextCreation.setDate(nextCreation.getDate() + (daysToAdd || 7));
      } else {
        nextCreation.setDate(nextCreation.getDate() + (nextDay - currentDay));
      }
      
      // If calculated time is in the past, move to next occurrence
      if (nextCreation < now) {
        const daysToAdd = sortedDays.length > 1 ? 1 : 7;
        let attempts = 0;
        while (nextCreation < now && attempts < 7) {
          nextCreation.setDate(nextCreation.getDate() + 1);
          if (sortedDays.includes(nextCreation.getDay())) {
            break;
          }
          attempts++;
        }
      }
    } else if (formData.frequency === 'weekly') {
      const daysUntilNext = (formData.day_of_week - nextCreation.getDay() + 7) % 7;
      nextCreation.setDate(nextCreation.getDate() + (daysUntilNext || 7));
      if (nextCreation < now) {
        nextCreation.setDate(nextCreation.getDate() + 7);
      }
    } else if (formData.frequency === 'monthly') {
      nextCreation.setDate(formData.day_of_month);
      if (nextCreation < now) {
        nextCreation.setMonth(nextCreation.getMonth() + 1);
      }
    }

    await createCard({
      board_id: boardId,
      list_id: formData.list_id,
      title: formData.title,
      description: formData.description,
      frequency: formData.frequency,
      day_of_week: formData.frequency === 'weekly' ? formData.day_of_week : undefined,
      day_of_month: formData.frequency === 'monthly' ? formData.day_of_month : undefined,
      time_of_day: formData.time_of_day,
      next_creation_at: nextCreation.toISOString(),
      days_of_week: formData.frequency === 'daily' ? formData.days_of_week : undefined,
      template_config: {},
      enabled: true,
    });

    setShowForm(false);
    setFormData({
      title: "",
      description: "",
      list_id: "",
      frequency: "daily",
      day_of_week: 1,
      day_of_month: 1,
      time_of_day: "09:00",
      days_of_week: [],
    });
  };

  const frequencyLabels = {
    daily: "Diário",
    weekly: "Semanal",
    monthly: "Mensal",
  };

  const weekDays = [
    { value: 0, label: "Domingo" },
    { value: 1, label: "Segunda" },
    { value: 2, label: "Terça" },
    { value: 3, label: "Quarta" },
    { value: 4, label: "Quinta" },
    { value: 5, label: "Sexta" },
    { value: 6, label: "Sábado" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Crie cards automaticamente em intervalos regulares
        </p>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Novo Card Recorrente
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Card Recorrente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Card</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Reunião semanal da equipe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detalhes do card..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="list">Lista</Label>
              <Select value={formData.list_id} onValueChange={(value) => setFormData({ ...formData, list_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma lista" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {state.currentBoard?.lists.map((list) => (
                      <SelectItem key={list.id} value={list.id}>
                        {list.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequência</Label>
                <Select value={formData.frequency} onValueChange={(value: any) => setFormData({ ...formData, frequency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Horário</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time_of_day}
                  onChange={(e) => setFormData({ ...formData, time_of_day: e.target.value })}
                />
              </div>
            </div>

            {formData.frequency === 'daily' && (
              <div className="space-y-2">
                <Label>Dias da Semana</Label>
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day) => (
                    <Button
                      key={day.value}
                      type="button"
                      variant={formData.days_of_week.includes(day.value) ? "default" : "outline"}
                      size="sm"
                      className="h-10 text-xs"
                      onClick={() => {
                        const newDays = formData.days_of_week.includes(day.value)
                          ? formData.days_of_week.filter(d => d !== day.value)
                          : [...formData.days_of_week, day.value].sort();
                        setFormData({ ...formData, days_of_week: newDays });
                      }}
                    >
                      {day.label.substring(0, 3)}
                    </Button>
                  ))}
                </div>
                {formData.days_of_week.length === 0 && (
                  <p className="text-xs text-destructive">Selecione pelo menos um dia</p>
                )}
              </div>
            )}

            {formData.frequency === 'weekly' && (
              <div className="space-y-2">
                <Label htmlFor="day_of_week">Dia da Semana</Label>
                <Select value={String(formData.day_of_week)} onValueChange={(value) => setFormData({ ...formData, day_of_week: Number(value) })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {weekDays.map((day) => (
                      <SelectItem key={day.value} value={String(day.value)}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.frequency === 'monthly' && (
              <div className="space-y-2">
                <Label htmlFor="day_of_month">Dia do Mês</Label>
                <Input
                  id="day_of_month"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.day_of_month}
                  onChange={(e) => setFormData({ ...formData, day_of_month: Number(e.target.value) })}
                />
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={
                  !formData.title || 
                  !formData.list_id || 
                  (formData.frequency === 'daily' && formData.days_of_week.length === 0)
                }
              >
                Criar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-8">Carregando...</p>
        ) : cards.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum card recorrente criado ainda
          </p>
        ) : (
          cards.map((card) => (
            <Card key={card.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{card.title}</CardTitle>
                    {card.description && (
                      <CardDescription className="mt-1">{card.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={card.enabled}
                      onCheckedChange={(checked) => toggleEnabled(card.id, checked)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteCard(card.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Frequência: {frequencyLabels[card.frequency]}</p>
                  {card.frequency === 'daily' && card.days_of_week && card.days_of_week.length > 0 && (
                    <p>
                      Dias: {card.days_of_week
                        .sort((a, b) => a - b)
                        .map(day => weekDays.find(d => d.value === day)?.label.substring(0, 3))
                        .join(', ')}
                    </p>
                  )}
                  {card.frequency === 'weekly' && card.day_of_week !== null && card.day_of_week !== undefined && (
                    <p>Dia: {weekDays.find(d => d.value === card.day_of_week)?.label}</p>
                  )}
                  {card.frequency === 'monthly' && card.day_of_month && (
                    <p>Dia do mês: {card.day_of_month}</p>
                  )}
                  <p>Horário: {card.time_of_day || '09:00'}</p>
                  <p>Próxima criação: {format(new Date(card.next_creation_at), 'dd/MM/yyyy HH:mm')}</p>
                  {card.last_created_at && (
                    <p>Última criação: {format(new Date(card.last_created_at), 'dd/MM/yyyy HH:mm')}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
