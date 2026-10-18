import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Chore } from '../../types/chore';
import { calculateTiming, sortByLateness } from '../../utils/time';
import { colors } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { triggerSuccessHaptic } from '../../utils/haptics';

interface TopLatenessWidgetProps {
  chores: Chore[];
  limit?: number;
  onLogCompleted: (choreId: string) => void;
  onSelectChore: (chore: Chore) => void;
}

export const TopLatenessWidget: React.FC<TopLatenessWidgetProps> = ({
  chores,
  limit = 3,
  onLogCompleted,
  onSelectChore,
}) => {
  const sorted = sortByLateness(chores);
  const topItems = sorted.slice(0, limit);

  if (topItems.length === 0) return null;

  return (
    <View style={styles.widgetCard}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="flame" size={17} color="#FB7185" />
          <Text style={styles.widgetTitle}>Most Late Chores</Text>
        </View>
      </View>

      <View style={styles.list}>
        {topItems.map((chore, index) => {
          const timing = calculateTiming(chore);
          return (
            <TouchableOpacity
              key={chore.id}
              style={[styles.itemRow, index < topItems.length - 1 && styles.borderBottom]}
              onPress={() => onSelectChore(chore)}
              accessibilityRole="button"
              accessibilityLabel={`${chore.title}, ${timing.latenessText}`}
              accessibilityHint="Opens the chore editor"
              accessibilityActions={[{ name: 'markDone', label: 'Mark done' }]}
              onAccessibilityAction={(e) => {
                if (e.nativeEvent.actionName === 'markDone') {
                  triggerSuccessHaptic();
                  onLogCompleted(chore.id);
                }
              }}
              activeOpacity={0.7}
            >
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {chore.title}
                </Text>
                <Text style={styles.itemSubtitle}>
                  <Text style={timing.isOverdue ? styles.overdueText : styles.onTrackText}>
                    {timing.latenessText}
                  </Text>{' '}
                  • {timing.timeSinceLastPerformedText}
                </Text>
              </View>

              <TouchableOpacity
                accessibilityRole="button"
                style={styles.doneCheck}
                onPress={() => {
                  triggerSuccessHaptic();
                  onLogCompleted(chore.id);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel={`Mark ${chore.title} done`}
              >
                <Ionicons name="checkmark-circle" size={26} color={colors.primary} />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  widgetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  widgetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMain,
  },
  list: {
    backgroundColor: '#FAFBFD',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  itemInfo: {
    flex: 1,
    paddingRight: 8,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  overdueText: {
    color: '#BE123C',
    fontWeight: '700',
  },
  onTrackText: {
    color: '#047857',
    fontWeight: '700',
  },
  doneCheck: {
    padding: 2,
  },
});
