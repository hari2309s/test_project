import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import type { TaskFilters, TaskInsert, TaskUpdate } from '../types/task.types';

const TASKS_QUERY_KEY = 'tasks';

/**
 * Hook to fetch all tasks for the current user
 */
export function useTasks(filters?: TaskFilters) {
  const client = useSupabase();
  
  return useQuery({
    queryKey: [TASKS_QUERY_KEY, filters],
    queryFn: async () => {
      let query = client
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply status filter
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      // Apply priority filter
      if (filters?.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority);
      }

      // Apply search filter
      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    staleTime: 0,
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  });
}

/**
 * Hook to fetch a single task by ID
 */
export function useTask(taskId: string | undefined) {
  const client = useSupabase();

  return useQuery({
    queryKey: [TASKS_QUERY_KEY, taskId],
    queryFn: async () => {
      if (!taskId) return null;

      const { data, error } = await client
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!taskId,
  });
}

/**
 * Hook to create a new task
 */
export function useCreateTask() {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: Omit<TaskInsert, 'user_id' | 'account_id'>) => {
      const { data: { user } } = await client.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await client
        .from('tasks')
        .insert({
          ...task,
          user_id: user.id,
          account_id: user.id, // For now, account_id = user_id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
    },
  });
}

/**
 * Hook to update a task
 */
export function useUpdateTask() {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TaskUpdate & { id: string }) => {
      const { data, error } = await client
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY, data.id] });
    },
  });
}

/**
 * Hook to delete a task
 */
export function useDeleteTask() {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await client
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
    },
  });
}

/**
 * Hook to toggle task completion status
 */
export function useToggleTaskStatus() {
  const updateTask = useUpdateTask();

  return useCallback(
    (taskId: string, currentStatus: string) => {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      return updateTask.mutateAsync({ id: taskId, status: newStatus });
    },
    [updateTask]
  );
}