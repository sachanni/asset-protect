import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { apiGet, apiPost, apiPut } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

interface WellnessSettings {
  _id?: string;
  alertFrequency: 'daily' | 'weekly';
  alertLimit: number;
  enabled: boolean;
  currentCount: number;
  lastAlert?: string;
}

const ALERT_FREQUENCIES = [
  { value: 'daily' as const, label: 'Daily', description: 'Check-in required every day' },
  { value: 'weekly' as const, label: 'Weekly', description: 'Check-in required every week' },
];

const ALERT_LIMITS = [3, 5, 7, 10, 14];

export default function WellnessSettingsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [settings, setSettings] = useState<WellnessSettings>({
    alertFrequency: 'weekly',
    alertLimit: 7,
    enabled: false,
    currentCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchWellnessSettings();
  }, []);

  const fetchWellnessSettings = async () => {
    try {
      const response = await apiGet('/api/wellness/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else if (response.status === 404) {
        // No settings exist yet, use defaults
        setSettings({
          alertFrequency: 'weekly',
          alertLimit: 7,
          enabled: false,
          currentCount: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching wellness settings:', error);
      Alert.alert('Error', 'Failed to load wellness settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      let response;
      if (settings._id) {
        response = await apiPut(`/api/wellness/settings/${settings._id}`, settings);
      } else {
        response = await apiPost('/api/wellness/settings', settings);
      }

      if (response.ok) {
        const updatedSettings = await response.json();
        setSettings(updatedSettings);
        Alert.alert('Success', 'Wellness settings saved successfully!');
      } else {
        Alert.alert('Error', 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving wellness settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof WellnessSettings>(
    key: K,
    value: WellnessSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleTestAlert = () => {
    Alert.alert(
      'Test Wellness Alert',
      'This is how your wellness check-in alert will look. You would respond to confirm you are okay.',
      [
        { text: 'Not Okay', style: 'destructive' },
        { text: 'I\'m Okay', style: 'default' },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Loading wellness settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Wellness Settings</Text>
        <Text style={styles.subtitle}>
          Configure how often you want to receive well-being check-ins
        </Text>
      </View>

      {/* Enable/Disable Toggle */}
      <View style={styles.section}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Enable Wellness Alerts</Text>
            <Text style={styles.settingDescription}>
              Receive regular check-ins to confirm your well-being
            </Text>
          </View>
          <Switch
            value={settings.enabled}
            onValueChange={(value) => updateSetting('enabled', value)}
            trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
            thumbColor={settings.enabled ? '#ffffff' : '#f4f3f4'}
          />
        </View>
      </View>

      {settings.enabled && (
        <>
          {/* Alert Frequency */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Check-in Frequency</Text>
            {ALERT_FREQUENCIES.map((frequency) => (
              <TouchableOpacity
                key={frequency.value}
                style={[
                  styles.optionButton,
                  settings.alertFrequency === frequency.value && styles.selectedOption
                ]}
                onPress={() => updateSetting('alertFrequency', frequency.value)}
              >
                <View style={styles.optionContent}>
                  <Text style={[
                    styles.optionTitle,
                    settings.alertFrequency === frequency.value && styles.selectedOptionText
                  ]}>
                    {frequency.label}
                  </Text>
                  <Text style={[
                    styles.optionDescription,
                    settings.alertFrequency === frequency.value && styles.selectedOptionDescription
                  ]}>
                    {frequency.description}
                  </Text>
                </View>
                <View style={[
                  styles.radioButton,
                  settings.alertFrequency === frequency.value && styles.radioButtonSelected
                ]}>
                  {settings.alertFrequency === frequency.value && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Alert Limit */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Alert Limit</Text>
            <Text style={styles.sectionDescription}>
              How many missed check-ins before escalating to admin review?
            </Text>
            <View style={styles.limitContainer}>
              {ALERT_LIMITS.map((limit) => (
                <TouchableOpacity
                  key={limit}
                  style={[
                    styles.limitButton,
                    settings.alertLimit === limit && styles.selectedLimitButton
                  ]}
                  onPress={() => updateSetting('alertLimit', limit)}
                >
                  <Text style={[
                    styles.limitText,
                    settings.alertLimit === limit && styles.selectedLimitText
                  ]}>
                    {limit}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Current Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Status</Text>
            <View style={styles.statusContainer}>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Missed Check-ins</Text>
                <Text style={[
                  styles.statusValue,
                  settings.currentCount >= settings.alertLimit && styles.statusDanger
                ]}>
                  {settings.currentCount} / {settings.alertLimit}
                </Text>
              </View>
              
              {settings.lastAlert && (
                <View style={styles.statusItem}>
                  <Text style={styles.statusLabel}>Last Alert</Text>
                  <Text style={styles.statusValue}>
                    {new Date(settings.lastAlert).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Test Alert */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.testButton} onPress={handleTestAlert}>
              <Text style={styles.testButtonText}>🔔 Test Alert</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Information */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>ℹ️ How Wellness Alerts Work</Text>
        <Text style={styles.infoText}>
          • You'll receive regular check-ins asking if you're okay
        </Text>
        <Text style={styles.infoText}>
          • If you don't respond within the time limit, a counter increases
        </Text>
        <Text style={styles.infoText}>
          • After reaching your alert limit, admin review is triggered
        </Text>
        <Text style={styles.infoText}>
          • This helps ensure your digital assets are properly managed
        </Text>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, saving && styles.disabledButton]}
        onPress={saveSettings}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    backgroundColor: '#f8fafc',
  },
  selectedOption: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  selectedOptionText: {
    color: '#1e40af',
  },
  optionDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  selectedOptionDescription: {
    color: '#3730a3',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#3b82f6',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3b82f6',
  },
  limitContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  limitButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f1f5f9',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedLimitButton: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  limitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  selectedLimitText: {
    color: '#fff',
  },
  statusContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  statusDanger: {
    color: '#dc2626',
  },
  testButton: {
    backgroundColor: '#f59e0b',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: '#eff6ff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
    marginBottom: 4,
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
});