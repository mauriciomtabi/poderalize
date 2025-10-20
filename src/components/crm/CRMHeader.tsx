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
import { AddLeadToFunnelDialog } from "./AddLeadToFunnelDialog";

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
      {/* Metrics Cards */}
      <div className="grid grid-cols-4 gap-4">
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

      {/* Search and Add Button */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar leads..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setShowAddLead(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Novo Lead
        </Button>
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

      {/* Add Lead Dialog */}
      {currentFunnel && (
        <AddLeadToFunnelDialog
          open={showAddLead}
          onOpenChange={setShowAddLead}
          stageId={currentFunnel.stages[0]?.id || ""}
        />
      )}
    </div>
  );
};