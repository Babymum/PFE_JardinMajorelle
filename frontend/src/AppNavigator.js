import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainNavigator from './MainNavigator';
import ZoneDetailScreen from './screens/ZoneDetailScreen';
import CollectionScreen from './screens/CollectionScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="MainTabs">
      <Stack.Screen name="MainTabs" component={MainNavigator} />
      <Stack.Screen name="ZoneDetail" component={ZoneDetailScreen} />
      <Stack.Screen name="Collection" component={CollectionScreen} />
    </Stack.Navigator>
  );
}
