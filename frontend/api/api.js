// src/services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mise à jour de l'IP selon ton erreur Expo actuelle ou l'environnement
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.5:5000/api'; 

const ZONES_CACHE_KEY = 'jardin_majorelle_zones_cache';

// On crée une instance configurée
export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- VOS REQUÊTES ---

const FALLBACK_ZONES = [
  {
    "_id": "6a0c4afa23151551bb47545e",
    "nom": "Bassin central",
    "description": "Zone principale du jardin avec bassin décoratif",
    "typeZone": "bassin",
    "position3D": { "x": 10, "y": 5, "z": 2 },
    "image": "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=600",
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "gallery": ["https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=600"],
    "latitude": 31.6415,
    "longitude": -8.0025
  },
  {
    "_id": "6a0c4b0823151551bb475460",
    "nom": "Jardin de cactus",
    "description": "Collection de cactus et plantes succulentes provenant de différentes régions du monde",
    "typeZone": "jardin_cactus",
    "position3D": { "x": 15, "y": 3, "z": 1 },
    "image": "https://images.unsplash.com/photo-1525253086316-d0c936c814f8?q=80&w=600",
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "gallery": ["https://images.unsplash.com/photo-1525253086316-d0c936c814f8?q=80&w=600"],
    "latitude": 31.6422,
    "longitude": -8.0022
  },
  {
    "_id": "6a0c4b0f23151551bb475462",
    "nom": "Café Bousafsaf",
    "description": "Café traditionnel entouré de végétation luxuriante",
    "typeZone": "cafe_bousafsaf",
    "position3D": { "x": 22, "y": 9, "z": 1 },
    "image": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600"
  },
  {
    "_id": "6a0c4b1723151551bb475464",
    "nom": "Allées du jardin",
    "description": "Chemins permettant la circulation et la découverte des différentes zones",
    "typeZone": "allee_jardin",
    "position3D": { "x": 12, "y": 6, "z": 0 },
    "image": "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600"
  },
  {
    "_id": "6a0c4b2123151551bb475466",
    "nom": "Jardin de bambou",
    "description": "Espace ombragé composé de bambous géants offrant une ambiance apaisante",
    "typeZone": "jardin_bambou",
    "position3D": { "x": 20, "y": 8, "z": 1 },
    "image": "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=600",
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    "gallery": ["https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=600"],
    "latitude": 31.6412,
    "longitude": -8.0026
  },
  {
    "_id": "6a0c4b2723151551bb475468",
    "nom": "Villa bleue",
    "description": "Bâtiment emblématique du jardin avec son architecture bleue intense",
    "typeZone": "villa_bleue",
    "position3D": { "x": 5, "y": 10, "z": 2 },
    "image": "https://images.unsplash.com/photo-1596436889106-be35e843f974?q=80&w=600",
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "gallery": [
      "https://images.unsplash.com/photo-1596436889106-be35e843f974?q=80&w=600",
      "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=600"
    ],
    "latitude": 31.6418,
    "longitude": -8.0028
  },
  {
    "_id": "6a0c4b2e23151551bb47546a",
    "nom": "Musée berbère",
    "description": "Musée présentant la culture et les objets traditionnels berbères",
    "typeZone": "musee_berbere",
    "position3D": { "x": 6, "y": 12, "z": 2 },
    "image": "https://images.unsplash.com/photo-1590073844006-33379778ae09?q=80&w=600",
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "gallery": ["https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600"],
    "latitude": 31.6418,
    "longitude": -8.0024
  },
  {
    "_id": "6a0c4b3523151551bb47546c",
    "nom": "Café Majorelle",
    "description": "Espace de restauration au cœur du jardin",
    "typeZone": "cafe_majorelle",
    "position3D": { "x": 18, "y": 10, "z": 1 },
    "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600"
  },
  {
    "_id": "6a0c4b3d23151551bb47546e",
    "nom": "Boutique",
    "description": "Espace de vente de souvenirs et produits artisanaux",
    "typeZone": "boutique",
    "position3D": { "x": 8, "y": 14, "z": 1 },
    "image": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600"
  },
  {
    "_id": "6a0c4b4323151551bb475470",
    "nom": "Librairie",
    "description": "Espace dédié aux livres sur l’art, la botanique et la culture",
    "typeZone": "librairie",
    "position3D": { "x": 9, "y": 13, "z": 1 },
    "image": "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=600"
  }
];

// Récupérer toutes les zones (ex: pour la carte interactive) avec cache hors-ligne
export const getZones = async () => {
  try {
    const response = await apiClient.get('/zones');
    // Sauvegarder dans le cache local
    try {
      await AsyncStorage.setItem(ZONES_CACHE_KEY, JSON.stringify(response.data));
    } catch (storageError) {
      console.warn("Impossible d'écrire dans AsyncStorage:", storageError.message);
    }
    return response.data && response.data.length > 0 ? response.data : FALLBACK_ZONES;
  } catch (error) {
    console.warn("Erreur réseau des zones. Tentative de lecture du cache...", error.message);
    try {
      const cached = await AsyncStorage.getItem(ZONES_CACHE_KEY);
      if (cached) {
        console.log("💾 Zones récupérées depuis le cache AsyncStorage local (Mode Hors-ligne).");
        const parsed = JSON.parse(cached);
        return parsed && parsed.length > 0 ? parsed : FALLBACK_ZONES;
      }
    } catch (cacheError) {
      console.warn("Impossible de lire le cache AsyncStorage :", cacheError.message);
    }
    console.log("⚠️ Réseau et cache indisponibles. Utilisation de la liste des 10 zones par défaut.");
    return FALLBACK_ZONES;
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
    console.warn("Erreur lors de la communication avec l'AI Guide:", error.message);
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

export const synthesizeSpeech = async (text) => {
  try {
    const response = await apiClient.post('/audio', { text });
    return response.data;
  } catch (error) {
    console.error(
      "Erreur synthèse vocale :",
      error.message
    );
    throw error;
  }
};
