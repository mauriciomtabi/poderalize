import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePlanos, TipoPlano } from "@/hooks/usePlanos";
import { useState } from "react";
import { EditPlanoDialog } from "./EditPlanoDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface PlanosListProps {
  tipo: TipoPlano;
}

export function PlanosList({ tipo }: PlanosListProps) {
  const { planos, deletePlano } = usePlanos();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const planosDoTipo = planos.filter(p => p.tipo === tipo);

  const formatCurrency = (value?: number) => {
    if (!value) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const renderConfiguracoes = (configuracoes: any) => {
    const items = [];
    if (configuracoes.qtde_feed) items.push(`${configuracoes.qtde_feed} Feed`);
    if (configuracoes.qtde_reels) items.push(`${configuracoes.qtde_reels} Reels`);
    if (configuracoes.stories_semanais) items.push(`${configuracoes.stories_semanais} Stories/sem`);
    if (configuracoes.qtde_campanhas) items.push(`${configuracoes.qtde_campanhas} Campanhas`);
    return items.join(" • ");
  };

  if (planosDoTipo.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Nenhum plano cadastrado para este tipo de serviço.</p>
        <p className="text-sm mt-2">Clique em "Novo Plano" para criar o primeiro.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {planosDoTipo.map((plano) => (
          <Card key={plano.id} className={!plano.ativo ? 'opacity-50' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{plano.nome}</CardTitle>
                  <CardDescription className="mt-1">
                    {plano.descricao || 'Sem descrição'}
                  </CardDescription>
                </div>
                <Badge variant={plano.ativo ? 'default' : 'secondary'}>
                  {plano.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.keys(plano.configuracoes).length > 0 && (
                <div className="text-sm">
                  <p className="font-medium mb-1">Configurações:</p>
                  <p className="text-muted-foreground">{renderConfiguracoes(plano.configuracoes)}</p>
                </div>
              )}

              {plano.valor_sugerido && (
                <div className="text-sm">
                  <p className="font-medium">Valor Sugerido:</p>
                  <p className="text-lg font-bold text-primary">{formatCurrency(plano.valor_sugerido)}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setEditingId(plano.id)}
                >
                  <Edit size={14} className="mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeletingId(plano.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingId && (
        <EditPlanoDialog
          planoId={editingId}
          open={true}
          onOpenChange={(open) => {
            if (!open) setEditingId(null);
          }}
        />
      )}

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este plano? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingId) {
                  deletePlano(deletingId);
                  setDeletingId(null);
                }
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
