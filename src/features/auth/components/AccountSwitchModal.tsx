import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';
import { UserAccount } from '@/types/auth';

interface AccountSwitchModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AccountSwitchModal({ visible, onClose }: AccountSwitchModalProps) {
  const { colors, isDark } = useAppTheme();
  const accounts = useAuthStore((s) => s.accounts);
  const activeAccount = useAuthStore((s) => s.activeAccount);
  const switchAccount = useAuthStore((s) => s.switchAccount);

  const [targetAccount, setTargetAccount] = useState<UserAccount | null>(null);
  const [pin, setPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectAccount = (acc: UserAccount) => {
    if (acc.id === activeAccount?.id) {
      // Already active
      return;
    }
    setTargetAccount(acc);
    setPin('');
    setErrorMessage(null);
  };

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setErrorMessage(null);
      if (nextPin.length === 4 && targetAccount) {
        attemptSwitch(targetAccount.id, nextPin);
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

  const handleAutoFillPin = () => {
    if (!targetAccount) return;
    setPin(targetAccount.pin);
    attemptSwitch(targetAccount.id, targetAccount.pin);
  };

  const attemptSwitch = (accountId: string, inputPin: string) => {
    setIsSubmitting(true);
    const result = switchAccount(accountId, inputPin);
    if (result.success) {
      setErrorMessage(null);
      setTargetAccount(null);
      setPin('');
      setIsSubmitting(false);
      onClose();
    } else {
      setErrorMessage(result.error || 'Incorrect PIN');
      setPin('');
      setIsSubmitting(false);
    }
  };

  const handleBackToPicker = () => {
    setTargetAccount(null);
    setPin('');
    setErrorMessage(null);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors.background, borderColor: colors.cardBorder },
          ]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.titleContainer}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {targetAccount ? `Switch to ${targetAccount.displayName}` : 'Switch User Profile'}
              </Text>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                {targetAccount
                  ? 'Enter 4-digit PIN to authenticate'
                  : 'Isolated local database per account'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={targetAccount ? handleBackToPicker : onClose}
              style={[styles.closeButton, { backgroundColor: colors.card }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons
                name={targetAccount ? 'arrow-back' : 'close'}
                size={20}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>

          {/* Account Picker Mode */}
          {!targetAccount ? (
            <ScrollView
              contentContainerStyle={styles.accountsList}
              showsVerticalScrollIndicator={false}>
              {accounts.map((acc) => {
                const isActive = acc.id === activeAccount?.id;
                const isMaster = acc.role === 'master';

                return (
                  <TouchableOpacity
                    key={acc.id}
                    activeOpacity={0.8}
                    onPress={() => handleSelectAccount(acc)}
                    style={[
                      styles.accountRowCard,
                      {
                        backgroundColor: isActive
                          ? isDark
                            ? '#1E293B'
                            : '#F0FDF4'
                          : colors.card,
                        borderColor: isActive ? '#16A34A' : colors.cardBorder,
                        borderWidth: isActive ? 2 : 1,
                      },
                    ]}>
                    <View style={styles.accountRowLeft}>
                      <Text style={styles.accountEmoji}>{acc.avatarEmoji}</Text>
                      <View style={{ flex: 1 }}>
                        <View style={styles.nameRow}>
                          <Text style={[styles.accountName, { color: colors.text }]}>
                            {acc.displayName}
                          </Text>
                          {isMaster && (
                            <View
                              style={[
                                styles.masterBadge,
                                { backgroundColor: isDark ? '#78350F' : '#FEF3C7' },
                              ]}>
                              <Text
                                style={[
                                  styles.masterBadgeText,
                                  { color: isDark ? '#FBBF24' : '#B45309' },
                                ]}>
                                MASTER
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text
                          style={[styles.accountSubtext, { color: colors.textSecondary }]}
                          numberOfLines={1}>
                          {acc.bio || 'Personal Profile'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.accountRowRight}>
                      {isActive ? (
                        <View style={styles.activePill}>
                          <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
                          <Text style={styles.activePillText}>ACTIVE</Text>
                        </View>
                      ) : (
                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color={colors.textMuted}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            /* PIN Verification Mode */
            <View style={styles.pinSection}>
              <View style={styles.targetProfileCard}>
                <Text style={styles.targetAvatar}>{targetAccount.avatarEmoji}</Text>
                <Text style={[styles.targetName, { color: colors.text }]}>
                  {targetAccount.displayName}
                </Text>
                <Text style={[styles.targetBio, { color: colors.textSecondary }]}>
                  {targetAccount.bio}
                </Text>
              </View>

              {/* PIN Dots */}
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

              {errorMessage && (
                <View style={[styles.errorPill, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="alert-circle" size={14} color="#DC2626" />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}

              {/* Keypad */}
              <View style={styles.keypad}>
                <View style={styles.keypadRow}>
                  {['1', '2', '3'].map((n) => (
                    <TouchableOpacity
                      key={n}
                      style={[styles.keypadKey, { backgroundColor: colors.card }]}
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
                      style={[styles.keypadKey, { backgroundColor: colors.card }]}
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
                      style={[styles.keypadKey, { backgroundColor: colors.card }]}
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
                    style={[styles.keypadKey, { backgroundColor: colors.card }]}
                    onPress={() => handleKeyPress('0')}
                    activeOpacity={0.6}>
                    <Text style={[styles.keypadKeyText, { color: colors.text }]}>0</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.keypadKey, styles.keypadActionKey]}
                    onPress={handleDelete}
                    activeOpacity={0.6}>
                    <Ionicons name="backspace-outline" size={20} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Quick Fill Demo PIN */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleAutoFillPin}
                style={[
                  styles.demoHelperPill,
                  {
                    backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                    borderColor: colors.cardBorder,
                  },
                ]}>
                <Ionicons name="key-outline" size={13} color={colors.accent} />
                <Text style={[styles.demoHelperText, { color: colors.accent }]}>
                  Auto-fill PIN ({targetAccount.pin})
                </Text>
              </TouchableOpacity>

              <Button
                title={isSubmitting ? 'Switching...' : `Unlock ${targetAccount.displayName}`}
                onPress={() => attemptSwitch(targetAccount.id, pin)}
                disabled={pin.length < 4 || isSubmitting}
                style={{ width: '100%', marginTop: Spacing.xs }}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    maxHeight: '90%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountsList: {
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  accountRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  accountRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  accountEmoji: {
    fontSize: 26,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  accountName: {
    fontSize: 15,
    fontWeight: '700',
  },
  masterBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.sm,
  },
  masterBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  accountSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  accountRowRight: {
    marginLeft: Spacing.sm,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  pinSection: {
    alignItems: 'center',
  },
  targetProfileCard: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  targetAvatar: {
    fontSize: 32,
  },
  targetName: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 4,
  },
  targetBio: {
    fontSize: 12,
    marginTop: 2,
  },
  pinDotsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginVertical: Spacing.sm,
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  errorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },
  keypad: {
    width: '100%',
    maxWidth: 260,
    gap: 6,
    marginBottom: Spacing.sm,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  keypadKey: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  keypadKeyText: {
    fontSize: 19,
    fontWeight: '600',
  },
  keypadActionKey: {
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  keypadActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  demoHelperPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginBottom: Spacing.xs,
  },
  demoHelperText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
