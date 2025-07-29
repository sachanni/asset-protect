import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { apiGet } from '../../services/api';

interface Asset {
  _id: string;
  type: string;
  name: string;
  description: string;
  location: string;
  contactInfo: string;
  createdAt: string;
}

export default function AssetsScreen() {
  const navigation = useNavigation();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAssets = async () => {
    try {
      const response = await apiGet('/api/assets');
      if (response.ok) {
        const data = await response.json();
        setAssets(data);
      } else {
        Alert.alert('Error', 'Failed to load assets');
      }
    } catch (error) {
      console.error('Error loading assets:', error);
      Alert.alert('Error', 'Network error while loading assets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadAssets();
  };

  const getAssetIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'bank-account':
        return '🏦';
      case 'cryptocurrency':
        return '₿';
      case 'real-estate':
        return '🏠';
      case 'investment':
        return '📈';
      case 'insurance':
        return '🛡️';
      default:
        return '💼';
    }
  };

  const AssetCard = ({ asset }: { asset: Asset }) => (
    <TouchableOpacity style={styles.assetCard}>
      <View style={styles.assetHeader}>
        <Text style={styles.assetIcon}>{getAssetIcon(asset.type)}</Text>
        <View style={styles.assetInfo}>
          <Text style={styles.assetName}>{asset.name}</Text>
          <Text style={styles.assetType}>{asset.type.replace('-', ' ')}</Text>
        </View>
      </View>
      {asset.description && (
        <Text style={styles.assetDescription}>{asset.description}</Text>
      )}
      <View style={styles.assetMeta}>
        <Text style={styles.assetLocation}>📍 {asset.location}</Text>
        <Text style={styles.assetDate}>
          Added {new Date(asset.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Assets</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddAsset' as never)}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <Text style={styles.loadingText}>Loading assets...</Text>
          </View>
        ) : assets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💼</Text>
            <Text style={styles.emptyTitle}>No Assets Yet</Text>
            <Text style={styles.emptySubtitle}>
              Add your first asset to secure your digital legacy
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('AddAsset' as never)}
            >
              <Text style={styles.emptyButtonText}>Add Asset</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.assetsContainer}>
            {assets.map((asset) => (
              <AssetCard key={asset._id} asset={asset} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
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
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
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
    marginBottom: 32,
  },
  emptyButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  assetsContainer: {
    padding: 20,
  },
  assetCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  assetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  assetIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  assetType: {
    fontSize: 14,
    color: '#64748b',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  assetDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 8,
  },
  assetMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assetLocation: {
    fontSize: 12,
    color: '#9ca3af',
  },
  assetDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
});