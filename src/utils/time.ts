import {
  Chore,
  ChoreTimingInfo,
  ConsistencyCycle,
  ConsistencyStats,
  FrequencyUnit,
} from '../types/chore';

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

export function calculateFrequencyInDays(value: number, unit: FrequencyUnit): number {
  const safeVal = Math.max(1, value);
  switch (unit) {
    case 'days':
      return safeVal;
    case 'weeks':
      return safeVal * 7;
    case 'months':
      return safeVal * 30;
    default:
      return safeVal;
  }
}

export function formatDurationHuman(diffMs: number): string {
  if (diffMs < MS_PER_HOUR) {
    const mins = Math.max(1, Math.floor(diffMs / MS_PER_MINUTE));
    return `${mins}m`;
  }
  if (diffMs < MS_PER_DAY) {
    const hours = Math.floor(diffMs / MS_PER_HOUR);
    return `${hours}h`;
  }
  const days = Math.floor(diffMs / MS_PER_DAY);
  if (days === 1) return '1 day';
  if (days < 14) return `${days} days`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return '1 week';
  if (weeks < 8) return `${weeks} weeks`;
  const months = Math.floor(days / 30);
  return `${months} mo`;
}

/**
 * Calculates how long since last performed and lateness past due date.
 */
export function calculateTiming(chore: Chore, now: number = Date.now()): ChoreTimingInfo {
  const frequencyDays = chore.frequencyInDays || calculateFrequencyInDays(chore.frequencyValue, chore.frequencyUnit);
  const freqMs = frequencyDays * MS_PER_DAY;

  const baseTimestamp = chore.lastCompletedAt ?? chore.createdAt;
  const dueDate = baseTimestamp + freqMs;
  const latenessMs = now - dueDate;
  const isOverdue = latenessMs > 0;

  // 1. Time since last performed text
  let timeSinceLastPerformedText: string;
  if (chore.lastCompletedAt === null) {
    const elapsedSinceCreation = Math.max(0, now - chore.createdAt);
    if (elapsedSinceCreation < MS_PER_DAY) {
      timeSinceLastPerformedText = 'Never performed (added today)';
    } else {
      timeSinceLastPerformedText = `Never performed (${formatDurationHuman(elapsedSinceCreation)} ago)`;
    }
  } else {
    const elapsedSinceCompletion = Math.max(0, now - chore.lastCompletedAt);
    if (elapsedSinceCompletion < MS_PER_HOUR) {
      timeSinceLastPerformedText = 'Last performed: just now';
    } else if (elapsedSinceCompletion < MS_PER_DAY) {
      timeSinceLastPerformedText = 'Last performed: today';
    } else {
      timeSinceLastPerformedText = `Last performed: ${formatDurationHuman(elapsedSinceCompletion)} ago`;
    }
  }

  // 2. Lateness text
  let latenessText: string;
  if (isOverdue) {
    latenessText = `${formatDurationHuman(latenessMs)} overdue`;
  } else {
    const remainingMs = dueDate - now;
    if (remainingMs < MS_PER_DAY) {
      latenessText = 'Due today';
    } else {
      latenessText = `Due in ${formatDurationHuman(remainingMs)}`;
    }
  }

  return {
    latenessMs,
    isOverdue,
    timeSinceLastPerformedText,
    latenessText,
    dueDate,
  };
}

/**
 * Sorts chores by lateness (most time passed since due date at the top)
 */
export function sortByLateness(chores: Chore[], now: number = Date.now()): Chore[] {
  return [...chores].sort((a, b) => {
    const timingA = calculateTiming(a, now);
    const timingB = calculateTiming(b, now);
    return timingB.latenessMs - timingA.latenessMs;
  });
}

/**
 * Formats chore frequency into readable string (e.g. "Every 3 days", "Every week")
 */
export function formatFrequency(value: number, unit: FrequencyUnit): string {
  if (value === 1) {
    if (unit === 'days') return 'Daily';
    if (unit === 'weeks') return 'Weekly';
    if (unit === 'months') return 'Monthly';
  }
  return `Every ${value} ${unit}`;
}

/**
 * Calculates consistency stats and performance cycles for a chore
 */
export function calculateChoreConsistency(chore: Chore): ConsistencyStats {
  const targetDays = chore.frequencyInDays || 1;
  const history = [...(chore.completionHistory || [])].sort((a, b) => a - b);

  const cycles: ConsistencyCycle[] = [];

  if (history.length > 0) {
    for (let i = 0; i < history.length; i++) {
      const prevTime = i === 0 ? chore.createdAt : history[i - 1];
      const currTime = history[i];
      const diffMs = Math.max(0, currTime - prevTime);
      const daysTaken = Math.max(0.2, Number((diffMs / MS_PER_DAY).toFixed(1)));

      const dateObj = new Date(currTime);
      const dateLabel = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;

      // Allow small 15% grace threshold
      const isOnTime = daysTaken <= targetDays * 1.15;
      const ratio = Number(Math.min(1.5, targetDays / Math.max(0.5, daysTaken)).toFixed(2));

      cycles.push({
        cycleIndex: i + 1,
        dateLabel,
        daysTaken,
        targetDays,
        isOnTime,
        performanceRatio: ratio,
      });
    }
  }

  // Calculate current on-time streak counting backwards
  let currentStreak = 0;
  for (let i = cycles.length - 1; i >= 0; i--) {
    if (cycles[i].isOnTime) {
      currentStreak += 1;
    } else {
      break;
    }
  }

  const onTimeCount = cycles.filter((c) => c.isOnTime).length;
  const total = cycles.length;
  const scorePercent = total > 0 ? Math.round((onTimeCount / total) * 100) : 100;

  let encouragementText: string;
  if (total === 0) {
    encouragementText = 'Log your first completion to ignite your streak! 🚀';
  } else if (scorePercent >= 85) {
    encouragementText = '🔥 Outstanding consistency! Target frequency maintained.';
  } else if (scorePercent >= 65) {
    encouragementText = '⭐ Solid rhythm! You are staying on track.';
  } else {
    encouragementText = '🌱 Good effort! Each logged chore builds momentum.';
  }

  return {
    scorePercent,
    currentStreak,
    totalCompletions: total,
    cycles,
    encouragementText,
  };
}
