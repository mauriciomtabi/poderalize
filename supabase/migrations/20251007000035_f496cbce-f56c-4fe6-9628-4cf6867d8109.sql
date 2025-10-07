-- Create function to create notifications
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_description text,
  p_priority text DEFAULT 'medium',
  p_link text DEFAULT NULL,
  p_entity_type text DEFAULT NULL,
  p_entity_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id uuid;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    description,
    priority,
    link,
    entity_type,
    entity_id,
    read
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_description,
    p_priority,
    p_link,
    p_entity_type,
    p_entity_id,
    false
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;