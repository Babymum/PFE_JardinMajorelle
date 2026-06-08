import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Box, Maximize2, PlayCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { getZones } from '../../api/api';

export default function TourScreen({ navigation }) {
  const { t } = useTranslation();
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchZones = async () => {
      setLoading(true);
      try {
        const data = await getZones();
        setZones(data);
      } catch (error) {
        console.log('Error fetching zones in Tour:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchZones();
  }, []);

  const getZoneDesignProps = (typeZone) => {
    const designMap = {
      'bassin': { fallbackImage: require('../../assets/majorelle_lilies.png') },
      'jardin_bambou': { fallbackImage: require('../../assets/majorelle_bamboo.png') },
      'musee_berbere': { fallbackImage: require('../../assets/majorelle_museum.png') },
      'villa_bleue': { fallbackImage: require('../../assets/majorelle_villa.png') },
      'jardin_cactus': { fallbackImage: require('../../assets/majorelle_cactus.png') },
      'allee_jardin': { fallbackImage: require('../../assets/majorelle_pathway.png') },
      'cafe_majorelle': { fallbackImage: require('../../assets/majorelle_cafe.png') },
      'cafe_bousafsaf': { fallbackImage: require('../../assets/majorelle_cafe2.png') },
      'boutique': { fallbackImage: require('../../assets/majorelle_boutique.png') },
      'librairie': { fallbackImage: require('../../assets/majorelle_library.png') },
    };
    
    return designMap[typeZone] || { fallbackImage: require('../../assets/majorelle_villa.png') };
  };

  const handleRetour = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  const handleFullscreen = () => {
    Alert.alert(
      t('tour_fullscreen_title'),
      t('tour_fullscreen_desc')
    );
  };

  const handleStartTour = () => {
    Alert.alert(
      t('tour_guided_title'),
      t('tour_guided_desc')
    );
  };

  const handleSelectZone = (zoneName) => {
    Alert.alert(
      t('tour_select_zone_title'),
      t('tour_select_zone_desc', { zoneName })
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground 
        source={require('../../assets/majorelle_villa.png')} 
        style={styles.container}
      >
        <LinearGradient
            colors={['rgba(10, 43, 94, 0.4)', 'transparent', 'rgba(10, 43, 94, 0.9)']}
            style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={handleRetour}>
              <ArrowLeft color="#FFF" size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('tour_title')}</Text>
            <TouchableOpacity style={styles.expandBtn} onPress={handleFullscreen}>
              <Maximize2 color="#FFF" size={20} />
            </TouchableOpacity>
          </View>

          {/* Center Play Area */}
          <View style={styles.centerArea}>
            <TouchableOpacity style={styles.playBtn} onPress={handleStartTour}>
               <PlayCircle color="#FFF" size={64} strokeWidth={1.5} />
            </TouchableOpacity>
            <Text style={styles.panoText}>{t('tour_gyro_info')}</Text>
          </View>

          {/* Bottom Thumbnails */}
          <View style={styles.bottomSection}>
             <Text style={styles.zoneText}>{t('tour_preview_zones')}</Text>
             <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gallery}>
                {zones.map((zone, index) => {
                  const design = getZoneDesignProps(zone.typeZone);
                  const isRemoteUrl = zone.image && (zone.image.startsWith('http://') || zone.image.startsWith('https://')) && !zone.image.includes('unsplash.com');
                  const mainImage = isRemoteUrl ? { uri: zone.image } : design.fallbackImage;
                  return (
                    <TouchableOpacity 
                      key={zone._id} 
                      style={[styles.thumbBox, index === 0 && styles.thumbBoxActive]} 
                      onPress={() => handleSelectZone(t('zone_name_' + zone.typeZone, zone.nom))}
                    >
                      <ImageBackground source={mainImage} style={styles.thumbImg} />
                    </TouchableOpacity>
                  );
                })}
             </ScrollView>
          </View>
        </LinearGradient>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#B4B813', // Iconic Jardin Majorelle Yellow
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 2,
  },
  expandBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#B4B813', // Iconic Jardin Majorelle Yellow
  },
  centerArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    marginBottom: 20,
    shadowColor: '#FFF',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  panoText: {
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    letterSpacing: 1,
  },
  bottomSection: {
    paddingBottom: 110, // Account for Bottom Tabs
    paddingHorizontal: 20,
  },
  zoneText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 15,
  },
  gallery: {
    flexDirection: 'row',
  },
  thumbBox: {
    width: 70,
    height: 70,
    borderRadius: 15,
    marginRight: 15,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbBoxActive: {
    borderColor: '#C5C90A',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
  }
});
