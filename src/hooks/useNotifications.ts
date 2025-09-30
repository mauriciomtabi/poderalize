import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Notification {
  id: string;
  type: 'follow-up' | 'project' | 'assignment';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  read: boolean;
  link?: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const notificationsList: Notification[] = [];

      // Buscar follow-ups atrasados ou para hoje
      const { data: followUps, error: followUpsError } = await supabase
        .from('follow_ups')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pendente')
        .lte('data_agendada', new Date().toISOString());

      if (followUpsError) {
        console.error('Erro ao carregar follow-ups:', followUpsError);
      } else if (followUps) {
        followUps.forEach((followUp) => {
          const followUpDate = new Date(followUp.data_agendada);
          const followUpDay = new Date(followUpDate.getFullYear(), followUpDate.getMonth(), followUpDate.getDate());
          
          const isOverdue = followUpDate < now;
          const isToday = followUpDay.getTime() === today.getTime();
          
          if (isOverdue || isToday) {
            notificationsList.push({
              id: `followup-${followUp.id}`,
              type: 'follow-up',
              title: isOverdue ? 'Follow-up Atrasado' : 'Follow-up Hoje',
              description: `Follow-up com ${followUp.lead_nome}${isOverdue ? ' está atrasado' : ' é hoje'}`,
              priority: isOverdue ? 'high' : 'medium',
              createdAt: followUp.data_agendada,
              read: false,
              link: '/crm'
            });
          }
        });
      }

      // Buscar projetos (cards) atrasados ou com prazo hoje
      const { data: projects, error: projectsError } = await supabase
        .from('project_cards')
        .select(`
          *,
          project_lists!inner (
            board_id,
            project_boards!inner (
              user_id
            )
          ),
          project_card_assignees!inner (
            member_id
          )
        `)
        .eq('project_card_assignees.member_id', user.id)
        .not('due_date', 'is', null)
        .eq('archived', false);

      if (projectsError) {
        console.error('Erro ao carregar projetos:', projectsError);
      } else if (projects) {
        projects.forEach((project) => {
          const dueDate = new Date(project.due_date);
          const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
          
          const isOverdue = dueDate < now;
          const isToday = dueDay.getTime() === today.getTime();
          
          if (isOverdue || isToday) {
            notificationsList.push({
              id: `project-${project.id}`,
              type: 'project',
              title: isOverdue ? 'Projeto Atrasado' : 'Projeto para Hoje',
              description: `${project.title}${isOverdue ? ' está atrasado' : ' vence hoje'}`,
              priority: isOverdue ? 'high' : 'medium',
              createdAt: project.due_date,
              read: false,
              link: '/projetos'
            });
          }
        });
      }

      // Buscar atribuições recentes de projetos (últimas 24 horas)
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const { data: assignments, error: assignmentsError } = await supabase
        .from('project_card_assignees')
        .select(`
          *,
          project_cards!inner (
            id,
            title,
            list_id,
            project_lists!inner (
              board_id,
              project_boards!inner (
                user_id
              )
            )
          )
        `)
        .eq('member_id', user.id)
        .gte('created_at', yesterday.toISOString());

      if (assignmentsError) {
        console.error('Erro ao carregar atribuições:', assignmentsError);
      } else if (assignments) {
        assignments.forEach((assignment: any) => {
          notificationsList.push({
            id: `assignment-${assignment.id}`,
            type: 'assignment',
            title: 'Nova Atribuição',
            description: `Você foi atribuído ao projeto: ${assignment.project_cards.title}`,
            priority: 'medium',
            createdAt: assignment.created_at,
            read: false,
            link: '/projetos'
          });
        });
      }

      // Ordenar por prioridade e data
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      notificationsList.sort((a, b) => {
        if (a.priority !== b.priority) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setNotifications(notificationsList);
      setUnreadCount(notificationsList.filter(n => !n.read).length);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();

    // Atualizar notificações a cada 5 minutos
    const interval = setInterval(loadNotifications, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refreshNotifications: loadNotifications
  };
}
