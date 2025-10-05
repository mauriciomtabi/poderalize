
-- Adicionar campos faltantes na tabela notifications
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS entity_type TEXT,
ADD COLUMN IF NOT EXISTS entity_id UUID;

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
ON public.notifications(user_id, read);

CREATE INDEX IF NOT EXISTS idx_notifications_entity 
ON public.notifications(entity_type, entity_id);

-- Atualizar a política de INSERT para permitir que o sistema crie notificações
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

CREATE POLICY "Anyone can insert notifications"
ON public.notifications
FOR INSERT
TO public
WITH CHECK (true);
