const designMap = {
  'bassin': { 
    type: 'BASSIN', 
    typeColor: '#B4EAA5', 
    typeTextColor: '#127A3A', 
    fallbackImage: require('../../assets/majorelle_lilies.png'),
    fallback: require('../../assets/majorelle_lilies.png'),
    image: require('../../assets/majorelle_lilies.png')
  },
  'jardin_bambou': { 
    type: 'BAMBOO', 
    typeColor: '#E0DDD3', 
    typeTextColor: '#68778D', 
    fallbackImage: require('../../assets/majorelle_bamboo.png'),
    fallback: require('../../assets/majorelle_bamboo.png'),
    image: require('../../assets/majorelle_bamboo.png')
  },
  'musee_berbere': { 
    type: 'MUSEUM', 
    typeColor: '#DCE4F8', 
    typeTextColor: '#0A2B5E', 
    fallbackImage: require('../../assets/majorelle_museum.png'),
    fallback: require('../../assets/majorelle_museum.png'),
    image: require('../../assets/majorelle_museum.png')
  },
  'villa_bleue': { 
    type: 'VILLA', 
    typeColor: '#DCE4F8', 
    typeTextColor: '#0A2B5E', 
    fallbackImage: require('../../assets/majorelle_villa.png'),
    fallback: require('../../assets/majorelle_villa.png'),
    image: require('../../assets/majorelle_villa.png')
  },
  'jardin_cactus': { 
    type: 'CACTUS', 
    typeColor: '#E0DDD3', 
    typeTextColor: '#68778D', 
    fallbackImage: require('../../assets/majorelle_cactus.png'),
    fallback: require('../../assets/majorelle_cactus.png'),
    image: require('../../assets/majorelle_cactus.png')
  },
  'allee_jardin': { 
    type: 'GARDEN', 
    typeColor: '#EAE6D8', 
    typeTextColor: '#0A2B5E', 
    fallbackImage: require('../../assets/majorelle_pathway.png'),
    fallback: require('../../assets/majorelle_pathway.png'),
    image: require('../../assets/majorelle_pathway.png')
  },
  'cafe_majorelle': { 
    type: 'COMMERCIAL', 
    typeColor: '#F0EFE9', 
    typeTextColor: '#68778D', 
    fallbackImage: require('../../assets/majorelle_cafe.png'),
    fallback: require('../../assets/majorelle_cafe.png'),
    image: require('../../assets/majorelle_cafe.png')
  },
  'cafe_bousafsaf': { 
    type: 'COMMERCIAL', 
    typeColor: '#F0EFE9', 
    typeTextColor: '#68778D', 
    fallbackImage: require('../../assets/majorelle_cafe2.png'),
    fallback: require('../../assets/majorelle_cafe2.png'),
    image: require('../../assets/majorelle_cafe2.png')
  },
  'boutique': { 
    type: 'COMMERCIAL', 
    typeColor: '#F0EFE9', 
    typeTextColor: '#68778D', 
    fallbackImage: require('../../assets/majorelle_boutique.png'),
    fallback: require('../../assets/majorelle_boutique.png'),
    image: require('../../assets/majorelle_boutique.png')
  },
  'librairie': { 
    type: 'COMMERCIAL', 
    typeColor: '#F0EFE9', 
    typeTextColor: '#68778D', 
    fallbackImage: require('../../assets/majorelle_library.png'),
    fallback: require('../../assets/majorelle_library.png'),
    image: require('../../assets/majorelle_library.png')
  },
};

const defaultProps = { 
  type: 'GARDEN', 
  typeColor: '#EAE6D8', 
  typeTextColor: '#0A2B5E', 
  fallbackImage: require('../../assets/majorelle_villa.png'),
  fallback: require('../../assets/majorelle_villa.png'),
  image: require('../../assets/majorelle_villa.png')
};

export function getZoneDesignProps(typeZone) {
  if (!typeZone) return defaultProps;
  
  const normalized = typeZone
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s-]+/g, '_');
    
  return designMap[normalized] || defaultProps;
}
