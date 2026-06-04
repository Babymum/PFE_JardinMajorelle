import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AudioPlayer from '../components/AudioPlayer';
import { trackScreen, trackZoneEngagement } from '../services/analytics';
import { useTranslation } from 'react-i18next';

export default function ZoneDetailScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { zone } = route.params;

  useEffect(() => {
    trackScreen(`ZoneDetail - ${zone.nom}`);
    trackZoneEngagement(zone._id, zone.nom, 'consulter_fiche');
  }, [zone]);

  const handleBack = () => {
    navigation.goBack();
  };

  const getZoneDesignProps = (typeZone) => {
    const designMap = {
      'bassin': { type: 'BASSIN', typeColor: '#B4EAA5', typeTextColor: '#127A3A', fallbackImage: require('../../assets/majorelle_lilies.png') },
      'jardin_bambou': { type: 'BAMBOO', typeColor: '#E0DDD3', typeTextColor: '#68778D', fallbackImage: require('../../assets/majorelle_bamboo.png') },
      'musee_berbere': { type: 'MUSEUM', typeColor: '#DCE4F8', typeTextColor: '#0A2B5E', fallbackImage: require('../../assets/majorelle_museum.png') },
      'villa_bleue': { type: 'VILLA', typeColor: '#DCE4F8', typeTextColor: '#0A2B5E', fallbackImage: require('../../assets/majorelle_villa.png') },
      'jardin_cactus': { type: 'CACTUS', typeColor: '#E0DDD3', typeTextColor: '#68778D', fallbackImage: require('../../assets/majorelle_cactus.png') },
      'allee_jardin': { type: 'GARDEN', typeColor: '#EAE6D8', typeTextColor: '#0A2B5E', fallbackImage: require('../../assets/majorelle_pathway.png') },
      'cafe_majorelle': { type: 'COMMERCIAL', typeColor: '#F0EFE9', typeTextColor: '#68778D', fallbackImage: require('../../assets/majorelle_cafe.png') },
      'cafe_bousafsaf': { type: 'COMMERCIAL', typeColor: '#F0EFE9', typeTextColor: '#68778D', fallbackImage: require('../../assets/majorelle_cafe2.png') },
      'boutique': { type: 'COMMERCIAL', typeColor: '#F0EFE9', typeTextColor: '#68778D', fallbackImage: require('../../assets/majorelle_boutique.png') },
      'librairie': { type: 'COMMERCIAL', typeColor: '#F0EFE9', typeTextColor: '#68778D', fallbackImage: require('../../assets/majorelle_library.png') },
    };
    
    return designMap[typeZone] || { type: 'GARDEN', typeColor: '#EAE6D8', typeTextColor: '#0A2B5E', fallbackImage: require('../../assets/majorelle_villa.png') };
  };

  const design = getZoneDesignProps(zone.typeZone);
  const isRemoteUrl = zone.image && (zone.image.startsWith('http://') || zone.image.startsWith('https://'));
  const mainImage = isRemoteUrl ? { uri: zone.image } : design.fallbackImage;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image source={mainImage} style={styles.heroImage} />
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(249, 248, 244, 1)']}
            style={styles.gradient}
          />
          <TouchableOpacity 
            onPress={handleBack} 
            style={styles.backBtn}
            accessibilityLabel={t('auth_back')}
            accessibilityRole="button"
          >
            <ArrowLeft color="#FFF" size={24} />
          </TouchableOpacity>
        </View>

        {/* Content Area */}
        <View style={styles.contentContainer}>
          {/* Category Badge */}
          <View style={[styles.badge, { backgroundColor: design.typeColor }]}>
            <Text style={[styles.badgeText, { color: design.typeTextColor }]}>{t(`type_${design.type.toLowerCase()}`)} {t('map_zone_suffix')}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{t('zone_name_' + zone.typeZone, zone.nom)}</Text>

          {/* Location details */}
          <View style={styles.locationRow}>
            <MapPin color="#127A3A" size={16} />
            <Text style={styles.locationText}>
              {zone.latitude && zone.longitude 
                ? `${t('detail_coordinates')}${zone.latitude.toFixed(4)}°, ${zone.longitude.toFixed(4)}°` 
                : t('ar_garden_entrance')}
            </Text>
          </View>

          {/* Audio Narration Guide Component */}
          {zone.audioUrl ? (
            <AudioPlayer audioUrl={zone.audioUrl} />
          ) : null}

          {/* Description */}
          <Text style={styles.sectionTitle}>{t('detail_history_botany')}</Text>
          <Text style={styles.descriptionText}>{t('zone_desc_' + zone.typeZone, zone.description)}</Text>

          {/* Gallery */}
          {zone.gallery && zone.gallery.length > 0 ? (
            <View style={styles.galleryContainer}>
              <Text style={styles.sectionTitle}>{t('detail_gallery')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScroll}>
                {zone.gallery.map((imgUrl, idx) => (
                  <View key={idx} style={styles.galleryCard}>
                    <Image source={{ uri: imgUrl }} style={styles.galleryImg} />
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : null}

          {/* Additional info */}
          {zone.informationsComplementaires ? (
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>{t('detail_visitor_info')}</Text>
              <Text style={styles.infoText}>{t('zone_info_' + zone.typeZone, zone.informationsComplementaires)}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F8F4',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageContainer: {
    width: '100%',
    height: 350,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(10, 43, 94, 0.4)',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#B4B813',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  contentContainer: {
    paddingHorizontal: 20,
    marginTop: -20,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0A2B5E',
    marginBottom: 10,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#68778D',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A2B5E',
    marginTop: 20,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  descriptionText: {
    fontSize: 14,
    color: '#3A485A',
    lineHeight: 22,
    fontWeight: '400',
  },
  galleryContainer: {
    marginTop: 25,
  },
  galleryScroll: {
    flexDirection: 'row',
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  galleryCard: {
    width: 180,
    height: 120,
    borderRadius: 15,
    overflow: 'hidden',
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#EAE6D8',
  },
  galleryImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  infoBox: {
    backgroundColor: '#EEEEE8',
    borderRadius: 15,
    padding: 15,
    marginTop: 30,
    borderLeftWidth: 4,
    borderColor: '#127A3A',
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#127A3A',
    marginBottom: 5,
    letterSpacing: 0.5,
  },
  infoText: {
    fontSize: 12,
    color: '#3A485A',
    lineHeight: 18,
  },
});
