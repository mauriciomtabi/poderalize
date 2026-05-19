import { useState } from "react";
import { Search, Filter, Plus, Settings, Zap, TrendingUp, Clock, DollarSign, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCRM } from "@/contexts/CRMContext";
import { CreateFunnelDialog } from "./CreateFunnelDialog";
import { EditFunnelDialog } from "./EditFunnelDialog";
import { CRMFilters } from "./CRMFilters";
import { CRMSettings } from "./CRMSettings";

export const CRMHeader = () => {
  const { currentFunnel, funnels, metrics, filters, setCurrentFunnel, setFilters } = useCRM();
  const [showCreateFunnel, setShowCreateFunnel] = useState(false);
  const [showEditFunnel, setShowEditFunnel] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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
    <div className="space-y-6">
{/* Metrics Row — Compact and elegant */}
      <div className="flex flex-wrap items-center gap-3">
        {metricsData.map((metric, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-full border border-border bg-surface-elevated px-4 py-2 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-default"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-primary ring-1 ring-primary/10">
              <metric.icon className="h-4 w-4" strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground leading-none mb-1">
                {metric.title}
              </p>
              <div className="flex items-baseline gap-1">
                <p className="font-display text-sm font-bold text-secondary leading-none">
                  {metric.value}
                </p>
                {metric.suffix && (
                  <span className="text-[10px] font-medium text-muted-foreground ml-1">{metric.suffix}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar — funnel + search + actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-border bg-surface-elevated px-4 py-3 shadow-sm">
        {/* 1. Funnel Selector */}
        <div className="flex-shrink-0 flex items-center gap-2">
          <div className="hidden sm:flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          <Select
            value={currentFunnel?.id || ""}
            onValueChange={handleFunnelChange}
          >
            <SelectTrigger className="h-10 text-sm min-w-[200px] border-border bg-background font-medium">
              <SelectValue placeholder="Selecionar funil" />
            </SelectTrigger>
            <SelectContent>
              {funnels.filter(funnel => funnel.id && funnel.id.trim()).map((funnel) => (
                <SelectItem key={funnel.id} value={funnel.id}>
                  <div className="flex items-center gap-2">
                    <span>{funnel.name}</span>
                    {funnel.isActive && (
                      <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                        Ativo
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 2. Search */}
        <div className="flex-1 min-w-0 max-w-md">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar leads..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 h-10 text-sm bg-background border-border"
            />
          </div>
        </div>

        {/* 3. Action Buttons */}
        <div className="flex gap-1.5 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`h-10 px-3 ${showFilters ? "bg-accent text-primary border-primary/30" : ""}`}
          >
            <Filter size={16} className="sm:mr-1.5" />
            <span className="hidden sm:inline">Filtros</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setShowCreateFunnel(true)}
            className="h-10 px-3 bg-primary hover:bg-primary-dark text-primary-foreground shadow-orange"
          >
            <Plus size={16} className="sm:mr-1.5" />
            <span className="hidden sm:inline">Novo funil</span>
          </Button>

          {currentFunnel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditFunnel(true)}
              className="h-10 px-3"
            >
              <Edit size={16} className="sm:mr-1.5" />
              <span className="hidden sm:inline">Editar</span>
            </Button>
          )}

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowSettings(true)}
            className="h-10 w-10"
          >
            <Settings size={16} />
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="animate-fade-in">
          <CRMFilters />
        </div>
      )}

      {/* Create Funnel Dialog */}
      <CreateFunnelDialog
        open={showCreateFunnel}
        onOpenChange={setShowCreateFunnel}
      />

      {/* Edit Funnel Dialog */}
      {currentFunnel && (
        <EditFunnelDialog
          open={showEditFunnel}
          onOpenChange={setShowEditFunnel}
          funnel={currentFunnel}
        />
      )}

      {/* Settings Dialog */}
      <CRMSettings
        open={showSettings}
        onOpenChange={setShowSettings}
      />
    </div>
  );
};