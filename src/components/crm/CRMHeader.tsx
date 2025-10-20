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
    <div className="space-y-4">
      {/* Page Title */}
      <div className="space-y-1">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent animate-fade-in">
          CRM & Leads
        </h2>
        <p className="text-muted-foreground">Gerencie seus funis de vendas e acompanhe seus leads</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricsData.map((metric, index) => (
          <Card key={index} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {metric.title}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {metric.value}
                </p>
              </div>
              <div className={`p-3 rounded-full ${metric.bgColor}`}>
                <metric.icon className={`h-6 w-6 ${metric.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Header Controls */}
      <div className="flex flex-row items-center justify-between gap-2 px-3 py-2">
        {/* 1. Funnel Selector */}
        <div className="flex-shrink-0">
          <Select
            value={currentFunnel?.id || ""}
            onValueChange={handleFunnelChange}
          >
            <SelectTrigger className="h-8 text-sm min-w-[150px]">
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

        {/* 2. Search */}
        <div className="flex-1 min-w-0 max-w-xs">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar leads..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-8 h-8 text-sm"
            />
          </div>
        </div>

        {/* 3. Action Buttons */}
        <div className="flex gap-1 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`h-8 px-2 ${showFilters ? "bg-muted" : ""}`}
          >
            <Filter size={16} className="sm:mr-1" />
            <span className="hidden sm:inline">Filtros</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateFunnel(true)}
            className="h-8 px-2"
          >
            <Plus size={16} className="sm:mr-1" />
            <span className="hidden sm:inline">Novo</span>
          </Button>

          {currentFunnel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditFunnel(true)}
              className="h-8 px-2"
            >
              <Edit size={16} className="sm:mr-1" />
              <span className="hidden sm:inline">Editar</span>
            </Button>
          )}

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowSettings(true)}
            className="h-8 w-8"
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