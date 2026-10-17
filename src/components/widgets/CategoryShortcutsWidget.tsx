import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Chore } from '../../types/chore';
import { calculateTiming } from '../../utils/time';
import { colors } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { triggerLightHaptic } from '../../utils/haptics';

interface CategoryShortcutsWidgetProps {
  chores: Chore[];
  labels: string[];
  activeFilter: string | null;
  onSelectCategory: (category: string | null) => void;
}

export const CategoryShortcutsWidget: React.FC<CategoryShortcutsWidgetProps> = ({
  chores,
  labels,
  activeFilter,
  onSelectCategory,
}) => {
  if (labels.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="grid-outline" size={16} color={colors.primary} />
          <Text style={styles.title}>Category Shortcuts</Text>
        </View>
        {activeFilter && (
          <TouchableOpacity
            onPress={() => {
              triggerLightHaptic();
              onSelectCategory(null);
            }}
          >
            <Text style={styles.clearText}>Clear Filter</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollRow}
      >
        {labels.map((label, index) => {
          const matchingChores = chores.filter((c) => c.labels.includes(label));
          const count = matchingChores.length;
          const overdueCount = matchingChores.filter((c) => calculateTiming(c).isOverdue).length;
          const isSelected = activeFilter === label;
          const pastelTint = colors.pastels[index % colors.pastels.length];

          return (
            <TouchableOpacity
              key={label}
              style={[
                styles.shortcutTile,
                {
                  backgroundColor: isSelected ? colors.primaryLight : pastelTint.bg,
                  borderColor: isSelected ? colors.primary : pastelTint.border,
                },
              ]}
              onPress={() => {
                triggerLightHaptic();
                onSelectCategory(isSelected ? null : label);
              }}
              activeOpacity={0.75}
            >
              <View style={styles.tileTop}>
                <Text
                  style={[
                    styles.labelName,
                    { color: isSelected ? colors.primaryDark : pastelTint.text },
                  ]}
                  numberOfLines={1}
                >
                  #{label}
                </Text>
                {overdueCount > 0 && (
                  <View style={styles.overdueBadge}>
                    <Text style={styles.overdueBadgeText}>{overdueCount}</Text>
                  </View>
                )}
              </View>

              <Text style={[styles.countText, isSelected && styles.countTextSelected]}>
                {count} {count === 1 ? 'chore' : 'chores'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMain,
  },
  clearText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  scrollRow: {
    gap: 8,
    paddingRight: 8,
  },
  shortcutTile: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 110,
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  tileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 6,
  },
  labelName: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  overdueBadge: {
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  overdueBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#BE123C',
  },
  countText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  countTextSelected: {
    color: colors.primaryDark,
    fontWeight: '600',
  },
});
