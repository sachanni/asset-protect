import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  FlatList,
} from 'react-native';
import { apiGet, apiPost } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

interface MoodEntry {
  _id: string;
  mood: string;
  intensity: number;
  notes?: string;
  createdAt: string;
}

const MOODS = [
  { emoji: '😊', name: 'Happy', color: '#22c55e' },
  { emoji: '😌', name: 'Calm', color: '#06b6d4' },
  { emoji: '😴', name: 'Tired', color: '#6366f1' },
  { emoji: '😔', name: 'Sad', color: '#3b82f6' },
  { emoji: '😰', name: 'Anxious', color: '#f59e0b' },
  { emoji: '😡', name: 'Angry', color: '#ef4444' },
  { emoji: '🤔', name: 'Thoughtful', color: '#8b5cf6' },
  { emoji: '😍', name: 'Excited', color: '#ec4899' },
  { emoji: '😐', name: 'Neutral', color: '#6b7280' },
  { emoji: '🤕', name: 'Unwell', color: '#f97316' },
  { emoji: '😩', name: 'Frustrated', color: '#dc2626' },
  { emoji: '🙃', name: 'Silly', color: '#10b981' },
];

export default function MoodTrackingScreen() {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [intensity, setIntensity] = useState<number>(5);
  const [notes, setNotes] = useState<string>('');
  const [recentEntries, setRecentEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecentEntries();
  }, []);

  const fetchRecentEntries = async () => {
    try {
      const response = await apiGet('/api/mood/entries?limit=5');
      if (response.ok) {
        const data = await response.json();
        setRecentEntries(data);
      }
    } catch (error) {
      console.error('Error fetching mood entries:', error);
    }
  };

  const handleSubmitMood = async () => {
    if (!selectedMood) {
      Alert.alert('Error', 'Please select a mood');
      return;
    }

    setLoading(true);
    try {
      const response = await apiPost('/api/mood/entries', {
        mood: selectedMood,
        intensity,
        notes: notes.trim() || undefined,
      });

      if (response.ok) {
        Alert.alert('Success', 'Mood logged successfully!');
        setSelectedMood('');
        setIntensity(5);
        setNotes('');
        fetchRecentEntries();
      } else {
        Alert.alert('Error', 'Failed to log mood');
      }
    } catch (error) {
      console.error('Error submitting mood:', error);
      Alert.alert('Error', 'Failed to log mood');
    } finally {
      setLoading(false);
    }
  };

  const renderMoodButton = (mood: any) => (
    <TouchableOpacity
      key={mood.name}
      style={[
        styles.moodButton,
        selectedMood === mood.name && { backgroundColor: mood.color + '20', borderColor: mood.color }
      ]}
      onPress={() => setSelectedMood(mood.name)}
    >
      <Text style={styles.moodEmoji}>{mood.emoji}</Text>
      <Text style={[styles.moodName, selectedMood === mood.name && { color: mood.color }]}>
        {mood.name}
      </Text>
    </TouchableOpacity>
  );

  const renderIntensityButton = (value: number) => (
    <TouchableOpacity
      key={value}
      style={[
        styles.intensityButton,
        intensity === value && styles.selectedIntensityButton
      ]}
      onPress={() => setIntensity(value)}
    >
      <Text style={[
        styles.intensityText,
        intensity === value && styles.selectedIntensityText
      ]}>
        {value}
      </Text>
    </TouchableOpacity>
  );

  const renderRecentEntry = ({ item }: { item: MoodEntry }) => {
    const moodData = MOODS.find(m => m.name === item.mood);
    const date = new Date(item.createdAt).toLocaleDateString();
    const time = new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={styles.entryCard}>
        <View style={styles.entryHeader}>
          <View style={styles.entryMood}>
            <Text style={styles.entryEmoji}>{moodData?.emoji || '😐'}</Text>
            <Text style={styles.entryMoodName}>{item.mood}</Text>
          </View>
          <Text style={styles.entryDate}>{date} at {time}</Text>
        </View>
        
        <View style={styles.entryDetails}>
          <Text style={styles.entryIntensity}>Intensity: {item.intensity}/10</Text>
          {item.notes && (
            <Text style={styles.entryNotes}>"{item.notes}"</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Mood Tracking</Text>
        <Text style={styles.subtitle}>How are you feeling today?</Text>
      </View>

      {/* Mood Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Your Mood</Text>
        <View style={styles.moodGrid}>
          {MOODS.map(renderMoodButton)}
        </View>
      </View>

      {/* Intensity Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Intensity Level</Text>
        <Text style={styles.intensityLabel}>How intense is this feeling? (1 = Low, 10 = High)</Text>
        <View style={styles.intensityContainer}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(renderIntensityButton)}
        </View>
      </View>

      {/* Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes (Optional)</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Add any thoughts or context about your mood..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.disabledButton]}
        onPress={handleSubmitMood}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? 'Logging Mood...' : 'Log Mood'}
        </Text>
      </TouchableOpacity>

      {/* Recent Entries */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Entries</Text>
        {recentEntries.length === 0 ? (
          <Text style={styles.emptyText}>No mood entries yet. Log your first mood above!</Text>
        ) : (
          <FlatList
            data={recentEntries}
            renderItem={renderRecentEntry}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
          />
        )}
      </View>
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
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
    marginBottom: 16,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moodButton: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    textAlign: 'center',
  },
  intensityLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  intensityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  intensityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  selectedIntensityButton: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  intensityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  selectedIntensityText: {
    color: '#fff',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    backgroundColor: '#f9fafb',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  entryCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryMood: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  entryMoodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  entryDate: {
    fontSize: 12,
    color: '#64748b',
  },
  entryDetails: {
    marginTop: 8,
  },
  entryIntensity: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  entryNotes: {
    fontSize: 14,
    color: '#475569',
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    padding: 20,
  },
});