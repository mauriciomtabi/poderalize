import { useState } from "react";
import { Search, Filter, Plus, Settings, Zap, TrendingUp, Clock, DollarSign, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
    {
      title: "Total de Leads",
      value: metrics.totalLeads,
      icon: Zap,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Taxa de Conversão",
      value: `${metrics.conversionRate}%`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Ciclo Médio",
      value: `${metrics.averageCycleTime} dias`,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Receita Prevista",
      value: `R$ ${metrics.predictedRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <div className="space-y-6 landscape:space-y-3">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 landscape:gap-2">
        {metricsData.map((metric, index) => (
          <Card key={index} className="p-4 landscape:p-2 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm landscape:text-xs font-medium text-muted-foreground mb-1 landscape:mb-0">
                  {metric.title}
                </p>
                <p className="text-2xl landscape:text-xl font-bold text-foreground">
                  {metric.value}
                </p>
              </div>
              <div className={`p-3 landscape:p-2 rounded-full ${metric.bgColor}`}>
                <metric.icon className={`h-6 w-6 landscape:h-5 landscape:w-5 ${metric.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 landscape:gap-2 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 landscape:gap-2 sm:gap-4 flex-1 w-full">
          {/* Funnel Selector */}
          <div className="min-w-[150px] w-full sm:w-auto sm:max-w-[200px]">
            <Select
              value={currentFunnel?.id || ""}
              onValueChange={handleFunnelChange}
            >
              <SelectTrigger className="h-10 landscape:h-8 text-sm landscape:text-xs">
                <SelectValue placeholder="Selecionar funil" />
              </SelectTrigger>
              <SelectContent>
                {funnels.filter(funnel => funnel.id && funnel.id.trim()).map((funnel) => (
                  <SelectItem key={funnel.id} value={funnel.id}>
                    <div className="flex items-center gap-2">
                      <span>{funnel.name}</span>
                      {funnel.isActive && (
                        <Badge variant="secondary" className="text-xs">
                          Ativo
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 landscape:left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 landscape:h-3 landscape:w-3" />
            <Input
              placeholder="Buscar leads..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 landscape:pl-8 h-10 landscape:h-8 text-sm landscape:text-xs"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 landscape:gap-1 flex-wrap w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex-1 sm:flex-initial h-9 landscape:h-7 px-3 landscape:px-2 ${showFilters ? "bg-muted" : ""}`}
          >
            <Filter className="h-4 w-4 landscape:h-3 landscape:w-3 sm:mr-2 landscape:sm:mr-1" />
            <span className="hidden sm:inline landscape:hidden lg:inline text-sm landscape:text-xs">Filtros</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateFunnel(true)}
            className="flex-1 sm:flex-initial h-9 landscape:h-7 px-3 landscape:px-2"
          >
            <Plus className="h-4 w-4 landscape:h-3 landscape:w-3 sm:mr-2 landscape:sm:mr-1" />
            <span className="hidden sm:inline landscape:hidden lg:inline text-sm landscape:text-xs">Novo</span>
          </Button>

          {currentFunnel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditFunnel(true)}
              className="flex-1 sm:flex-initial h-9 landscape:h-7 px-3 landscape:px-2"
            >
              <Edit className="h-4 w-4 landscape:h-3 landscape:w-3 sm:mr-2 landscape:sm:mr-1" />
              <span className="hidden sm:inline landscape:hidden lg:inline text-sm landscape:text-xs">Editar</span>
            </Button>
          )}

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowSettings(true)}
            className="flex-1 sm:flex-initial h-9 w-9 landscape:h-7 landscape:w-7"
          >
            <Settings className="h-4 w-4 landscape:h-3 landscape:w-3" />
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