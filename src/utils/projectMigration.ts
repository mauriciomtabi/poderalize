import { supabase } from '@/integrations/supabase/client';

export const createInitialBoard = async (userId: string) => {
  try {
    // Create initial board
    const { data: board, error: boardError } = await supabase
      .from('project_boards')
      .insert({
        user_id: userId,
        title: 'Meu Primeiro Projeto',
        description: 'Quadro inicial para organizar suas tarefas',
        status: 'active',
        settings: {
          visibility: 'private',
          allowComments: true,
          allowVoting: false,
          cardAging: false,
          calendarFeed: false
        }
      })
      .select()
      .single();

    if (boardError) {
      console.error('Error creating board:', boardError);
      return null;
    }

    // Create initial lists
    const lists = [
      { title: 'Backlog', color: '#3b82f6', position: 0 },
      { title: 'Em Andamento', color: '#f59e0b', position: 1 },
      { title: 'Revisão', color: '#8b5cf6', position: 2 },
      { title: 'Concluído', color: '#10b981', position: 3 }
    ];

    const { data: createdLists, error: listsError } = await supabase
      .from('project_lists')
      .insert(
        lists.map(list => ({
          board_id: board.id,
          title: list.title,
          color: list.color,
          position: list.position,
          archived: false,
          subscribed: true
        }))
      )
      .select();

    if (listsError) {
      console.error('Error creating lists:', listsError);
      return null;
    }

    // Create initial labels
    const labels = [
      { name: 'Bug', color: '#ef4444', description: 'Correção de bugs' },
      { name: 'Feature', color: '#3b82f6', description: 'Nova funcionalidade' },
      { name: 'Urgent', color: '#f59e0b', description: 'Prioridade urgente' },
      { name: 'Design', color: '#8b5cf6', description: 'Trabalho de design' },
      { name: 'Review', color: '#10b981', description: 'Precisa de revisão' }
    ];

    await supabase
      .from('project_labels')
      .insert(
        labels.map(label => ({
          board_id: board.id,
          name: label.name,
          color: label.color,
          description: label.description
        }))
      );

    // Add user as board member
    await supabase
      .from('project_members')
      .insert({
        board_id: board.id,
        user_id: userId,
        name: 'Você',
        email: 'user@example.com',
        role: 'owner'
      });

    return board;
  } catch (error) {
    console.error('Error creating initial board:', error);
    return null;
  }
};