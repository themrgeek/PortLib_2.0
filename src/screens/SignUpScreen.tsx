import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { InputField } from '../components/InputField';
import { Button } from '../components/Button';
import { Checkbox } from '../components/Checkbox';
import { ProgressDots } from '../components/ProgressDots';
import { colors, spacing, typography } from '../theme/colors';

interface SignUpScreenProps {
  navigation: any;
}

type PasswordStrength = 'weak' | 'medium' | 'strong' | null;

export const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>(null);
  const [passwordMatchError, setPasswordMatchError] = useState(false);
  const otpRefs = useRef<(TextInput | null)[]>([]);

  const calculatePasswordStrength = (pwd: string): PasswordStrength => {
    if (pwd.length === 0) return null;
    if (pwd.length < 6) return 'weak';
    if (pwd.length < 10) return 'medium';
    // Check for complexity
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
    const complexity = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
    
    if (complexity >= 3 && pwd.length >= 10) return 'strong';
    if (complexity >= 2) return 'medium';
    return 'weak';
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordStrength(calculatePasswordStrength(text));
    if (confirmPassword && text !== confirmPassword) {
      setPasswordMatchError(true);
    } else {
      setPasswordMatchError(false);
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (password && text !== password) {
      setPasswordMatchError(true);
    } else {
      setPasswordMatchError(false);
    }
  };

  const handleContinue = () => {
    if (step === 1) {
      // Validate form
      if (!fullName || !email || !phoneNumber || !studentId || !password || !confirmPassword) {
        return;
      }
      if (password !== confirmPassword) {
        setPasswordMatchError(true);
        return;
      }
      if (!agreeToTerms) {
        return;
      }
      setStep(2);
    }
  };

  const handleVerify = () => {
    // Handle OTP verification
    const otpString = otp.join('');
    if (otpString.length === 6) {
      console.log('OTP verified:', otpString);
      // Navigate to next screen or complete signup
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    
    if (numericValue.length > 1) {
      // Handle paste
      const pastedOtp = numericValue.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedOtp.forEach((char, i) => {
        if (index + i < 6) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);
      
      // Focus the last filled input or next empty
      const nextEmptyIndex = newOtp.findIndex((val, i) => i >= index && val === '');
      if (nextEmptyIndex !== -1 && otpRefs.current[nextEmptyIndex]) {
        otpRefs.current[nextEmptyIndex]?.focus();
      } else if (index + pastedOtp.length < 6 && otpRefs.current[index + pastedOtp.length]) {
        otpRefs.current[index + pastedOtp.length]?.focus();
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = numericValue;
    setOtp(newOtp);

    // Auto-focus next input
    if (numericValue && index < 5 && otpRefs.current[index + 1]) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0 && otpRefs.current[index - 1]) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const renderStep1 = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.iconPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
        <View style={styles.placeholder} />
      </View>

      <ProgressDots totalSteps={2} currentStep={1} />

      <Text style={styles.welcomeText}>Welcome!</Text>
      <Text style={styles.descriptionText}>
        Enter your details below to get started.
      </Text>

      <InputField
        label="Full Name"
        icon="person"
        placeholder="Enter your full name"
        value={fullName}
        onChangeText={setFullName}
        autoCapitalize="words"
      />

      <InputField
        label="Email"
        icon="mail"
        placeholder="Enter your email address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <InputField
        label="Phone Number"
        icon="call"
        placeholder="Enter your phone number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />

      <InputField
        label="Student ID"
        icon="briefcase"
        placeholder="Enter your student ID"
        value={studentId}
        onChangeText={setStudentId}
      />

      <InputField
        label="Password"
        icon="lock-closed"
        placeholder="Enter your password"
        value={password}
        onChangeText={handlePasswordChange}
        secureTextEntry
        showPasswordToggle
        passwordStrength={passwordStrength}
      />

      <InputField
        label="Confirm Password"
        icon="lock-closed"
        placeholder="Confirm your password"
        value={confirmPassword}
        onChangeText={handleConfirmPasswordChange}
        secureTextEntry
        showPasswordToggle
        error={passwordMatchError ? 'Passwords do not match.' : undefined}
      />

      <Checkbox
        checked={agreeToTerms}
        onToggle={() => setAgreeToTerms(!agreeToTerms)}
        label="I agree to the "
        linkText="Terms & Conditions."
        onLinkPress={() => console.log('Terms pressed')}
      />

      <Button title="Continue" onPress={handleContinue} />
    </>
  );

  const renderStep2 = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setStep(1)}
        >
          <Ionicons name="arrow-back" size={24} color={colors.iconPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
        <View style={styles.placeholder} />
      </View>

      <ProgressDots totalSteps={2} currentStep={2} />

      <Text style={styles.welcomeText}>Verify Your Phone</Text>
      <Text style={styles.descriptionText}>
        Enter the 6-digit code sent to your phone number
      </Text>

      <View style={styles.otpContainer}>
        {otp.map((value, index) => (
          <View key={index} style={styles.otpInputWrapper}>
            <TextInput
              ref={(ref) => (otpRefs.current[index] = ref)}
              style={styles.otpInput}
              value={value}
              onChangeText={(text) => handleOtpChange(index, text)}
              onKeyPress={({ nativeEvent }) => handleOtpKeyPress(index, nativeEvent.key)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          </View>
        ))}
      </View>

      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>Resend code in 01:59</Text>
      </View>

      <TouchableOpacity style={styles.resendButton}>
        <Text style={styles.resendButtonText}>Resend OTP</Text>
      </TouchableOpacity>

      <Button title="Verify" onPress={handleVerify} />
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {step === 1 ? renderStep1() : renderStep2()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  welcomeText: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.xxxl,
    marginBottom: spacing.xs,
  },
  descriptionText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.xxxl,
  },
  otpInputWrapper: {
    flex: 1,
    marginHorizontal: spacing.xs / 2,
  },
  otpInput: {
    width: '100%',
    height: 45,
    borderWidth: 1,
    borderColor: colors.borderInactive,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  timerText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  resendButton: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  resendButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
});

