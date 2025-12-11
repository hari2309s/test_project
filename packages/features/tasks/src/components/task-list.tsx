'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, Clock, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent } from '@kit/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@kit/ui/alert-dialog';
import { Trans } from '@kit/ui/trans';
import { toast } from 'sonner';
import { useDeleteTask, useToggleTaskStatus } from '../hooks/use-tasks';
import { Task, PRIORITY_COLORS, TaskPriority } from '../types/task.types';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
}

export function TaskList({ tasks, onEdit }: TaskListProps) {
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const deleteTask = useDeleteTask();
  const toggleStatus = useToggleTaskStatus();

  const handleToggleStatus = async (task: Task) => {
    try {
      await toggleStatus(task.id, task.status);
      toast.success(
        task.status === 'completed' 
          ? 'Task marked as pending'
          : 'Task completed!'
      );
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async () => {
    if (!deleteTaskId) return;

    try {
      await deleteTask.mutateAsync(deleteTaskId);
      toast.success('Task deleted');
      setDeleteTaskId(null);
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            No tasks found. Create your first task to get started!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {tasks.map((task) => (
          <Card key={task.id} className="group hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* Status toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 mt-0.5"
                  onClick={() => handleToggleStatus(task)}
                >
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </Button>

                {/* Task content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className={`font-medium ${
                        task.status === 'completed'
                          ? 'line-through text-muted-foreground'
                          : ''
                      }`}
                    >
                      {task.title}
                    </h3>
                    
                    {/* Actions */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(task)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTaskId(task.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  {task.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant="outline" className={PRIORITY_COLORS[task.priority as TaskPriority]}>
                      {task.priority}
                    </Badge>
                    
                    {task.due_date && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(task.due_date), 'MMM d, yyyy')}
                      </div>
                    )}

                    {task.status === 'in_progress' && (
                      <Badge variant="secondary">In Progress</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTaskId} onOpenChange={() => setDeleteTaskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Trans i18nKey="common:cancel" />
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}