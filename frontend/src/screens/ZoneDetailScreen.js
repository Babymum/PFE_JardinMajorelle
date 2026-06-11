import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, Modal, Alert, ActivityIndicator, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Download, X, Share2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AudioPlayer from '../components/AudioPlayer';
import { trackScreen, trackZoneEngagement } from '../services/analytics';
import { useTranslation } from 'react-i18next';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Asset } from 'expo-asset';


const zoneAudioMap = {
  bassin: require('../../assets/audio/bassin.mp3'),
  jardin_bambou: require('../../assets/audio/jardin-bambou.mp3'),
  jardin_cactus: require('../../assets/audio/jardin-cactus.mp3'),
  musee_berbere: require('../../assets/audio/musee-berbere.mp3'),
  villa_bleue: require('../../assets/audio/villa-bleue.mp3'),
  boutique: require('../../assets/audio/boutique.mp3'),
  librairie: require('../../assets/audio/librairie.mp3'),
  allee_jardin: require('../../assets/audio/allees.mp3'),
  cafe_majorelle: require('../../assets/audio/cafe-majorelle.mp3'),
  cafe_bousafsaf: require('../../assets/audio/cafe-bousafsaf.mp3'),
};

const localGalleryMap = {
  bassin: [
    require('../../assets/galerie/bassin1.jpeg'),
    require('../../assets/galerie/bassin2.jpeg'),
    require('../../assets/galerie/bassin3.jpeg'),
    require('../../assets/galerie/bassin4.jpeg'),
    require('../../assets/galerie/bassin5.jpeg'),
    require('../../assets/galerie/bassin6.jpeg'),
  ],
  jardin_cactus: [
    require('../../assets/galerie/cactus1.jpeg'),
    require('../../assets/galerie/cactus2.jpeg'),
    require('../../assets/galerie/cactus3.jpeg'),
    require('../../assets/galerie/cactus4.jpeg'),
    require('../../assets/galerie/cactus5.jpeg'),
    require('../../assets/galerie/cactus6.jpeg'),
  ],
  cafe_bousafsaf: [
    require('../../assets/galerie/bousafsaf.jpeg'),
    require('../../assets/galerie/bousaf.jpeg'),
    require('../../assets/galerie/bousaff.jpeg'),
    require('../../assets/galerie/bousa.jpeg'),
    require('../../assets/galerie/bousafsa.jpeg'),
    require('../../assets/galerie/bousafsaff.jpeg'),
  ],
  allee_jardin: [
    require('../../assets/galerie/allee1.jpeg'),
    require('../../assets/galerie/allee2.jpeg'),
    require('../../assets/galerie/allee3.jpeg'),
    require('../../assets/galerie/allee4.jpeg'),
    require('../../assets/galerie/allee5.jpeg'),
    require('../../assets/galerie/allee6.jpeg'),
  ],
  jardin_bambou: [
    require('../../assets/galerie/bambou1.jpeg'),
    require('../../assets/galerie/bambou2.jpeg'),
    require('../../assets/galerie/bambou3.jpeg'),
    require('../../assets/galerie/bambou4.jpeg'),
    require('../../assets/galerie/bambou5.jpeg'),
    require('../../assets/galerie/bambou6.jpeg'),
  ],
  villa_bleue: [
    require('../../assets/galerie/villa1.jpeg'),
    require('../../assets/galerie/villa2.jpeg'),
    require('../../assets/galerie/villa3.jpeg'),
    require('../../assets/galerie/villa4.jpeg'),
    require('../../assets/galerie/villa5.jpeg'),
    require('../../assets/galerie/villa6.jpeg'),
  ],
  musee_berbere: [
    require('../../assets/galerie/musee1.jpeg'),
    require('../../assets/galerie/musee2.jpeg'),
    require('../../assets/galerie/musee3.jpeg'),
    require('../../assets/galerie/musee4.jpeg'),
    require('../../assets/galerie/musee5.jpeg'),
    require('../../assets/galerie/musee6.jpeg'),
  ],
  cafe_majorelle: [
    require('../../assets/galerie/cmajorelle1.jpeg'),
    require('../../assets/galerie/cmajorelle2.jpeg'),
    require('../../assets/galerie/cmajorelle3.jpeg'),
    require('../../assets/galerie/cmajorelle4.jpeg'),
    require('../../assets/galerie/cmajorelle5.jpeg'),
    require('../../assets/galerie/cmajorelle6.jpeg'),
  ],
  boutique: [
    require('../../assets/galerie/boutique1.jpeg'),
    require('../../assets/galerie/boutique2.jpeg'),
    require('../../assets/galerie/boutique3.jpeg'),
    require('../../assets/galerie/boutique4.jpeg'),
    require('../../assets/galerie/boutique5.jpeg'),
    require('../../assets/galerie/boutique6.jpeg'),
  ],
  librairie: [
    require('../../assets/galerie/librairie1.jpeg'),
    require('../../assets/galerie/librairie2.jpeg'),
    require('../../assets/galerie/librairie3.jpeg'),
    require('../../assets/galerie/librairie4.jpeg'),
    require('../../assets/galerie/librairie5.jpeg'),
    require('../../assets/galerie/librairie6.jpeg'),
  ],
};


export default function ZoneDetailScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { zone } = route.params;
  const [selectedImage, setSelectedImage] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    trackScreen(`ZoneDetail - ${zone.nom}`);
    trackZoneEngagement(zone._id, zone.nom, 'consulter_fiche');
  }, [zone]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleDownload = async (img) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('error') || 'Erreur',
          t('permission_denied_gallery') || "L'accès à la galerie a été refusé. Veuillez l'autoriser dans les réglages de votre téléphone."
        );
        return;
      }

      setDownloading(true);
      let localUri;
      if (typeof img === 'string') {
        const filename = img.split('/').pop().split('?')[0] || 'photo';
        const cleanFilename = filename.endsWith('.jpg') || filename.endsWith('.png') ? filename : `${filename}.jpg`;
        const fileUri = `${FileSystem.documentDirectory}${cleanFilename}`;
        
        const downloadResult = await FileSystem.downloadAsync(img, fileUri);
        
        if (downloadResult.status === 200) {
          localUri = downloadResult.uri;
        } else {
          throw new Error('Server returned non-200 status');
        }
      } else {
        const asset = Asset.fromModule(img);
        await asset.downloadAsync();
        localUri = asset.localUri;
      }
      
      if (localUri) {
        await MediaLibrary.createAssetAsync(localUri);
        Alert.alert(
          t('success') || 'Succès',
          t('image_saved_success') || 'Image enregistrée avec succès dans la galerie !'
        );
      }
    } catch (error) {
      console.error('Error saving image:', error);
      Alert.alert(
        t('error') || 'Erreur',
        t('image_saved_error') || "Impossible d'enregistrer l'image. Veuillez réessayer."
      );
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async (img) => {
    try {
      if (typeof img === 'string') {
        await Share.share({
          url: img,
          message: `${t('zone_name_' + zone.typeZone, zone.nom)} - Jardin Majorelle: ${img}`,
        });
      } else {
        const asset = Asset.fromModule(img);
        await asset.downloadAsync();
        await Share.share({
          url: asset.localUri,
          message: `${t('zone_name_' + zone.typeZone, zone.nom)} - Jardin Majorelle`,
        });
      }
    } catch (error) {
      console.error('Error sharing image:', error);
    }
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
  const isRemoteUrl = zone.image && (zone.image.startsWith('http://') || zone.image.startsWith('https://')) && !zone.image.includes('unsplash.com');
  const mainImage = isRemoteUrl ? { uri: zone.image } : design.fallbackImage;
  const audioSource = zoneAudioMap[zone.typeZone] || zone.audioUrl || null;
  const galleryImages = localGalleryMap[zone.typeZone] || zone.gallery || [];

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

          {/* Removed Audio Narration Guide Component */}
          {/* Description */}
          <Text style={styles.sectionTitle}>{t('detail_history_botany')}</Text>
          <Text style={styles.descriptionText}>{t('zone_desc_' + zone.typeZone, zone.description)}</Text>

          {/* Gallery */}
          {galleryImages && galleryImages.length > 0 ? (
            <View style={styles.galleryContainer}>
              <Text style={styles.sectionTitle}>{t('detail_gallery')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScroll}>
                {galleryImages.map((imgSource, idx) => {
                  const sourceProp = typeof imgSource === 'string' ? { uri: imgSource } : imgSource;
                  return (
                    <TouchableOpacity 
                      key={idx} 
                      style={styles.galleryCard}
                      onPress={() => setSelectedImage(imgSource)}
                      activeOpacity={0.8}
                    >
                      <Image source={sourceProp} style={styles.galleryImg} />
                    </TouchableOpacity>
                  );
                })}
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

      {/* Full Screen Image Viewer Modal */}
      <Modal
        visible={!!selectedImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.modalContainer}>
          {/* Close button on top */}
          <TouchableOpacity 
            style={styles.modalCloseBtn} 
            onPress={() => setSelectedImage(null)}
          >
            <X color="#FFF" size={28} />
          </TouchableOpacity>

          {/* Large Image */}
          {selectedImage && (
            <Image 
              source={typeof selectedImage === 'string' ? { uri: selectedImage } : selectedImage} 
              style={styles.modalImage} 
              resizeMode="contain" 
            />
          )}

          {/* Action buttons at the bottom */}
          {selectedImage && (
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalActionBtn} 
                onPress={() => handleShare(selectedImage)}
              >
                <Share2 color="#FFF" size={24} />
                <Text style={styles.modalActionText}>{t('share') || 'Partager'}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalActionBtn, styles.modalDownloadBtn]} 
                onPress={() => handleDownload(selectedImage)}
                disabled={downloading}
              >
                {downloading ? (
                  <ActivityIndicator color="#0A2B5E" size="small" />
                ) : (
                  <>
                    <Download color="#0A2B5E" size={24} />
                    <Text style={[styles.modalActionText, { color: '#0A2B5E' }]}>
                      {t('download') || 'Télécharger'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 25,
  },
  modalImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.7,
  },
  modalActions: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    gap: 15,
  },
  modalActionBtn: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  modalDownloadBtn: {
    backgroundColor: '#B4B813',
    borderColor: '#B4B813',
  },
  modalActionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
