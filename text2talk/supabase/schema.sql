create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text check (char_length(full_name) <= 120),
  preferred_language text not null default 'en-US',
  default_rate numeric not null default 1 check (default_rate between 0.5 and 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.transcripts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  content text not null,
  language text not null default 'en-US',
  duration_seconds int not null default 0 check (duration_seconds >= 0),
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.audio_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  input_text text not null check (char_length(input_text) <= 20000),
  language text not null default 'en-US',
  voice text,
  speech_rate numeric not null default 1,
  audio_storage_path text,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now()
);
create index on public.transcripts (user_id, created_at desc);
create index on public.audio_generations (user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.transcripts enable row level security;
alter table public.audio_generations enable row level security;

create policy "own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own transcripts" on public.transcripts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own audio" on public.audio_generations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name) values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger t_touch before update on public.transcripts for each row execute function public.touch_updated_at();
create trigger p_touch before update on public.profiles for each row execute function public.touch_updated_at();
