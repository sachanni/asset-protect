import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { apiGet } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

interface AdminStats {
  totalUsers: number;
  totalAssets: number;
  totalNominees: number;
  usersAtRisk: number;
  recentActivities: ActivityLog[];
}

interface ActivityLog {
  _id: string;
  category: string;
  action: string;
  details: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: string;
  userId?: string;
  adminId?: string;
}

export default function AdminPanelScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isAdmin = user?.email === 'admin@aulnovatechsoft.com';

  useEffect(() => {
    if (isAdmin) {
      fetchAdminStats();
    }
  }, [isAdmin]);

  const fetchAdminStats = async () => {
    if (!isAdmin) return;

    try {
      const response = await apiGet('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        Alert.alert('Error', 'Failed to load admin data');
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      Alert.alert('Error', 'Failed to load admin data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAdminStats();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#dc2626';
      case 'error': return '#ea580c';
      case 'warning': return '#d97706';
      case 'info': return '#2563eb';
      default: return '#6b7280';
    }
  };

  const getSeverityBackgroundColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#fef2f2';
      case 'error': return '#fff7ed';
      case 'warning': return '#fffbeb';
      case 'info': return '#eff6ff';
      default: return '#f9fafb';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isAdmin) {
    return (
      <View style={styles.accessDenied}>
        <Text style={styles.accessDeniedTitle}>Access Denied</Text>
        <Text style={styles.accessDeniedText}>
          This area is restricted to administrators only.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Loading admin data...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Admin Panel</Text>
        <Text style={styles.subtitle}>System Overview & Management</Text>
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.primaryCard]}>
            <Text style={styles.statNumber}>{stats?.totalUsers || 0}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          
          <View style={[styles.statCard, styles.successCard]}>
            <Text style={styles.statNumber}>{stats?.totalAssets || 0}</Text>
            <Text style={styles.statLabel}>Total Assets</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.infoCard]}>
            <Text style={styles.statNumber}>{stats?.totalNominees || 0}</Text>
            <Text style={styles.statLabel}>Total Nominees</Text>
          </View>
          
          <View style={[styles.statCard, styles.warningCard]}>
            <Text style={styles.statNumber}>{stats?.usersAtRisk || 0}</Text>
            <Text style={styles.statLabel}>Users at Risk</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>👥 Manage Users</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>⚠️ Risk Assessment</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>📊 View Reports</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>⚙️ System Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activities */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activities</Text>
        {stats?.recentActivities && stats.recentActivities.length > 0 ? (
          stats.recentActivities.map((activity) => (
            <View key={activity._id} style={[
              styles.activityCard,
              { backgroundColor: getSeverityBackgroundColor(activity.severity) }
            ]}>
              <View style={styles.activityHeader}>
                <View style={styles.activityInfo}>
                  <Text style={[styles.activityCategory, { color: getSeverityColor(activity.severity) }]}>
                    {activity.category.toUpperCase()}
                  </Text>
                  <Text style={styles.activityAction}>{activity.action}</Text>
                </View>
                <Text style={styles.activityTime}>
                  {formatDate(activity.timestamp)}
                </Text>
              </View>
              <Text style={styles.activityDetails}>{activity.details}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No recent activities</Text>
        )}
      </View>

      {/* System Health */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Health</Text>
        <View style={styles.healthCard}>
          <View style={styles.healthItem}>
            <Text style={styles.healthLabel}>Database</Text>
            <View style={[styles.healthStatus, styles.healthGood]}>
              <Text style={styles.healthStatusText}>✅ Online</Text>
            </View>
          </View>
          
          <View style={styles.healthItem}>
            <Text style={styles.healthLabel}>API Services</Text>
            <View style={[styles.healthStatus, styles.healthGood]}>
              <Text style={styles.healthStatusText}>✅ Operational</Text>
            </View>
          </View>
          
          <View style={styles.healthItem}>
            <Text style={styles.healthLabel}>Notifications</Text>
            <View style={[styles.healthStatus, styles.healthGood]}>
              <Text style={styles.healthStatusText}>✅ Active</Text>
            </View>
          </View>
        </View>
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
    backgroundColor: '#1e293b',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#cbd5e1',
  },
  statsContainer: {
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryCard: {
    backgroundColor: '#dbeafe',
  },
  successCard: {
    backgroundColor: '#dcfce7',
  },
  infoCard: {
    backgroundColor: '#e0f2fe',
  },
  warningCard: {
    backgroundColor: '#fef3c7',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  activityCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  activityInfo: {
    flex: 1,
  },
  activityCategory: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  activityAction: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  activityTime: {
    fontSize: 12,
    color: '#64748b',
  },
  activityDetails: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  healthCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
  },
  healthItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  healthLabel: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  healthStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  healthGood: {
    backgroundColor: '#dcfce7',
  },
  healthStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8fafc',
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 12,
  },
  accessDeniedText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
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