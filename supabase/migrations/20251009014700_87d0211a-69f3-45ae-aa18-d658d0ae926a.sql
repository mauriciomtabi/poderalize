-- Migration to move automations from archived boards to active board
DO $$
DECLARE
  u RECORD;
  v_active_board uuid;
  r RECORD;
  s RECORD;
  tgt_list_id uuid;
  src_list_title text;
BEGIN
  RAISE NOTICE 'Starting automations migration...';

  -- For each user with boards
  FOR u IN (
    SELECT DISTINCT user_id FROM project_boards
  ) LOOP
    -- Find the active board for this user
    SELECT id INTO v_active_board
    FROM project_boards
    WHERE user_id = u.user_id 
      AND status = 'active'
    ORDER BY created_at ASC
    LIMIT 1;

    IF v_active_board IS NULL THEN
      RAISE NOTICE 'No active board found for user %', u.user_id;
      CONTINUE;
    END IF;

    -- Migrate recurring_cards
    FOR r IN (
      SELECT rc.*
      FROM recurring_cards rc
      JOIN project_boards pb ON pb.id = rc.board_id
      WHERE pb.user_id = u.user_id
        AND pb.status = 'archived'
        AND rc.board_id != v_active_board
    ) LOOP
      -- Get the source list title
      SELECT title INTO src_list_title
      FROM project_lists
      WHERE id = r.list_id;

      -- Find matching list on active board
      SELECT id INTO tgt_list_id
      FROM project_lists
      WHERE board_id = v_active_board
        AND lower(title) = lower(src_list_title)
      LIMIT 1;

      -- If no matching list, use the first list
      IF tgt_list_id IS NULL THEN
        SELECT id INTO tgt_list_id
        FROM project_lists
        WHERE board_id = v_active_board
        ORDER BY position ASC
        LIMIT 1;
      END IF;

      IF tgt_list_id IS NOT NULL THEN
        UPDATE recurring_cards
        SET board_id = v_active_board,
            list_id = tgt_list_id,
            updated_at = now()
        WHERE id = r.id;
        
        RAISE NOTICE 'Moved recurring card % to active board', r.title;
      END IF;
    END LOOP;

    -- Migrate scheduled_cards
    FOR s IN (
      SELECT sc.*
      FROM scheduled_cards sc
      JOIN project_boards pb ON pb.id = sc.board_id
      WHERE pb.user_id = u.user_id
        AND pb.status = 'archived'
        AND sc.board_id != v_active_board
    ) LOOP
      -- Get the source list title
      SELECT title INTO src_list_title
      FROM project_lists
      WHERE id = s.list_id;

      -- Find matching list on active board
      SELECT id INTO tgt_list_id
      FROM project_lists
      WHERE board_id = v_active_board
        AND lower(title) = lower(src_list_title)
      LIMIT 1;

      -- If no matching list, use the first list
      IF tgt_list_id IS NULL THEN
        SELECT id INTO tgt_list_id
        FROM project_lists
        WHERE board_id = v_active_board
        ORDER BY position ASC
        LIMIT 1;
      END IF;

      IF tgt_list_id IS NOT NULL THEN
        UPDATE scheduled_cards
        SET board_id = v_active_board,
            list_id = tgt_list_id,
            updated_at = now()
        WHERE id = s.id;
        
        RAISE NOTICE 'Moved scheduled card % to active board', s.title;
      END IF;
    END LOOP;

    -- Migrate automation_rules
    UPDATE automation_rules ar
    SET board_id = v_active_board,
        updated_at = now()
    FROM project_boards pb
    WHERE ar.board_id = pb.id
      AND pb.user_id = u.user_id
      AND pb.status = 'archived'
      AND ar.board_id != v_active_board;

    -- Migrate board_buttons
    UPDATE board_buttons bb
    SET board_id = v_active_board,
        updated_at = now()
    FROM project_boards pb
    WHERE bb.board_id = pb.id
      AND pb.user_id = u.user_id
      AND pb.status = 'archived'
      AND bb.board_id != v_active_board;

  END LOOP;

  RAISE NOTICE 'Automations migration completed successfully!';
END;
$$;