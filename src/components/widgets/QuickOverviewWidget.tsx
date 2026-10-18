import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Chore } from '../../types/chore';
import { calculateTiming } from '../../utils/time';

interface QuickOverviewWidgetProps {
  chores: Chore[];
}

export const QuickOverviewWidget: React.FC<QuickOverviewWidgetProps> = ({ chores }) => {
  const overdueCount = chores.filter((c) => calculateTiming(c).isOverdue).length;
  const onTrackCount = chores.length - overdueCount;

  return (
    <View style={styles.container}>
      <View style={[styles.statBox, styles.statBoxOverdue]}>
        <Text style={styles.statNumberOverdue}>{overdueCount}</Text>
        <Text style={styles.statLabelOverdue}>Overdue</Text>
      </View>

      <View style={[styles.statBox, styles.statBoxOnTrack]}>
        <Text style={styles.statNumberOnTrack}>{onTrackCount}</Text>
        <Text style={styles.statLabelOnTrack}>On Track</Text>
      </View>

      <View style={[styles.statBox, styles.statBoxTotal]}>
        <Text style={styles.statNumberTotal}>{chores.length}</Text>
        <Text style={styles.statLabelTotal}>Total Chores</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  statBoxOverdue: {
    backgroundColor: '#FFF1F2', // Soft pastel rose
    borderColor: '#FECDD3',
  },
  statBoxOnTrack: {
    backgroundColor: '#F0FDF4', // Soft pastel sage
    borderColor: '#BBF7D0',
  },
  statBoxTotal: {
    backgroundColor: '#F8F9FE', // Soft pastel lavender tint
    borderColor: '#E8ECF8',
  },
  statNumberOverdue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#BE123C',
  },
  statLabelOverdue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#BE123C',
    marginTop: 2,
  },
  statNumberOnTrack: {
    fontSize: 22,
    fontWeight: '800',
    color: '#047857',
  },
  statLabelOnTrack: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
    marginTop: 2,
  },
  statNumberTotal: {
    fontSize: 22,
    fontWeight: '800',
    color: '#6366F1',
  },
  statLabelTotal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
    marginTop: 2,
  },
});
