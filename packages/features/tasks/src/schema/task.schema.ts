import { z } from 'zod';

// Create task schema
export const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  description: z.string().max(5000, 'Description is too long').optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  dueDate: z.date().nullable().optional(),
});

// Update task schema
export const UpdateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long').optional(),
  description: z.string().max(5000, 'Description is too long').optional().nullable(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  dueDate: z.date().nullable().optional(),
});

// Filter schema
export const TaskFiltersSchema = z.object({
  status: z.enum(['all', 'pending', 'in_progress', 'completed']).default('all'),
  priority: z.enum(['all', 'low', 'medium', 'high', 'urgent']).default('all'),
  search: z.string().optional(),
});

export type CreateTaskFormData = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskFormData = z.infer<typeof UpdateTaskSchema>;
export type TaskFiltersFormData = z.infer<typeof TaskFiltersSchema>;