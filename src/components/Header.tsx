import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { triggerLightHaptic } from '../utils/haptics';

interface HeaderProps {
  onOpenAddChore: () => void;
  onOpenCustomizeWidgets: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddChore, onOpenCustomizeWidgets }) => {
  return (
    <View style={styles.header}>
      <View>
        <View style={styles.titleRow}>
          <Text style={styles.title}>ChoreFlow</Text>
          <View style={styles.pastelDot} />
        </View>
        <Text style={styles.subtitle}>Sorted by lateness & overdue time</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          accessibilityRole="button"
          style={styles.iconButton}
          onPress={() => {
            triggerLightHaptic();
            onOpenCustomizeWidgets();
          }}
          accessibilityLabel="Customize home widgets"
        >
          <Ionicons name="options-outline" size={19} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          style={styles.addButton}
          onPress={() => {
            triggerLightHaptic();
            onOpenAddChore();
          }}
          activeOpacity={0.85}
          accessibilityLabel="Add new chore"
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 23,
    fontWeight: '800',
    color: colors.textMain,
    letterSpacing: -0.4,
  },
  pastelDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: 6,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 12.5,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F5F7FB',
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
});
