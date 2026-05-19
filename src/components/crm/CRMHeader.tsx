import { useState } from "react";
import { Search, Filter, Plus, Settings, Zap, TrendingUp, Clock, DollarSign, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useCRM } from "@/contexts/CRMContext";
import { CreateFunnelDialog } from "./CreateFunnelDialog";
import { EditFunnelDialog } from "./EditFunnelDialog";
import { AddLeadToFunnelDialog } from "./AddLeadToFunnelDialog";
import { CRMFilters } from "./CRMFilters";
import { CRMSettings } from "./CRMSettings";

export const CRMHeader = () => {
  const { currentFunnel, funnels, metrics, filters, setCurrentFunnel, setFilters } = useCRM();
  const [showCreateFunnel, setShowCreateFunnel] = useState(false);
  const [showEditFunnel, setShowEditFunnel] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddLead, setShowAddLead] = useState(false);

  const handleFunnelChange = (funnelId: string) => {
    const funnel = funnels.find(f => f.id === funnelId);
    if (funnel) {
      setCurrentFunnel(funnel);
    }
  };

  const handleSearchChange = (value: string) => {
    setFilters({ search: value });
  };

  const metricsData = [
    { title: "Total de Leads", value: metrics.totalLeads.toString(), icon: Zap, hint: "no funil ativo" },
    { title: "Taxa de Conversão", value: `${metrics.conversionRate}%`, icon: TrendingUp, hint: "leads → fechados" },
    { title: "Ciclo Médio", value: `${metrics.averageCycleTime}`, suffix: "dias", icon: Clock, hint: "do primeiro contato" },
    { title: "Receita Prevista", value: `R$ ${metrics.predictedRevenue.toLocaleString('pt-BR')}`, icon: DollarSign, hint: "soma do pipeline" },
  ];

  return (
    <div className="sticky top-0 z-30 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border-b border-border pb-2 pt-2 -mx-4 px-4 sm:-mx-6 sm:px-6">
      <div className="flex flex-row items-center justify-between gap-3">
        
        {/* 1. Funnel Selector */}
        <div className="flex-shrink-0">
          <Select
            value={currentFunnel?.id || ""}
            onValueChange={handleFunnelChange}
          >
            <SelectTrigger className="h-8 text-sm min-w-[200px] bg-muted border-transparent font-medium shadow-none">
              <SelectValue placeholder="Selecionar funil" />
            </SelectTrigger>
            <SelectContent>
              {funnels.filter(funnel => funnel.id && funnel.id.trim()).map((funnel) => (
                <SelectItem key={funnel.id} value={funnel.id}>
                  {funnel.name} {funnel.isActive && "(Ativo)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 2. Campo de Busca */}
        <div className="flex-1 min-w-[200px] max-w-md">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar leads..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 h-8 text-sm bg-muted border-transparent shadow-none focus-visible:ring-1"
            />
          </div>
        </div>

        {/* 3. Botões de Ação */}
        <div className="flex gap-2 flex-shrink-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="relative h-8 px-3 bg-muted border-transparent shadow-none hover:bg-muted/80">
                <Filter size={16} className="sm:mr-1" />
                <span className="hidden sm:inline">Filtros</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" side="bottom" className="p-0 w-80">
              <div className="p-4 bg-popover rounded-md border border-border shadow-md">
                <CRMFilters />
              </div>
            </PopoverContent>
          </Popover>

          <Button
            size="sm"
            onClick={() => setShowAddLead(true)}
            className="h-8 px-3 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus size={16} className="sm:mr-1" />
            <span className="hidden sm:inline">Novo Lead</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setShowCreateFunnel(true)}
            className="h-8 px-3 shadow-sm"
          >
            <Plus size={16} className="sm:mr-1" />
            <span className="hidden sm:inline">Novo funil</span>
          </Button>

          {currentFunnel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditFunnel(true)}
              className="h-8 px-3 bg-muted border-transparent shadow-none hover:bg-muted/80"
            >
              <Edit size={16} className="sm:mr-1" />
              <span className="hidden sm:inline">Editar</span>
            </Button>
          )}

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowSettings(true)}
            className="h-8 w-8 p-0 bg-muted border-transparent shadow-none hover:bg-muted/80"
          >
            <Settings size={16} />
          </Button>
        </div>
      </div>

      {/* Metrics Row - super compact */}
      <div className="flex flex-wrap items-center gap-4 mt-2">
        {metricsData.map((metric, index) => (
          <div key={index} className="flex items-center gap-1.5 text-xs">
            <metric.icon className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground font-medium">{metric.title}:</span>
            <span className="font-bold text-secondary">{metric.value} {metric.suffix}</span>
          </div>
        ))}
      </div>

      <CreateFunnelDialog
        open={showCreateFunnel}
        onOpenChange={setShowCreateFunnel}
      />

      {currentFunnel && (
        <EditFunnelDialog
          open={showEditFunnel}
          onOpenChange={setShowEditFunnel}
          funnel={currentFunnel}
        />
      )}

      {currentFunnel && (
        <AddLeadToFunnelDialog
          open={showAddLead}
          onOpenChange={setShowAddLead}
          stageId={currentFunnel.stages?.[0]?.id || ''}
        />
      )}

      <CRMSettings
        open={showSettings}
        onOpenChange={setShowSettings}
      />
    </div>
  );
};