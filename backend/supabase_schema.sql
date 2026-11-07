create table if not exists public.session_recaps (
    id uuid primary key default gen_random_uuid(),
    session_id uuid not null,
    user_id uuid not null references auth.users (id) on delete cascade,
    started_at timestamptz not null,
    ended_at timestamptz not null,
    summary text not null,
    themes text[] not null default '{}',
    cbt_reflection jsonb not null,
    next_step text not null,
    helpfulness_rating smallint,
    created_at timestamptz not null default now(),
    constraint session_recaps_user_session_unique unique (user_id, session_id),
    constraint session_recaps_reflection_object check (jsonb_typeof(cbt_reflection) = 'object'),
    constraint session_recaps_helpfulness_range check (
        helpfulness_rating is null or helpfulness_rating between 1 and 5
    )
);

create index if not exists session_recaps_user_ended_idx
    on public.session_recaps (user_id, ended_at desc);

alter table public.session_recaps enable row level security;

revoke all on table public.session_recaps from anon, authenticated;
grant select, insert, update, delete on table public.session_recaps to authenticated;

drop policy if exists "Users read their own recaps" on public.session_recaps;
create policy "Users read their own recaps"
    on public.session_recaps for select to authenticated
    using ((select auth.uid()) = user_id);

drop policy if exists "Users create their own recaps" on public.session_recaps;
create policy "Users create their own recaps"
    on public.session_recaps for insert to authenticated
    with check ((select auth.uid()) = user_id);

drop policy if exists "Users update their own recaps" on public.session_recaps;
create policy "Users update their own recaps"
    on public.session_recaps for update to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

drop policy if exists "Users delete their own recaps" on public.session_recaps;
create policy "Users delete their own recaps"
    on public.session_recaps for delete to authenticated
    using ((select auth.uid()) = user_id);
