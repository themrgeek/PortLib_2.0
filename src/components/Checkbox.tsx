import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme/colors';

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label: string;
  linkText?: string;
  onLinkPress?: () => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onToggle,
  label,
  linkText,
  onLinkPress,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.checkbox,
            checked && styles.checkboxChecked,
            !checked && styles.checkboxUnchecked,
          ]}
        >
          {checked && (
            <Ionicons name="checkmark" size={16} color={colors.textWhite} />
          )}
        </View>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {linkText && (
            <TouchableOpacity onPress={onLinkPress} activeOpacity={0.7}>
              <Text style={styles.linkText}>{linkText}</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxUnchecked: {
    backgroundColor: colors.background,
    borderColor: colors.textPlaceholder,
  },
  labelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  label: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
  },
  linkText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
});

