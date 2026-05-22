-- HeyHeyDive — Merch product variants (size × color × per-variant stock)
--
-- A merch_product can have multiple variants, each with its own stock counter,
-- optional SKU, and optional price override. The product page lets the buyer
-- pick (size, color); each combo is a separate variant row.
--
-- Existing data is backfilled: for each product, we expand the legacy
--   sizes[] × colors[] arrays into variants and split the product-level
--   `stock` value evenly between them. Products with neither size nor color
--   get a single default variant carrying the product-level stock.
--
-- Going forward, the admin UI edits variants directly and `merch_products`
-- keeps `sizes[]`/`colors[]` only as a denormalised cache for filters.

create table if not exists public.merch_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.merch_products(id) on delete cascade,
  size text,
  color text,
  sku text,
  stock integer not null default 0 check (stock >= 0),
  price_twd integer,
  display_order integer not null default 0,
  status text not null default 'active'
    check (status in ('active','sold_out','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists merch_variants_product_idx
  on public.merch_variants (product_id);

-- A given product can't have two variants with the same (size, color) combo.
-- Use COALESCE to treat NULL like '' for uniqueness purposes.
create unique index if not exists merch_variants_unique_combo
  on public.merch_variants (product_id, coalesce(size, ''), coalesce(color, ''));

drop trigger if exists merch_variants_touch on public.merch_variants;
create trigger merch_variants_touch before update on public.merch_variants
  for each row execute function public.touch_updated_at();

alter table public.merch_variants enable row level security;

drop policy if exists "merch_variants read non-archived" on public.merch_variants;
create policy "merch_variants read non-archived" on public.merch_variants for select
  using (status <> 'archived' or public.is_admin());

drop policy if exists "merch_variants admin write" on public.merch_variants;
create policy "merch_variants admin write" on public.merch_variants for all
  using (public.is_admin()) with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- Backfill: expand existing products into variants.
-- Only runs for products that don't yet have any variants — idempotent.
-- ─────────────────────────────────────────────────────────────
do $$
declare
  p   record;
  s   text;
  c   text;
  sz  int;
  cz  int;
  per int;
begin
  for p in
    select mp.*
    from public.merch_products mp
    where not exists (
      select 1 from public.merch_variants v where v.product_id = mp.id
    )
  loop
    sz := coalesce(array_length(p.sizes,  1), 0);
    cz := coalesce(array_length(p.colors, 1), 0);

    if sz = 0 and cz = 0 then
      insert into public.merch_variants (product_id, stock, status)
      values (p.id, coalesce(p.stock, 0), 'active');

    elsif sz = 0 then
      per := coalesce(p.stock, 0) / greatest(cz, 1);
      foreach c in array p.colors loop
        insert into public.merch_variants (product_id, color, stock, status)
        values (p.id, c, per, 'active');
      end loop;

    elsif cz = 0 then
      per := coalesce(p.stock, 0) / greatest(sz, 1);
      foreach s in array p.sizes loop
        insert into public.merch_variants (product_id, size, stock, status)
        values (p.id, s, per, 'active');
      end loop;

    else
      per := coalesce(p.stock, 0) / greatest(sz * cz, 1);
      foreach s in array p.sizes loop
        foreach c in array p.colors loop
          insert into public.merch_variants (product_id, size, color, stock, status)
          values (p.id, s, c, per, 'active');
        end loop;
      end loop;
    end if;
  end loop;
end
$$;
