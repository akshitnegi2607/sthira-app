import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';
import { SthiraBrandLogo } from '@/components/ui/SthiraBrandLogo';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';
import { UserAccount } from '@/types/auth';

interface LoginScreenProps {
  onSuccess?: () => void;
}

export function LoginScreen({ onSuccess }: LoginScreenProps) {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const accounts = useAuthStore((s) => s.accounts);
  const login = useAuthStore((s) => s.login);

  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    accounts[0]?.id || 'jay'
  );
  const [pin, setPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  const handleSelectAccount = (acc: UserAccount) => {
    setSelectedAccountId(acc.id);
    setPin('');
    setErrorMessage(null);
  };

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setErrorMessage(null);
      if (nextPin.length === 4) {
        attemptLogin(selectedAccountId, nextPin);
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      setErrorMessage(null);
    }
  };

  const handleClear = () => {
    setPin('');
    setErrorMessage(null);
  };

  const handleAutoFillDemoPin = () => {
    if (!selectedAccount) return;
    setPin(selectedAccount.pin);
    attemptLogin(selectedAccountId, selectedAccount.pin);
  };

  const attemptLogin = (accountId: string, inputPin: string) => {
    setIsSubmitting(true);
    const result = login(accountId, inputPin);
    if (result.success) {
      setErrorMessage(null);
      if (onSuccess) {
        onSuccess();
      }
    } else {
      setErrorMessage(result.error || 'Incorrect PIN. Try again.');
      setPin('');
    }
    setIsSubmitting(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Sthira Lotus Brand Header */}
        <View style={styles.brandHeader}>
          <SthiraBrandLogo size="medium" showTagline />
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Select your personal profile to continue
          </Text>
        </View>

        {/* 4 Profiles Selection */}
        <View style={styles.accountsGrid}>
          {accounts.map((acc) => {
            const isSelected = acc.id === selectedAccountId;
            const isMaster = acc.role === 'master';

            return (
              <TouchableOpacity
                key={acc.id}
                activeOpacity={0.8}
                onPress={() => handleSelectAccount(acc)}
                style={[
                  styles.accountCard,
                  {
                    backgroundColor: isSelected
                      ? isDark
                        ? '#1E293B'
                        : '#F1F5F9'
                      : colors.card,
                    borderColor: isSelected ? colors.accent : colors.cardBorder,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}>
                <View style={styles.accountTopRow}>
                  <Text style={styles.accountAvatar}>{acc.avatarEmoji}</Text>
                  {isMaster ? (
                    <View
                      style={[
                        styles.roleBadge,
                        { backgroundColor: isDark ? '#78350F' : '#FEF3C7' },
                      ]}>
                      <Text
                        style={[
                          styles.roleBadgeText,
                          { color: isDark ? '#FBBF24' : '#B45309' },
                        ]}>
                        MASTER
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.roleBadge,
                        { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' },
                      ]}>
                      <Text
                        style={[
                          styles.roleBadgeText,
                          { color: colors.textSecondary },
                        ]}>
                        FRIEND
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={[styles.accountName, { color: colors.text }]}>
                  {acc.displayName}
                </Text>
                <Text
                  numberOfLines={2}
                  style={[styles.accountBio, { color: colors.textMuted }]}>
                  {acc.bio || 'Personal Fitness Coach'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected Account PIN Entry Box */}
        {selectedAccount && (
          <Card style={styles.pinCard}>
            <View style={styles.pinHeader}>
              <Text style={[styles.pinPromptTitle, { color: colors.text }]}>
                Enter PIN for {selectedAccount.displayName}
              </Text>
              <Text style={[styles.pinPromptSubtitle, { color: colors.textSecondary }]}>
                {selectedAccount.role === 'master'
                  ? '🔒 Master Profile Data Protected'
                  : '📂 Isolated Friend Database'}
              </Text>
            </View>

            {/* 4 PIN Dots */}
            <View style={styles.pinDotsRow}>
              {[0, 1, 2, 3].map((idx) => {
                const isFilled = pin.length > idx;
                return (
                  <View
                    key={idx}
                    style={[
                      styles.pinDot,
                      {
                        backgroundColor: isFilled ? colors.accent : 'transparent',
                        borderColor: isFilled ? colors.accent : colors.textMuted,
                      },
                    ]}
                  />
                );
              })}
            </View>

            {/* Error Message */}
            {errorMessage ? (
              <View style={[styles.errorPill, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="alert-circle" size={16} color="#DC2626" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Numeric Keypad */}
            <View style={styles.keypad}>
              <View style={styles.keypadRow}>
                {['1', '2', '3'].map((n) => (
                  <TouchableOpacity
                    key={n}
                    style={[styles.keypadKey, { backgroundColor: colors.background }]}
                    onPress={() => handleKeyPress(n)}
                    activeOpacity={0.6}>
                    <Text style={[styles.keypadKeyText, { color: colors.text }]}>{n}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.keypadRow}>
                {['4', '5', '6'].map((n) => (
                  <TouchableOpacity
                    key={n}
                    style={[styles.keypadKey, { backgroundColor: colors.background }]}
                    onPress={() => handleKeyPress(n)}
                    activeOpacity={0.6}>
                    <Text style={[styles.keypadKeyText, { color: colors.text }]}>{n}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.keypadRow}>
                {['7', '8', '9'].map((n) => (
                  <TouchableOpacity
                    key={n}
                    style={[styles.keypadKey, { backgroundColor: colors.background }]}
                    onPress={() => handleKeyPress(n)}
                    activeOpacity={0.6}>
                    <Text style={[styles.keypadKeyText, { color: colors.text }]}>{n}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.keypadRow}>
                <TouchableOpacity
                  style={[styles.keypadKey, styles.keypadActionKey]}
                  onPress={handleClear}
                  activeOpacity={0.6}>
                  <Text style={[styles.keypadActionText, { color: colors.textMuted }]}>
                    Clear
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.keypadKey, { backgroundColor: colors.background }]}
                  onPress={() => handleKeyPress('0')}
                  activeOpacity={0.6}>
                  <Text style={[styles.keypadKeyText, { color: colors.text }]}>0</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.keypadKey, styles.keypadActionKey]}
                  onPress={handleDelete}
                  activeOpacity={0.6}>
                  <Ionicons name="backspace-outline" size={22} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Demo Helper */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleAutoFillDemoPin}
              style={[
                styles.demoHelperPill,
                {
                  backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                  borderColor: colors.cardBorder,
                },
              ]}>
              <Ionicons name="key-outline" size={14} color={colors.accent} />
              <Text style={[styles.demoHelperText, { color: colors.accent }]}>
                Quick Fill PIN ({selectedAccount.pin})
              </Text>
            </TouchableOpacity>

            <Button
              title={isSubmitting ? 'Verifying...' : `Enter ${selectedAccount.displayName}'s Coach`}
              onPress={() => attemptLogin(selectedAccountId, pin)}
              disabled={pin.length < 4 || isSubmitting}
              style={{ marginTop: Spacing.sm }}
            />
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  accountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  accountCard: {
    width: '48%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    justifyContent: 'space-between',
    minHeight: 110,
  },
  accountTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountAvatar: {
    fontSize: 26,
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: Spacing.xs,
  },
  accountBio: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 14,
  },
  pinCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  },
  pinHeader: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  pinPromptTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  pinPromptSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  pinDotsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginVertical: Spacing.md,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  errorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },
  keypad: {
    width: '100%',
    maxWidth: 280,
    gap: Spacing.xs + 2,
    marginBottom: Spacing.md,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.xs + 2,
  },
  keypadKey: {
    flex: 1,
    height: 52,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  keypadKeyText: {
    fontSize: 20,
    fontWeight: '600',
  },
  keypadActionKey: {
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  keypadActionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  demoHelperPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  demoHelperText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
