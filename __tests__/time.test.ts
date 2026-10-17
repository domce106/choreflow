import {
  calculateTiming,
  sortByLateness,
  calculateFrequencyInDays,
  formatFrequency,
  formatDurationHuman,
  calculateChoreConsistency,
} from '../src/utils/time';
import { Chore } from '../src/types/chore';

const DAY_MS = 24 * 60 * 60 * 1000;

describe('time.ts - Lateness calculation and ordering', () => {
  const baseChore: Chore = {
    id: 'chore-test',
    title: 'Clean Kitchen',
    frequencyValue: 2,
    frequencyUnit: 'days',
    frequencyInDays: 2,
    labels: ['Kitchen', 'Daily'],
    lastCompletedAt: null,
    createdAt: Date.now() - DAY_MS * 5,
    completionHistory: [],
    reminderEnabled: true,
  };

  test('calculates frequency in days correctly for units', () => {
    expect(calculateFrequencyInDays(3, 'days')).toBe(3);
    expect(calculateFrequencyInDays(2, 'weeks')).toBe(14);
    expect(calculateFrequencyInDays(1, 'months')).toBe(30);
  });

  test('calculates never completed chore lateness based on creation date', () => {
    const now = Date.now();
    const chore: Chore = {
      ...baseChore,
      frequencyValue: 2,
      frequencyInDays: 2,
      createdAt: now - DAY_MS * 5, // created 5 days ago, frequency is 2 days -> 3 days overdue
      lastCompletedAt: null,
    };

    const timing = calculateTiming(chore, now);
    expect(timing.isOverdue).toBe(true);
    expect(timing.timeSinceLastPerformedText).toBe('Never performed (5 days ago)');
    expect(timing.latenessText).toBe('3 days overdue');
  });

  test('calculates chore performed recently as not overdue', () => {
    const now = Date.now();
    const chore: Chore = {
      ...baseChore,
      frequencyValue: 7,
      frequencyInDays: 7,
      createdAt: now - DAY_MS * 20,
      lastCompletedAt: now - DAY_MS * 2, // done 2 days ago, frequency 7 days -> due in 5 days
    };

    const timing = calculateTiming(chore, now);
    expect(timing.isOverdue).toBe(false);
    expect(timing.timeSinceLastPerformedText).toBe('Last performed: 2 days ago');
    expect(timing.latenessText).toBe('Due in 5 days');
  });

  test('sorts chores strictly by lateness (most overdue item at the top)', () => {
    const now = Date.now();

    const choreOnTrack: Chore = {
      ...baseChore,
      id: 'on-track',
      title: 'Due in 5 days',
      frequencyInDays: 7,
      lastCompletedAt: now - DAY_MS * 2, // due in 5 days (latenessMs = -5 days)
    };

    const choreMildlyOverdue: Chore = {
      ...baseChore,
      id: 'mild-overdue',
      title: '1 day overdue',
      frequencyInDays: 1,
      lastCompletedAt: now - DAY_MS * 2, // due 1 day ago (latenessMs = +1 day)
    };

    const choreMostOverdue: Chore = {
      ...baseChore,
      id: 'most-overdue',
      title: '6 days overdue',
      frequencyInDays: 1,
      lastCompletedAt: now - DAY_MS * 7, // due 6 days ago (latenessMs = +6 days)
    };

    const sorted = sortByLateness(
      [choreOnTrack, choreMildlyOverdue, choreMostOverdue],
      now
    );

    expect(sorted[0].id).toBe('most-overdue');
    expect(sorted[1].id).toBe('mild-overdue');
    expect(sorted[2].id).toBe('on-track');
  });

  test('formats frequency readable text', () => {
    expect(formatFrequency(1, 'days')).toBe('Daily');
    expect(formatFrequency(3, 'days')).toBe('Every 3 days');
    expect(formatFrequency(1, 'weeks')).toBe('Weekly');
    expect(formatFrequency(2, 'weeks')).toBe('Every 2 weeks');
    expect(formatFrequency(1, 'months')).toBe('Monthly');
  });

  test('calculateChoreConsistency computes on-time streak and score', () => {
    const now = Date.now();
    const chore: Chore = {
      ...baseChore,
      frequencyValue: 2,
      frequencyInDays: 2,
      createdAt: now - DAY_MS * 10,
      completionHistory: [
        now - DAY_MS * 8, // cycle 1: 2 days (on time)
        now - DAY_MS * 6, // cycle 2: 2 days (on time)
        now - DAY_MS * 4, // cycle 3: 2 days (on time)
        now - DAY_MS * 2, // cycle 4: 2 days (on time)
      ],
    };

    const stats = calculateChoreConsistency(chore);
    expect(stats.totalCompletions).toBe(4);
    expect(stats.currentStreak).toBe(4);
    expect(stats.scorePercent).toBe(100);
    expect(stats.encouragementText).toContain('Outstanding');
    expect(stats.cycles.length).toBe(4);
  });
});
