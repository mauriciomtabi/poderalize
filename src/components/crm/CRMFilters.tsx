import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { useCRM } from "@/contexts/CRMContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

export const CRMFilters = () => {
  const { state, setFilters } = useCRM();
  const [dateRange, setDateRange] = useState<{ start: Date | undefined; end: Date | undefined }>({
    start: undefined,
    end: undefined
  });

  const handleDateRangeChange = (start: Date | undefined, end: Date | undefined) => {
    setDateRange({ start, end });
    if (start && end) {
      setFilters({
        dateRange: {
          start: start.toISOString(),
          end: end.toISOString()
        }
      });
    }
  };

  const clearDateRange = () => {
    setDateRange({ start: undefined, end: undefined });
    setFilters({ dateRange: null });
  };

  const leadSources = ['Website', 'LinkedIn', 'Google Ads', 'Indicação', 'Evento', 'Cold Call'];
  const responsibles = ['Maria Santos', 'Carlos Lima', 'Ana Silva', 'Pedro Costa'];

  const addSourceFilter = (source: string) => {
    if (!state.filters.leadSource.includes(source)) {
      setFilters({
        leadSource: [...state.filters.leadSource, source]
      });
    }
  };

  const removeSourceFilter = (source: string) => {
    setFilters({
      leadSource: state.filters.leadSource.filter(s => s !== source)
    });
  };

  const addResponsibleFilter = (responsible: string) => {
    if (!state.filters.responsible.includes(responsible)) {
      setFilters({
        responsible: [...state.filters.responsible, responsible]
      });
    }
  };

  const removeResponsibleFilter = (responsible: string) => {
    setFilters({
      responsible: state.filters.responsible.filter(r => r !== responsible)
    });
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      dateRange: null,
      leadSource: [],
      responsible: [],
      funnel: null
    });
    setDateRange({ start: undefined, end: undefined });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Filtros</h3>
        <Button variant="outline" size="sm" onClick={clearAllFilters}>
          Limpar Filtros
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Date Range */}
        <div className="space-y-2">
          <Label>Período</Label>
          <div className="space-y-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.start ? (
                    format(dateRange.start, "dd/MM/yyyy", { locale: ptBR })
                  ) : (
                    "Data inicial"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange.start}
                  onSelect={(date) => handleDateRangeChange(date, dateRange.end)}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.end ? (
                    format(dateRange.end, "dd/MM/yyyy", { locale: ptBR })
                  ) : (
                    "Data final"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange.end}
                  onSelect={(date) => handleDateRangeChange(dateRange.start, date)}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>

            {(dateRange.start || dateRange.end) && (
              <Button variant="ghost" size="sm" onClick={clearDateRange} className="w-full">
                <X className="h-4 w-4 mr-2" />
                Limpar datas
              </Button>
            )}
          </div>
        </div>

        {/* Lead Source */}
        <div className="space-y-2">
          <Label>Origem do Lead</Label>
          <Select onValueChange={addSourceFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Selecionar origem" />
            </SelectTrigger>
            <SelectContent>
              {leadSources
                .filter(source => !state.filters.leadSource.includes(source))
                .map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-1 mt-2">
            {state.filters.leadSource.map((source) => (
              <Badge
                key={source}
                variant="secondary"
                className="text-xs cursor-pointer"
                onClick={() => removeSourceFilter(source)}
              >
                {source}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
          </div>
        </div>

        {/* Responsible */}
        <div className="space-y-2">
          <Label>Responsável</Label>
          <Select onValueChange={addResponsibleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Selecionar responsável" />
            </SelectTrigger>
            <SelectContent>
              {responsibles
                .filter(responsible => !state.filters.responsible.includes(responsible))
                .map((responsible) => (
                  <SelectItem key={responsible} value={responsible}>
                    {responsible}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-1 mt-2">
            {state.filters.responsible.map((responsible) => (
              <Badge
                key={responsible}
                variant="secondary"
                className="text-xs cursor-pointer"
                onClick={() => removeResponsibleFilter(responsible)}
              >
                {responsible}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
          </div>
        </div>

        {/* Funnel Filter */}
        <div className="space-y-2">
          <Label>Funil Específico</Label>
          <Select
            value={state.filters.funnel || ""}
            onValueChange={(value) => setFilters({ funnel: value || null })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos os funis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os funis</SelectItem>
              {state.funnels.map((funnel) => (
                <SelectItem key={funnel.id} value={funnel.id}>
                  {funnel.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
};