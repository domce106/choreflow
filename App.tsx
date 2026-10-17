import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  TouchableOpacity,
  AppState,
} from 'react-native';
import { Chore, HomeWidgetConfig } from './src/types/chore';
import { colors } from './src/theme/colors';
import {
  loadAppData,
  saveAppData,
  DEFAULT_WIDGETS,
  INITIAL_AVAILABLE_LABELS,
} from './src/utils/storage';
import { sortByLateness } from './src/utils/time';
import { syncChoreNotifications } from './src/utils/notifications';
import { Header } from './src/components/Header';
import { ChoreCard } from './src/components/ChoreCard';
import { EditChoreModal } from './src/components/EditChoreModal';
import { CategoryFilterBar } from './src/components/CategoryFilterBar';
import { TopLatenessWidget } from './src/components/widgets/TopLatenessWidget';
import { CategoryShortcutsWidget } from './src/components/widgets/CategoryShortcutsWidget';
import { QuickOverviewWidget } from './src/components/widgets/QuickOverviewWidget';
import { ChoreConsistencyWidget } from './src/components/widgets/ChoreConsistencyWidget';
import { CustomizeWidgetsModal } from './src/components/widgets/CustomizeWidgetsModal';
import { Ionicons } from '@expo/vector-icons';

export default function App() {
  const [chores, setChores] = useState<Chore[]>([]);
  const [widgets, setWidgets] = useState<HomeWidgetConfig[]>(DEFAULT_WIDGETS);
  const [availableLabels, setAvailableLabels] = useState<string[]>(INITIAL_AVAILABLE_LABELS);
  // Lateness is time-based, so re-render periodically instead of only on edits
  const [now, setNow] = useState(() => Date.now());
  // Lets the foreground listener read the latest chores without re-subscribing
  const choresRef = useRef(chores);
  useEffect(() => {
    choresRef.current = chores;
  }, [chores]);

  // Filters & Modal States
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [editingChore, setEditingChore] = useState<Chore | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  // Bumped on every open so the editor remounts with fresh form state
  const [editorKey, setEditorKey] = useState(0);
  const [customizeModalVisible, setCustomizeModalVisible] = useState(false);

  // Initial Data Load
  useEffect(() => {
    async function init() {
      try {
        const data = await loadAppData();
        setChores(data.chores);
        setWidgets(data.widgets);
        setAvailableLabels(data.availableLabels);
        await syncChoreNotifications(data.chores);
      } catch (err) {
        console.error('Failed to initialize app data:', err);
      }
    }
    init();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60 * 1000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setNow(Date.now());
        syncChoreNotifications(choresRef.current);
      }
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []);

  // Persist Helper
  const persistChanges = useCallback(
    async (
      updatedChores: Chore[],
      updatedWidgets: HomeWidgetConfig[] = widgets,
      updatedLabels: string[] = availableLabels
    ) => {
      setChores(updatedChores);
      setWidgets(updatedWidgets);
      setAvailableLabels(updatedLabels);
      await saveAppData({
        chores: updatedChores,
        widgets: updatedWidgets,
        availableLabels: updatedLabels,
      });
      await syncChoreNotifications(updatedChores);
    },
    [widgets, availableLabels]
  );

  // Logging Chore as Completed
  const handleLogCompleted = useCallback(
    (choreId: string) => {
      const now = Date.now();
      const updated = chores.map((c) => {
        if (c.id === choreId) {
          return {
            ...c,
            lastCompletedAt: now,
            completionHistory: [...(c.completionHistory || []), now],
          };
        }
        return c;
      });
      persistChanges(updated);
    },
    [chores, persistChanges]
  );

  // Save Chore (Create or Update)
  const handleSaveChore = useCallback(
    (savedChore: Chore, newLabelsPool: string[]) => {
      const exists = chores.some((c) => c.id === savedChore.id);
      const updatedChores = exists
        ? chores.map((c) => (c.id === savedChore.id ? savedChore : c))
        : [savedChore, ...chores];

      persistChanges(updatedChores, widgets, newLabelsPool);
    },
    [chores, widgets, persistChanges]
  );

  // Delete Chore
  const handleDeleteChore = useCallback(
    (choreId: string) => {
      const updated = chores.filter((c) => c.id !== choreId);
      persistChanges(updated);
    },
    [chores, persistChanges]
  );

  // Update Widget Configurations
  const handleUpdateWidgets = useCallback(
    (updatedWidgets: HomeWidgetConfig[]) => {
      setWidgets(updatedWidgets);
      saveAppData({ chores, widgets: updatedWidgets, availableLabels });
    },
    [chores, availableLabels]
  );

  const openEditor = useCallback((chore: Chore | null) => {
    setEditingChore(chore);
    setEditorKey((k) => k + 1);
    setEditModalVisible(true);
  }, []);

  // Sorted and Filtered Chores
  const sortedChores = useMemo(() => sortByLateness(chores, now), [chores, now]);

  const filteredChores = useMemo(() => {
    if (!selectedLabel) return sortedChores;
    return sortedChores.filter((c) => c.labels.includes(selectedLabel));
  }, [sortedChores, selectedLabel]);

  // Active Widgets Helpers
  const isWidgetEnabled = useCallback(
    (type: string) => widgets.find((w) => w.type === type)?.enabled ?? true,
    [widgets]
  );

  const topLatenessLimit = useMemo(() => {
    const w = widgets.find((item) => item.type === 'top-lateness');
    return w?.itemLimit || 3;
  }, [widgets]);

  const consistencyChoreId = useMemo(() => {
    const w = widgets.find((item) => item.type === 'chore-consistency');
    return w?.selectedChoreId || chores[0]?.id;
  }, [widgets, chores]);

  const handleUpdateConsistencyChoreId = useCallback(
    (choreId: string) => {
      const updated = widgets.map((w) =>
        w.type === 'chore-consistency' ? { ...w, selectedChoreId: choreId } : w
      );
      handleUpdateWidgets(updated);
    },
    [widgets, handleUpdateWidgets]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <Header
        onOpenAddChore={() => openEditor(null)}
        onOpenCustomizeWidgets={() => setCustomizeModalVisible(true)}
      />

      <View style={styles.content}>
        <FlatList
          data={filteredChores}
          keyExtractor={(item) => item.id}
          extraData={now}
          renderItem={({ item }) => (
            <ChoreCard
              chore={item}
              onLogCompleted={handleLogCompleted}
              onEdit={openEditor}
              onSelectLabel={(label) => setSelectedLabel(label)}
            />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            chores.length > 0 ? (
              <View style={styles.headerWidgetsArea}>
                {/* Widget 1: Quick Overview Summary (if enabled and no filter active) */}
                {!selectedLabel && isWidgetEnabled('quick-overview') && (
                  <QuickOverviewWidget chores={chores} />
                )}

                {/* Widget 2: Consistency & Performance Tracker Graph Widget */}
                {!selectedLabel && isWidgetEnabled('chore-consistency') && (
                  <ChoreConsistencyWidget
                    chores={chores}
                    selectedChoreId={consistencyChoreId}
                    onSelectChoreId={handleUpdateConsistencyChoreId}
                    onLogCompleted={handleLogCompleted}
                  />
                )}

                {/* Widget 3: Most Late Chores Shortcut Widget (if enabled and no filter active) */}
                {!selectedLabel && isWidgetEnabled('top-lateness') && (
                  <TopLatenessWidget
                    chores={chores}
                    limit={topLatenessLimit}
                    onLogCompleted={handleLogCompleted}
                    onSelectChore={openEditor}
                  />
                )}

                {/* Widget 4: Category Shortcuts Widget (if enabled) */}
                {isWidgetEnabled('category-shortcuts') && (
                  <CategoryShortcutsWidget
                    chores={chores}
                    labels={availableLabels}
                    activeFilter={selectedLabel}
                    onSelectCategory={(cat) => setSelectedLabel(cat)}
                  />
                )}

                {/* Category Filter Pills Bar */}
                <CategoryFilterBar
                  labels={availableLabels}
                  selectedLabel={selectedLabel}
                  onSelectLabel={setSelectedLabel}
                  totalChoresCount={chores.length}
                />

                {/* List Header Title */}
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeaderTitle}>
                    {selectedLabel
                      ? `Chores in #${selectedLabel} (${filteredChores.length})`
                      : `All Chores (${chores.length})`}
                  </Text>
                  <Text style={styles.sectionHeaderSortNote}>Sorted by lateness ↓</Text>
                </View>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="checkmark-done-circle-outline"
                size={48}
                color={colors.textMuted}
                style={{ marginBottom: 10 }}
              />
              <Text style={styles.emptyTitle}>
                {selectedLabel
                  ? `No chores found with label #${selectedLabel}`
                  : 'No chores added yet'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {selectedLabel
                  ? 'Tap another label above or clear the filter to view all.'
                  : 'Tap the + button in the top right to add your first chore around the house.'}
              </Text>
              {selectedLabel && (
                <TouchableOpacity
                  style={styles.clearFilterBtn}
                  onPress={() => setSelectedLabel(null)}
                >
                  <Text style={styles.clearFilterBtnText}>Show All Chores</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      </View>

      {/* Add / Edit Chore Modal */}
      <EditChoreModal
        key={editorKey}
        visible={editModalVisible}
        chore={editingChore}
        availableLabels={availableLabels}
        onClose={() => setEditModalVisible(false)}
        onSave={handleSaveChore}
        onDelete={handleDeleteChore}
        onLogCompletedNow={handleLogCompleted}
      />

      {/* Customize Home Widgets Modal */}
      <CustomizeWidgetsModal
        visible={customizeModalVisible}
        widgets={widgets}
        chores={chores}
        onClose={() => setCustomizeModalVisible(false)}
        onUpdateWidgets={handleUpdateWidgets}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  headerWidgetsArea: {
    marginBottom: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textMain,
  },
  sectionHeaderSortNote: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  clearFilterBtn: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  clearFilterBtnText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
});
