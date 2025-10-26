import { useState } from "react";
import { Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePlanos, TipoPlano } from "@/hooks/usePlanos";
import { PlanosList } from "@/components/planos/PlanosList";
import { CreatePlanoDialog } from "@/components/planos/CreatePlanoDialog";

const tiposPlano = [
  { value: 'social_media', label: 'Social Mídia' },
  { value: 'trafego_pago', label: 'Tráfego Pago' },
  { value: 'treinamento_vendas', label: 'Treinamento de Vendas' },
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'assinatura_jornada', label: 'Assinatura Jornada Poderalize' },
  { value: 'criacao_site', label: 'Criação de Site' },
  { value: 'identidade_visual', label: 'Identidade Visual' },
  { value: 'plataforma_vendas', label: 'Plataforma de Vendas On-line' },
] as const;

export default function Planos() {
  const { planos, isLoading } = usePlanos();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState<TipoPlano>('social_media');

  const getPlanosCount = (tipo: TipoPlano) => {
    return planos.filter(p => p.tipo === tipo && p.ativo).length;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
            <Package size={32} />
            Planos de Serviços
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os planos e templates de serviços disponíveis
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus size={20} />
          Novo Plano
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Catálogo de Planos</CardTitle>
          <CardDescription>
            Organize os planos por tipo de serviço
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTipo} onValueChange={(v) => setSelectedTipo(v as TipoPlano)}>
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 h-auto">
              {tiposPlano.map((tipo) => (
                <TabsTrigger 
                  key={tipo.value} 
                  value={tipo.value}
                  className="flex flex-col items-center gap-1 py-2"
                >
                  <span className="text-xs text-center">{tipo.label}</span>
                  <span className="text-xs font-bold text-primary">
                    ({getPlanosCount(tipo.value as TipoPlano)})
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            {tiposPlano.map((tipo) => (
              <TabsContent key={tipo.value} value={tipo.value} className="mt-6">
                <PlanosList tipo={tipo.value as TipoPlano} />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <CreatePlanoDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        defaultTipo={selectedTipo}
      />
    </div>
  );
}
