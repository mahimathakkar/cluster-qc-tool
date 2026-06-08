-- ============================================================
-- Cluster QC Tool — Initial Schema
-- Run this in Supabase SQL editor: https://supabase.com/dashboard
-- ============================================================

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  role text not null default 'user', -- 'user' | 'admin'
  created_at timestamptz default now()
);

-- Projects
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  status text not null default 'active', -- 'active' | 'completed' | 'archived'
  current_step text not null default 'upload', -- 'upload' | 'ready' | '1' | '2' | '3' | 'export'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Project state (full serialized QC state — no image blobs)
create table if not exists public.project_states (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null unique,
  clusters jsonb not null default '[]',
  removed jsonb not null default '[]',
  discarded jsonb not null default '[]',
  current_cluster_index int not null default 0,
  current_removed_index int not null default 0,
  new_cluster_counter int not null default 0,
  updated_at timestamptz default now()
);

-- Project images (track which images belong to which project)
create table if not exists public.project_images (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  cluster_id text not null,
  filename text not null,
  storage_path text not null,
  created_at timestamptz default now()
);

-- Indexes for common lookups
create index if not exists idx_projects_user_id on public.projects(user_id);
create index if not exists idx_project_images_project_cluster on public.project_images(project_id, cluster_id);
create index if not exists idx_project_images_project on public.project_images(project_id);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_states enable row level security;
alter table public.project_images enable row level security;

-- Drop existing policies if re-running
do $$ begin
  drop policy if exists "Users can view own profile" on public.profiles;
  drop policy if exists "Admins can view all profiles" on public.profiles;
  drop policy if exists "Users can update own profile" on public.profiles;
  drop policy if exists "Users manage own projects" on public.projects;
  drop policy if exists "Admins manage all projects" on public.projects;
  drop policy if exists "Users manage own project states" on public.project_states;
  drop policy if exists "Admins manage all project states" on public.project_states;
  drop policy if exists "Users manage own project images" on public.project_images;
  drop policy if exists "Admins manage all project images" on public.project_images;
end $$;

-- Profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Projects
create policy "Users manage own projects"
  on public.projects for all
  using (auth.uid() = user_id);

create policy "Admins manage all projects"
  on public.projects for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Project states
create policy "Users manage own project states"
  on public.project_states for all
  using (exists (select 1 from public.projects where id = project_id and user_id = auth.uid()));

create policy "Admins manage all project states"
  on public.project_states for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Project images
create policy "Users manage own project images"
  on public.project_images for all
  using (exists (select 1 from public.projects where id = project_id and user_id = auth.uid()));

create policy "Admins manage all project images"
  on public.project_images for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ============================================================
-- Auto-create profile trigger
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Storage bucket (run separately in Supabase dashboard or via API)
-- ============================================================
-- NOTE: Create a private bucket named 'cluster-images' in the
-- Supabase dashboard under Storage. Then add these policies:

-- INSERT (authenticated users can upload to their own path):
-- (bucket_id = 'cluster-images') AND (auth.uid()::text = (storage.foldername(name))[1])

-- SELECT (users can read their own files; admins can read all):
-- (bucket_id = 'cluster-images') AND (
--   auth.uid()::text = (storage.foldername(name))[1]
--   OR exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
-- )

-- ============================================================
-- Promote admin (run after first signup)
-- ============================================================
-- update public.profiles set role = 'admin' where email = 'mahima.t@aftershoot.com';
