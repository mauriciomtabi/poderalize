import { supabase } from '@/integrations/supabase/client';

export const createInitialBoard = async (userId: string, userEmail?: string, userName?: string) => {
  try {
    // Check if user already has a board
    const { data: existingBoards } = await supabase
      .from('project_boards')
      .select('id')
      .eq('user_id', userId);

    if (existingBoards && existingBoards.length > 0) {
      // User already has boards, return the first one
      const { data: board } = await supabase
        .from('project_boards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();
      
      return board;
    }

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
      { title: 'A Fazer', color: '#E55A27', position: 0 },
      { title: 'Em andamento', color: '#E55A27', position: 1 },
      { title: 'Aguardando Aprovação', color: '#E55A27', position: 2 },
      { title: 'Executado', color: '#E55A27', position: 3 }
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
        name: userName || 'Você',
        email: userEmail || 'user@example.com',
        role: 'owner'
      });

    return board;
  } catch (error) {
    console.error('Error creating initial board:', error);
    return null;
  }
};