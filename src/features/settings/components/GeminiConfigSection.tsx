import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  getGeminiApiKey,
  saveGeminiApiKey,
  isGeminiConfigured,
  testGeminiConnection,
} from '@/services/geminiMealParser';

export const GeminiConfigSection: React.FC = () => {
  const { colors, isDark } = useAppTheme();
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const existing = getGeminiApiKey();
    if (existing) {
      setApiKey(existing);
    }
  }, []);

  const handleSave = () => {
    saveGeminiApiKey(apiKey);
    setSavedSuccess(true);
    setTestResult(null);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, message: 'Please enter a Gemini API key first.' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      // Save key first
      saveGeminiApiKey(apiKey);
      const res = await testGeminiConnection(apiKey.trim());
      setTestResult(res);
    } finally {
      setIsTesting(false);
    }
  };

  const isConfigured = Boolean(apiKey.trim().length > 15);

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
        AI MEAL PARSING (GOOGLE GEMINI)
      </Text>

      <Card style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Ionicons name="sparkles" size={18} color="#8B5CF6" />
            <Text style={[styles.title, { color: colors.text }]}>Gemini AI Nutrition Engine</Text>
          </View>
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: isConfigured
                  ? 'rgba(16, 185, 129, 0.12)'
                  : 'rgba(245, 158, 11, 0.12)',
                borderColor: isConfigured ? '#10B981' : '#F59E0B',
              },
            ]}>
            <View
              style={[
                styles.dot,
                { backgroundColor: isConfigured ? '#10B981' : '#F59E0B' },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: isConfigured ? '#10B981' : '#F59E0B' },
              ]}>
              {isConfigured ? 'Active' : 'Offline Rule Engine'}
            </Text>
          </View>
        </View>

        <Text style={[styles.description, { color: colors.textMuted }]}>
          Powers natural language food logging with gram weight conversions, exact macro lookups, and Atwater energy consistency. When unconfigured, Sthira uses its local vegetarian rule database.
        </Text>

        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Google Gemini API Key</Text>
          <View
            style={[
              styles.inputWrap,
              {
                backgroundColor: colors.cardElevated,
                borderColor: colors.cardBorder,
              },
            ]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={apiKey}
              onChangeText={(txt) => {
                setApiKey(txt);
                setTestResult(null);
              }}
              placeholder="Paste AIzaSy... API key"
              placeholderTextColor={colors.textMuted}
              secureTextEntry={!showKey}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={() => setShowKey(!showKey)}
              style={styles.eyeBtn}>
              <Ionicons
                name={showKey ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>

        {testResult && (
          <View
            style={[
              styles.resultBanner,
              {
                backgroundColor: testResult.success
                  ? 'rgba(16, 185, 129, 0.1)'
                  : 'rgba(239, 68, 68, 0.1)',
                borderColor: testResult.success ? '#10B981' : '#EF4444',
              },
            ]}>
            <Ionicons
              name={testResult.success ? 'checkmark-circle' : 'alert-circle'}
              size={16}
              color={testResult.success ? '#10B981' : '#EF4444'}
            />
            <Text
              style={[
                styles.resultText,
                { color: testResult.success ? '#10B981' : '#EF4444' },
              ]}>
              {testResult.message}
            </Text>
          </View>
        )}

        <View style={styles.actionsRow}>
          <Button
            title={savedSuccess ? 'Saved ✓' : 'Save Key'}
            onPress={handleSave}
            variant="secondary"
            style={styles.actionBtn}
            disabled={isTesting}
          />
          <Button
            title={isTesting ? 'Testing...' : 'Test Connection'}
            onPress={handleTestConnection}
            style={styles.actionBtn}
            disabled={isTesting || !apiKey.trim()}
            loading={isTesting}
          />
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.md,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  card: {
    padding: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: Spacing.md,
    marginTop: 2,
  },
  inputContainer: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.sm,
    fontSize: 13,
  },
  eyeBtn: {
    padding: 6,
  },
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.md,
    gap: 8,
  },
  resultText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionBtn: {
    flex: 1,
  },
});
