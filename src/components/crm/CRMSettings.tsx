import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useCRM } from "@/contexts/CRMContext";
import { Trash2, Archive, Edit, Calendar, Users, Target, Settings2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CRMSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CRMSettings = ({ open, onOpenChange }: CRMSettingsProps) => {
  const { state, deleteFunnel, updateFunnel } = useCRM();
  const [funnelToDelete, setFunnelToDelete] = useState<string | null>(null);
  const [funnelToArchive, setFunnelToArchive] = useState<string | null>(null);

  const handleDeleteFunnel = (funnelId: string) => {
    if (state.funnels.length <= 1) {
      // Don't allow deleting the last funnel
      return;
    }
    deleteFunnel(funnelId);
    setFunnelToDelete(null);
  };

  const handleArchiveFunnel = (funnelId: string) => {
    updateFunnel(funnelId, { isActive: false });
    setFunnelToArchive(null);
  };

  const handleActivateFunnel = (funnelId: string) => {
    updateFunnel(funnelId, { isActive: true });
  };

  const getTotalLeads = (funnel: any) => {
    return funnel.stages.reduce((total: number, stage: any) => total + stage.leads.length, 0);
  };

  const getActiveFunnels = () => state.funnels.filter(f => f.isActive);
  const getArchivedFunnels = () => state.funnels.filter(f => !f.isActive);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Configurações do CRM
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Active Funnels */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                Funis Ativos ({getActiveFunnels().length})
              </h3>
              <div className="space-y-3">
                {getActiveFunnels().map((funnel) => (
                  <Card key={funnel.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-foreground">{funnel.name}</h4>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Ativo
                          </Badge>
                          {state.currentFunnel?.id === funnel.id && (
                            <Badge className="bg-primary text-primary-foreground">
                              Atual
                            </Badge>
                          )}
                        </div>
                        
                        {funnel.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {funnel.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{getTotalLeads(funnel)} leads</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            <span>{funnel.stages.length} etapas</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Criado em {format(new Date(funnel.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                          </div>
                        </div>

                        {/* Stages Preview */}
                        <div className="flex gap-2 mt-3">
                          {funnel.stages.map((stage) => (
                            <div
                              key={stage.id}
                              className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                              style={{ 
                                backgroundColor: `${stage.color}20`,
                                color: stage.color 
                              }}
                            >
                              <div 
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: stage.color }}
                              />
                              {stage.title} ({stage.leads.length})
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setFunnelToArchive(funnel.id)}
                        >
                          <Archive className="h-4 w-4 mr-2" />
                          Arquivar
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setFunnelToDelete(funnel.id)}
                          disabled={state.funnels.length <= 1}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Archived Funnels */}
            {getArchivedFunnels().length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Archive className="h-5 w-5 text-muted-foreground" />
                    Funis Arquivados ({getArchivedFunnels().length})
                  </h3>
                  <div className="space-y-3">
                    {getArchivedFunnels().map((funnel) => (
                      <Card key={funnel.id} className="p-4 bg-muted/30">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium text-muted-foreground">{funnel.name}</h4>
                              <Badge variant="outline" className="text-muted-foreground">
                                Arquivado
                              </Badge>
                            </div>
                            
                            {funnel.description && (
                              <p className="text-sm text-muted-foreground mb-3">
                                {funnel.description}
                              </p>
                            )}

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{getTotalLeads(funnel)} leads</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                <span>{funnel.stages.length} etapas</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  Arquivado em {format(new Date(funnel.updatedAt), "dd/MM/yyyy", { locale: ptBR })}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleActivateFunnel(funnel.id)}
                            >
                              <Target className="h-4 w-4 mr-2" />
                              Reativar
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setFunnelToDelete(funnel.id)}
                              disabled={state.funnels.length <= 1}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Help Text */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Sobre o gerenciamento de funis:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Funis arquivados mantêm os dados mas ficam ocultos da visualização principal</li>
                <li>• Você sempre deve ter pelo menos um funil ativo</li>
                <li>• Excluir um funil remove permanentemente todos os dados associados</li>
                <li>• Funis arquivados podem ser reativados a qualquer momento</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!funnelToDelete} onOpenChange={() => setFunnelToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Funil</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este funil? Esta ação não pode ser desfeita e todos os leads associados serão permanentemente removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => funnelToDelete && handleDeleteFunnel(funnelToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={!!funnelToArchive} onOpenChange={() => setFunnelToArchive(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Arquivar Funil</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja arquivar este funil? Ele ficará oculto da visualização principal, mas poderá ser reativado depois.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => funnelToArchive && handleArchiveFunnel(funnelToArchive)}>
              Arquivar Funil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};