-- Function to consolidate all user boards into one primary board per user
CREATE OR REPLACE FUNCTION public.consolidate_user_boards()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  u RECORD;
  v_primary_board uuid;
  b RECORD;
  l RECORD;
  tgt_list_id uuid;
  moved_card_ids uuid[];
  link RECORD;
  src_label RECORD;
  tgt_label_id uuid;
  src_member RECORD;
  tgt_member_id uuid;
BEGIN
  RAISE NOTICE 'Starting boards consolidation...';

  FOR u IN (
    SELECT DISTINCT user_id FROM project_boards
  ) LOOP
    -- Pick primary board: the one with most cards, then oldest
    SELECT pb.id INTO v_primary_board
    FROM project_boards pb
    LEFT JOIN LATERAL (
      SELECT COUNT(pc.id) AS card_count
      FROM project_lists pl
      LEFT JOIN project_cards pc ON pc.list_id = pl.id
      WHERE pl.board_id = pb.id
    ) t ON true
    WHERE pb.user_id = u.user_id
    ORDER BY COALESCE(t.card_count,0) DESC, pb.created_at ASC
    LIMIT 1;

    IF v_primary_board IS NULL THEN
      CONTINUE; -- nothing to consolidate
    END IF;

    -- Loop all other boards for this user
    FOR b IN (
      SELECT id FROM project_boards WHERE user_id = u.user_id AND id <> v_primary_board
    ) LOOP
      RAISE NOTICE 'Consolidating board % into % for user %', b.id, v_primary_board, u.user_id;

      -- For each list in the source board
      FOR l IN (
        SELECT id, title, color, position
        FROM project_lists
        WHERE board_id = b.id
        ORDER BY position ASC
      ) LOOP
        -- Find target list by case-insensitive title
        SELECT id INTO tgt_list_id
        FROM project_lists
        WHERE board_id = v_primary_board AND lower(title) = lower(l.title)
        LIMIT 1;

        -- Create if missing
        IF tgt_list_id IS NULL THEN
          INSERT INTO project_lists (board_id, title, color, position, archived, subscribed, rules)
          VALUES (v_primary_board, l.title, l.color, (
            SELECT COALESCE(MAX(position),0)+1 FROM project_lists WHERE board_id = v_primary_board
          ), false, false, '[]'::jsonb)
          RETURNING id INTO tgt_list_id;
        END IF;

        -- Move cards from source list to target list
        UPDATE project_cards pc
        SET list_id = tgt_list_id
        WHERE pc.list_id = l.id
        RETURNING pc.id INTO moved_card_ids;

        -- Remap labels for moved cards: ensure labels exist on primary board
        FOR link IN (
          SELECT DISTINCT pcl.label_id
          FROM project_card_labels pcl
          JOIN project_cards pc ON pc.id = pcl.card_id
          WHERE pc.list_id = tgt_list_id -- now in target list
        ) LOOP
          SELECT * INTO src_label FROM project_labels WHERE id = link.label_id;
          IF src_label IS NULL THEN CONTINUE; END IF;
          -- Find matching label on target board
          SELECT id INTO tgt_label_id
          FROM project_labels
          WHERE board_id = v_primary_board AND lower(name) = lower(src_label.name) AND color = src_label.color
          LIMIT 1;

          IF tgt_label_id IS NULL THEN
            INSERT INTO project_labels (board_id, name, color, description)
            VALUES (v_primary_board, src_label.name, src_label.color, src_label.description)
            RETURNING id INTO tgt_label_id;
          END IF;

          -- Repoint card label links that still reference labels from other boards
          UPDATE project_card_labels pcl
          SET label_id = tgt_label_id
          FROM project_cards pc
          WHERE pcl.card_id = pc.id
            AND pc.list_id = tgt_list_id
            AND pcl.label_id = src_label.id;
        END LOOP;

        -- Remap assignees: ensure member exists on primary board and re-link
        FOR src_member IN (
          SELECT DISTINCT pm.user_id AS member_user_id, pm.name, pm.email, pm.avatar, pm.role, pca.card_id, pca.member_id AS old_member_id
          FROM project_card_assignees pca
          JOIN project_members pm ON pm.id = pca.member_id
          JOIN project_cards pc ON pc.id = pca.card_id
          WHERE pc.list_id = tgt_list_id
        ) LOOP
          -- Find/create member on primary board for this user_id
          SELECT id INTO tgt_member_id
          FROM project_members
          WHERE board_id = v_primary_board AND user_id = src_member.member_user_id
          LIMIT 1;

          IF tgt_member_id IS NULL THEN
            INSERT INTO project_members (board_id, user_id, added_by, added_at, name, email, avatar, role)
            VALUES (v_primary_board, src_member.member_user_id, u.user_id, now(), src_member.name, src_member.email, src_member.avatar, COALESCE(src_member.role, 'member'))
            RETURNING id INTO tgt_member_id;
          END IF;

          -- Update card assignee link
          UPDATE project_card_assignees
          SET member_id = tgt_member_id
          WHERE card_id = src_member.card_id AND member_id = src_member.old_member_id;
        END LOOP;
      END LOOP; -- lists

      -- Archive the now-empty/old board
      UPDATE project_boards SET status = 'archived', title = title || ' (Arquivado - consolidado)' WHERE id = b.id;
    END LOOP; -- boards
  END LOOP; -- users

  RAISE NOTICE 'Boards consolidation completed.';
END;
$$;

-- Execute the consolidation
SELECT public.consolidate_user_boards();