import { Database } from '@kit/supabase/database';

// Extract the task type from the database schema
export type Task = Database['public']['Tables']['tasks']['Row'];
export type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
export type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

// Task status and priority enums
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// Form data types
export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: Date | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date | null;
}

// Filter types for task lists
export interface TaskFilters {
  status?: TaskStatus | 'all';
  priority?: TaskPriority | 'all';
  search?: string;
}

// Sort options
export type TaskSortField = 'created_at' | 'due_date' | 'priority' | 'title';
export type TaskSortDirection = 'asc' | 'desc';

export interface TaskSort {
  field: TaskSortField;
  direction: TaskSortDirection;
}

// Constants
export const TASK_STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

export const TASK_PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'text-blue-600 dark:text-blue-400',
  medium: 'text-yellow-600 dark:text-yellow-400',
  high: 'text-orange-600 dark:text-orange-400',
  urgent: 'text-red-600 dark:text-red-400',
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  pending: 'text-gray-600 dark:text-gray-400',
  in_progress: 'text-blue-600 dark:text-blue-400',
  completed: 'text-green-600 dark:text-green-400',
};