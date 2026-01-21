-- Limpar dados base64 gigantes dos attachments dos 8 cards problemáticos
-- Preserva os metadados (nome, tipo, tamanho, data) mas remove a URL base64

-- Função auxiliar para limpar attachments base64
CREATE OR REPLACE FUNCTION public.clean_base64_attachments()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  card_record RECORD;
  cleaned_attachments jsonb;
  attachment jsonb;
  new_attachments jsonb := '[]'::jsonb;
BEGIN
  -- Iterar sobre todos os cards que têm attachments com base64
  FOR card_record IN 
    SELECT id, custom_fields
    FROM project_cards
    WHERE custom_fields->'attachments' IS NOT NULL
      AND custom_fields->>'attachments' LIKE '%data:%'
  LOOP
    new_attachments := '[]'::jsonb;
    
    -- Processar cada attachment
    FOR attachment IN 
      SELECT * FROM jsonb_array_elements(card_record.custom_fields->'attachments')
    LOOP
      -- Se a URL começa com 'data:', substituir por marcador
      IF (attachment->>'url') LIKE 'data:%' THEN
        attachment := jsonb_set(
          attachment, 
          '{url}', 
          '"[arquivo-removido-por-performance]"'::jsonb
        );
      END IF;
      
      new_attachments := new_attachments || jsonb_build_array(attachment);
    END LOOP;
    
    -- Atualizar o card com os attachments limpos
    UPDATE project_cards
    SET custom_fields = jsonb_set(
      COALESCE(custom_fields, '{}'::jsonb),
      '{attachments}',
      new_attachments
    )
    WHERE id = card_record.id;
  END LOOP;
END;
$$;

-- Executar a limpeza
SELECT public.clean_base64_attachments();

-- Remover a função após uso (não é mais necessária)
DROP FUNCTION public.clean_base64_attachments();