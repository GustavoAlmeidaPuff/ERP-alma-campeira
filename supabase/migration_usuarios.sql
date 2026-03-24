-- ============================================================
-- Migration: Tabela de perfis de usuário
-- Execute no SQL Editor do Supabase após o schema.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS usuarios_perfis (
  id      uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome    text NOT NULL,
  perfil  text NOT NULL CHECK (perfil IN ('admin', 'gerente', 'producao', 'vendas')),
  ativo   boolean NOT NULL DEFAULT true
);

ALTER TABLE usuarios_perfis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados podem ler perfis"
  ON usuarios_perfis FOR SELECT TO authenticated USING (true);

CREATE POLICY "Autenticados podem inserir perfis"
  ON usuarios_perfis FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Autenticados podem atualizar perfis"
  ON usuarios_perfis FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Autenticados podem deletar perfis"
  ON usuarios_perfis FOR DELETE TO authenticated USING (true);
