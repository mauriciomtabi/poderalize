import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  MapPin, 
  Search,
  Filter,
  Plus,
  Clock,
  AlertCircle,
  Zap
} from "lucide-react";
import { useProjects } from "@/contexts/ProjectsContext";
import { ProjectCard } from "@/types/projects";
import { cn } from "@/lib/utils";

const priorityConfig = {
  low: { icon: Clock, className: 'text-blue-500' },
  medium: { icon: AlertCircle, className: 'text-yellow-500' },
  high: { icon: Zap, className: 'text-red-500' },
  urgent: { icon: Zap, className: 'text-red-600' }
};

// Mock locations for demonstration
const mockLocations = [
  { lat: -23.5505, lng: -46.6333, name: "São Paulo - SP" },
  { lat: -22.9068, lng: -43.1729, name: "Rio de Janeiro - RJ" },
  { lat: -25.4284, lng: -49.2733, name: "Curitiba - PR" },
  { lat: -30.0346, lng: -51.2177, name: "Porto Alegre - RS" },
  { lat: -19.9167, lng: -43.9345, name: "Belo Horizonte - MG" }
];

export const MapView = () => {
  const { state, actions } = useProjects();
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<typeof mockLocations[0] | null>(null);

  const filteredCards = actions.getFilteredCards();
  const cardsWithLocation = filteredCards.filter(card => card.location);

  // For demo purposes, assign random locations to cards that don't have them
  const cardsWithMockLocations = filteredCards.map((card, index) => ({
    ...card,
    location: card.location || {
      ...mockLocations[index % mockLocations.length],
      lat: mockLocations[index % mockLocations.length].lat + (Math.random() - 0.5) * 0.1,
      lng: mockLocations[index % mockLocations.length].lng + (Math.random() - 0.5) * 0.1,
    }
  }));

  const CardItem = ({ card }: { card: ProjectCard }) => {
    const PriorityIcon = priorityConfig[card.priority].icon;
    
    return (
      <div 
        className="p-3 mb-3 bg-card border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => actions.setSelectedCard(card)}
      >
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium line-clamp-2 flex-1">{card.title}</h4>
          <div className={cn("ml-2", priorityConfig[card.priority].className)}>
            <PriorityIcon size={14} />
          </div>
        </div>
        
        {card.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {card.description}
          </p>
        )}
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex -space-x-1">
            {card.assignees.slice(0, 3).map((assignee) => (
              <Avatar key={assignee.id} className="h-6 w-6 border-2 border-background">
                <AvatarImage src={assignee.avatar} />
                <AvatarFallback className="text-xs">
                  {assignee.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            ))}
            {card.assignees.length > 3 && (
              <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                <span className="text-xs text-muted-foreground">
                  +{card.assignees.length - 3}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex space-x-1">
            {card.labels.slice(0, 3).map((label) => (
              <Badge
                key={label.id}
                variant="secondary"
                className="text-xs"
                style={{ backgroundColor: label.color + '20', color: label.color }}
              >
                {label.name}
              </Badge>
            ))}
          </div>
        </div>
        
        {card.location && (
          <div className="flex items-center text-xs text-muted-foreground">
            <MapPin size={12} className="mr-1" />
            {card.location.name}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex">
      {/* Map Area */}
      <div className="flex-1 relative">
        {/* Map Placeholder */}
        <div className="h-full bg-muted/30 flex items-center justify-center relative">
          <div className="text-center">
            <MapPin size={64} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Visualização de Mapa</h3>
            <p className="text-muted-foreground mb-4">
              Integração com mapas em desenvolvimento
            </p>
            <div className="text-sm text-muted-foreground">
              {cardsWithMockLocations.length} cartões com localização
            </div>
          </div>
          
          {/* Mock Location Pins */}
          {mockLocations.map((location, index) => {
            const locationCards = cardsWithMockLocations.filter(card => 
              card.location && 
              Math.abs(card.location.lat - location.lat) < 0.5 &&
              Math.abs(card.location.lng - location.lng) < 0.5
            );
            
            return (
              <div
                key={index}
                className="absolute bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                style={{
                  left: `${20 + (index % 3) * 30}%`,
                  top: `${20 + Math.floor(index / 3) * 30}%`
                }}
                onClick={() => setSelectedLocation(location)}
              >
                {locationCards.length}
              </div>
            );
          })}
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 left-4 flex space-x-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar localização..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="w-64 pl-9 bg-background"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter size={16} className="mr-1" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Location Details Sidebar */}
      <div className="w-96 border-l border-border bg-card p-4 overflow-auto">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">
              {selectedLocation ? selectedLocation.name : "Cartões por Localização"}
            </h3>
            <Button variant="outline" size="sm">
              <Plus size={14} className="mr-1" />
              Adicionar
            </Button>
          </div>
          
          {selectedLocation ? (
            <div className="text-sm text-muted-foreground">
              {cardsWithMockLocations.filter(card => 
                card.location && 
                Math.abs(card.location.lat - selectedLocation.lat) < 0.5 &&
                Math.abs(card.location.lng - selectedLocation.lng) < 0.5
              ).length} cartão(s) nesta região
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              {cardsWithMockLocations.length} cartão(s) com localização
            </div>
          )}
        </div>

        <div className="space-y-3">
          {/* Location Groups */}
          {mockLocations.map((location) => {
            const locationCards = cardsWithMockLocations.filter(card => 
              card.location && 
              Math.abs(card.location.lat - location.lat) < 0.5 &&
              Math.abs(card.location.lng - location.lng) < 0.5
            );
            
            if (locationCards.length === 0) return null;
            
            const isSelected = selectedLocation && 
              Math.abs(selectedLocation.lat - location.lat) < 0.1 &&
              Math.abs(selectedLocation.lng - location.lng) < 0.1;
            
            return (
              <Card 
                key={location.name}
                className={cn(
                  "cursor-pointer transition-colors",
                  isSelected && "ring-2 ring-primary"
                )}
                onClick={() => setSelectedLocation(location)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center">
                      <MapPin size={14} className="mr-2" />
                      {location.name}
                    </CardTitle>
                    <Badge variant="secondary">
                      {locationCards.length}
                    </Badge>
                  </div>
                </CardHeader>
                
                {isSelected && (
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {locationCards.map((card) => (
                        <CardItem key={card.id} card={card} />
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
          
          {/* Cards without specific location */}
          {filteredCards.filter(card => !card.location).length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <MapPin size={14} className="mr-2 text-muted-foreground" />
                  Sem localização
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {filteredCards
                    .filter(card => !card.location)
                    .slice(0, 3)
                    .map((card) => (
                      <CardItem key={card.id} card={card} />
                    ))}
                  
                  {filteredCards.filter(card => !card.location).length > 3 && (
                    <div className="text-xs text-muted-foreground text-center py-2">
                      +{filteredCards.filter(card => !card.location).length - 3} mais cartões
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};