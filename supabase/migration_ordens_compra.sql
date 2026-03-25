-- =============================================================
-- Ordens de Compra
-- =============================================================

create table if not exists ordens_compra (
  id            uuid primary key default gen_random_uuid(),
  codigo        text unique not null,          -- OC-0001
  fornecedor_id uuid references fornecedores(id) on delete set null,
  status        text not null default 'pendente',
  -- pendente | enviada | recebida
  data_geracao  date not null default current_date,
  observacao    text,
  created_at    timestamptz default now()
);
alter table ordens_compra enable row level security;
create policy "auth ordens_compra" on ordens_compra
  for all to authenticated using (true) with check (true);

create table if not exists ordem_compra_itens (
  id               uuid primary key default gen_random_uuid(),
  ordem_compra_id  uuid not null references ordens_compra(id) on delete cascade,
  materia_prima_id uuid not null references materias_primas(id),
  quantidade       numeric(10,3) not null check (quantidade > 0),
  preco_unitario   numeric(10,2)
);
alter table ordem_compra_itens enable row level security;
create policy "auth ordem_compra_itens" on ordem_compra_itens
  for all to authenticated using (true) with check (true);
