import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Chore, HomeWidgetConfig, WidgetType } from '../../types/chore';
import { colors } from '../../theme/colors';
import { triggerLightHaptic } from '../../utils/haptics';

const WIDGET_DESCRIPTIONS: Record<WidgetType, string> = {
  'chore-consistency':
    'Displays a performance graph of how consistently you meet the chore frequency.',
  'top-lateness': 'Displays the top most late chores needing attention.',
  'category-shortcuts': 'Quick-tap shortcut tiles to filter by category/label.',
  'quick-overview': 'Summary cards of overdue and on-track counts.',
};

interface CustomizeWidgetsModalProps {
  visible: boolean;
  widgets: HomeWidgetConfig[];
  chores: Chore[];
  onClose: () => void;
  onUpdateWidgets: (updated: HomeWidgetConfig[]) => void;
}

export const CustomizeWidgetsModal: React.FC<CustomizeWidgetsModalProps> = ({
  visible,
  widgets,
  chores,
  onClose,
  onUpdateWidgets,
}) => {
  const toggleWidget = (id: string, enabled: boolean) => {
    triggerLightHaptic();
    const updated = widgets.map((w) => (w.id === id ? { ...w, enabled } : w));
    onUpdateWidgets(updated);
  };

  const changeLimit = (id: string, limit: number) => {
    triggerLightHaptic();
    const updated = widgets.map((w) => (w.id === id ? { ...w, itemLimit: limit } : w));
    onUpdateWidgets(updated);
  };

  const changeSelectedChore = (widgetId: string, choreId: string) => {
    triggerLightHaptic();
    const updated = widgets.map((w) =>
      w.id === widgetId ? { ...w, selectedChoreId: choreId } : w
    );
    onUpdateWidgets(updated);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      {/* Modals render in a separate native root, so they need their own provider */}
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Customize Home Widgets</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.doneButton}
              accessibilityRole="button"
            >
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.hintText}>
              Choose which widgets appear on your home screen and how they look.
            </Text>

            {widgets.map((widget) => (
              <View key={widget.id} style={styles.widgetRow}>
                <View style={styles.widgetInfo}>
                  <Text style={styles.widgetTitle}>{widget.title}</Text>
                  <Text style={styles.widgetSubtitle}>{WIDGET_DESCRIPTIONS[widget.type]}</Text>

                  {/* Additional controls for Consistency Tracker */}
                  {widget.type === 'chore-consistency' && widget.enabled && chores.length > 0 && (
                    <View style={styles.pickerSection}>
                      <Text style={styles.pickerLabel}>Track Chore:</Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={{ marginTop: 6 }}
                      >
                        <View style={{ flexDirection: 'row', gap: 6 }}>
                          {chores.map((c) => {
                            const isSelected = (widget.selectedChoreId || chores[0]?.id) === c.id;
                            return (
                              <TouchableOpacity
                                accessibilityRole="button"
                                accessibilityState={{ selected: isSelected }}
                                key={c.id}
                                style={[styles.chorePill, isSelected && styles.chorePillActive]}
                                onPress={() => changeSelectedChore(widget.id, c.id)}
                              >
                                <Text
                                  style={[
                                    styles.chorePillText,
                                    isSelected && styles.chorePillTextActive,
                                  ]}
                                >
                                  {c.title}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </ScrollView>
                    </View>
                  )}

                  {/* Additional controls for top lateness widget */}
                  {widget.type === 'top-lateness' && widget.enabled && (
                    <View style={styles.limitPicker}>
                      <Text style={styles.limitLabel}>Show top:</Text>
                      {[3, 5, 10].map((num) => (
                        <TouchableOpacity
                          accessibilityRole="button"
                          accessibilityState={{ selected: (widget.itemLimit || 3) === num }}
                          key={num}
                          style={[
                            styles.limitChip,
                            (widget.itemLimit || 3) === num && styles.limitChipActive,
                          ]}
                          onPress={() => changeLimit(widget.id, num)}
                        >
                          <Text
                            style={[
                              styles.limitChipText,
                              (widget.itemLimit || 3) === num && styles.limitChipTextActive,
                            ]}
                          >
                            {num} items
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <Switch
                  value={widget.enabled}
                  onValueChange={(val) => toggleWidget(widget.id, val)}
                  accessibilityLabel={`Show ${widget.title}`}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFBFD',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textMain,
  },
  doneButton: {
    padding: 4,
  },
  doneText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '700',
  },
  content: {
    padding: 16,
  },
  hintText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  widgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  widgetInfo: {
    flex: 1,
    paddingRight: 12,
  },
  widgetTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 2,
  },
  widgetSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  pickerSection: {
    marginTop: 10,
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chorePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F5F7FC',
    borderWidth: 1,
    borderColor: '#EEF2F8',
  },
  chorePillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chorePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chorePillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  limitPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  limitLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  limitChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F5F7FC',
    borderWidth: 1,
    borderColor: '#EEF2F8',
  },
  limitChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  limitChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  limitChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
