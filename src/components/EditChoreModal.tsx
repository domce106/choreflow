import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import { Chore, FrequencyUnit } from '../types/chore';
import { calculateFrequencyInDays } from '../utils/time';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { triggerLightHaptic, triggerMediumHaptic } from '../utils/haptics';

interface EditChoreModalProps {
  visible: boolean;
  chore: Chore | null; // null if creating new
  availableLabels: string[];
  onClose: () => void;
  onSave: (chore: Chore, newLabelsPool: string[]) => void;
  onDelete?: (choreId: string) => void;
  onLogCompletedNow?: (choreId: string) => void;
}

const FREQUENCY_PRESETS: { label: string; value: number; unit: FrequencyUnit }[] = [
  { label: 'Daily', value: 1, unit: 'days' },
  { label: 'Every 2 days', value: 2, unit: 'days' },
  { label: 'Every 3 days', value: 3, unit: 'days' },
  { label: 'Weekly', value: 1, unit: 'weeks' },
  { label: 'Every 2 weeks', value: 2, unit: 'weeks' },
  { label: 'Monthly', value: 1, unit: 'months' },
];

export const EditChoreModal: React.FC<EditChoreModalProps> = ({
  visible,
  chore,
  availableLabels,
  onClose,
  onSave,
  onDelete,
  onLogCompletedNow,
}) => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [frequencyValue, setFrequencyValue] = useState(1);
  const [frequencyUnit, setFrequencyUnit] = useState<FrequencyUnit>('days');
  const [customValueText, setCustomValueText] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [newLabelInput, setNewLabelInput] = useState('');
  const [allLabelsPool, setAllLabelsPool] = useState<string[]>(availableLabels);
  const [reminderEnabled, setReminderEnabled] = useState(true);

  useEffect(() => {
    setAllLabelsPool(availableLabels);
  }, [availableLabels]);

  useEffect(() => {
    if (chore) {
      setTitle(chore.title);
      setNotes(chore.notes || '');
      setFrequencyValue(chore.frequencyValue);
      setFrequencyUnit(chore.frequencyUnit);
      setCustomValueText(String(chore.frequencyValue));
      setSelectedLabels(chore.labels || []);
      setReminderEnabled(chore.reminderEnabled);
    } else {
      setTitle('');
      setNotes('');
      setFrequencyValue(1);
      setFrequencyUnit('days');
      setCustomValueText('1');
      setSelectedLabels([]);
      setReminderEnabled(true);
    }
    setNewLabelInput('');
  }, [chore, visible]);

  const handleSelectPreset = (value: number, unit: FrequencyUnit) => {
    triggerLightHaptic();
    setFrequencyValue(value);
    setFrequencyUnit(unit);
    setCustomValueText(String(value));
  };

  const handleCustomValueChange = (text: string) => {
    setCustomValueText(text);
    const parsed = parseInt(text.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(parsed) && parsed > 0) {
      setFrequencyValue(parsed);
    }
  };

  const handleToggleLabel = (label: string) => {
    triggerLightHaptic();
    if (selectedLabels.includes(label)) {
      setSelectedLabels(selectedLabels.filter((l) => l !== label));
    } else {
      setSelectedLabels([...selectedLabels, label]);
    }
  };

  const handleAddNewLabel = () => {
    const trimmed = newLabelInput.trim();
    if (!trimmed) return;
    triggerLightHaptic();

    if (!allLabelsPool.includes(trimmed)) {
      setAllLabelsPool([...allLabelsPool, trimmed]);
    }
    if (!selectedLabels.includes(trimmed)) {
      setSelectedLabels([...selectedLabels, trimmed]);
    }
    setNewLabelInput('');
  };

  const handleSave = () => {
    if (!title.trim()) {
      const msg = 'Please enter a chore title.';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Required Field', msg);
      return;
    }

    triggerMediumHaptic();

    const frequencyInDays = calculateFrequencyInDays(frequencyValue, frequencyUnit);

    const savedChore: Chore = {
      id: chore ? chore.id : `chore-${Date.now()}`,
      title: title.trim(),
      notes: notes.trim() ? notes.trim() : undefined,
      frequencyValue,
      frequencyUnit,
      frequencyInDays,
      labels: selectedLabels,
      lastCompletedAt: chore ? chore.lastCompletedAt : null,
      createdAt: chore ? chore.createdAt : Date.now(),
      completionHistory: chore ? chore.completionHistory : [],
      reminderEnabled,
    };

    onSave(savedChore, allLabelsPool);
    onClose();
  };

  const handleDelete = () => {
    if (!chore || !onDelete) return;

    const doDelete = () => {
      triggerMediumHaptic();
      onDelete(chore.id);
      onClose();
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Delete "${chore.title}"?`)) doDelete();
    } else {
      Alert.alert(
        'Delete Chore',
        `Are you sure you want to delete "${chore.title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: doDelete },
        ]
      );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {chore ? 'Edit Chore' : 'Add New Chore'}
          </Text>
          <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          {/* Chore Title */}
          <Text style={styles.sectionLabel}>CHORE TITLE *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Vacuum living room, Clean bathroom"
            placeholderTextColor={colors.textMuted}
          />

          {/* Notes */}
          <Text style={styles.sectionLabel}>NOTES / DETAILS (OPTIONAL)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g. Use the hardwood floor attachment"
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={2}
          />

          {/* Frequency Section */}
          <Text style={styles.sectionLabel}>FREQUENCY (HOW OFTEN IS IT DONE?)</Text>
          <View style={styles.presetsRow}>
            {FREQUENCY_PRESETS.map((p) => {
              const isSelected =
                frequencyValue === p.value && frequencyUnit === p.unit;
              return (
                <TouchableOpacity
                  key={`${p.value}-${p.unit}`}
                  style={[
                    styles.presetPill,
                    isSelected && styles.presetPillSelected,
                  ]}
                  onPress={() => handleSelectPreset(p.value, p.unit)}
                >
                  <Text
                    style={[
                      styles.presetText,
                      isSelected && styles.presetTextSelected,
                    ]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Custom Frequency Value & Unit */}
          <View style={styles.customFrequencyRow}>
            <Text style={styles.customFreqPrefix}>Every</Text>
            <TextInput
              style={styles.customNumberInput}
              value={customValueText}
              onChangeText={handleCustomValueChange}
              keyboardType="number-pad"
              maxLength={3}
            />
            <View style={styles.unitButtonsRow}>
              {(['days', 'weeks', 'months'] as FrequencyUnit[]).map((u) => {
                const isSelected = frequencyUnit === u;
                return (
                  <TouchableOpacity
                    key={u}
                    style={[
                      styles.unitButton,
                      isSelected && styles.unitButtonSelected,
                    ]}
                    onPress={() => {
                      triggerLightHaptic();
                      setFrequencyUnit(u);
                    }}
                  >
                    <Text
                      style={[
                        styles.unitButtonText,
                        isSelected && styles.unitButtonTextSelected,
                      ]}
                    >
                      {u}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Labels / Categories Section */}
          <Text style={styles.sectionLabel}>
            LABELS & CATEGORIES (CHOOSE MULTIPLE OR CREATE NEW)
          </Text>
          <Text style={styles.helperText}>
            Name and assign your own custom labels to categorize this chore.
          </Text>

          {/* Selected & Available Labels */}
          <View style={styles.labelsPoolWrap}>
            {allLabelsPool.map((label) => {
              const isSelected = selectedLabels.includes(label);
              return (
                <TouchableOpacity
                  key={label}
                  style={[
                    styles.labelChip,
                    isSelected && styles.labelChipSelected,
                  ]}
                  onPress={() => handleToggleLabel(label)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.labelChipText,
                      isSelected && styles.labelChipTextSelected,
                    ]}
                  >
                    #{label}
                  </Text>
                  {isSelected && (
                    <Ionicons
                      name="checkmark"
                      size={14}
                      color="#FFFFFF"
                      style={{ marginLeft: 4 }}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Add New Custom Label Input */}
          <View style={styles.addLabelRow}>
            <TextInput
              style={[styles.input, styles.addLabelInput]}
              value={newLabelInput}
              onChangeText={setNewLabelInput}
              placeholder="Name a new label (e.g. Upstairs, Fast)"
              placeholderTextColor={colors.textMuted}
              onSubmitEditing={handleAddNewLabel}
            />
            <TouchableOpacity
              style={styles.addLabelBtn}
              onPress={handleAddNewLabel}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Notifications Switch */}
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.switchTitle}>Remind When Due</Text>
              <Text style={styles.switchSubtitle}>
                Sends a notification based on this chore's frequency and lateness.
              </Text>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          {/* If Editing: Quick Log as Done Button */}
          {chore && onLogCompletedNow && (
            <TouchableOpacity
              style={styles.logDoneNowBtn}
              onPress={() => {
                triggerMediumHaptic();
                onLogCompletedNow(chore.id);
                onClose();
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color="#16A34A" style={{ marginRight: 6 }} />
              <Text style={styles.logDoneNowText}>Log Chore As Done Right Now</Text>
            </TouchableOpacity>
          )}

          {/* Delete Option */}
          {chore && onDelete && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={18} color={colors.danger} style={{ marginRight: 6 }} />
              <Text style={styles.deleteButtonText}>Delete Chore</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
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
    paddingHorizontal: 16,
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
  headerButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  cancelText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  saveText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '700',
  },
  content: {
    padding: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  helperText: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textMain,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 54,
    textAlignVertical: 'top',
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  presetPill: {
    backgroundColor: '#F5F7FC',
    borderWidth: 1,
    borderColor: '#EEF2F8',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  presetPillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  presetText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  presetTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  customFrequencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEF2F8',
    padding: 8,
    marginBottom: 18,
    gap: 8,
  },
  customFreqPrefix: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 6,
  },
  customNumberInput: {
    width: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: colors.textMain,
  },
  unitButtonsRow: {
    flexDirection: 'row',
    flex: 1,
    backgroundColor: '#EEF2F6',
    borderRadius: 8,
    padding: 2,
    gap: 2,
  },
  unitButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 6,
  },
  unitButtonSelected: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  unitButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  unitButtonTextSelected: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  labelsPoolWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  labelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FC',
    borderWidth: 1,
    borderColor: '#EEF2F8',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  labelChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  labelChipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  labelChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  addLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  addLabelInput: {
    flex: 1,
    marginBottom: 0,
  },
  addLabelBtn: {
    backgroundColor: colors.primary,
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEF2F8',
    marginBottom: 16,
  },
  switchTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 2,
  },
  switchSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  logDoneNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  logDoneNowText: {
    color: '#047857',
    fontSize: 14,
    fontWeight: '700',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 12,
    paddingVertical: 12,
  },
  deleteButtonText: {
    color: '#BE123C',
    fontSize: 14,
    fontWeight: '700',
  },
});
