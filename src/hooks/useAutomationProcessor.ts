import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useAutomationProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processAutomations = async () => {
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('process-automations', {
        body: {}
      });

      if (error) throw error;

      const recurringCount = data?.recurring_cards_processed || 0;
      const scheduledCount = data?.scheduled_cards_processed || 0;
      const totalProcessed = recurringCount + scheduledCount;

      if (totalProcessed > 0) {
        toast({
          title: "Automações processadas",
          description: `${totalProcessed} card(s) criado(s) com sucesso`,
        });
      } else {
        toast({
          title: "Nenhuma automação pendente",
          description: "Não há cards para criar no momento",
        });
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error processing automations:', error);
      toast({
        title: "Erro ao processar automações",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processAutomations,
    isProcessing,
  };
};
