'use client';

import { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@kit/ui/button';
import { LoadingOverlay } from '@kit/ui/loading-overlay';
import { Alert, AlertDescription } from '@kit/ui/alert';
import { TaskList } from './task-list';
import { TaskForm } from './task-form';
import { TaskFiltersComponent } from './task-filters';
import { useTasks } from '../hooks/use-tasks';
import { Task, TaskFilters } from '../types/task.types';

export function TasksPageContainer() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const [queryFilters, setQueryFilters] = useState<TaskFilters>({
    status: 'all',
    priority: 'all',
    search: '',
  });

  const { data: tasks, isPending, isError } = useTasks(queryFilters);

  const handleEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingTask(null);
  }, []);

  if (isPending && !tasks) {
    return <LoadingOverlay fullPage={false} />;
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load tasks. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">
            Manage your tasks and stay organized
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Filters */}
      <TaskFiltersComponent 
        onFiltersChange={setQueryFilters} 
      />

      {/* Task Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Tasks"
          value={tasks?.length || 0}
          variant="default"
        />
        <StatCard
          label="Pending"
          value={tasks?.filter((t) => t.status === 'pending').length || 0}
          variant="warning"
        />
        <StatCard
          label="Completed"
          value={tasks?.filter((t) => t.status === 'completed').length || 0}
          variant="success"
        />
      </div>

      {/* Task List */}
      <div className="relative">
        <TaskList tasks={tasks || []} onEdit={handleEdit} />
      </div>

      {/* Task Form Modal */}
      <TaskForm
        open={isFormOpen}
        onOpenChange={handleCloseForm}
        task={editingTask}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  variant = 'default',
}: {
  label: string;
  value: number;
  variant?: 'default' | 'success' | 'warning';
}) {
  const colors = {
    default: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    success: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
    warning: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  };

  return (
    <div className={`rounded-lg p-4 ${colors[variant]}`}>
      <div className="text-sm font-medium opacity-75">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}