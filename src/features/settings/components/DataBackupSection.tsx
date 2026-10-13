import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataSyncService, ExportDataPayload } from '@/services/dataSyncService';

export const DataBackupSection: React.FC = () => {
  const { colors } = useAppTheme();

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [exportedJson, setExportedJson] = useState('');
  const [exportPayload, setExportPayload] = useState<ExportDataPayload | null>(null);
  const [importJson, setImportJson] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleOpenExport = () => {
    const payload = DataSyncService.exportData();
    const str = JSON.stringify(payload, null, 2);
    setExportPayload(payload);
    setExportedJson(str);
    setCopySuccess(false);
    setIsExportOpen(true);
  };

  const handleCopyToClipboard = async () => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(exportedJson);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2500);
      } else {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2500);
        Alert.alert('Copied', 'JSON backup is ready to copy from the box below.');
      }
    } catch {
      setCopySuccess(true);
    }
  };

  const handleRunImport = () => {
    if (!importJson.trim()) {
      setImportStatus({ success: false, message: 'Please paste backup JSON first.' });
      return;
    }

    const result = DataSyncService.importData(importJson.trim());
    setImportStatus(result);

    if (result.success) {
      setTimeout(() => {
        setIsImportOpen(false);
        setImportJson('');
        setImportStatus(null);
      }, 1600);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
        DATA BACKUP & MULTI-DEVICE SYNC
      </Text>

      <Card style={styles.card}>
        <View style={styles.headerRow}>
          <Ionicons name="sync-circle-outline" size={24} color={colors.accent} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Local-First Sync & Transfer
          </Text>
        </View>

        <Text style={[styles.description, { color: colors.textMuted }]}>
          Sthira stores all your nutrition, workout logs, and weights locally on this device for absolute privacy. Transfer your data between Expo Go and your web browser seamlessly using JSON backups.
        </Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.accent, borderColor: colors.accent }]}
            onPress={handleOpenExport}
            activeOpacity={0.8}>
            <Ionicons name="cloud-upload-outline" size={17} color="#0B0F17" />
            <Text style={[styles.actionBtnText, { color: '#0B0F17' }]}>Export Backup</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={() => {
              setImportJson('');
              setImportStatus(null);
              setIsImportOpen(true);
            }}
            activeOpacity={0.8}>
            <Ionicons name="cloud-download-outline" size={17} color={colors.text} />
            <Text style={[styles.actionBtnText, { color: colors.text }]}>Import Data</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Export Modal */}
      <Modal
        visible={isExportOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsExportOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Export Data Backup</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                  {exportPayload?.userName || 'Jay'}’s Complete Offline History
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsExportOpen(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {exportPayload && (
              <View style={[styles.statsRow, { backgroundColor: colors.cardElevated }]}>
                <View style={styles.statCol}>
                  <Text style={[styles.statValue, { color: colors.text }]}>{exportPayload.stats.meals}</Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>Meals</Text>
                </View>
                <View style={styles.statCol}>
                  <Text style={[styles.statValue, { color: colors.text }]}>{exportPayload.stats.workouts}</Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>Workouts</Text>
                </View>
                <View style={styles.statCol}>
                  <Text style={[styles.statValue, { color: colors.text }]}>{exportPayload.stats.weightEntries}</Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>Weights</Text>
                </View>
                <View style={styles.statCol}>
                  <Text style={[styles.statValue, { color: colors.text }]}>{exportPayload.stats.dailyLogs}</Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>Days</Text>
                </View>
              </View>
            )}

            <TextInput
              style={[
                styles.jsonInput,
                { color: colors.text, borderColor: colors.cardBorder, backgroundColor: colors.background },
              ]}
              multiline
              value={exportedJson}
              editable={false}
              selectTextOnFocus
            />

            <View style={styles.modalActions}>
              <Button
                title={copySuccess ? 'Copied to Clipboard! ✓' : 'Copy Backup to Clipboard'}
                onPress={handleCopyToClipboard}
                style={{ flex: 1 }}
              />
              <Button
                title="Done"
                variant="outline"
                onPress={() => setIsExportOpen(false)}
                style={{ minWidth: 80 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Import Modal */}
      <Modal
        visible={isImportOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsImportOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Import Data Backup</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                  Sync logs from Expo Go or browser backup
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsImportOpen(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.importHint, { color: colors.textSecondary }]}>
              Paste the JSON text exported from your other device below to restore all meals, workouts, weights, and daily targets:
            </Text>

            <TextInput
              style={[
                styles.jsonInput,
                { color: colors.text, borderColor: colors.cardBorder, backgroundColor: colors.background },
              ]}
              multiline
              placeholder='Paste JSON here (starts with {"version": 1...)'
              placeholderTextColor={colors.textMuted}
              value={importJson}
              onChangeText={setImportJson}
            />

            {importStatus && (
              <View
                style={[
                  styles.statusBox,
                  {
                    backgroundColor: importStatus.success ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    borderColor: importStatus.success ? '#22C55E' : '#EF4444',
                  },
                ]}>
                <Ionicons
                  name={importStatus.success ? 'checkmark-circle' : 'alert-circle'}
                  size={18}
                  color={importStatus.success ? '#22C55E' : '#EF4444'}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: importStatus.success ? '#22C55E' : '#EF4444' },
                  ]}>
                  {importStatus.message}
                </Text>
              </View>
            )}

            <View style={styles.modalActions}>
              <Button
                title="Restore & Sync Data"
                onPress={handleRunImport}
                style={{ flex: 1 }}
              />
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setIsImportOpen(false)}
                style={{ minWidth: 80 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
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
    marginBottom: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 500,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    justifyContent: 'space-around',
  },
  statCol: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  jsonInput: {
    height: 180,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textAlignVertical: 'top',
  },
  importHint: {
    fontSize: 12,
    lineHeight: 16,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
});
