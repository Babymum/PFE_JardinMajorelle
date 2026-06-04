// src/services/api.js
import axios from 'axios';

// Mise Ã  jour de l'IP selon ton erreur Expo actuelle ou l'environnement
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.5:5000/api';

// On crÃ©e une instance configurÃ©e
export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- VOS REQUÃŠTES ---

// RÃ©cupÃ©rer toutes les zones (ex: pour la carte interactive)
export const getZones = async () => {
  try {
    const response = await apiClient.get('/zones');
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la rÃ©cupÃ©ration des zones:", error);
    throw error;
  }
};

// RÃ©cupÃ©rer une zone spÃ©cifique (ex: quand on clique sur un point d'intÃ©rÃªt)
export const getZoneById = async (id) => {
  try {
    const response = await apiClient.get(`/zones/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la recuperation de la zone ${id}:`, error);
    throw error;
  }
};

// CrÃ©er une nouvelle zone (NÃ©cessite un token admin)
export const createZone = async (zoneData, token) => {
  try {
    const response = await apiClient.post('/zones', zoneData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la crÃ©ation de la zone:", error);
    throw error;
  }
};

// Modifier une zone (NÃ©cessite un token admin)
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

// Supprimer une zone (NÃ©cessite un token admin)
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

    const response = await apiClient.post('/upload/upload', formData, {
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

    const response = await apiClient.post(`/upload/zone/${zoneId}`, formData, {
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

export const synthesizeSpeech = async (text) => {
  try {
    const response = await apiClient.post('/audio', { text });
    return response.data;
  } catch (error) {
    console.error(
      "Erreur synthÃ¨se vocale :",
      error.message
    );
    throw error;
  }
};
