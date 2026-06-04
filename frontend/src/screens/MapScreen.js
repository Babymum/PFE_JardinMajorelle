import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, Dimensions, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu, Plus, Minus, Crosshair, MapPin, Bookmark, Layers, Flower2, Home, ArrowLeft, Route } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { getZones } from '../../api/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAP_AREA_WIDTH = SCREEN_WIDTH; 
const MAP_AREA_HEIGHT = 450; 

export default function MapScreen({ navigation }) {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [userLocation, setUserLocation] = useState(null);
  const [distanceKm, setDistanceKm] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [is3DMode, setIs3DMode] = useState(false);
  const mapRef = useRef(null);
  const locationSubscription = useRef(null);
  const [region, setRegion] = useState({
    latitude: 31.641758,
    longitude: -8.002498,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });

  const GARDEN_COORDS = {
    latitude: 31.641758,
    longitude: -8.002498,
  };

  const normalizeZoneType = (value) =>
    value
      ? value
          .toString()
          .trim()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[\s-]+/g, '_')
      : null;

  const calculateDistanceKm = (from, to) => {
    const toRad = (degrees) => degrees * Math.PI / 180;
    const dLat = toRad(to.latitude - from.latitude);
    const dLon = toRad(to.longitude - from.longitude);
    const lat1 = toRad(from.latitude);
    const lat2 = toRad(to.latitude);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((6371 * c).toFixed(2));
  };

  const formatDistance = (distance) => {
    if (distance === null || distance === undefined) return '';
    if (distance < 1) return `${Math.round(distance * 1000)} m`;
    return `${distance} km`;
  };

  const requestLocationPermissionAndWatch = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission GPS refusée. Activez les autorisations pour voir votre position.');
        return;
      }

      const currentPosition = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      const currentCoords = {
        latitude: currentPosition.coords.latitude,
        longitude: currentPosition.coords.longitude,
      };
      setUserLocation(currentCoords);
      setDistanceKm(calculateDistanceKm(currentCoords, GARDEN_COORDS));

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          timeInterval: 5000,
          distanceInterval: 5,
        },
        (locationUpdate) => {
          const updatedCoords = {
            latitude: locationUpdate.coords.latitude,
            longitude: locationUpdate.coords.longitude,
          };
          setUserLocation(updatedCoords);
          setDistanceKm(calculateDistanceKm(updatedCoords, GARDEN_COORDS));
        }
      );

      locationSubscription.current = subscription;
    } catch (error) {
      console.log('Location error:', error);
      setLocationError('Impossible de récupérer la position. Vérifiez les paramètres du GPS.');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getZones();
      setZones(data);
      if (data.length > 0) {
        setSelectedZone(data[0]);
      }
    } catch (error) {
      console.log('Error fetching zones from backend:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    requestLocationPermissionAndWatch();

    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.fitToCoordinates([userLocation, GARDEN_COORDS], {
        edgePadding: { top: 100, right: 100, bottom: 200, left: 100 },
        animated: true,
      });
    }
  }, [userLocation]);

  const getZoneDesignProps = useCallback((typeZone) => {
    const normalizedType = normalizeZoneType(typeZone);
    const designMap = {
      'bassin': { type: 'BASSIN', typeColor: '#B4EAA5', typeTextColor: '#127A3A', image: require('../../assets/images/bassin.png') },
      'jardin_bambou': { type: 'BAMBOU', typeColor: '#E0DDD3', typeTextColor: '#68778D', image: require('../../assets/images/jardin-bambou.png') },
      'musee_berbere': { type: 'MUSEE', typeColor: '#DCE4F8', typeTextColor: '#0A2B5E', image: require('../../assets/images/musee-berbere.png') },
      'villa_bleue': { type: 'VILLA', typeColor: '#DCE4F8', typeTextColor: '#0A2B5E', image: require('../../assets/images/villa-bleue.png') },
      'jardin_cactus': { type: 'CACTUS', typeColor: '#E0DDD3', typeTextColor: '#68778D', image: require('../../assets/images/jardin-cactus.png') },
    };
    
    if (['boutique', 'librairie', 'cafe_majorelle', 'cafe_bousafsaf'].includes(normalizedType)) {
      return { type: 'COMMERCIAL', typeColor: '#F0EFE9', typeTextColor: '#68778D', image: require('../../assets/images/boutique.jpg') };
    }
    
    return designMap[normalizedType] || { type: 'GARDEN', typeColor: '#EAE6D8', typeTextColor: '#0A2B5E', image: require('../../assets/images/villa-bleue.png') };
  }, []);

  const filteredZones = useMemo(() => {
    if (activeFilter === 'HISTORICAL') {
      return zones.filter(z => ['villa_bleue', 'musee_berbere'].includes(normalizeZoneType(z.typeZone)));
    }
    if (activeFilter === 'BOTANICAL') {
      return zones.filter(z => ['bassin', 'jardin_bambou', 'jardin_cactus'].includes(normalizeZoneType(z.typeZone)));
    }
    return zones;
  }, [zones, activeFilter]);

  const markers = useMemo(() => {
    return filteredZones.map((zone) => ({
      id: zone._id,
      coordinate: { 
        latitude: zone.latitude || 31.6416, 
        longitude: zone.longitude || -8.0024 
      },
      title: zone.nom,
      zone: zone
    }));
  }, [filteredZones]);

  const handleZoomIn = () => {
    setRegion(prev => {
      const nextRegion = {
        ...prev,
        latitudeDelta: prev.latitudeDelta / 2,
        longitudeDelta: prev.longitudeDelta / 2,
      };
      mapRef.current?.animateToRegion(nextRegion, 300);
      return nextRegion;
    });
  };

  const handleZoomOut = () => {
    setRegion(prev => {
      const nextRegion = {
        ...prev,
        latitudeDelta: prev.latitudeDelta * 2,
        longitudeDelta: prev.longitudeDelta * 2,
      };
      mapRef.current?.animateToRegion(nextRegion, 300);
      return nextRegion;
    });
  };

  const handleRecenter = () => {
    const targetCoords = userLocation || GARDEN_COORDS;
    const recenterRegion = {
      latitude: targetCoords.latitude,
      longitude: targetCoords.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };
    setRegion(recenterRegion);
    mapRef.current?.animateToRegion(recenterRegion, 500);
  };

  const handleOpenDirections = async () => {
    const destination = `${GARDEN_COORDS.latitude},${GARDEN_COORDS.longitude}`;
    const origin = userLocation ? `${userLocation.latitude},${userLocation.longitude}` : '';
    const url = Platform.select({
      ios: `http://maps.apple.com/?daddr=${destination}&dirflg=w`,
      android: `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=walking${origin ? `&origin=${origin}` : ''}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=walking${origin ? `&origin=${origin}` : ''}`,
    });

    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Itinéraire indisponible', 'Impossible d’ouvrir l’application de navigation.');
    }
  };

  const handleToggle3D = () => {
    const nextMode = !is3DMode;
    setIs3DMode(nextMode);

    mapRef.current?.animateCamera(
      {
        center: GARDEN_COORDS,
        pitch: nextMode ? 60 : 0,
        heading: nextMode ? -25 : 0,
        zoom: nextMode ? 18 : 16,
      },
      { duration: 700 }
    );
  };

  return (
    <LinearGradient colors={['#D5DFD9', '#EAE6DF']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backBtn}>
            <ArrowLeft color="#0A2B5E" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>JARDIN MAJORELLE</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.locationPanel}>
          <Text style={styles.locationTitle}>Géolocalisation</Text>
          <Text style={styles.locationSubtitle}>
            {locationError
              ? locationError
              : userLocation
                ? `Distance au Jardin Majorelle : ${formatDistance(distanceKm)}`
                : 'Recherche de votre position...'}
          </Text>
          {userLocation && (
            <Text style={styles.locationCoords}>Lat: {userLocation.latitude.toFixed(5)} · Lon: {userLocation.longitude.toFixed(5)}</Text>
          )}
        </View>

        {/* Top Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabInactive, activeFilter === 'ALL' && styles.tabActive]} 
            onPress={() => setActiveFilter('ALL')}
          >
            <Text style={[styles.tabTextInactive, activeFilter === 'ALL' && styles.tabTextActive]}>ALL</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabInactive, activeFilter === 'HISTORICAL' && styles.tabActive]} 
            onPress={() => setActiveFilter('HISTORICAL')}
          >
            <Text style={[styles.tabTextInactive, activeFilter === 'HISTORICAL' && styles.tabTextActive]}>HISTORICAL</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabInactive, activeFilter === 'BOTANICAL' && styles.tabActive]} 
            onPress={() => setActiveFilter('BOTANICAL')}
          >
            <Text style={[styles.tabTextInactive, activeFilter === 'BOTANICAL' && styles.tabTextActive]}>BOTANICAL</Text>
          </TouchableOpacity>
        </View>

        {/* Map Elements (Dynamic Zones) */}
        <View style={styles.mapArea}>
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFillObject}
            initialRegion={region}
            showsUserLocation={false}
            showsMyLocationButton={false}
            showsCompass={false}
            showsBuildings={is3DMode}
            pitchEnabled={is3DMode}
            rotateEnabled={is3DMode}
          >
            {userLocation ? (
              <Marker
                coordinate={userLocation}
                title="Vous êtes ici"
                pinColor="#0A3A69"
              />
            ) : (
              <Marker
                coordinate={{ latitude: 31.6410, longitude: -8.0025 }}
                title="Localisation non disponible"
                pinColor="#0A3A69"
              />
            )}

            <Marker
              coordinate={GARDEN_COORDS}
              title="Jardin Majorelle"
              description="Latitude: 31.641758 · Longitude: -8.002498"
              pinColor="#B4B813"
            />

            {userLocation && (
              <Polyline
                coordinates={[userLocation, GARDEN_COORDS]}
                strokeColor="#0A3A69"
                strokeWidth={4}
                lineDashPattern={[10, 6]}
              />
            )}

            {/* Zone markers - Memoized */}
            {markers.map((marker) => (
              <Marker
                key={marker.id}
                coordinate={marker.coordinate}
                title={marker.title}
                onPress={() => setSelectedZone(marker.zone)}
                pinColor="#127A3A"
              />
            ))}
          </MapView>

          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#0A2B5E" />
            </View>
          )}

         {/*<TouchableOpacity style={styles.homePin} onPress={() => navigation.navigate('Home')}>
            <Home color="#FFF" size={20} />
          </TouchableOpacity> */}
        </View>

        {/* Right Controls */}
        <View style={styles.rightControls}>
          <TouchableOpacity style={styles.ctrlBtn} onPress={handleZoomIn}><Plus color="#0A2B5E" size={20} /></TouchableOpacity>
          <TouchableOpacity style={styles.ctrlBtn} onPress={handleZoomOut}><Minus color="#0A2B5E" size={20} /></TouchableOpacity>
          <TouchableOpacity style={[styles.ctrlBtn, styles.ctrlBtnDark]} onPress={handleRecenter}><Crosshair color="#FFF" size={20} /></TouchableOpacity>
          <TouchableOpacity style={[styles.ctrlBtn, styles.routeBtn]} onPress={handleOpenDirections}>
            <Route color="#FFF" size={20} />
          </TouchableOpacity>
        </View>

        {/* Bottom Elements */}
        <View style={styles.bottomOverlay}>
          <TouchableOpacity
            style={[styles.layerBtn, is3DMode && styles.layerBtnActive]}
            onPress={handleToggle3D}
          >
            <Layers color={is3DMode ? '#FFF' : '#127A3A'} size={24} />
          </TouchableOpacity>
          
          {selectedZone && (
            <View style={styles.bottomCard}>
              <Image
                source={selectedZone.image && /^https?:\/\//i.test(selectedZone.image)
                  ? { uri: selectedZone.image }
                  : getZoneDesignProps(selectedZone.typeZone).image}
                style={styles.cardCover}
              />
              <View style={styles.cardContent}>
                <Text style={styles.cardCategory}>{getZoneDesignProps(selectedZone.typeZone).type} ZONE</Text>
                <Text style={styles.cardTitle}>{selectedZone.nom}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{selectedZone.description}</Text>
                
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.btnPrimary} onPress={() => Alert.alert('Experience', 'Starting ' + (selectedZone.typeExperience?.[0] || 'tour'))}>
                    <Text style={styles.btnPrimaryText}>START TOUR</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnSecondary} onPress={() => Alert.alert('Saved', 'Zone saved to your bookmarks!')}>
                    <Bookmark color="#0A2B5E" size={18} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A2B5E',
    letterSpacing: 2,
  },
  locationPanel: {
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    borderRadius: 20,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  locationTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#127A3A',
    marginBottom: 6,
  },
  locationSubtitle: {
    fontSize: 14,
    color: '#0A2B5E',
    marginBottom: 6,
  },
  locationCoords: {
    fontSize: 12,
    color: '#68778D',
  },
  backBtn: {
    backgroundColor: 'rgba(10, 43, 94, 0.1)',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#B4B813', // Iconic Jardin Majorelle Yellow
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(230,230,225,0.6)',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 5,
    justifyContent: 'space-between',
  },
  tabActive: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  tabTextActive: {
    color: '#0A2B5E',
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
  },
  tabInactive: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabTextInactive: {
    color: '#68778D',
    fontWeight: '700',
    fontSize: 12,
  },
  mapArea: {
    flex: 1,
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    zIndex: 10,
  },
  pinBg: {
    backgroundColor: '#127A3A',
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  youAreHereIndicator: {
    alignItems: 'center',
  },
  outerDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(10, 43, 94, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  innerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#0A3A69',
  },
  youAreHerePill: {
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  youAreHereText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0A2B5E',
    letterSpacing: 1,
  },
  homePin: {
    position: 'absolute',
    top: '60%',
    left: '20%',
    backgroundColor: '#0A2B5E',
    padding: 15,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  rightControls: {
    position: 'absolute',
    right: 20,
    top: '30%',
  },
  ctrlBtn: {
    backgroundColor: '#FFF',
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  ctrlBtnDark: {
    backgroundColor: '#0A3A69',
    marginTop: 10,
  },
  routeBtn: {
    backgroundColor: '#127A3A',
  },
  recenterTextBtn: {
    marginTop: 5,
    backgroundColor: '#0A3A69',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recenterText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  layerBtn: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  layerBtnActive: {
    backgroundColor: '#0A3A69',
  },
  bottomCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  cardCover: {
    width: 80,
    height: 100,
    borderRadius: 15,
  },
  cardContent: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  cardCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: '#127A3A',
    letterSpacing: 1,
    marginBottom: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A2B5E',
    marginBottom: 5,
  },
  cardDesc: {
    fontSize: 12,
    color: '#68778D',
    marginBottom: 10,
  },
  cardActions: {
    flexDirection: 'row',
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: '#0A3A69',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  btnPrimaryText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  btnSecondary: {
    backgroundColor: '#EAE6D8',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
