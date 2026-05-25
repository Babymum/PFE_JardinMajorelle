// src/services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mise à jour de l'IP selon ton erreur Expo actuelle ou l'environnement
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.5:5000/api'; 

const ZONES_CACHE_KEY = 'jardin_majorelle_zones_cache';

// On crée une instance configurée
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- VOS REQUÊTES ---

// Récupérer toutes les zones (ex: pour la carte interactive) avec cache hors-ligne
export const getZones = async () => {
  try {
    const response = await apiClient.get('/zones');
    // Sauvegarder dans le cache local
    await AsyncStorage.setItem(ZONES_CACHE_KEY, JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.warn("Erreur réseau des zones. Tentative de lecture du cache...", error.message);
    try {
      const cached = await AsyncStorage.getItem(ZONES_CACHE_KEY);
      if (cached) {
        console.log("💾 Zones récupérées depuis le cache AsyncStorage local (Mode Hors-ligne).");
        return JSON.parse(cached);
      }
    } catch (cacheError) {
      console.error("Impossible de lire le cache AsyncStorage :", cacheError);
    }
    throw error;
  }
};

// Récupérer une zone spécifique (ex: quand on clique sur un point d'intérêt)
export const getZoneById = async (id) => {
  try {
    const response = await apiClient.get(`/zones/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de la zone ${id}:`, error);
    throw error;
  }
};

// Créer une nouvelle zone (Nécessite un token admin)
export const createZone = async (zoneData, token) => {
  try {
    const response = await apiClient.post('/zones', zoneData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la création de la zone:", error);
    throw error;
  }
};

// Modifier une zone (Nécessite un token admin)
export const updateZone = async (id, zoneData, token) => {
  try {
    const response = await apiClient.put(`/zones/${id}`, zoneData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la modification de la zone ${id}:`, error);
    throw error;
  }
};

// Supprimer une zone (Nécessite un token admin)
export const deleteZone = async (id, token) => {
  try {
    const response = await apiClient.delete(`/zones/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la suppression de la zone ${id}:`, error);
    throw error;
  }
};

// Authentification Admin
export const adminLogin = async (email, password) => {
  try {
    const response = await apiClient.post('/admin/login', { email, password });
    return response.data; // retourne { token: "..." }
  } catch (error) {
    console.error("Erreur lors de la connexion admin:", error);
    throw error;
  }
};

// AI Guide Communication
export const sendMessageToGuide = async (messageText) => {
  try {
    const response = await apiClient.post('/chat', { message: messageText });
    return response.data.reply;
  } catch (error) {
    console.error("Erreur lors de la communication avec l'AI Guide:", error);
    throw error;
  }
};

// Upload Image
export const uploadImage = async (imageUri, token) => {
  try {
    const formData = new FormData();
    const fileName = imageUri.split('/').pop();
    const fileType = imageUri.substring(imageUri.lastIndexOf(".") + 1);
    
    formData.append('image', {
      uri: imageUri,
      name: fileName,
      type: `image/${fileType}`,
    });

    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data.imageUrl;
  } catch (error) {
    console.error("Erreur lors de l'upload de l'image:", error);
    throw error;
  }
};

// Upload Zone Image
export const uploadZoneImage = async (zoneId, imageUri, token) => {
  try {
    const formData = new FormData();
    const fileName = imageUri.split('/').pop();
    const fileType = imageUri.substring(imageUri.lastIndexOf(".") + 1);
    
    formData.append('image', {
      uri: imageUri,
      name: fileName,
      type: `image/${fileType}`,
    });

    const response = await apiClient.post(`/zone/${zoneId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data.zone;
  } catch (error) {
    console.error("Erreur lors de l'upload de l'image de zone:", error);
    throw error;
  }
};