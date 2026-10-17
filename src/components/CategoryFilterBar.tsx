import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { triggerLightHaptic } from '../utils/haptics';

interface CategoryFilterBarProps {
  labels: string[];
  selectedLabel: string | null;
  onSelectLabel: (label: string | null) => void;
  totalChoresCount: number;
}

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  labels,
  selectedLabel,
  onSelectLabel,
  totalChoresCount,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={[styles.filterChip, selectedLabel === null && styles.filterChipActive]}
          onPress={() => {
            triggerLightHaptic();
            onSelectLabel(null);
          }}
        >
          <Text style={[styles.filterText, selectedLabel === null && styles.filterTextActive]}>
            All Chores ({totalChoresCount})
          </Text>
        </TouchableOpacity>

        {labels.map((label, index) => {
          const isSelected = selectedLabel === label;
          const pastel = colors.pastels[index % colors.pastels.length];
          return (
            <TouchableOpacity
              key={label}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isSelected ? colors.primary : pastel.bg,
                  borderColor: isSelected ? colors.primary : pastel.border,
                },
              ]}
              onPress={() => {
                triggerLightHaptic();
                onSelectLabel(isSelected ? null : label);
              }}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: isSelected ? '#FFFFFF' : pastel.text },
                  isSelected && styles.filterTextActive,
                ]}
              >
                #{label}
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
    marginVertical: 10,
  },
  scrollContent: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 10,
  },
  filterChip: {
    backgroundColor: '#F5F7FC',
    borderWidth: 1,
    borderColor: '#EEF2F8',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
