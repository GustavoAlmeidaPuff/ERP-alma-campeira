-- =============================================================
-- Categorias de faca (cores de badge)
-- =============================================================

create table if not exists categorias_faca (
  id         uuid primary key default gen_random_uuid(),
  nome       text unique not null,
  cor_texto  text not null,
  cor_fundo  text not null,
  cor_borda  text not null,
  ordem      integer not null default 0,
  created_at timestamptz default now(),
  constraint categorias_faca_cor_texto_chk check (cor_texto ~ '^#[0-9A-Fa-f]{6}$'),
  constraint categorias_faca_cor_fundo_chk check (cor_fundo ~ '^#[0-9A-Fa-f]{6}$'),
  constraint categorias_faca_cor_borda_chk check (cor_borda ~ '^#[0-9A-Fa-f]{6}$')
);

alter table categorias_faca enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'categorias_faca'
      and policyname = 'auth categorias_faca'
  ) then
    create policy "auth categorias_faca" on categorias_faca
      for all to authenticated
      using (true)
      with check (true);
  end if;
end $$;

insert into categorias_faca (nome, cor_texto, cor_fundo, cor_borda, ordem)
values
  ('Gauchesca', '#1f2937', '#e5e7eb', '#d1d5db', 1),
  ('Utilitária', '#1e3a8a', '#dbeafe', '#93c5fd', 2),
  ('Decorativa', '#7c2d12', '#ffedd5', '#fdba74', 3),
  ('Cozinha', '#14532d', '#dcfce7', '#86efac', 4),
  ('Esportiva', '#581c87', '#f3e8ff', '#d8b4fe', 5),
  ('Outro', '#374151', '#f3f4f6', '#e5e7eb', 99)
on conflict (nome) do nothing;
