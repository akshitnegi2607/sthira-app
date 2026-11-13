import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Spacing } from '@/constants/theme';
import { SthiraBrandLogo } from '@/components/ui/SthiraBrandLogo';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';

interface LoginScreenProps {
  onSuccess?: () => void;
}

export function LoginScreen({ onSuccess }: LoginScreenProps) {
  const insets = useSafeAreaInsets();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = () => {
    setErrorMessage(null);
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    const result = login(username, password);
    if (result.success) {
      if (onSuccess) onSuccess();
    } else {
      setErrorMessage(result.error || 'Invalid username or password.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Full-screen Sacred Background of Lord Narayana */}
      <Image
        source={require('@/../assets/images/narayana_vishwaroop.jpg')}
        style={styles.bgImage}
        resizeMode="cover"
      />

      {/* Dark Vignette Overlay for Calm Contrast and Legibility */}
      <View style={styles.darkOverlay} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Lotus Brand Header */}
          <View style={styles.brandHeader}>
            <SthiraBrandLogo size="medium" showTagline />
            <Text style={styles.appTagline}>
              Personal AI Fitness & Nutrition Coach
            </Text>
          </View>

          {/* Secure Login Card */}
          <View style={styles.loginCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Sign In</Text>
              <Text style={styles.cardSubtitle}>
                Access your private workout routines & nutrition logs
              </Text>
            </View>

            {/* Error Message Pill */}
            {errorMessage ? (
              <View style={styles.errorPill}>
                <Ionicons name="alert-circle" size={16} color="#F87171" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Username Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Username</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="person-outline"
                  size={18}
                  color="#94A3B8"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter username"
                  placeholderTextColor="#64748B"
                  value={username}
                  onChangeText={(val) => {
                    setUsername(val);
                    setErrorMessage(null);
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color="#94A3B8"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.textInput, { paddingRight: 40 }]}
                  placeholder="Enter password"
                  placeholderTextColor="#64748B"
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    setErrorMessage(null);
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign In Button */}
            <Button
              title={isLoading ? 'Signing In...' : 'Sign In'}
              onPress={handleLogin}
              disabled={isLoading || !username.trim() || !password.trim()}
              style={styles.signInButton}
            />

            {/* Privacy & Isolation Footnote */}
            <View style={styles.privacyFootnote}>
              <Ionicons name="shield-checkmark-outline" size={13} color="#10B981" />
              <Text style={styles.privacyText}>
                Local-first • Strictly isolated database per user
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F17',
  },
  bgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(11, 15, 23, 0.78)',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  appTagline: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '500',
    marginTop: Spacing.xs,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  loginCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.88)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHeader: {
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: 0.3,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
    lineHeight: 18,
  },
  errorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CBD5E1',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  textInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 15,
    height: '100%',
  },
  eyeButton: {
    padding: 6,
  },
  signInButton: {
    marginTop: Spacing.sm,
  },
  privacyFootnote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.lg,
  },
  privacyText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
