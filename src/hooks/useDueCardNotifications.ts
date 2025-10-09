import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

interface DueCard {
  id: string;
  title: string;
  due_date: string;
  list_id: string;
}

export const useDueCardNotifications = () => {
  const { user } = useAuth();
  const [dueCards, setDueCards] = useState<DueCard[]>([]);
  const [notifiedCardIds, setNotifiedCardIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;

    const checkDueCards = async () => {
      try {
        // Get all cards where user is assigned (via project_members) and due date has passed
        const { data: assignedCards } = await supabase
          .from('project_card_assignees')
          .select(`
            card_id,
            project_cards!inner(id, title, due_date, list_id, archived),
            project_members!inner(user_id)
          `)
          .eq('project_members.user_id', user.id)
          .eq('project_cards.archived', false);

        if (!assignedCards) return;

        const now = new Date();
        const overdueCands: DueCard[] = [];

        for (const assignment of assignedCards) {
          const card = assignment.project_cards as any;
          if (!card || !card.due_date) continue;

          const dueDate = new Date(card.due_date);
          
          // Check if card is overdue
          if (dueDate < now) {
            overdueCands.push({
              id: card.id,
              title: card.title,
              due_date: card.due_date,
              list_id: card.list_id
            });

            // Create notification if not already notified
            if (!notifiedCardIds.has(card.id)) {
              // Insert notification into database
              await supabase.from('notifications').insert({
                user_id: user.id,
                type: 'card_overdue',
                title: 'Cartão vencido',
                description: `O cartão "${card.title}" está vencido desde ${dueDate.toLocaleDateString('pt-BR')}`,
                priority: 'high',
                link: `/projetos?card=${card.id}`,
                read: false
              });

              // Mark as notified
              setNotifiedCardIds(prev => new Set(prev).add(card.id));
            }
          }
        }

        setDueCards(overdueCands);
      } catch (error) {
        console.error('Error checking due cards:', error);
      }
    };

    // Check immediately
    checkDueCards();

    // Check every 5 minutes
    const interval = setInterval(checkDueCards, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user?.id]);

  return { dueCards };
};
