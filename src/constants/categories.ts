import {
  Moon,
  Dumbbell,
  Code,
  Heart,
  Brain,
  Target
} from 'lucide-react';
import type { CategoryInfo } from '../types/habit';

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'Prayer',
    label: 'Prayer',
    icon: Moon,
    badgeClass: 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    accent: '#0d9488'
  },
  {
    id: 'Fitness',
    label: 'Fitness',
    icon: Dumbbell,
    badgeClass: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    accent: '#0284c7'
  },
  {
    id: 'Work & Study',
    label: 'Work & Study',
    icon: Code,
    badgeClass: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    accent: '#2563eb'
  },
  {
    id: 'Health',
    label: 'Health',
    icon: Heart,
    badgeClass: 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    accent: '#0d9488'
  },
  {
    id: 'Mindfulness',
    label: 'Mindfulness',
    icon: Brain,
    badgeClass: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    accent: '#0891b2'
  },
  {
    id: 'Personal',
    label: 'Personal',
    icon: Target,
    badgeClass: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    accent: '#0284c7'
  }
];
