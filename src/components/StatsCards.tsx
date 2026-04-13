import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Clock, ListChecks } from 'lucide-react';
import type { MaintenanceTask } from '@/lib/types';
import { getTaskStatus } from '@/lib/maintenance-utils';

interface StatsCardsProps {
  tasks: MaintenanceTask[];
}

export function StatsCards({ tasks }: StatsCardsProps) {
  const overdue = tasks.filter(t => getTaskStatus(t) === 'overdue').length;
  const dueSoon = tasks.filter(t => getTaskStatus(t) === 'due-soon').length;
  const onTrack = tasks.filter(t => getTaskStatus(t) === 'on-track').length;

  const stats = [
    { label: 'Total', value: tasks.length, icon: ListChecks, color: 'text-primary' },
    { label: 'Al día', value: onTrack, icon: CheckCircle2, color: 'text-success' },
    { label: 'Próximos', value: dueSoon, icon: Clock, color: 'text-warning' },
    { label: 'Vencidos', value: overdue, icon: AlertTriangle, color: 'text-destructive' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="rounded-lg border bg-card p-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
            <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
          </div>
          <p className="text-2xl font-heading text-card-foreground">{stat.value}</p>
        </motion.div>
      ))}
    </div>
  );
}
