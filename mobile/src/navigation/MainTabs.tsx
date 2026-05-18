import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../core/theme/colors';
import Icon3D from '../core/components/Icon3D';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../features/home/screens/HomeScreen';
import CalculatorScreen from '../features/home/screens/CalculatorScreen';
import OrderScreen from '../features/orders/screens/OrderScreen';
import ProfileScreen from '../features/profile/screens/ProfileScreen';
import MyOffersScreen from '../features/fournisseur/screens/MyOffersScreen';
import AddOfferScreen from '../features/fournisseur/screens/AddOfferScreen';
import ArtisanProfileScreen from '../features/artisan/screens/ArtisanProfileScreen';
import MarketProductsScreen from '../features/market/screens/MarketProductsScreen';
import MarketArtisansScreen from '../features/market/screens/MarketArtisansScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          height: 65 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Accueil',
          tabBarIcon: ({ focused }) => <Icon3D icon="🏠" size={14} bgColor={focused ? '#2563EB' : '#E2E8F0'} />,
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrderScreen}
        options={{
          tabBarLabel: 'Commandes',
          tabBarIcon: ({ focused }) => <Icon3D icon="📋" size={14} bgColor={focused ? '#7C3AED' : '#E2E8F0'} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Mon Profil',
          tabBarIcon: ({ focused }) => <Icon3D icon="👤" size={14} bgColor={focused ? '#DC2626' : '#E2E8F0'} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function MainTabs() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={HomeTabs} />
      <Stack.Screen name="MyOffers" component={MyOffersScreen} />
      <Stack.Screen name="AddOffer" component={AddOfferScreen} />
      <Stack.Screen name="ArtisanProfile" component={ArtisanProfileScreen} />
      <Stack.Screen name="MarketProducts" component={MarketProductsScreen} />
      <Stack.Screen name="MarketArtisans" component={MarketArtisansScreen} />
      <Stack.Screen name="MarketEquipment" component={MarketProductsScreen} />
      <Stack.Screen name="CalculatorScreen" component={CalculatorScreen} />
    </Stack.Navigator>
  );
}
