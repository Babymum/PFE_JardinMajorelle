import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

export const AuthContext = createContext();

const SECURE_STORE_KEY = 'jardin_majorelle_admin_token';

export const AuthProvider = ({ children }) => {
  const [adminToken, setAdminToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Restaurer le token au démarrage de l'application
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await SecureStore.getItemAsync(SECURE_STORE_KEY);
        if (token) {
          setAdminToken(token);
          setIsAuthenticated(true);
        }
      } catch (e) {
        console.warn('Impossible de restaurer le token sécurisé', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  // Action de connexion
  const login = async (token) => {
    try {
      await SecureStore.setItemAsync(SECURE_STORE_KEY, token);
      setAdminToken(token);
      setIsAuthenticated(true);
    } catch (e) {
      console.error('Erreur lors de la sauvegarde du token sécurisé', e);
      throw e;
    }
  };

  // Action de déconnexion
  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync(SECURE_STORE_KEY);
      setAdminToken(null);
      setIsAuthenticated(false);
    } catch (e) {
      console.error('Erreur lors de la suppression du token sécurisé', e);
    }
  };

  return (
    <AuthContext.Provider value={{ adminToken, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
