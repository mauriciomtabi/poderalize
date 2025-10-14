import { useEffect, useState } from 'react';
import { useDueCardNotifications } from '@/hooks/useDueCardNotifications';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { isDateOverdue } from '@/lib/utils';

export const DueCardAlert = () => {
  const { dueCards } = useDueCardNotifications();
  const [showAlert, setShowAlert] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (dueCards.length > 0 && !showAlert) {
      setShowAlert(true);
      setCurrentCardIndex(0);
    }
  }, [dueCards.length]);

  const handleNext = () => {
    if (currentCardIndex < dueCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setShowAlert(false);
      setCurrentCardIndex(0);
    }
  };

  const handleViewCard = () => {
    const card = dueCards[currentCardIndex];
    navigate(`/projetos?card=${card.id}`);
    setShowAlert(false);
  };

  if (dueCards.length === 0) return null;

  const currentCard = dueCards[currentCardIndex];
  const dueDate = new Date(currentCard.due_date);
  
  // Calcular dias de atraso apenas se estiver realmente vencido
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDateOnly = new Date(dueDate);
  dueDateOnly.setHours(0, 0, 0, 0);
  
  const daysOverdue = Math.max(0, Math.floor((today.getTime() - dueDateOnly.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle>Cartão Vencido</AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground mt-1">
                {dueCards.length > 1 && `${currentCardIndex + 1} de ${dueCards.length} cartões vencidos`}
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
          {dueCards.length > 1 && currentCardIndex < dueCards.length - 1 ? (
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
              <Button onClick={() => setShowAlert(false)} variant="outline">
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
