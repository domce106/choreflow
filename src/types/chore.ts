export type FrequencyUnit = 'days' | 'weeks' | 'months';

export interface Chore {
  id: string;
  title: string;
  notes?: string;
  frequencyValue: number; // e.g. 3
  frequencyUnit: FrequencyUnit; // e.g. 'days'
  frequencyInDays: number; // calculated total days for sorting/timing
  labels: string[]; // user-defined labels, multiple allowed
  lastCompletedAt: number | null; // epoch timestamp in ms of last logged completion
  createdAt: number;
  completionHistory: number[]; // timestamps of past completions
  reminderEnabled: boolean;
}

export interface ChoreTimingInfo {
  latenessMs: number; // positive = overdue, negative = not yet due
  isOverdue: boolean;
  timeSinceLastPerformedText: string;
  latenessText: string;
  dueDate: number;
}

export type WidgetType =
  'top-lateness' | 'category-shortcuts' | 'quick-overview' | 'chore-consistency';

export interface HomeWidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  enabled: boolean;
  itemLimit?: number; // e.g. show top 3 or 5 items
  selectedChoreId?: string; // for chore consistency graph widget
}

export interface AppData {
  chores: Chore[];
  widgets: HomeWidgetConfig[];
  availableLabels: string[]; // persistent pool of user-created labels
}

export interface ConsistencyCycle {
  cycleIndex: number;
  dateLabel: string;
  daysTaken: number;
  targetDays: number;
  isOnTime: boolean;
  performanceRatio: number; // 1.0 = exactly on time, > 1.0 = ahead of time, < 1.0 = took longer
}

export interface ConsistencyStats {
  scorePercent: number; // e.g. 85%
  currentStreak: number; // consecutive on-time cycles
  totalCompletions: number;
  cycles: ConsistencyCycle[];
  encouragementText: string;
}
