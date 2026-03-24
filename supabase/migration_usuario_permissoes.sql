-- ============================================================
-- Migration: Permissões customizadas por usuário
-- Execute no SQL Editor do Supabase
-- ============================================================

CREATE TABLE IF NOT EXISTS usuario_permissoes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  modulo     text NOT NULL,
  ver        boolean NOT NULL DEFAULT false,
  criar      boolean NOT NULL DEFAULT false,
  editar     boolean NOT NULL DEFAULT false,
  deletar    boolean NOT NULL DEFAULT false,
  UNIQUE(usuario_id, modulo)
);

ALTER TABLE usuario_permissoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados podem ler usuario_permissoes"
  ON usuario_permissoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Autenticados podem inserir usuario_permissoes"
  ON usuario_permissoes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Autenticados podem atualizar usuario_permissoes"
  ON usuario_permissoes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Autenticados podem deletar usuario_permissoes"
  ON usuario_permissoes FOR DELETE TO authenticated USING (true);
