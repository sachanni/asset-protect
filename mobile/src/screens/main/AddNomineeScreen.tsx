import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { apiPost, apiPut } from '../../services/api';

interface Nominee {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  verified?: boolean;
}

const RELATIONSHIPS = [
  'Spouse',
  'Child',
  'Parent',
  'Sibling',
  'Grandparent',
  'Grandchild',
  'Friend',
  'Legal Guardian',
  'Business Partner',
  'Other Family Member',
  'Other',
];

export default function AddNomineeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const existingNominee = (route.params as any)?.nominee as Nominee;
  const isEditing = !!existingNominee;

  const [formData, setFormData] = useState<Nominee>({
    name: existingNominee?.name || '',
    email: existingNominee?.email || '',
    phone: existingNominee?.phone || '',
    relationship: existingNominee?.relationship || '',
  });
  const [loading, setLoading] = useState(false);
  const [selectedRelationship, setSelectedRelationship] = useState(
    existingNominee?.relationship || ''
  );

  const updateFormData = (field: keyof Nominee, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter nominee name');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter email address');
      return false;
    }
    if (!formData.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Please enter phone number');
      return false;
    }
    if (!selectedRelationship) {
      Alert.alert('Error', 'Please select relationship');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        relationship: selectedRelationship,
      };

      let response;
      if (isEditing && existingNominee?._id) {
        response = await apiPut(`/api/nominees/${existingNominee._id}`, payload);
      } else {
        response = await apiPost('/api/nominees', payload);
      }

      if (response.ok) {
        Alert.alert(
          'Success',
          `Nominee ${isEditing ? 'updated' : 'added'} successfully!`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || `Failed to ${isEditing ? 'update' : 'add'} nominee`);
      }
    } catch (error) {
      console.error('Error submitting nominee:', error);
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'add'} nominee`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>
            {isEditing ? 'Edit Nominee' : 'Add New Nominee'}
          </Text>
          <Text style={styles.subtitle}>
            {isEditing 
              ? 'Update nominee information below'
              : 'Add a trusted person who will be notified about your digital assets'
            }
          </Text>

          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter nominee's full name"
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              autoCapitalize="words"
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="nominee@example.com"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Phone Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChangeText={(value) => updateFormData('phone', value)}
              keyboardType="phone-pad"
            />
          </View>

          {/* Relationship Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Relationship *</Text>
            <Text style={styles.helperText}>Select how this person is related to you</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.relationshipScrollView}>
              <View style={styles.relationshipContainer}>
                {RELATIONSHIPS.map((relationship) => (
                  <TouchableOpacity
                    key={relationship}
                    style={[
                      styles.relationshipButton,
                      selectedRelationship === relationship && styles.selectedRelationshipButton
                    ]}
                    onPress={() => setSelectedRelationship(relationship)}
                  >
                    <Text style={[
                      styles.relationshipText,
                      selectedRelationship === relationship && styles.selectedRelationshipText
                    ]}>
                      {relationship}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Information Note */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>📋 Important Information</Text>
            <Text style={styles.infoText}>
              • Your nominee will be contacted only after proper verification procedures
            </Text>
            <Text style={styles.infoText}>
              • They will receive information about assets you've designated for them
            </Text>
            <Text style={styles.infoText}>
              • All communications are secure and confidential
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading 
                ? (isEditing ? 'Updating...' : 'Adding...') 
                : (isEditing ? 'Update Nominee' : 'Add Nominee')
              }
            </Text>
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
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
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#1f2937',
  },
  relationshipScrollView: {
    marginTop: 8,
  },
  relationshipContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    gap: 12,
  },
  relationshipButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minWidth: 80,
    alignItems: 'center',
  },
  selectedRelationshipButton: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  relationshipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  selectedRelationshipText: {
    color: '#fff',
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    padding: 16,
    marginVertical: 24,
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
  submitButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
});