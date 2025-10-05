import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { RecurringCardsTab } from "./RecurringCardsTab";
import { ScheduledCardsTab } from "./ScheduledCardsTab";
import { RulesTab } from "./RulesTab";
import { ButtonsTab } from "./ButtonsTab";
import { useProjects } from "@/contexts/ProjectsContext";
import { useAutomationProcessor } from "@/hooks/useAutomationProcessor";

interface AutomationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AutomationDialog = ({ isOpen, onClose }: AutomationDialogProps) => {
  const { state } = useProjects();
  const { processAutomations, isProcessing } = useAutomationProcessor();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              Automação
            </div>
            <Button
              onClick={processAutomations}
              disabled={isProcessing}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              {isProcessing ? "Processando..." : "Processar Agora"}
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="recurring" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="recurring">Cards Recorrentes</TabsTrigger>
            <TabsTrigger value="scheduled">Cards Programados</TabsTrigger>
            <TabsTrigger value="rules">Regras</TabsTrigger>
            <TabsTrigger value="buttons">Botões</TabsTrigger>
          </TabsList>

          <TabsContent value="recurring" className="mt-6">
            <RecurringCardsTab boardId={state.currentBoard?.id || null} />
          </TabsContent>

          <TabsContent value="scheduled" className="mt-6">
            <ScheduledCardsTab boardId={state.currentBoard?.id || null} />
          </TabsContent>

          <TabsContent value="rules" className="mt-6">
            <RulesTab boardId={state.currentBoard?.id || null} />
          </TabsContent>

          <TabsContent value="buttons" className="mt-6">
            <ButtonsTab boardId={state.currentBoard?.id || null} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
