import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';
import { AccountSwitchModal } from '@/features/auth/components/AccountSwitchModal';

export function AccountManagementSection() {
  const { colors, isDark } = useAppTheme();
  const activeAccount = useAuthStore((s) => s.activeAccount);
  const logout = useAuthStore((s) => s.logout);
  const updatePin = useAuthStore((s) => s.updatePin);

  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinMessage, setPinMessage] = useState<string | null>(null);

  if (!activeAccount) return null;

  const isMaster = activeAccount.role === 'master';

  const handleSavePin = () => {
    if (!/^\d{4}$/.test(newPin)) {
      setPinMessage('PIN must be exactly 4 digits');
      return;
    }
    if (newPin !== confirmPin) {
      setPinMessage('PINs do not match');
      return;
    }

    const success = updatePin(activeAccount.id, newPin);
    if (success) {
      setPinMessage('PIN successfully updated! ✓');
      setTimeout(() => {
        setIsChangingPin(false);
        setNewPin('');
        setConfirmPin('');
        setPinMessage(null);
      }, 1200);
    } else {
      setPinMessage('Failed to update PIN');
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
        ACCOUNT & DATA ISOLATION
      </Text>

      <Card style={styles.card}>
        {/* Active Account Identity */}
        <View style={styles.accountHeader}>
          <Text style={styles.avatarEmoji}>{activeAccount.avatarEmoji}</Text>
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={[styles.displayName, { color: colors.text }]}>
                {activeAccount.displayName}
              </Text>
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
                    👑 MASTER
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

            <Text style={[styles.accountBio, { color: colors.textSecondary }]}>
              {activeAccount.bio || 'Personal Profile'}
            </Text>
          </View>
        </View>

        {/* Database Partition Badge */}
        <View
          style={[
            styles.dbPartitionPill,
            { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
          ]}>
          <Ionicons
            name={isMaster ? 'shield-checkmark' : 'folder-outline'}
            size={15}
            color={isMaster ? '#16A34A' : colors.accent}
          />
          <Text style={[styles.dbPartitionText, { color: colors.textSecondary }]}>
            Partition:{' '}
            <Text style={{ fontWeight: '700', color: colors.text }}>
              {activeAccount.dbName}
            </Text>
          </Text>
          <View style={styles.isolatedTag}>
            <Text style={styles.isolatedTagText}>ISOLATED</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.background, borderColor: colors.cardBorder },
            ]}
            onPress={() => setIsSwitchModalOpen(true)}
            activeOpacity={0.7}>
            <Ionicons name="swap-horizontal" size={16} color={colors.accent} />
            <Text style={[styles.actionButtonText, { color: colors.accent }]}>
              Switch Profile
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.background, borderColor: colors.cardBorder },
            ]}
            onPress={() => setIsChangingPin(!isChangingPin)}
            activeOpacity={0.7}>
            <Ionicons name="key-outline" size={16} color={colors.text} />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>
              {isChangingPin ? 'Cancel' : 'Change PIN'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.background, borderColor: colors.cardBorder },
            ]}
            onPress={handleLogout}
            activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={16} color="#DC2626" />
            <Text style={[styles.actionButtonText, { color: '#DC2626' }]}>
              Lock
            </Text>
          </TouchableOpacity>
        </View>

        {/* Change PIN Accordion */}
        {isChangingPin && (
          <View
            style={[
              styles.pinFormContainer,
              { borderColor: colors.cardBorder, backgroundColor: colors.background },
            ]}>
            <Text style={[styles.pinFormTitle, { color: colors.text }]}>
              Update 4-Digit PIN for {activeAccount.displayName}
            </Text>

            <View style={styles.pinInputRow}>
              <Text style={[styles.pinInputLabel, { color: colors.textSecondary }]}>
                New 4-Digit PIN:
              </Text>
              <TextInput
                style={[styles.pinInput, { color: colors.text, borderColor: colors.cardBorder }]}
                value={newPin}
                onChangeText={setNewPin}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
                placeholder="••••"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.pinInputRow}>
              <Text style={[styles.pinInputLabel, { color: colors.textSecondary }]}>
                Confirm PIN:
              </Text>
              <TextInput
                style={[styles.pinInput, { color: colors.text, borderColor: colors.cardBorder }]}
                value={confirmPin}
                onChangeText={setConfirmPin}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
                placeholder="••••"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            {pinMessage && (
              <Text
                style={[
                  styles.pinMessageText,
                  { color: pinMessage.includes('✓') ? '#16A34A' : '#DC2626' },
                ]}>
                {pinMessage}
              </Text>
            )}

            <Button
              title="Save New PIN"
              onPress={handleSavePin}
              disabled={newPin.length !== 4 || confirmPin.length !== 4}
              style={{ marginTop: Spacing.sm }}
            />
          </View>
        )}

        {/* Guarantee Info */}
        <View style={styles.guaranteeBox}>
          <Text style={[styles.guaranteeText, { color: colors.textMuted }]}>
            Master Data Isolation: Jay's workouts, nutrition history, and scale entries
            are strictly segregated in the master database ({activeAccount.role === 'master' ? 'currently active' : 'protected in background'}).
          </Text>
        </View>
      </Card>

      <AccountSwitchModal
        visible={isSwitchModalOpen}
        onClose={() => setIsSwitchModalOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.sm,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  card: {
    padding: Spacing.md,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  avatarEmoji: {
    fontSize: 32,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '700',
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
  accountBio: {
    fontSize: 12,
    marginTop: 2,
  },
  dbPartitionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  dbPartitionText: {
    fontSize: 12,
    flex: 1,
  },
  isolatedTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  isolatedTagText: {
    color: '#16A34A',
    fontSize: 9,
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pinFormContainer: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  pinFormTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  pinInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  pinInputLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  pinInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    minWidth: 80,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 4,
  },
  pinMessageText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 4,
  },
  guaranteeBox: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
  },
  guaranteeText: {
    fontSize: 11,
    lineHeight: 15,
  },
});
