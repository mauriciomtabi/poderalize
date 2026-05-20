import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface FunnelStage {
  id: string;
  title: string;
  color: string;
  position: number;
}

interface LeadStageSelectorProps {
  leadId: string;
  currentStageId?: string;
  currentStageTitle?: string;
  funnelId?: string;
  onStageChange?: () => void;
}

export const LeadStageSelector = ({ 
  leadId, 
  currentStageId, 
  currentStageTitle, 
  funnelId,
  onStageChange 
}: LeadStageSelectorProps) => {
  const { user } = useAuth();
  const [stages, setStages] = useState<FunnelStage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadStages = async () => {
      if (!user || !funnelId) return;

      try {
        const { data, error } = await supabase
          .from('funnel_stages')
          .select('*')
          .eq('funnel_id', funnelId)
          .order('position');

        if (error) {
          console.error('Erro ao carregar etapas:', error);
          return;
        }

        setStages(data || []);
      } catch (error) {
        console.error('Erro ao carregar etapas:', error);
      }
    };

    loadStages();
  }, [user, funnelId]);

  const handleStageChange = async (newStageId: string) => {
    if (!user || isLoading) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('leads')
        .update({ funnel_stage_id: newStageId })
        .eq('id', leadId)
        ;

      if (error) {
        console.error('Erro ao mover lead:', error);
        toast.error('Erro ao mover lead');
        return;
      }

      toast.success('Lead movido com sucesso!');
      onStageChange?.();
    } catch (error) {
      console.error('Erro ao mover lead:', error);
      toast.error('Erro ao mover lead');
    } finally {
      setIsLoading(false);
    }
  };

  if (!funnelId || stages.length === 0) {
    return (
      <Badge variant="outline" className="text-xs">
        {currentStageTitle || 'Sem etapa'}
      </Badge>
    );
  }

  const currentStage = stages.find(s => s.id === currentStageId);
  const availableStages = stages.filter(s => s.id !== currentStageId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-6 text-xs px-2 gap-1"
          disabled={isLoading}
        >
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: currentStage?.color || '#6B7280' }}
          />
          {currentStage?.title || currentStageTitle || 'Sem etapa'}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        {availableStages.map((stage) => (
          <DropdownMenuItem
            key={stage.id}
            onClick={() => handleStageChange(stage.id)}
            className="flex items-center gap-2"
          >
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: stage.color }}
            />
            {stage.title}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};