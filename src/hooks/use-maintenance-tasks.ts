import { useState, useEffect } from 'react';
import type { MaintenanceTask } from '@/lib/types';

const STORAGE_KEY = 'home-maintenance-tasks';

const SAMPLE_TASKS: MaintenanceTask[] = [
  {
    id: '1',
    title: 'Revisar filtros del aire acondicionado',
    category: 'hvac',
    description: 'Limpiar o reemplazar filtros',
    frequencyValue: 3,
    frequencyUnit: 'months',
    lastCompleted: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'Limpiar canaletas',
    category: 'exterior',
    description: 'Remover hojas y residuos de las canaletas',
    frequencyValue: 6,
    frequencyUnit: 'months',
    lastCompleted: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    title: 'Podar el jardín',
    category: 'garden',
    frequencyValue: 2,
    frequencyUnit: 'weeks',
    lastCompleted: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    title: 'Revisar detectores de humo',
    category: 'electrical',
    description: 'Probar baterías y funcionamiento',
    frequencyValue: 6,
    frequencyUnit: 'months',
    lastCompleted: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    title: 'Limpieza profunda de cocina',
    category: 'cleaning',
    description: 'Electrodomésticos, azulejos y campana',
    frequencyValue: 1,
    frequencyUnit: 'months',
    lastCompleted: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export function useMaintenanceTasks() {
  const [tasks, setTasks] = useState<MaintenanceTask[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : SAMPLE_TASKS;
    } catch {
      return SAMPLE_TASKS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (task: MaintenanceTask) => setTasks(prev => [task, ...prev]);
  
  const updateTask = (id: string, updates: Partial<MaintenanceTask>) =>
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));

  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

  const markCompleted = (id: string) =>
    updateTask(id, { lastCompleted: new Date().toISOString() });

  return { tasks, addTask, updateTask, deleteTask, markCompleted };
}
