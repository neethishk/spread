-- Spread Studio schema

create table public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null default 'Untitled catalog',
  store text not null default 'YOUR STORE',
  accent text not null default 'oklch(0.57 0.2 25)',
  badge text not null default 'oklch(0.86 0.16 92)',
  template text not null default 'promo',
  grid_key text not null default '3x3',
  page_size text not null default 'a4',
  orientation text not null default 'portrait',
  headline1 text not null default 'WEEKEND',
  headline2 text not null default 'DEALS',
  burst text not null default 'UP TO 60% OFF',
  validity text not null default 'VALID THIS WEEK',
  products jsonb not null default '[]',
  manual_pages jsonb not null default '[]',
  page_grids jsonb not null default '{}',
  banners jsonb not null default '{}',
  cover jsonb not null default '{}',
  catalog_name text not null default 'Untitled catalog',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.projects enable row level security;

create policy "Users can view their own projects"
  on public.projects for select using (auth.uid() = user_id);

create policy "Users can insert their own projects"
  on public.projects for insert with check (auth.uid() = user_id);

create policy "Users can update their own projects"
  on public.projects for update using (auth.uid() = user_id);

create policy "Users can delete their own projects"
  on public.projects for delete using (auth.uid() = user_id);

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_projects_updated
  before update on public.projects
  for each row execute procedure public.handle_updated_at();
