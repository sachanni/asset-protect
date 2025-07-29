import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import screens
import DashboardScreen from '../screens/main/DashboardScreen';
import AssetsScreen from '../screens/main/AssetsScreen';
import NomineesScreen from '../screens/main/NomineesScreen';
import MoodTrackingScreen from '../screens/main/MoodTrackingScreen';
import AdminPanelScreen from '../screens/main/AdminPanelScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import AddAssetScreen from '../screens/main/AddAssetScreen';
import AddNomineeScreen from '../screens/main/AddNomineeScreen';
import WellnessSettingsScreen from '../screens/main/WellnessSettingsScreen';

import { useAuth } from '../hooks/useAuth';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function DashboardStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="DashboardMain" 
        component={DashboardScreen} 
        options={{ title: 'Dashboard' }}
      />
      <Stack.Screen 
        name="WellnessSettings" 
        component={WellnessSettingsScreen} 
        options={{ title: 'Wellness Settings' }}
      />
    </Stack.Navigator>
  );
}

function AssetsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="AssetsList" 
        component={AssetsScreen} 
        options={{ title: 'My Assets' }}
      />
      <Stack.Screen 
        name="AddAsset" 
        component={AddAssetScreen} 
        options={{ title: 'Add Asset' }}
      />
    </Stack.Navigator>
  );
}

function NomineesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="NomineesList" 
        component={NomineesScreen} 
        options={{ title: 'My Nominees' }}
      />
      <Stack.Screen 
        name="AddNominee" 
        component={AddNomineeScreen} 
        options={{ title: 'Add Nominee' }}
      />
    </Stack.Navigator>
  );
}

function MoodStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MoodMain" 
        component={MoodTrackingScreen} 
        options={{ title: 'Mood Tracking' }}
      />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  const { user } = useAuth();
  
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ProfileMain" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }}
      />
      {user?.isAdmin && (
        <Stack.Screen 
          name="AdminPanel" 
          component={AdminPanelScreen} 
          options={{ title: 'Admin Panel' }}
        />
      )}
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Assets':
              iconName = 'account-balance-wallet';
              break;
            case 'Nominees':
              iconName = 'people';
              break;
            case 'Mood':
              iconName = 'mood';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#6b7280',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="Assets" component={AssetsStack} />
      <Tab.Screen name="Nominees" component={NomineesStack} />
      <Tab.Screen name="Mood" component={MoodStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}