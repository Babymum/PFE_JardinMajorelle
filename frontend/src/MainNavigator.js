import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Text } from 'react-native';
import { Home, ScanFace, Compass, Box, Bot } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import HomeScreen from './screens/HomeScreen';
import TourScreen from './screens/TourScreen';
import ARScreen from './screens/ARScreen';
import GuideScreen from './screens/GuideScreen';
import MapScreen from './screens/MapScreen';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarIcon: ({ focused }) => {
          let IconComp;
          let label;

          switch (route.name) {
            case 'Home':
              IconComp = Home;
              label = t('tab_home');
              break;
            case '3DTour':
              IconComp = Box;
              label = t('tab_tour');
              break;
            case 'AR':
              IconComp = ScanFace;
              label = t('tab_ar');
              break;
            case 'Guide':
              IconComp = Bot;
              label = t('tab_guide');
              break;
            case 'Map':
              IconComp = Compass;
              label = t('tab_map');
              break;
          }

          return (
            <View style={[styles.tabItem, focused && styles.tabItemFocused]}>
              <IconComp size={22} color={focused ? '#0A2B5E' : '#68778D'} />
              <Text style={[styles.tabLabel, { color: focused ? '#0A2B5E' : '#68778D' }]}>
                {label}
              </Text>
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="3DTour" component={TourScreen} />
      <Tab.Screen name="AR" component={ARScreen} />
      <Tab.Screen name="Guide" component={GuideScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#EEEEE8',
    height: 80,
    borderTopWidth: 0,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    position: 'absolute',    
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginTop: 10,
  },
  tabItemFocused: {
    backgroundColor: '#DCE4F8',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
});
