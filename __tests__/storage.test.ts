import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_WIDGETS,
  INITIAL_AVAILABLE_LABELS,
  loadAppData,
  reconcileWidgets,
} from '../src/utils/storage';

describe('storage.ts - Clean slate and widgets configuration', () => {
  test('starts with no predefined labels', () => {
    expect(INITIAL_AVAILABLE_LABELS).toEqual([]);
  });

  test('default widgets include chore-consistency, top-lateness and category shortcuts', () => {
    const types = DEFAULT_WIDGETS.map((w) => w.type);
    expect(types).toContain('chore-consistency');
    expect(types).toContain('top-lateness');
    expect(types).toContain('category-shortcuts');
    expect(types).toContain('quick-overview');
  });

  test('loadAppData returns empty chores list on fresh start', async () => {
    const data = await loadAppData();
    expect(data.chores).toEqual([]);
    expect(data.availableLabels).toEqual([]);
    expect(data.widgets.length).toBeGreaterThan(0);
  });

  test('loadAppData does not overwrite unparseable stored data', async () => {
    const key = '@house_chores_app_clean_v4';
    await AsyncStorage.setItem(key, '{not valid json');

    const data = await loadAppData();

    expect(data.chores).toEqual([]);
    expect(await AsyncStorage.getItem(key)).toBe('{not valid json');
    const keys = await AsyncStorage.getAllKeys();
    expect(keys.some((k) => k.startsWith(`${key}_corrupt_`))).toBe(true);
  });

  test('reconcileWidgets drops unknown widget types and adds missing defaults', () => {
    const stored = [
      { ...DEFAULT_WIDGETS[1], enabled: false },
      { id: 'widget-all-chores', type: 'all-chores', title: 'All Chores', enabled: true },
    ] as unknown as typeof DEFAULT_WIDGETS;

    const result = reconcileWidgets(stored);

    expect(result[0]).toEqual({ ...DEFAULT_WIDGETS[1], enabled: false });
    expect(result.map((w) => w.type).sort()).toEqual(DEFAULT_WIDGETS.map((w) => w.type).sort());
  });
});
