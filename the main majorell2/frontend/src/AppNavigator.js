import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AuthScreen from './screens/AuthScreen';
import MainNavigator from './MainNavigator';
import ZoneManagementScreen from './screens/ZoneManagementScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="MainTabs">
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="MainTabs" component={MainNavigator} />
      <Stack.Screen name="ZoneManagement" component={ZoneManagementScreen} />
    </Stack.Navigator>
  );
}
