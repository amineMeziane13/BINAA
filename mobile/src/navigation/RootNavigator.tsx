import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../core/hooks/useAuth';
import { colors } from '../core/theme/colors';
import AuthStack from './AuthStack';
import AdminStack from './AdminStack';
import MainTabs from './MainTabs';

export default function RootNavigator() {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!token ? <AuthStack /> : user?.role === 'ADMIN' ? <AdminStack /> : <MainTabs />}
    </NavigationContainer>
  );
}
