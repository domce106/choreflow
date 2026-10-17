import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Chore } from '../types/chore';
import { calculateTiming, formatFrequency } from '../utils/time';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { triggerSuccessHaptic } from '../utils/haptics';

interface ChoreCardProps {
  chore: Chore;
  onLogCompleted: (choreId: string) => void;
  onEdit: (chore: Chore) => void;
  onSelectLabel?: (label: string) => void;
}

export const ChoreCard: React.FC<ChoreCardProps> = ({
  chore,
  onLogCompleted,
  onEdit,
  onSelectLabel,
}) => {
  const timing = calculateTiming(chore);
  const statusTheme = timing.isOverdue ? colors.overdue : colors.onTrack;

  const handleLogDone = () => {
    triggerSuccessHaptic();
    onLogCompleted(chore.id);
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        timing.isOverdue && { borderColor: statusTheme.border },
      ]}
      onPress={() => onEdit(chore)}
      activeOpacity={0.85}
    >
      {/* Top Header: Frequency & Pastel Status Badge */}
      <View style={styles.topRow}>
        <View style={styles.frequencyRow}>
          <Ionicons name="repeat-outline" size={13} color={colors.textSecondary} />
          <Text style={styles.frequencyText}>
            {formatFrequency(chore.frequencyValue, chore.frequencyUnit)}
          </Text>
        </View>

        <View
          style={[
            styles.badge,
            { backgroundColor: statusTheme.bg, borderColor: statusTheme.border },
          ]}
        >
          <View style={[styles.badgeDot, { backgroundColor: statusTheme.badge }]} />
          <Text style={[styles.badgeText, { color: statusTheme.text }]}>
            {timing.latenessText}
          </Text>
        </View>
      </View>

      {/* Main Content: Title, Notes, Time Since Performed */}
      <View style={styles.mainRow}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{chore.title}</Text>
          {chore.notes ? (
            <Text style={styles.notes} numberOfLines={2}>
              {chore.notes}
            </Text>
          ) : null}

          {/* Time since last performed */}
          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={13} color={colors.textMuted} />
            <Text style={styles.timeText}>
              {timing.timeSinceLastPerformedText}
            </Text>
          </View>
        </View>

        {/* 1-Tap Log Completed Action Button */}
        <TouchableOpacity
          style={[styles.logButton, timing.isOverdue && styles.logButtonOverdue]}
          onPress={handleLogDone}
          activeOpacity={0.75}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Log chore as done"
        >
          <Ionicons name="checkmark" size={18} color="#FFFFFF" />
          <Text style={styles.logButtonText}>Done</Text>
        </TouchableOpacity>
      </View>

      {/* Pastel Labels Row */}
      {chore.labels.length > 0 && (
        <View style={styles.labelsContainer}>
          {chore.labels.map((label) => (
            <TouchableOpacity
              key={label}
              style={styles.labelChip}
              onPress={() => onSelectLabel?.(label)}
              activeOpacity={0.7}
            >
              <Text style={styles.labelText}>#{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  frequencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  frequencyText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  badgeText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  textContainer: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 2,
  },
  notes: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
    lineHeight: 18,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  timeText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  logButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 11,
    gap: 4,
  },
  logButtonOverdue: {
    backgroundColor: '#FB7185', // Soft pastel rose
  },
  logButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  labelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  labelChip: {
    backgroundColor: '#F5F7FC',
    borderWidth: 1,
    borderColor: '#E8ECF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  labelText: {
    fontSize: 11,
    color: '#6366F1',
    fontWeight: '600',
  },
});
