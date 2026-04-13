import type { TaskStatus } from '@/lib/types';

const STATUS_CONFIG: Record<TaskStatus, { label: string; className: string }> = {
  'on-track': { label: 'Al día', className: 'bg-success/15 text-success' },
  'due-soon': { label: 'Próximo', className: 'bg-warning/15 text-warning-foreground' },
  'overdue': { label: 'Vencido', className: 'bg-destructive/15 text-destructive' },
};

export function StatusIndicator({ status }: { status: TaskStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${
        status === 'on-track' ? 'bg-success' : status === 'due-soon' ? 'bg-warning' : 'bg-destructive'
      }`} />
      {config.label}
    </span>
  );
}
