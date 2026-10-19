export type TabType = 'dashboard' | 'my-tasks' | 'smart-schedule' | 'focus-mode' | 'insights' | 'settings' | 'intro-video';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string;
  photoURL?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type PriorityType = 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW';

export type TaskStatus = 'UPCOMING' | 'IN_PROGRESS' | 'OVERDUE' | 'COMPLETED';

export interface Task {
  id: string;
  title: string;
  desc?: string;
  category: string;
  priority: PriorityType;
  due?: string; // ISO date string or formatted
  dueLabel?: string;
  duration: number; // in minutes
  repeat?: string;
  status: TaskStatus;
  score: number; // 0-100
  reason?: string;
  completedAt?: string;
  isLocked?: boolean;
}

export interface CompletedTask {
  id: string;
  title: string;
  desc?: string;
  category: string;
  completedAt: string;
  originalTaskId?: string;
}

export interface FocusSession {
  id: string;
  timeRange: string;
  durationMinutes: number;
  taskTitle: string;
  category: string;
  status: string;
}

export interface ScheduleBlock {
  id: string;
  time: string;
  timeRange: string;
  durationMinutes: number;
  title: string;
  desc?: string;
  type: 'FIXED' | 'TASK' | 'BREAK' | 'BUFFER' | 'EMPTY';
  category?: string;
  score?: number;
  isLocked?: boolean;
  isNext?: boolean;
  isDone?: boolean;
  dueNotice?: string;
  tag?: string;
  icon?: string;
}
