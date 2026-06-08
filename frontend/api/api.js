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
    "gallery": [
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=600",
      "https://images.unsplash.com/photo-1508962914676-134849a727f0?q=80&w=600",
      "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=600",
      "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?q=80&w=600",
      "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?q=80&w=600",
      "https://images.unsplash.com/photo-1533038590840-1cde6e66b0a2?q=80&w=600"
    ],
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
    "gallery": [
      "https://images.unsplash.com/photo-1525253086316-d0c936c814f8?q=80&w=600",
      "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?q=80&w=600",
      "https://images.unsplash.com/photo-1483794344563-d27a8d18014e?q=80&w=600",
      "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?q=80&w=600",
      "https://images.unsplash.com/photo-1509423350716-97f9360b4e5f?q=80&w=600",
      "https://images.unsplash.com/photo-1551893478-d726eaf06427?q=80&w=600"
    ],
    "latitude": 31.6422,
    "longitude": -8.0022
  },
  {
    "_id": "6a0c4b0f23151551bb475462",
    "nom": "Café Bousafsaf",
    "description": "Café traditionnel entouré de végétation luxuriante",
    "typeZone": "cafe_bousafsaf",
    "position3D": { "x": 22, "y": 9, "z": 1 },
    "image": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600",
    "gallery": [
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600",
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600",
      "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=600",
      "https://images.unsplash.com/photo-1507133750040-4a8f57021571?q=80&w=600",
      "https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=600",
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600"
    ]
  },
  {
    "_id": "6a0c4b1723151551bb475464",
    "nom": "Allées du jardin",
    "description": "Chemins permettant la circulation et la découverte des différentes zones",
    "typeZone": "allee_jardin",
    "position3D": { "x": 12, "y": 6, "z": 0 },
    "image": "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600",
    "gallery": [
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600",
      "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=600",
      "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=600",
      "https://images.unsplash.com/photo-1472214222541-d510753a4907?q=80&w=600",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=600",
      "https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=600"
    ]
  },
  {
    "_id": "6a0c4b2123151551bb475466",
    "nom": "Jardin de bambou",
    "description": "Espace ombragé composé de bambous géants offrant une ambiance apaisante",
    "typeZone": "jardin_bambou",
    "position3D": { "x": 20, "y": 8, "z": 1 },
    "image": "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=600",
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    "gallery": [
      "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=600",
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600",
      "https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=600",
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=600",
      "https://images.unsplash.com/photo-1535223289827-42f1e9919769?q=80&w=600"
    ],
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
      "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=600",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=600",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=600"
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
    "gallery": [
      "https://images.unsplash.com/photo-1590073844006-33379778ae09?q=80&w=600",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600",
      "https://images.unsplash.com/photo-1566121318599-27b055928d10?q=80&w=600",
      "https://images.unsplash.com/photo-1503174971373-b1f69850bdf4?q=80&w=600",
      "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=600",
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600"
    ],
    "latitude": 31.6418,
    "longitude": -8.0024
  },
  {
    "_id": "6a0c4b3523151551bb47546c",
    "nom": "Café Majorelle",
    "description": "Espace de restauration au cœur du jardin",
    "typeZone": "cafe_majorelle",
    "position3D": { "x": 18, "y": 10, "z": 1 },
    "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600",
    "gallery": [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600",
      "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=600",
      "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=600",
      "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600",
      "https://images.unsplash.com/photo-1522336572241-9946d7913b91?q=80&w=600",
      "https://images.unsplash.com/photo-1485182708500-e8f1f318ba72?q=80&w=600"
    ]
  },
  {
    "_id": "6a0c4b3d23151551bb47546e",
    "nom": "Boutique",
    "description": "Espace de vente de souvenirs et produits artisanaux",
    "typeZone": "boutique",
    "position3D": { "x": 8, "y": 14, "z": 1 },
    "image": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600",
    "gallery": [
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600",
      "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?q=80&w=600",
      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=600",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600",
      "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=600",
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600"
    ]
  },
  {
    "_id": "6a0c4b4323151551bb475470",
    "nom": "Librairie",
    "description": "Espace dédié aux livres sur l’art, la botanique et la culture",
    "typeZone": "librairie",
    "position3D": { "x": 9, "y": 13, "z": 1 },
    "image": "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=600",
    "gallery": [
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=600",
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=600",
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=600",
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=600",
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=600",
      "https://images.unsplash.com/photo-1505664194779-8bebcb95c557?q=80&w=600"
    ]
  }
];

// Récupérer toutes les zones (ex: pour la carte interactive) avec cache hors-ligne
export const getZones = async () => {
  try {
    const response = await apiClient.get('/zones');
    let liveZones = response.data && response.data.length > 0 ? response.data : FALLBACK_ZONES;
    const missingZones = FALLBACK_ZONES.filter(fz => !liveZones.some(lz => lz.typeZone === fz.typeZone));
    if (missingZones.length > 0) {
      liveZones = [...liveZones, ...missingZones];
    }
    // Sauvegarder dans le cache local
    try {
      await AsyncStorage.setItem(ZONES_CACHE_KEY, JSON.stringify(liveZones));
    } catch (storageError) {
      console.warn("Impossible d'écrire dans AsyncStorage:", storageError.message);
    }
    return liveZones;
  } catch (error) {
    console.warn("Erreur réseau des zones. Tentative de lecture du cache...", error.message);
    try {
      const cached = await AsyncStorage.getItem(ZONES_CACHE_KEY);
      if (cached) {
        console.log("💾 Zones récupérées depuis le cache AsyncStorage local (Mode Hors-ligne).");
        const parsed = JSON.parse(cached);
        let liveZones = parsed && parsed.length > 0 ? parsed : FALLBACK_ZONES;
        const missingZones = FALLBACK_ZONES.filter(fz => !liveZones.some(lz => lz.typeZone === fz.typeZone));
        if (missingZones.length > 0) {
          liveZones = [...liveZones, ...missingZones];
        }
        return liveZones;
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
