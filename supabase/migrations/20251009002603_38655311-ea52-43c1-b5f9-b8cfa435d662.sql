-- CONSOLIDAÇÃO GLOBAL: Unificar todos os boards em um único board principal (CORRIGIDO)
-- Isso resolve problemas de fragmentação de dados, etiquetas, membros e cards invisíveis

DO $$
DECLARE
  v_primary_board_id uuid;
  v_board record;
  v_list record;
  v_target_list_id uuid;
  v_card_count integer;
  v_label record;
  v_target_label_id uuid;
  v_member record;
  v_target_member_id uuid;
  v_total_boards integer;
  v_total_cards integer;
  v_total_members integer;
  v_total_labels integer;
BEGIN
  RAISE NOTICE 'INICIANDO CONSOLIDAÇÃO GLOBAL DE BOARDS...';
  
  -- 1. IDENTIFICAR O BOARD PRINCIPAL (o com mais cards e membros)
  SELECT pb.id INTO v_primary_board_id
  FROM project_boards pb
  LEFT JOIN LATERAL (
    SELECT COUNT(DISTINCT pc.id) as card_count
    FROM project_lists pl
    LEFT JOIN project_cards pc ON pc.list_id = pl.id
    WHERE pl.board_id = pb.id
  ) cards ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(DISTINCT pm.id) as member_count
    FROM project_members pm
    WHERE pm.board_id = pb.id
  ) members ON true
  WHERE pb.status = 'active'
  ORDER BY 
    COALESCE(cards.card_count, 0) DESC,
    COALESCE(members.member_count, 0) DESC,
    pb.created_at ASC
  LIMIT 1;

  IF v_primary_board_id IS NULL THEN
    RAISE EXCEPTION 'Nenhum board ativo encontrado para consolidação';
  END IF;

  RAISE NOTICE 'Board principal selecionado: %', v_primary_board_id;

  -- Contar boards ativos
  SELECT COUNT(*) INTO v_total_boards FROM project_boards WHERE status = 'active' AND id != v_primary_board_id;
  RAISE NOTICE 'Total de boards para consolidar: %', v_total_boards;

  -- 2. CONSOLIDAR ETIQUETAS DE TODOS OS BOARDS
  RAISE NOTICE 'Consolidando etiquetas...';
  v_total_labels := 0;
  
  FOR v_label IN (
    SELECT DISTINCT ON (name, color) 
      id, name, color, description
    FROM project_labels
    WHERE board_id != v_primary_board_id
    ORDER BY name, color, created_at ASC
  ) LOOP
    -- Verificar se já existe etiqueta similar no board principal
    SELECT id INTO v_target_label_id
    FROM project_labels
    WHERE board_id = v_primary_board_id 
      AND name = v_label.name 
      AND color = v_label.color
    LIMIT 1;

    -- Se não existe, criar
    IF v_target_label_id IS NULL THEN
      INSERT INTO project_labels (board_id, name, color, description)
      VALUES (v_primary_board_id, v_label.name, v_label.color, v_label.description)
      RETURNING id INTO v_target_label_id;
      v_total_labels := v_total_labels + 1;
    END IF;

    -- Remapear todas as associações de cards para a nova etiqueta
    UPDATE project_card_labels
    SET label_id = v_target_label_id
    WHERE label_id = v_label.id;
  END LOOP;

  RAISE NOTICE 'Etiquetas consolidadas: %', v_total_labels;

  -- 3. CONSOLIDAR MEMBROS DE TODOS OS BOARDS
  RAISE NOTICE 'Consolidando membros...';
  v_total_members := 0;

  FOR v_member IN (
    SELECT DISTINCT ON (user_id)
      user_id, name, email, avatar, role, added_by, added_at
    FROM project_members
    WHERE board_id != v_primary_board_id
    ORDER BY user_id, added_at ASC
  ) LOOP
    -- Verificar se o membro já existe no board principal
    SELECT id INTO v_target_member_id
    FROM project_members
    WHERE board_id = v_primary_board_id 
      AND user_id = v_member.user_id
    LIMIT 1;

    -- Se não existe, adicionar
    IF v_target_member_id IS NULL THEN
      INSERT INTO project_members (
        board_id, user_id, name, email, avatar, role, added_by, added_at
      )
      VALUES (
        v_primary_board_id, v_member.user_id, v_member.name, v_member.email, 
        v_member.avatar, v_member.role, v_member.added_by, v_member.added_at
      )
      RETURNING id INTO v_target_member_id;
      v_total_members := v_total_members + 1;
    END IF;

    -- Remapear todas as atribuições de cards para o novo membro
    UPDATE project_card_assignees
    SET member_id = v_target_member_id
    WHERE member_id IN (
      SELECT id FROM project_members 
      WHERE user_id = v_member.user_id 
        AND board_id != v_primary_board_id
    );
  END LOOP;

  RAISE NOTICE 'Membros consolidados: %', v_total_members;

  -- 4. CONSOLIDAR LISTAS E CARDS DE TODOS OS BOARDS
  RAISE NOTICE 'Consolidando listas e cards...';
  v_total_cards := 0;

  FOR v_board IN (
    SELECT id, title FROM project_boards 
    WHERE status = 'active' AND id != v_primary_board_id
  ) LOOP
    RAISE NOTICE 'Processando board: % (%)', v_board.title, v_board.id;

    -- Para cada lista no board secundário
    FOR v_list IN (
      SELECT id, title, color, position, archived, subscribed, rules
      FROM project_lists
      WHERE board_id = v_board.id
      ORDER BY position ASC
    ) LOOP
      -- Encontrar ou criar lista no board principal
      SELECT id INTO v_target_list_id
      FROM project_lists
      WHERE board_id = v_primary_board_id 
        AND LOWER(title) = LOWER(v_list.title)
      LIMIT 1;

      IF v_target_list_id IS NULL THEN
        INSERT INTO project_lists (
          board_id, title, color, position, archived, subscribed, rules
        )
        VALUES (
          v_primary_board_id, v_list.title, v_list.color,
          (SELECT COALESCE(MAX(position), 0) + 1 FROM project_lists WHERE board_id = v_primary_board_id),
          v_list.archived, v_list.subscribed, v_list.rules
        )
        RETURNING id INTO v_target_list_id;
      END IF;

      -- Mover todos os cards para a lista do board principal
      UPDATE project_cards
      SET list_id = v_target_list_id
      WHERE list_id = v_list.id;

      -- Contar cards movidos
      SELECT COUNT(*) INTO v_card_count
      FROM project_cards 
      WHERE list_id = v_target_list_id;
      
      v_total_cards := v_total_cards + v_card_count;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Total de cards consolidados: %', v_total_cards;

  -- 5. LIMPAR ETIQUETAS E MEMBROS ÓRFÃOS
  DELETE FROM project_labels WHERE board_id != v_primary_board_id;
  DELETE FROM project_members WHERE board_id != v_primary_board_id;

  -- 6. ARQUIVAR TODOS OS OUTROS BOARDS
  UPDATE project_boards
  SET status = 'archived',
      title = title || ' (Consolidado em ' || to_char(now(), 'DD/MM/YYYY') || ')',
      updated_at = now()
  WHERE status = 'active' AND id != v_primary_board_id;

  -- 7. GARANTIR QUE O BOARD PRINCIPAL ESTÁ ATIVO
  UPDATE project_boards
  SET status = 'active',
      title = 'Board Principal - Poderalize',
      updated_at = now()
  WHERE id = v_primary_board_id;

  RAISE NOTICE '==============================================';
  RAISE NOTICE 'CONSOLIDAÇÃO GLOBAL CONCLUÍDA COM SUCESSO!';
  RAISE NOTICE 'Board Principal: %', v_primary_board_id;
  RAISE NOTICE 'Boards arquivados: %', v_total_boards;
  RAISE NOTICE 'Etiquetas consolidadas: %', v_total_labels;
  RAISE NOTICE 'Membros consolidados: %', v_total_members;
  RAISE NOTICE 'Cards totais no sistema: %', v_total_cards;
  RAISE NOTICE '==============================================';
END $$;