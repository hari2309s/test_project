-- Migration: 20241212000000_create_tasks_table.sql
-- Description: Creates tasks table with support for future team collaboration

-- Create tasks table
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  
  -- Ownership
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  
  -- Task content
  title text not null,
  description text,
  
  -- Organization
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  
  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  due_date timestamptz,
  
  -- Metadata
  metadata jsonb default '{}'::jsonb
);

-- Add comments
comment on table public.tasks is 'User tasks with support for future team collaboration';
comment on column public.tasks.user_id is 'The user who created/owns the task';
comment on column public.tasks.account_id is 'The account the task belongs to (enables team sharing in future)';
comment on column public.tasks.status is 'Task status: pending, in_progress, or completed';
comment on column public.tasks.priority is 'Task priority: low, medium, high, or urgent';
comment on column public.tasks.metadata is 'Flexible JSON field for future extensions (tags, attachments, etc)';

-- Create indexes for common queries
create index tasks_user_id_idx on public.tasks(user_id);
create index tasks_account_id_idx on public.tasks(account_id);
create index tasks_status_idx on public.tasks(status);
create index tasks_priority_idx on public.tasks(priority);
create index tasks_due_date_idx on public.tasks(due_date);
create index tasks_created_at_idx on public.tasks(created_at desc);

-- Enable RLS
alter table public.tasks enable row level security;

-- RLS Policies
-- Users can view their own tasks
create policy tasks_select_own on public.tasks
  for select
  to authenticated
  using (user_id = auth.uid());

-- Users can insert their own tasks
create policy tasks_insert_own on public.tasks
  for insert
  to authenticated
  with check (
    user_id = auth.uid() 
    and account_id = auth.uid()
  );

-- Users can update their own tasks
create policy tasks_update_own on public.tasks
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Users can delete their own tasks
create policy tasks_delete_own on public.tasks
  for delete
  to authenticated
  using (user_id = auth.uid());

-- Grant permissions
grant select, insert, update, delete on public.tasks to authenticated;

-- Function to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to update updated_at on row update
create trigger tasks_updated_at
  before update on public.tasks
  for each row
  execute function public.handle_updated_at();

-- Function to automatically set completed_at when status changes to completed
create or replace function public.handle_task_completion()
returns trigger as $$
begin
  if new.status = 'completed' and old.status != 'completed' then
    new.completed_at = now();
  elsif new.status != 'completed' then
    new.completed_at = null;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to handle task completion
create trigger tasks_completion
  before update on public.tasks
  for each row
  execute function public.handle_task_completion();