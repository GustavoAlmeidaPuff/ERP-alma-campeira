-- =============================================================
-- Vendas: clientes, pedidos, pedido_itens,
--          movimentacoes_estoque, fila_reposicao
-- =============================================================

-- Clientes
create table if not exists clientes (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null,
  tipo       text not null,  -- Lojista | Revendedor | Pessoa Física
  telefone   text,
  email      text,
  cidade     text,
  estado     text,
  created_at timestamptz default now()
);
alter table clientes enable row level security;
create policy "auth clientes" on clientes
  for all to authenticated using (true) with check (true);

-- Pedidos
create table if not exists pedidos (
  id          uuid primary key default gen_random_uuid(),
  codigo      text unique not null,      -- PD-0001
  cliente_id  uuid references clientes(id) on delete set null,
  data_pedido date not null default current_date,
  status      text not null default 'orcamento',
  -- orcamento | confirmado | em_producao | entregue | cancelado
  observacao  text,
  valor_total numeric(10,2),
  entregue_at timestamptz,
  created_at  timestamptz default now()
);
alter table pedidos enable row level security;
create policy "auth pedidos" on pedidos
  for all to authenticated using (true) with check (true);

-- Itens do pedido
create table if not exists pedido_itens (
  id              uuid primary key default gen_random_uuid(),
  pedido_id       uuid not null references pedidos(id) on delete cascade,
  faca_id         uuid not null references facas(id),
  quantidade      integer not null check (quantidade > 0),
  preco_unitario  numeric(10,2) not null check (preco_unitario >= 0),
  subtotal        numeric(10,2) generated always as (quantidade * preco_unitario) stored
);
alter table pedido_itens enable row level security;
create policy "auth pedido_itens" on pedido_itens
  for all to authenticated using (true) with check (true);

-- Movimentações de estoque
create table if not exists movimentacoes_estoque (
  id               uuid primary key default gen_random_uuid(),
  tipo             text not null,
  -- entrada | saida_producao | saida_venda | ajuste
  materia_prima_id uuid references materias_primas(id),
  faca_id          uuid references facas(id),
  pedido_id        uuid references pedidos(id),
  quantidade       numeric(10,3) not null,
  observacao       text,
  usuario_id       uuid references auth.users(id),
  created_at       timestamptz default now()
);
alter table movimentacoes_estoque enable row level security;
create policy "auth movimentacoes" on movimentacoes_estoque
  for all to authenticated using (true) with check (true);

-- Fila de reposição (alimentada ao marcar pedido como entregue)
create table if not exists fila_reposicao (
  id                  uuid primary key default gen_random_uuid(),
  materia_prima_id    uuid not null references materias_primas(id),
  fornecedor_id       uuid references fornecedores(id),
  quantidade_pendente numeric(10,3) not null default 0,
  pedido_id           uuid references pedidos(id),
  created_at          timestamptz default now()
);
alter table fila_reposicao enable row level security;
create policy "auth fila_reposicao" on fila_reposicao
  for all to authenticated using (true) with check (true);

-- Seed: alguns clientes de exemplo
insert into clientes (nome, tipo, cidade, estado) values
  ('Armarinhos Pampa Ltda',  'Lojista',    'Porto Alegre', 'RS'),
  ('Casa do Gaúcho Ltda',    'Revendedor', 'Caxias do Sul', 'RS'),
  ('Empório Sul',            'Lojista',    'Pelotas', 'RS')
on conflict do nothing;
