-- Tabela de usuários autorizados a usar o WhatsApp bot
CREATE TABLE IF NOT EXISTS usuarios_whatsapp (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telefone   TEXT NOT NULL UNIQUE,   -- ex: 5511999999999 (sem + e sem @)
  nome       TEXT,
  ativo      BOOLEAN DEFAULT true,
  user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índice para busca rápida por telefone
CREATE INDEX IF NOT EXISTS idx_usuarios_whatsapp_telefone ON usuarios_whatsapp(telefone);
CREATE INDEX IF NOT EXISTS idx_usuarios_whatsapp_ativo    ON usuarios_whatsapp(ativo);

-- RLS: somente o dono do sistema vê/edita (service role bypassa)
ALTER TABLE usuarios_whatsapp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_only" ON usuarios_whatsapp
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Inserir um número de teste
-- INSERT INTO usuarios_whatsapp (telefone, nome, ativo) VALUES ('5511999999999', 'Teste', true);
