-- Adiciona coluna status na tabela configuracao_dono
ALTER TABLE configuracao_dono
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'liberado';

-- Define 'liberado' para todos os registros existentes
UPDATE configuracao_dono
SET status = 'liberado'
WHERE status IS NULL;
