import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const ProfileItem = ({ title, subtitle, onPress }: any) => (
    <TouchableOpacity style={styles.profileItem} onPress={onPress}>
      <View style={styles.profileItemContent}>
        <Text style={styles.profileItemTitle}>{title}</Text>
        {subtitle && <Text style={styles.profileItemSubtitle}>{subtitle}</Text>}
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.name}>{user?.fullName || 'User'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {user?.isAdmin && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>Administrator</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <ProfileItem
            title="Personal Information"
            subtitle="Update your profile details"
            onPress={() => {}}
          />
          
          <ProfileItem
            title="Security Settings"
            subtitle="Change password, enable 2FA"
            onPress={() => {}}
          />
          
          <ProfileItem
            title="Well-being Settings"
            subtitle="Configure alerts and notifications"
            onPress={() => navigation.navigate('WellnessSettings' as never)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          
          <ProfileItem
            title="Export Data"
            subtitle="Download your information"
            onPress={() => {}}
          />
          
          <ProfileItem
            title="Privacy Policy"
            subtitle="Read our privacy terms"
            onPress={() => {}}
          />
          
          <ProfileItem
            title="Terms of Service"
            subtitle="View terms and conditions"
            onPress={() => {}}
          />
        </View>

        {user?.isAdmin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Administration</Text>
            
            <ProfileItem
              title="Admin Panel"
              subtitle="Manage users and system"
              onPress={() => navigation.navigate('AdminPanel' as never)}
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <ProfileItem
            title="Help Center"
            subtitle="Get help and support"
            onPress={() => {}}
          />
          
          <ProfileItem
            title="Contact Us"
            subtitle="Reach out to our team"
            onPress={() => {}}
          />
          
          <ProfileItem
            title="App Version"
            subtitle="v1.0.0"
            onPress={() => {}}
          />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
  header: {
    backgroundColor: 'white',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#64748b',
  },
  adminBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
  },
  adminBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  profileItem: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  profileItemContent: {
    flex: 1,
  },
  profileItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  profileItemSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    color: '#cbd5e1',
    fontWeight: '300',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    marginHorizontal: 24,
    marginVertical: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});