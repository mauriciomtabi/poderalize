import { useEffect, useState } from 'react';
import { useDueCardNotifications } from '@/hooks/useDueCardNotifications';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const VIEWED_CARDS_KEY = 'viewed_due_cards';
const VIEWED_CARDS_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const DueCardAlert = () => {
  const { dueCards } = useDueCardNotifications();
  const [activeDueCards, setActiveDueCards] = useState<any[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [viewedCards, setViewedCards] = useLocalStorage(VIEWED_CARDS_KEY, { cards: [], timestamp: Date.now() });
  const navigate = useNavigate();

  useEffect(() => {
    // Clean up expired viewed cards
    if (Date.now() - viewedCards.timestamp > VIEWED_CARDS_EXPIRY) {
      setViewedCards({ cards: [], timestamp: Date.now() });
    }

    // Filter out completed cards and already viewed cards
    const newActiveDueCards = dueCards.filter((card: any) => {
      return card.status !== 'done' && !viewedCards.cards.includes(card.id);
    });
    
    setActiveDueCards(newActiveDueCards);
    
    // Only show alert if there are new unviewed cards and alert is not already open
    if (newActiveDueCards.length > 0 && !showAlert) {
      setShowAlert(true);
      setCurrentCardIndex(0);
    } else if (newActiveDueCards.length === 0) {
      setShowAlert(false);
    }
  }, [dueCards]);

  const markCardAsViewed = (cardId: string) => {
    setViewedCards({
      cards: [...viewedCards.cards, cardId],
      timestamp: viewedCards.timestamp
    });
  };

  const markAllCurrentCardsAsViewed = () => {
    const cardIds = activeDueCards.map(card => card.id);
    setViewedCards({
      cards: [...new Set([...viewedCards.cards, ...cardIds])],
      timestamp: viewedCards.timestamp
    });
  };

  const handleNext = () => {
    if (activeDueCards[currentCardIndex]) {
      markCardAsViewed(activeDueCards[currentCardIndex].id);
    }
    
    if (currentCardIndex < activeDueCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setShowAlert(false);
      setCurrentCardIndex(0);
    }
  };

  const handleViewCard = () => {
    if (activeDueCards[currentCardIndex]) {
      const card = activeDueCards[currentCardIndex];
      markCardAsViewed(card.id);
      navigate(`/projetos?card=${card.id}`);
      setShowAlert(false);
    }
  };

  const handleClose = () => {
    markAllCurrentCardsAsViewed();
    setShowAlert(false);
    setCurrentCardIndex(0);
  };

  // Safety checks
  if (activeDueCards.length === 0) return null;
  if (!activeDueCards[currentCardIndex]) return null;

  const currentCard = activeDueCards[currentCardIndex];
  const dueDate = new Date(currentCard.due_date);
  
  // Calcular dias de atraso apenas se estiver realmente vencido
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDateOnly = new Date(dueDate);
  dueDateOnly.setHours(0, 0, 0, 0);
  
  const daysOverdue = Math.max(0, Math.floor((today.getTime() - dueDateOnly.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <AlertDialog open={showAlert} onOpenChange={(open) => {
      if (!open) {
        handleClose();
      }
      setShowAlert(open);
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle>Cartão Vencido</AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground mt-1">
                {activeDueCards.length > 1 && `${currentCardIndex + 1} de ${activeDueCards.length} cartões vencidos`}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        
        <div className="space-y-3 py-4">
          <div>
            <h4 className="font-semibold text-sm mb-1">Cartão:</h4>
            <p className="text-sm text-muted-foreground">{currentCard.title}</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm mb-1">Prazo:</h4>
            <p className="text-sm text-destructive">
              Vencido há {daysOverdue} {daysOverdue === 1 ? 'dia' : 'dias'}
              <span className="text-muted-foreground ml-2">
                ({dueDate.toLocaleDateString('pt-BR')})
              </span>
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          {activeDueCards.length > 1 && currentCardIndex < activeDueCards.length - 1 ? (
            <>
              <Button onClick={handleNext} variant="outline">
                Próximo
              </Button>
              <Button onClick={handleViewCard}>
                Ver Cartão
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleClose} variant="outline">
                Fechar
              </Button>
              <Button onClick={handleViewCard}>
                Ver Cartão
              </Button>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
