import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../theme/theme';

export default function ZoneCard({ zone, onPress }) {
  const { t } = useTranslation();
  const getZoneDesignProps = (typeZone) => {
    const designMap = {
      'bassin': { type: 'BASSIN', typeColor: COLORS.bassinBg, typeTextColor: COLORS.bassin, fallback: require('../../assets/majorelle_lilies.png') },
      'jardin_bambou': { type: 'BAMBOO', typeColor: COLORS.bambooBg, typeTextColor: COLORS.bamboo, fallback: require('../../assets/majorelle_bamboo.png') },
      'musee_berbere': { type: 'MUSEUM', typeColor: COLORS.museumBg, typeTextColor: COLORS.museum, fallback: require('../../assets/majorelle_museum.png') },
      'villa_bleue': { type: 'VILLA', typeColor: COLORS.villaBg, typeTextColor: COLORS.villa, fallback: require('../../assets/majorelle_villa.png') },
      'jardin_cactus': { type: 'CACTUS', typeColor: COLORS.cactusBg, typeTextColor: COLORS.cactus, fallback: require('../../assets/majorelle_cactus.png') },
      'allee_jardin': { type: 'GARDEN', typeColor: '#EAE6D8', typeTextColor: '#0A2B5E', fallback: require('../../assets/majorelle_pathway.png') },
      'cafe_majorelle': { type: 'COMMERCIAL', typeColor: COLORS.commercialBg, typeTextColor: COLORS.commercial, fallback: require('../../assets/majorelle_cafe.png') },
      'cafe_bousafsaf': { type: 'COMMERCIAL', typeColor: COLORS.commercialBg, typeTextColor: COLORS.commercial, fallback: require('../../assets/majorelle_cafe2.png') },
      'boutique': { type: 'COMMERCIAL', typeColor: COLORS.commercialBg, typeTextColor: COLORS.commercial, fallback: require('../../assets/majorelle_boutique.png') },
      'librairie': { type: 'COMMERCIAL', typeColor: COLORS.commercialBg, typeTextColor: COLORS.commercial, fallback: require('../../assets/majorelle_library.png') },
    };
    
    return designMap[typeZone] || { type: 'GARDEN', typeColor: '#EAE6D8', typeTextColor: '#0A2B5E', fallback: require('../../assets/majorelle_villa.png') };
  };

  const props = getZoneDesignProps(zone.typeZone);
  const isRemoteUrl = zone.image && (zone.image.startsWith('http://') || zone.image.startsWith('https://'));
  const cardImage = isRemoteUrl ? { uri: zone.image } : props.fallback;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={cardImage} style={styles.cardImage} />
      <View style={styles.cardInfo}>
        <View style={[styles.badge, { backgroundColor: props.typeColor }]}>
          <Text style={[styles.badgeText, { color: props.typeTextColor }]}>{props.type}</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>{t('zone_name_' + zone.typeZone, zone.nom)}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{t('zone_desc_' + zone.typeZone, zone.description)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 15,
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 15,
  },
  cardInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 3,
  },
  cardDesc: {
    fontSize: 11,
    color: COLORS.textGray,
    lineHeight: 15,
  },
});
