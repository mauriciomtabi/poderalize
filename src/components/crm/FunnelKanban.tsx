import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CustomFunnel } from "@/types/crm";
import { useCRM } from "@/contexts/CRMContext";
import { LeadCard } from "./LeadCard";
import { AddLeadToFunnelDialog } from "./AddLeadToFunnelDialog";
import { TrendingUp, Users, Plus } from "lucide-react";
import { useState, useRef } from "react";

interface FunnelKanbanProps {
  funnel: CustomFunnel;
}

// Helper to disable drop animation and prevent style artifacts
const getDropStyle = (style: any, snapshot: any) => {
  if (!style) return style;
  if (!snapshot.isDropAnimating) return style;
  return { ...style, transitionDuration: '0.001s' };
};

export const FunnelKanban = ({ funnel }: FunnelKanbanProps) => {
  const { moveLead } = useCRM();
  const [addLeadDialog, setAddLeadDialog] = useState<{ open: boolean; stageId: string }>({
    open: false,
    stageId: ""
  });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [dndKey, setDndKey] = useState(0);

  // Ensure real repaint even at scroll edges
  const directionAwareMicroScroll = (sc: HTMLDivElement | null) => {
    if (!sc) return;
    const atStart = sc.scrollLeft <= 0;
    const atEnd = sc.scrollLeft >= sc.scrollWidth - sc.clientWidth - 1;
    const delta = atEnd ? -1 : 1;
    sc.scrollBy({ left: delta, behavior: 'auto' });
    requestAnimationFrame(() => sc.scrollBy({ left: -delta, behavior: 'auto' }));
  };

  const forcePaint = (sc: HTMLDivElement | null) => {
    if (!sc) return;
    const prev = sc.style.transform;
    sc.style.transform = 'translateZ(0)';
    void sc.offsetHeight; // reflow
    sc.style.transform = prev;
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) return;

    moveLead(draggableId, destination.droppableId);
    
    // Global cleanup function to remove ALL DnD artifacts
    const cleanupGlobalDnD = () => {
      const selectors = '[data-rbd-draggable-id], [data-rbd-drag-handle-draggable-id], [data-rbd-droppable-id]';
      document.querySelectorAll(selectors).forEach((el) => {
        const node = el as HTMLElement;
        node.style.transform = '';
        node.style.transition = '';
        node.style.willChange = '';
      });
      
      document.querySelectorAll('[data-rbd-placeholder-context-id]').forEach((el) => {
        const node = el as HTMLElement;
        node.style.transform = '';
        node.style.height = '';
        node.style.width = '';
      });
    };
    
    // Cleanup global após mover lead
    requestAnimationFrame(() => {
      cleanupGlobalDnD();
      void document.body.offsetHeight; // Global reflow
      
      // Real scroll para forçar repaint
      const sc = scrollContainerRef.current;
      if (sc) {
        sc.scrollBy({ left: 3, behavior: 'auto' });
        requestAnimationFrame(() => {
          sc.scrollBy({ left: -3, behavior: 'auto' });
        });
      }
      
      window.dispatchEvent(new Event('resize'));
      
      // Auto-scroll para stage de destino DEPOIS do cleanup
      setTimeout(() => {
        const targetEl = sc?.querySelector(`[data-stage-id="${destination.droppableId}"]`) as HTMLElement | null;
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        }
      }, 100);
    });
  };

  const calculateConversionRate = (currentStageIndex: number) => {
    if (currentStageIndex === 0) return 100;
    
    const currentStage = funnel.stages[currentStageIndex];
    const previousStage = funnel.stages[currentStageIndex - 1];
    
    if (previousStage.leads.length === 0) return 0;
    
    return Math.round((currentStage.leads.length / previousStage.leads.length) * 100);
  };

  const handleAddLead = (stageId: string) => {
    setAddLeadDialog({ open: true, stageId });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="mb-5 landscape:mb-2 sm:mb-6 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl landscape:text-base sm:text-3xl font-bold text-secondary tracking-tight">{funnel.name}</h2>
          {funnel.description && (
            <p className="mt-1 text-sm landscape:text-xs sm:text-base text-muted-foreground">{funnel.description}</p>
          )}
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          {funnel.stages.length} etapas
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div ref={scrollContainerRef} className="flex gap-5 landscape:gap-2 sm:gap-6 pb-2 landscape:pb-1 sm:pb-4 flex-1 overflow-x-auto overflow-y-hidden">
          {funnel.stages.map((stage, index) => (
            <div key={stage.id} data-stage-id={stage.id} className="flex-shrink-0 w-72 landscape:w-56 sm:w-80">
              <Card
                className="h-[calc(100vh-20rem)] landscape:h-[calc(100vh-8rem)] sm:h-[calc(100vh-18rem)] flex flex-col overflow-hidden border-border bg-surface-subtle shadow-sm"
              >
                {/* Stage Header */}
                <div
                  className="px-4 pt-4 pb-3 landscape:p-2 border-b border-border/60 bg-surface-elevated"
                  style={{ boxShadow: `inset 3px 0 0 ${stage.color}` }}
                >
                  <div className="flex items-center justify-between mb-2 landscape:mb-1">
                    <h3 className="font-display font-semibold text-sm landscape:text-xs text-secondary flex items-center gap-2 landscape:gap-1 tracking-tight">
                      <span
                        className="w-2 h-2 landscape:w-2 landscape:h-2 rounded-full ring-2 ring-offset-1"
                        style={{ backgroundColor: stage.color, boxShadow: `0 0 0 3px ${stage.color}22` } as any}
                      />
                      {stage.title}
                    </h3>
                    <Badge variant="secondary" className="text-[11px] h-5 px-2 bg-secondary text-secondary-foreground font-medium tabular-nums">
                      {stage.leads.length}
                    </Badge>
                  </div>

                  {/* Stage Metrics */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 landscape:gap-2 text-xs landscape:text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1 landscape:gap-0.5">
                        <Users className="h-3 w-3" />
                        <span className="tabular-nums">{stage.leads.length}</span>
                      </div>
                      {index > 0 && (
                        <div className="flex items-center gap-1 landscape:gap-0.5">
                          <TrendingUp className="h-3 w-3" />
                          <span className="tabular-nums">{calculateConversionRate(index)}%</span>
                        </div>
                      )}
                    </div>

                    {/* Add Lead Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddLead(stage.id)}
                      className="text-muted-foreground hover:text-primary hover:bg-accent h-7 w-7 landscape:h-6 landscape:w-6 p-0 rounded-lg"
                    >
                      <Plus className="h-4 w-4 landscape:h-3 landscape:w-3" />
                    </Button>
                  </div>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 p-3 landscape:p-2 space-y-2.5 landscape:space-y-2 min-h-[200px] landscape:min-h-[150px] overflow-y-auto overflow-x-hidden pr-2 landscape:pr-1 transition-colors ${
                        snapshot.isDraggingOver 
                          ? 'kanban-drop-zone' 
                          : ''
                      }`}
                    >
                      {stage.leads.map((lead, leadIndex) => (
                        <Draggable
                          key={lead.id}
                          draggableId={lead.id}
                          index={leadIndex}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={getDropStyle(provided.draggableProps.style, snapshot)}
                              className={`${
                                snapshot.isDragging 
                                  ? 'rotate-2 scale-105 shadow-xl opacity-95' 
                                  : ''
                              }`}
                            >
                              <LeadCard lead={lead} onLeadUpdate={() => window.location.reload()} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {stage.leads.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-36 text-muted-foreground text-sm border border-dashed border-border rounded-xl bg-background/50">
                          <p className="mb-2 text-xs">Nenhum lead ainda</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddLead(stage.id)}
                            className="text-primary hover:text-primary-dark hover:bg-accent"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Lead
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </Card>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Add Lead Dialog */}
      <AddLeadToFunnelDialog
        open={addLeadDialog.open}
        onOpenChange={(open) => setAddLeadDialog({ ...addLeadDialog, open })}
        stageId={addLeadDialog.stageId}
      />
    </div>
  );
};