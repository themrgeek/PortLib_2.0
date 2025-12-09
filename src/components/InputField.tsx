import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme/colors';

interface InputFieldProps extends TextInputProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  showPasswordToggle?: boolean;
  passwordStrength?: 'weak' | 'medium' | 'strong' | null;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  icon,
  error,
  showPasswordToggle = false,
  passwordStrength = null,
  secureTextEntry,
  ...textInputProps
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error
    ? colors.borderError
    : isFocused
    ? colors.borderActive
    : colors.borderInactive;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputContainer, { borderColor }]}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={colors.iconDefault}
            style={styles.icon}
          />
        )}
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.textPlaceholder}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...textInputProps}
        />
        {showPasswordToggle && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.passwordToggle}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye' : 'eye-off'}
              size={20}
              color={colors.iconDefault}
            />
          </TouchableOpacity>
        )}
      </View>
      {passwordStrength && (
        <View style={styles.passwordStrengthContainer}>
          <View style={styles.passwordStrengthBars}>
            <View
              style={[
                styles.passwordBar,
                {
                  backgroundColor:
                    passwordStrength === 'weak'
                      ? colors.passwordWeak
                      : passwordStrength === 'medium'
                      ? colors.passwordMedium
                      : colors.passwordStrong,
                },
              ]}
            />
            <View
              style={[
                styles.passwordBar,
                {
                  backgroundColor:
                    passwordStrength === 'medium' || passwordStrength === 'strong'
                      ? passwordStrength === 'medium'
                        ? colors.passwordMedium
                        : colors.passwordStrong
                      : colors.borderInactive,
                },
              ]}
            />
            <View
              style={[
                styles.passwordBar,
                {
                  backgroundColor:
                    passwordStrength === 'strong'
                      ? colors.passwordStrong
                      : colors.borderInactive,
                },
              ]}
            />
          </View>
          <Text
            style={[
              styles.passwordStrengthText,
              {
                color:
                  passwordStrength === 'weak'
                    ? colors.passwordWeak
                    : passwordStrength === 'medium'
                    ? colors.passwordMedium
                    : colors.passwordStrong,
              },
            ]}
          >
            {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
          </Text>
        </View>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    height: 50,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
  },
  passwordToggle: {
    padding: spacing.xs,
  },
  passwordStrengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  passwordStrengthBars: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  passwordBar: {
    height: 4,
    flex: 1,
    marginRight: spacing.xs,
    borderRadius: 2,
  },
  passwordStrengthText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    marginLeft: spacing.xs,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.textError,
    marginTop: spacing.xs,
  },
});

