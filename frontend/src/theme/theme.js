// src/theme/theme.js
export const lightTheme = {
  // Palette Identitaire Jardin Majorelle
  primary: '#0A2B5E',       // Bleu Majorelle Iconique (Cobalt profond)
  accent: '#B4B813',        // Jaune Citron / Moutarde Majorelle
  accentLight: '#C5C90A',   // Jaune Clair
  success: '#127A3A',       // Vert Cactus / Jardin
  successBg: '#B4EAA5',     // Vert Clair
  bg: '#F7F5EE',            // Blanc Sable / Desert White (using the #F7F5EE used in HomeScreen)
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

  // UI elements
  headerBg: '#F7F5EE',
  headerBorder: '#E0DDD3',
  inputBg: '#FFF',
  inputBorder: 'rgba(10, 43, 94, 0.1)',
  chatBotBg: '#EAE6D8',
  chatUserBg: '#0A2B5E',
  badgeBg: '#C5C90A',
};

export const darkTheme = {
  // Palette Identitaire Somber (Lighter dark mode)
  primary: '#5C90ED',       // Lighter Bleu Majorelle for dark mode
  accent: '#C5C90A',        // Keep mustard
  accentLight: '#DCE03B',
  success: '#3CB065',
  successBg: '#1C3E28',     
  bg: '#1E293B',            // Lighter somber (Slate 800)
  cardBg: '#2A3A52',        // Slate 700 for cards
  textDark: '#F4F5F7',      // Softer white for text
  textLight: '#FFF',
  textGray: '#B4C0CF',      // Lighter gray for dark mode
  textMuted: '#71839A',
  danger: '#E06B68',

  // Catégories spécifiques de zones (adapted for dark mode)
  bassin: '#3CB065',
  bassinBg: '#1C3E28',
  bamboo: '#B4C0CF',
  bambooBg: '#23344A',
  museum: '#5C90ED',
  museumBg: '#2A3A52',
  villa: '#5C90ED',
  villaBg: '#2A3A52',
  cactus: '#B4C0CF',
  cactusBg: '#23344A',
  commercial: '#B4C0CF',
  commercialBg: '#23344A',

  // UI elements
  headerBg: '#1E293B',
  headerBorder: '#30415A',
  inputBg: '#2A3A52',
  inputBorder: '#30415A',
  chatBotBg: '#2A3A52',
  chatUserBg: '#30415A',
  badgeBg: '#B4B813',
};

// Keep COLORS mapped to lightTheme temporarily to avoid breaking unmigrated screens
export const COLORS = lightTheme;

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
