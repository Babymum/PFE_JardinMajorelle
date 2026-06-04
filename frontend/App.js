import React, { useEffect } from 'react';
import { I18nManager } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/AppNavigator';
import { getZones } from './api/api';

// Forcer la mise en page en LTR pour éviter le décalage à gauche/droite
I18nManager.allowRTL(false);
I18nManager.forceRTL(false);

export default function App() {
  // TEST DE CONNEXION AU DÉMARRAGE
  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log("⏳ Test de connexion au backend en cours...");
        const data = await getZones();
        console.log("✅ SUCCÈS ! Données reçues du backend :", data);
      } catch (error) {
        console.log("❌ ÉCHEC de la connexion au backend :", error.message);
      }
    };
    testConnection();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
