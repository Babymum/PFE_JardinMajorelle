import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu, MapPin, Plus, Minus, Scan, Headphones, Share2, ArrowLeft } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTranslation } from 'react-i18next';
import { getZones } from '../../api/api';

export default function ARScreen({ navigation }) {
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const [telemetry, setTelemetry] = useState({ x: 142.084, y: 0.821, z: -22.419 });
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchZones = async () => {
      setLoading(true);
      try {
        const data = await getZones();
        setZones(data);
      } catch (error) {
        console.log('Error fetching zones in AR:', error);
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

  // No simulated telemetry intervals for a production-grade app
  const [activeOverlay, setActiveOverlay] = useState(null);

  const handleZoom = (level) => {
    Alert.alert(
      t('ar_zoom_title'), 
      t('ar_zoom_desc', { level })
    );
  };

  const handleToggleOverlay = () => {
    Alert.alert(
      t('ar_botany_filter_title'),
      t('ar_botany_filter_desc')
    );
  };

  const handleScan = () => {
    Alert.alert(
      t('ar_scan_title'),
      t('ar_scan_desc')
    );
  };

  const handleAudioTour = () => {
    Alert.alert(
      t('ar_audio_title'),
      t('ar_audio_desc')
    );
  };

  const renderContent = () => (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleRetour} 
          style={[styles.backBtn, { backgroundColor: isCameraActive ? 'rgba(10, 43, 94, 0.4)' : '#0A2B5E' }]}
        >
          <ArrowLeft color="#FFF" size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isCameraActive ? '#FFF' : '#0A2B5E' }]} numberOfLines={1}>
          {t('ar_title')}
        </Text>
        <TouchableOpacity onPress={() => setIsCameraActive(!isCameraActive)} style={styles.cameraToggleBtn}>
          <Text style={styles.cameraToggleText}>{isCameraActive ? t('ar_camera_disable') : t('ar_camera_enable')}</Text>
        </TouchableOpacity>
      </View>

      {!isCameraActive && (
        <>
          {/* AR Info panel */}
          <View style={styles.telemetryBox}>
            <View style={styles.dotRow}>
              <View style={styles.greenDot} />
              <Text style={styles.telemetryTitle}>{t('ar_companion_title')}</Text>
            </View>
            <Text style={{ fontSize: 12, color: '#0A2B5E', lineHeight: 18, fontWeight: '500' }}>
              {t('ar_companion_desc')}
            </Text>
          </View>

          {/* Current Zone */}
          <View style={styles.zoneBox}>
            <MapPin color="#127A3A" size={16} />
            <View style={{marginLeft: 10}}>
              <Text style={styles.zoneLabel}>{t('ar_position_detected')}</Text>
              <Text style={styles.zoneName}>{t('ar_garden_entrance')}</Text>
            </View>
          </View>
        </>
      )}

      {/* Right Controls */}
      {isCameraActive && (
        <View style={[styles.rightControls, styles.smallControls]}>
          <TouchableOpacity style={[styles.iconBtn, styles.smallIconBtn]} onPress={() => handleZoom('In')}><Plus color="#0A2B5E" size={14} /></TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, styles.smallIconBtn]} onPress={() => handleZoom('Out')}><Minus color="#0A2B5E" size={14} /></TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={[styles.leafBtn, styles.smallLeafBtn]} onPress={handleToggleOverlay}>
            <Text style={{color: '#FFF', fontWeight: 'bold', fontSize: 12 }}>❦</Text>
          </TouchableOpacity>
        </View>
      )}

      {isCameraActive && (
        <TouchableOpacity style={[styles.scanBtn, styles.smallScanBtn]} onPress={handleScan}>
          <Scan color="#FFF" size={16} />
        </TouchableOpacity>
      )}

      {/* Bottom Horizontal Cards */}
      {!isCameraActive && (
        <View style={styles.bottomSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: 20}}>
            {zones.map((zone) => {
              const design = getZoneDesignProps(zone.typeZone);
              const isRemoteUrl = zone.image && (zone.image.startsWith('http://') || zone.image.startsWith('https://'));
              const mainImage = isRemoteUrl ? { uri: zone.image } : design.fallbackImage;
              return (
                <TouchableOpacity 
                  key={zone._id} 
                  style={styles.arCard} 
                  onPress={() => navigation.navigate('ZoneDetail', { zone })}
                >
                  <Image source={mainImage} style={styles.arCardImage} />
                  <View style={styles.arCardContent}>
                    <Text style={styles.arCardTitle} numberOfLines={1}>{t('zone_name_' + zone.typeZone, zone.nom)}</Text>
                    <Text style={styles.arCardSub} numberOfLines={1}>{t('zone_desc_' + zone.typeZone, zone.description)}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity style={styles.headphonesBtn} onPress={handleAudioTour}>
            <Headphones color="#FFF" size={24} />
          </TouchableOpacity>
        </View>
      )}
      
      {/* Spacer for MainNavigator */}
      <View style={{height: 100}} />
    </SafeAreaView>
  );

  if (isCameraActive) {
    return (
      <View style={styles.container}>
        <CameraView style={StyleSheet.absoluteFillObject} facing="back" />
        {renderContent()}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#F5F4EC' }]}>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F4EC',
  },
  permissionText: {
    color: '#0A2B5E',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    marginHorizontal: 40,
  },
  permissionBtn: {
    backgroundColor: '#0A2B5E',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)', // Subtle dark overlay for better text readability over camera
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    minHeight: 50,
    position: 'relative',
    width: '100%',
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
    maxWidth: '45%',
  },
  telemetryBox: {
    backgroundColor: 'rgba(230, 234, 232, 0.9)',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 15,
    padding: 15,
  },
  dotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#359954',
    marginRight: 10,
  },
  telemetryTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0A2B5E',
    letterSpacing: 1,
  },
  axisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  axisLabel: {
    fontSize: 10,
    color: '#68778D',
    marginBottom: 4,
  },
  axisValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0A2B5E',
  },
  zoneBox: {
    backgroundColor: 'rgba(230, 234, 232, 0.9)',
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  zoneLabel: {
    fontSize: 10,
    color: '#68778D',
  },
  zoneName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A2B5E',
  },
  rightControls: {
    position: 'absolute',
    right: 20,
    top: 250,
    alignItems: 'center',
  },
  smallControls: {
    top: 150,
    right: 10,
  },
  iconBtn: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    width: 44,
    height: 44,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  smallIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    marginBottom: 5,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginBottom: 10,
  },
  leafBtn: {
    backgroundColor: '#1B6A31',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallLeafBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  reticle: {
    position: 'absolute',
    top: 250,
    left: '30%',
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(10, 43, 94, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  reticleInner: {
    width: 2,
    height: 10,
    backgroundColor: '#FFF',
  },
  motionText: {
    position: 'absolute',
    bottom: 240,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'rgba(10, 43, 94, 0.4)',
    fontSize: 24,
    letterSpacing: 8,
    fontWeight: '700',
  },
  scanBtn: {
    position: 'absolute',
    bottom: 220,
    right: 30,
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#0A2B5E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallScanBtn: {
    width: 36,
    height: 36,
    bottom: 120,
    right: 20,
    borderRadius: 12,
  },
  backBtn: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(10, 43, 94, 0.4)',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#B4B813', // Iconic Jardin Majorelle Yellow/Mustard
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cameraToggleBtn: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    backgroundColor: '#0A2B5E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#B4B813', // Yellow accent border
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  cameraToggleText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  bottomSection: {
    position: 'absolute',
    bottom: 100,
    width: '100%',
  },
  arCard: {
    width: 180,
    height: 200,
    backgroundColor: '#EAE6D8',
    borderRadius: 25,
    marginRight: 15,
    overflow: 'hidden',
  },
  arCardImage: {
    width: '100%',
    height: 130,
    borderTopLeftRadius: 110,
    borderTopRightRadius: 110,
  },
  arCardContent: {
    padding: 15,
  },
  arCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0A2B5E',
  },
  arCardSub: {
    fontSize: 10,
    color: '#68778D',
    marginTop: 4,
  },
  headphonesBtn: {
    position: 'absolute',
    right: -10,
    bottom: 0,
    backgroundColor: '#868305',
    width: 50,
    height: 80,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
