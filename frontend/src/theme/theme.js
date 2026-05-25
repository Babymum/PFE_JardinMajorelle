// src/theme/theme.js
export const COLORS = {
  // Palette Identitaire Jardin Majorelle
  primary: '#0A2B5E',       // Bleu Majorelle Iconique (Cobalt profond)
  accent: '#B4B813',        // Jaune Citron / Moutarde Majorelle
  accentLight: '#C5C90A',   // Jaune Clair
  success: '#127A3A',       // Vert Cactus / Jardin
  successBg: '#B4EAA5',     // Vert Clair
  bg: '#F9F8F4',            // Blanc Sable / Desert White
  cardBg: '#FFF',           // Blanc pur pour les cartes
  textDark: '#0A2B5E',      // Texte principal bleu
  textLight: '#FFF',        // Texte blanc
  textGray: '#68778D',      // Texte secondaire gris
  textMuted: '#8C9BB0',     // Texte désactivé ou ID
  danger: '#D9534F',        // Rouge Alerte / Suppression
  
  // Catégories spécifiques de zones
  bassin: '#127A3A',
  bassinBg: '#B4EAA5',
  bamboo: '#68778D',
  bambooBg: '#E0DDD3',
  museum: '#0A2B5E',
  museumBg: '#DCE4F8',
  villa: '#0A2B5E',
  villaBg: '#DCE4F8',
  cactus: '#68778D',
  cactusBg: '#E0DDD3',
  commercial: '#68778D',
  commercialBg: '#F0EFE9',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 15,
  lg: 20,
  xl: 30,
  xxl: 40,
};

export const TYPOGRAPHY = {
  h1: {
    fontSize: 32,
    fontWeight: '800',
  },
  h2: {
    fontSize: 22,
    fontWeight: '700',
  },
  h3: {
    fontSize: 16,
    fontWeight: '700',
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
  },
  caption: {
    fontSize: 10,
    fontWeight: '700',
  },
};

export const SHADOWS = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  premium: {
    shadowColor: '#0A2B5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
};
