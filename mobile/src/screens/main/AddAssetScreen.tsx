import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { apiPost } from '../../services/api';

const ASSET_TYPES = [
  { value: 'bank-account', label: 'Bank Account', icon: '🏦' },
  { value: 'cryptocurrency', label: 'Cryptocurrency', icon: '₿' },
  { value: 'real-estate', label: 'Real Estate', icon: '🏠' },
  { value: 'investment', label: 'Investment', icon: '📈' },
  { value: 'insurance', label: 'Insurance', icon: '🛡️' },
  { value: 'other', label: 'Other', icon: '💼' },
];

const STORAGE_LOCATIONS = [
  { value: 'secure-cloud', label: 'Secure Cloud Storage' },
  { value: 'local-encrypted', label: 'Local Encrypted Storage' },
  { value: 'bank-vault', label: 'Bank Safety Deposit Box' },
  { value: 'lawyer-office', label: 'Lawyer Office' },
];

export default function AddAssetScreen() {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    type: '',
    name: '',
    description: '',
    location: '',
    contactInfo: '',
    accessInstructions: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.type || !formData.name || !formData.location) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await apiPost('/api/assets', formData);
      
      if (response.ok) {
        Alert.alert('Success', 'Asset added successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        const error = await response.json();
        Alert.alert('Error', error.message || 'Failed to add asset');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const AssetTypeSelector = () => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>Asset Type *</Text>
      <View style={styles.typeGrid}>
        {ASSET_TYPES.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.typeCard,
              formData.type === type.value && styles.typeCardSelected
            ]}
            onPress={() => handleInputChange('type', type.value)}
          >
            <Text style={styles.typeIcon}>{type.icon}</Text>
            <Text style={[
              styles.typeLabel,
              formData.type === type.value && styles.typeLabelSelected
            ]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const StorageLocationSelector = () => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>Storage Location *</Text>
      {STORAGE_LOCATIONS.map((location) => (
        <TouchableOpacity
          key={location.value}
          style={[
            styles.radioOption,
            formData.location === location.value && styles.radioOptionSelected
          ]}
          onPress={() => handleInputChange('location', location.value)}
        >
          <View style={[
            styles.radioCircle,
            formData.location === location.value && styles.radioCircleSelected
          ]} />
          <Text style={[
            styles.radioLabel,
            formData.location === location.value && styles.radioLabelSelected
          ]}>
            {location.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Add Asset</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={[styles.saveButton, loading && styles.saveButtonDisabled]}>
              {loading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form}>
          <AssetTypeSelector />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Asset Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="e.g., Main Savings Account, Bitcoin Wallet"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              placeholder="Additional details about this asset"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
            />
          </View>

          <StorageLocationSelector />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Information</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.contactInfo}
              onChangeText={(value) => handleInputChange('contactInfo', value)}
              placeholder="Bank details, wallet provider, broker contact info, etc."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Access Instructions</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.accessInstructions}
              onChangeText={(value) => handleInputChange('accessInstructions', value)}
              placeholder="How to access this asset (passwords, keys, procedures, etc.)"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  cancelButton: {
    fontSize: 16,
    color: '#64748b',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  saveButton: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  saveButtonDisabled: {
    color: '#9ca3af',
  },
  form: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    width: '30%',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  typeCardSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  typeIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  typeLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
  },
  typeLabelSelected: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  radioOptionSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
  },
  radioCircleSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#3b82f6',
  },
  radioLabel: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  radioLabelSelected: {
    color: '#3b82f6',
    fontWeight: '500',
  },
  bottomPadding: {
    height: 40,
  },
});