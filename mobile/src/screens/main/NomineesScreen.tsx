import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { apiGet, apiDelete } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

interface Nominee {
  _id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  verified: boolean;
  createdAt: string;
}

export default function NomineesScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNominees = async () => {
    try {
      if (!user) return;
      
      const response = await apiGet('/api/nominees');
      if (response.ok) {
        const data = await response.json();
        setNominees(data);
      }
    } catch (error) {
      console.error('Error fetching nominees:', error);
      Alert.alert('Error', 'Failed to load nominees');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNominees();
  }, [user]);

  const handleDeleteNominee = async (nomineeId: string, nomineeName: string) => {
    Alert.alert(
      'Delete Nominee',
      `Are you sure you want to delete ${nomineeName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiDelete(`/api/nominees/${nomineeId}`);
              if (response.ok) {
                setNominees(nominees.filter(n => n._id !== nomineeId));
                Alert.alert('Success', 'Nominee deleted successfully');
              } else {
                Alert.alert('Error', 'Failed to delete nominee');
              }
            } catch (error) {
              console.error('Error deleting nominee:', error);
              Alert.alert('Error', 'Failed to delete nominee');
            }
          }
        }
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNominees();
  };

  const renderNominee = ({ item }: { item: Nominee }) => (
    <View style={styles.nomineeCard}>
      <View style={styles.nomineeHeader}>
        <Text style={styles.nomineeName}>{item.name}</Text>
        <View style={[styles.statusBadge, item.verified ? styles.verifiedBadge : styles.unverifiedBadge]}>
          <Text style={[styles.statusText, item.verified ? styles.verifiedText : styles.unverifiedText]}>
            {item.verified ? 'Verified' : 'Pending'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.nomineeDetail}>📧 {item.email}</Text>
      <Text style={styles.nomineeDetail}>📱 {item.phone}</Text>
      <Text style={styles.nomineeDetail}>👥 {item.relationship}</Text>
      
      <View style={styles.nomineeActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('AddNominee' as never, { nominee: item } as never)}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteNominee(item._id, item.name)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Loading nominees...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Nominees</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddNominee' as never)}
        >
          <Text style={styles.addButtonText}>+ Add Nominee</Text>
        </TouchableOpacity>
      </View>

      {nominees.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No Nominees Yet</Text>
          <Text style={styles.emptySubtitle}>
            Add trusted family members or friends who will be notified about your digital assets.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('AddNominee' as never)}
          >
            <Text style={styles.primaryButtonText}>Add Your First Nominee</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={nominees}
          renderItem={renderNominee}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  listContainer: {
    padding: 20,
  },
  nomineeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nomineeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  nomineeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedBadge: {
    backgroundColor: '#dcfce7',
  },
  unverifiedBadge: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  verifiedText: {
    color: '#166534',
  },
  unverifiedText: {
    color: '#92400e',
  },
  nomineeDetail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 6,
  },
  nomineeActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  editButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
  },
  editButtonText: {
    color: '#475569',
    fontWeight: '600',
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
  },
  deleteButtonText: {
    color: '#dc2626',
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
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