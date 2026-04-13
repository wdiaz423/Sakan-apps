import { AlertTriangle, Clock, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MaintenanceTask } from '@/lib/types';
import { getTaskStatus, getDaysUntilDue, getNextDueDate } from '@/lib/maintenance-utils';
import { CATEGORIES } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface RemindersBarProps {
  tasks: MaintenanceTask[];
  onScrollToTask?: (id: string) => void;
}

export function RemindersBar({ tasks }: RemindersBarProps) {
  const overdueTasks = tasks
    .filter(t => getTaskStatus(t) === 'overdue')
    .sort((a, b) => getDaysUntilDue(a) - getDaysUntilDue(b));

  const dueSoonTasks = tasks
    .filter(t => getTaskStatus(t) === 'due-soon')
    .sort((a, b) => getDaysUntilDue(a) - getDaysUntilDue(b));

  if (overdueTasks.length === 0 && dueSoonTasks.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {overdueTasks.length > 0 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <h3 className="text-sm font-semibold text-destructive">
              {overdueTasks.length} {overdueTasks.length === 1 ? 'tarea vencida' : 'tareas vencidas'}
            </h3>
          </div>
          <div className="space-y-2">
            {overdueTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between gap-2 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span>{CATEGORIES[task.category].emoji}</span>
                  <span className="truncate text-foreground font-medium">{task.title}</span>
                </div>
                <span className="text-destructive text-xs font-medium whitespace-nowrap">
                  hace {Math.abs(getDaysUntilDue(task))} días
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {dueSoonTasks.length > 0 && (
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-warning" />
            <h3 className="text-sm font-semibold text-warning-foreground">
              {dueSoonTasks.length} {dueSoonTasks.length === 1 ? 'tarea próxima' : 'tareas próximas'}
            </h3>
          </div>
          <div className="space-y-2">
            {dueSoonTasks.map(task => {
              const days = getDaysUntilDue(task);
              const nextDue = getNextDueDate(task);
              return (
                <div key={task.id} className="flex items-center justify-between gap-2 text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span>{CATEGORIES[task.category].emoji}</span>
                    <span className="truncate text-foreground font-medium">{task.title}</span>
                  </div>
                  <span className="text-muted-foreground text-xs whitespace-nowrap">
                    {days === 0 ? 'Hoy' : days === 1 ? 'Mañana' : `en ${days} días`}
                    {' · '}
                    {format(nextDue, "d MMM", { locale: es })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
