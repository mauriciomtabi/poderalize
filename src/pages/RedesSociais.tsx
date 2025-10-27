import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function RedesSociais() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="space-y-6 h-full">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-primary">
            <BarChart3 className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard de Redes Sociais</h1>
            <p className="text-muted-foreground">
              Acompanhamento dos insights e métricas das redes sociais dos clientes
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleFullscreen}
          className="hidden md:flex"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
      </div>

      {/* Dashboard Card */}
      <Card className={`${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}>
        <CardHeader className={isFullscreen ? 'flex flex-row items-center justify-between' : ''}>
          <div>
            <CardTitle>Looker Studio Analytics</CardTitle>
            <CardDescription>
              Dashboard integrado com métricas em tempo real
            </CardDescription>
          </div>
          {isFullscreen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0 md:p-6">
          <div className="relative w-full" style={{ minHeight: isFullscreen ? 'calc(100vh - 200px)' : '600px' }}>
            {/* Loading Spinner */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                <LoadingSpinner size="lg" text="Carregando dashboard..." />
              </div>
            )}
            
            {/* Iframe Container */}
            <div className="w-full h-full rounded-lg overflow-hidden border border-border">
              <iframe
                src="https://lookerstudio.google.com/embed/reporting/19747409-008f-4707-95fe-fa89e1634e47/page/p_3gkxsi9nud"
                className="w-full h-full"
                style={{ 
                  minHeight: isFullscreen ? 'calc(100vh - 200px)' : '600px',
                  border: 0 
                }}
                allowFullScreen
                sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                onLoad={handleLoad}
                title="Dashboard de Redes Sociais"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Section */}
      {!isFullscreen && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Dados em Tempo Real</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                As métricas são atualizadas automaticamente pelo Google Looker Studio
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Múltiplas Redes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Acompanhe o desempenho em todas as plataformas de redes sociais
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Insights Acionáveis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Análises detalhadas para otimizar suas estratégias de marketing
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
