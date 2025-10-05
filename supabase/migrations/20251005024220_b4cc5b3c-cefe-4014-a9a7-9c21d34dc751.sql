-- Add client_id to project_cards table
ALTER TABLE public.project_cards 
ADD COLUMN client_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_project_cards_client_id ON public.project_cards(client_id);