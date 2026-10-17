import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData, Chore, HomeWidgetConfig } from '../types/chore';
import { calculateFrequencyInDays } from './time';

const APP_DATA_STORAGE_KEY = '@house_chores_app_clean_v4';

export const DEFAULT_WIDGETS: HomeWidgetConfig[] = [
  {
    id: 'widget-chore-consistency',
    type: 'chore-consistency',
    title: 'Consistency & Performance Tracker',
    enabled: true,
  },
  {
    id: 'widget-top-lateness',
    type: 'top-lateness',
    title: 'Most Overdue Chores',
    enabled: true,
    itemLimit: 3,
  },
  {
    id: 'widget-category-shortcuts',
    type: 'category-shortcuts',
    title: 'Category Shortcuts',
    enabled: true,
  },
  {
    id: 'widget-quick-overview',
    type: 'quick-overview',
    title: 'Overview',
    enabled: true,
  },
  {
    id: 'widget-all-chores',
    type: 'all-chores',
    title: 'All Chores',
    enabled: true,
  },
];

// No predefined chores - clean slate for the user
export const INITIAL_SAMPLE_CHORES: Chore[] = [];

// No predefined labels - user creates their own
export const INITIAL_AVAILABLE_LABELS: string[] = [];

export async function loadAppData(): Promise<AppData> {
  const defaultData: AppData = {
    chores: [],
    widgets: DEFAULT_WIDGETS,
    availableLabels: [],
  };

  let raw: string | null;
  try {
    raw = await AsyncStorage.getItem(APP_DATA_STORAGE_KEY);
  } catch (err) {
    // Storage is unreadable right now; don't write defaults over data we couldn't see
    console.error('Failed to read app data:', err);
    return defaultData;
  }

  if (!raw) {
    await saveAppData(defaultData);
    return defaultData;
  }

  try {
    const parsed: AppData = JSON.parse(raw);
    return {
      chores: (parsed.chores || []).map((c) => ({
        ...c,
        frequencyInDays:
          c.frequencyInDays ||
          calculateFrequencyInDays(c.frequencyValue, c.frequencyUnit),
        completionHistory: c.completionHistory || [],
        labels: c.labels || [],
      })),
      widgets: parsed.widgets?.length ? parsed.widgets : DEFAULT_WIDGETS,
      availableLabels: parsed.availableLabels || [],
    };
  } catch (err) {
    // Keep a copy of the unreadable payload so the next save can't destroy it
    console.error('Failed to parse app data, backing it up:', err);
    try {
      await AsyncStorage.setItem(`${APP_DATA_STORAGE_KEY}_corrupt_${Date.now()}`, raw);
    } catch (backupErr) {
      console.error('Failed to back up corrupt app data:', backupErr);
    }
    return defaultData;
  }
}

export async function saveAppData(data: AppData): Promise<void> {
  try {
    await AsyncStorage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save app data:', err);
  }
}
