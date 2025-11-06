-- Criar tabela de cartões de crédito
CREATE TABLE cartoes_credito (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  bandeira TEXT NOT NULL,
  ultimos_digitos TEXT,
  limite NUMERIC DEFAULT 0,
  dia_fechamento INTEGER NOT NULL DEFAULT 10,
  dia_vencimento INTEGER NOT NULL DEFAULT 15,
  cor TEXT DEFAULT '#3B82F6',
  icone TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies para cartoes_credito
ALTER TABLE cartoes_credito ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cartoes_credito"
  ON cartoes_credito FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cartoes_credito"
  ON cartoes_credito FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cartoes_credito"
  ON cartoes_credito FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cartoes_credito"
  ON cartoes_credito FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_cartoes_credito_updated_at
  BEFORE UPDATE ON cartoes_credito
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Modificar tabela despesas para suportar parcelamento
ALTER TABLE despesas 
  ADD COLUMN conta_id UUID REFERENCES contas_bancarias(id) ON DELETE SET NULL,
  ADD COLUMN cartao_credito_id UUID REFERENCES cartoes_credito(id) ON DELETE SET NULL,
  ADD COLUMN forma_pagamento TEXT DEFAULT 'dinheiro',
  ADD COLUMN parcelas INTEGER DEFAULT 1,
  ADD COLUMN parcela_atual INTEGER DEFAULT 1,
  ADD COLUMN despesa_pai_id UUID REFERENCES despesas(id) ON DELETE CASCADE,
  ADD COLUMN is_parcelada BOOLEAN DEFAULT false;

-- Comentários para documentação
COMMENT ON COLUMN despesas.conta_id IS 'Conta bancária de onde saiu o dinheiro (se forma_pagamento = dinheiro/pix/debito)';
COMMENT ON COLUMN despesas.cartao_credito_id IS 'Cartão de crédito utilizado (se forma_pagamento = cartao_credito)';
COMMENT ON COLUMN despesas.forma_pagamento IS 'Forma de pagamento: dinheiro, cartao_credito, pix, debito, transferencia';
COMMENT ON COLUMN despesas.parcelas IS 'Número total de parcelas (ex: 12x)';
COMMENT ON COLUMN despesas.parcela_atual IS 'Número da parcela atual (ex: 1, 2, 3... até parcelas)';
COMMENT ON COLUMN despesas.despesa_pai_id IS 'ID da despesa original (primeira parcela). NULL se não for parcelada ou se for a primeira parcela';
COMMENT ON COLUMN despesas.is_parcelada IS 'Flag para facilitar queries de despesas parceladas';