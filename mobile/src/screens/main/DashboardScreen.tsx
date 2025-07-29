import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { apiGet } from '../../services/api';

interface DashboardStats {
  totalAssets: number;
  totalNominees: number;
  lastMoodEntry: any;
  wellBeingStatus: string;
}

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalAssets: 0,
    totalNominees: 0,
    lastMoodEntry: null,
    wellBeingStatus: 'Active',
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      // Load assets
      const assetsResponse = await apiGet('/api/assets');
      const assets = assetsResponse.ok ? await assetsResponse.json() : [];

      // Load nominees
      const nomineesResponse = await apiGet('/api/nominees');
      const nominees = nomineesResponse.ok ? await nomineesResponse.json() : [];

      // Load latest mood
      const moodResponse = await apiGet('/api/mood/latest');
      const latestMood = moodResponse.ok ? await moodResponse.json() : null;

      setStats({
        totalAssets: assets.length,
        totalNominees: nominees.length,
        lastMoodEntry: latestMood,
        wellBeingStatus: 'Active',
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const QuickActionCard = ({ title, subtitle, onPress, color = '#3b82f6' }: any) => (
    <TouchableOpacity style={[styles.actionCard, { borderLeftColor: color }]} onPress={onPress}>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );

  const StatCard = ({ title, value, subtitle }: any) => (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.fullName || user?.email}</Text>
          {user?.isAdmin && (
            <TouchableOpacity
              style={styles.adminBadge}
              onPress={() => navigation.navigate('AdminPanel' as never)}
            >
              <Text style={styles.adminBadgeText}>Admin Panel</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.statsContainer}>
          <StatCard title="Assets" value={stats.totalAssets} subtitle="Secured" />
          <StatCard title="Nominees" value={stats.totalNominees} subtitle="Trusted" />
          <StatCard 
            title="Status" 
            value={stats.wellBeingStatus} 
            subtitle="Well-being" 
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <QuickActionCard
            title="Add Asset"
            subtitle="Secure a new digital asset"
            onPress={() => navigation.navigate('Assets' as never, { screen: 'AddAsset' })}
            color="#10b981"
          />

          <QuickActionCard
            title="Add Nominee"
            subtitle="Designate a trusted person"
            onPress={() => navigation.navigate('Nominees' as never, { screen: 'AddNominee' })}
            color="#f59e0b"
          />

          <QuickActionCard
            title="Track Mood"
            subtitle="Log your current emotional state"
            onPress={() => navigation.navigate('Mood' as never)}
            color="#8b5cf6"
          />

          <QuickActionCard
            title="Wellness Settings"
            subtitle="Configure well-being alerts"
            onPress={() => navigation.navigate('WellnessSettings' as never)}
            color="#ef4444"
          />
        </View>

        {stats.lastMoodEntry && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Mood</Text>
            <View style={styles.moodCard}>
              <Text style={styles.moodEmoji}>
                {getMoodEmoji(stats.lastMoodEntry.mood)}
              </Text>
              <View style={styles.moodInfo}>
                <Text style={styles.moodText}>{stats.lastMoodEntry.mood}</Text>
                <Text style={styles.moodDate}>
                  {new Date(stats.lastMoodEntry.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getMoodEmoji(mood: string): string {
  const moodEmojis: { [key: string]: string } = {
    'very-happy': '😁',
    'happy': '😊',
    'content': '😌',
    'neutral': '😐',
    'sad': '😔',
    'anxious': '😰',
    'angry': '😠',
    'excited': '🤩',
    'grateful': '🙏',
    'energetic': '⚡',
    'calm': '😌',
    'frustrated': '😤',
  };
  return moodEmojis[mood] || '😊';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    backgroundColor: 'white',
  },
  greeting: {
    fontSize: 16,
    color: '#64748b',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 4,
  },
  adminBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  adminBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statTitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  moodCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  moodInfo: {
    flex: 1,
  },
  moodText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    textTransform: 'capitalize',
  },
  moodDate: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
});