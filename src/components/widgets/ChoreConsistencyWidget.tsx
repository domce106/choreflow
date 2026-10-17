import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Chore } from '../../types/chore';
import { calculateChoreConsistency, formatFrequency } from '../../utils/time';
import { colors } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { triggerSuccessHaptic, triggerLightHaptic } from '../../utils/haptics';

interface ChoreConsistencyWidgetProps {
  chores: Chore[];
  selectedChoreId?: string;
  onSelectChoreId: (choreId: string) => void;
  onLogCompleted: (choreId: string) => void;
}

export const ChoreConsistencyWidget: React.FC<ChoreConsistencyWidgetProps> = ({
  chores,
  selectedChoreId,
  onSelectChoreId,
  onLogCompleted,
}) => {
  const activeChore = chores.find((c) => c.id === selectedChoreId) || chores[0];

  if (!activeChore) return null;

  const stats = calculateChoreConsistency(activeChore);
  const targetDays = activeChore.frequencyInDays || 1;

  const displayCycles = stats.cycles.slice(-6);

  const maxDays = Math.max(targetDays * 1.5, ...displayCycles.map((c) => c.daysTaken), 3);

  const handleChoreChipPress = (id: string) => {
    triggerLightHaptic();
    onSelectChoreId(id);
  };

  const handleLogNow = () => {
    triggerSuccessHaptic();
    onLogCompleted(activeChore.id);
  };

  return (
    <View style={styles.card}>
      {/* Widget Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="trending-up" size={17} color={colors.success} />
          <Text style={styles.widgetTitle}>Consistency Tracker</Text>
        </View>
        <View style={styles.targetPill}>
          <Text style={styles.targetPillText}>
            Target: {formatFrequency(activeChore.frequencyValue, activeChore.frequencyUnit)}
          </Text>
        </View>
      </View>

      {/* Chore Selector Horizontal Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.choreSelectorRow}
      >
        {chores.map((chore) => {
          const isSelected = chore.id === activeChore.id;
          return (
            <TouchableOpacity
              key={chore.id}
              style={[styles.choreChip, isSelected && styles.choreChipSelected]}
              onPress={() => handleChoreChipPress(chore.id)}
            >
              <Text
                style={[styles.choreChipText, isSelected && styles.choreChipTextSelected]}
                numberOfLines={1}
              >
                {chore.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Pastel Stats Banner */}
      <View style={styles.statsBanner}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreNumber}>{stats.scorePercent}%</Text>
          <Text style={styles.scoreLabel}>On-Time Score</Text>
        </View>

        <View style={styles.streakContainer}>
          <View style={styles.streakBadge}>
            <Text style={styles.streakFire}>🔥</Text>
            <Text style={styles.streakCount}>{stats.currentStreak} in a row</Text>
          </View>
          <Text style={styles.streakSub}>{stats.encouragementText}</Text>
        </View>
      </View>

      {/* Visual Consistency Bar Graph */}
      <View style={styles.graphContainer}>
        <View style={styles.graphHeader}>
          <Text style={styles.graphTitle}>PERFORMANCE BY CYCLE</Text>
          <Text style={styles.targetLineLabel}>Goal: ≤ {targetDays}d per cycle</Text>
        </View>

        {displayCycles.length === 0 ? (
          <View style={styles.emptyGraph}>
            <Text style={styles.emptyGraphText}>
              No completions logged yet. Tap the button below to start your streak!
            </Text>
          </View>
        ) : (
          <View style={styles.barsArea}>
            {displayCycles.map((cycle) => {
              const heightPercent = Math.min(100, Math.max(15, (cycle.daysTaken / maxDays) * 100));

              return (
                <View key={cycle.cycleIndex} style={styles.barColumn}>
                  <Text style={styles.barTopText}>{cycle.daysTaken}d</Text>

                  {/* The Pastel Bar */}
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${heightPercent}%`,
                          backgroundColor: cycle.isOnTime
                            ? colors.graph.onTimeBar
                            : colors.graph.delayedBar,
                        },
                      ]}
                    />
                  </View>

                  <Ionicons
                    name={cycle.isOnTime ? 'checkmark-circle' : 'time-outline'}
                    size={13}
                    color={cycle.isOnTime ? colors.success : colors.graph.delayedBar}
                    style={{ marginTop: 4 }}
                  />

                  <Text style={styles.barDateLabel}>{cycle.dateLabel}</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Pastel Quick-Log Button */}
      <TouchableOpacity style={styles.logButton} onPress={handleLogNow} activeOpacity={0.8}>
        <Ionicons name="sparkles" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
        <Text style={styles.logButtonText}>Log “{activeChore.title}” Done Now</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
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
    marginBottom: 10,
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
  targetPill: {
    backgroundColor: '#F5F7FC',
    borderWidth: 1,
    borderColor: '#EEF2F8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  targetPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  choreSelectorRow: {
    flexDirection: 'row',
    gap: 6,
    paddingBottom: 10,
  },
  choreChip: {
    backgroundColor: '#FAFBFD',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E8ECF5',
    maxWidth: 160,
  },
  choreChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  choreChipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  choreChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  statsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4', // Pastel sage
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 14,
  },
  scoreContainer: {
    alignItems: 'center',
    paddingRight: 14,
    borderRightWidth: 1,
    borderRightColor: '#A7F3D0',
  },
  scoreNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: '#059669',
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
    textTransform: 'uppercase',
  },
  streakContainer: {
    flex: 1,
    paddingLeft: 12,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  streakFire: {
    fontSize: 14,
    marginRight: 4,
  },
  streakCount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#047857',
  },
  streakSub: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '500',
  },
  graphContainer: {
    backgroundColor: '#FAFBFD',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  graphHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  graphTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  targetLineLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  emptyGraph: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyGraphText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  barsArea: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: 10,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barTopText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  barTrack: {
    height: 70,
    width: 20,
    backgroundColor: colors.graph.track,
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  barDateLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  logButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 11,
  },
  logButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
