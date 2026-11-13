import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/stores/useAuthStore';

export function AccountManagementSection() {
  const { colors, isDark } = useAppTheme();
  const activeAccount = useAuthStore((s) => s.activeAccount);
  const logout = useAuthStore((s) => s.logout);

  if (!activeAccount) return null;

  const isMaster = activeAccount.role === 'master';

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
                    PERSONAL PROFILE
                  </Text>
                </View>
              )}
            </View>

            <Text style={[styles.accountBio, { color: colors.textSecondary }]}>
              {activeAccount.bio || 'Active Profile'}
            </Text>
          </View>
        </View>

        {/* Local Isolation Pill */}
        <View
          style={[
            styles.dbPartitionPill,
            { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
          ]}>
          <Ionicons
            name="shield-checkmark"
            size={15}
            color={colors.accent}
          />
          <Text style={[styles.dbPartitionText, { color: colors.textSecondary }]}>
            Local Database:{' '}
            <Text style={{ fontWeight: '700', color: colors.text }}>
              Private & Isolated
            </Text>
          </Text>
          <View style={styles.isolatedTag}>
            <Text style={styles.isolatedTagText}>ISOLATED</Text>
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity
          style={[
            styles.logoutButton,
            { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2', borderColor: '#FCA5A5' },
          ]}
          onPress={() => logout()}
          activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={16} color="#DC2626" />
          <Text style={styles.logoutButtonText}>Sign Out / Switch User</Text>
        </TouchableOpacity>

        {/* Data Security Guarantee */}
        <View style={styles.guaranteeBox}>
          <Text style={[styles.guaranteeText, { color: colors.textMuted }]}>
            Data Security Guarantee: Your workout records, nutrition logs, and scale entries
            are strictly segregated in your own isolated local database. Other users cannot view or access your entries.
          </Text>
        </View>
      </Card>
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  logoutButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
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
