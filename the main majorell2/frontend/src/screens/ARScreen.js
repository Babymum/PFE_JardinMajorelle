import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu, MapPin, Plus, Minus, Scan, Headphones, Share2, ArrowLeft } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function ARScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [telemetry, setTelemetry] = useState({ x: 142.084, y: 0.821, z: -22.419 });
  const [isCameraActive, setIsCameraActive] = useState(true);

  const handleRetour = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  // Simulate live telemetry changes
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry({
        x: +(142 + Math.random() * 2).toFixed(3),
        y: +(0.8 + Math.random() * 0.5).toFixed(3),
        z: +(-22 - Math.random() * 2).toFixed(3),
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  if (!permission) {
    // Permission state loading
    return <View style={styles.container}><ActivityIndicator style={{marginTop: 100}} /></View>;
  }

  if (!permission.granted) {
    // Permissions denied
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Text style={styles.permissionText}>L'accès à la caméra est nécessaire pour l'expérience AR.</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Autoriser la Caméra</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const renderContent = () => (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleRetour} style={styles.backBtn}>
          <ArrowLeft color="#FFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>JARDIN</Text>
        <TouchableOpacity onPress={() => setIsCameraActive(!isCameraActive)} style={styles.cameraToggleBtn}>
          <Text style={styles.cameraToggleText}>{isCameraActive ? "Désactiver" : "Activer"}</Text>
        </TouchableOpacity>
      </View>

      {!isCameraActive && (
        <>
          {/* Telemetry */}
          <View style={styles.telemetryBox}>
            <View style={styles.dotRow}>
              <View style={styles.greenDot} />
              <Text style={styles.telemetryTitle}>LIVE TELEMETRY</Text>
            </View>
            <View style={styles.axisRow}>
              <View>
                <Text style={styles.axisLabel}>X-AXIS</Text>
                <Text style={styles.axisValue}>{telemetry.x}</Text>
              </View>
              <View>
                <Text style={styles.axisLabel}>Y-AXIS</Text>
                <Text style={styles.axisValue}>{telemetry.y}</Text>
              </View>
              <View>
                <Text style={styles.axisLabel}>Z-AXIS</Text>
                <Text style={styles.axisValue}>{telemetry.z}</Text>
              </View>
            </View>
          </View>

          {/* Current Zone */}
          <View style={styles.zoneBox}>
            <MapPin color="#4E5E2D" size={16} />
            <View style={{marginLeft: 10}}>
              <Text style={styles.zoneLabel}>CURRENT ZONE</Text>
              <Text style={styles.zoneName}>The Great Basin</Text>
            </View>
          </View>
        </>
      )}

      {/* Right Controls */}
      <View style={[styles.rightControls, isCameraActive && styles.smallControls]}>
        <TouchableOpacity style={[styles.iconBtn, isCameraActive && styles.smallIconBtn]} onPress={() => Alert.alert('Zoom', 'Zoom In')}><Plus color="#0A2B5E" size={isCameraActive ? 14 : 20} /></TouchableOpacity>
        <TouchableOpacity style={[styles.iconBtn, isCameraActive && styles.smallIconBtn]} onPress={() => Alert.alert('Zoom', 'Zoom Out')}><Minus color="#0A2B5E" size={isCameraActive ? 14 : 20} /></TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={[styles.leafBtn, isCameraActive && styles.smallLeafBtn]} onPress={() => Alert.alert('Leaves', 'Enable Plant Info Overlays')}>
          <Text style={{color: '#FFF', fontWeight: 'bold', fontSize: isCameraActive ? 12 : 16 }}>❦</Text>
        </TouchableOpacity>
      </View>

      {/* Center Reticle removed for clear AR view */}

      <TouchableOpacity style={[styles.scanBtn, isCameraActive && styles.smallScanBtn]} onPress={() => Alert.alert('Scanner', 'Opening AR Camera Scanner...')}>
        <Scan color="#FFF" size={isCameraActive ? 16 : 24} />
      </TouchableOpacity>

      {/* Bottom Horizontal Cards */}
      {!isCameraActive && (
        <View style={styles.bottomSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: 20}}>
            <View style={styles.arCard}>
              <Image source={require('../../assets/jardin-cactus.png')} style={styles.arCardImage} />
              <View style={styles.arCardContent}>
                <Text style={styles.arCardTitle}>CACTUS GARDEN</Text>
                <Text style={styles.arCardSub}>14 Hotspots</Text>
              </View>
            </View>

            <View style={styles.arCard}>
              <Image source={require('../../assets/villa-bleue.png')} style={styles.arCardImage} />
              <View style={styles.arCardContent}>
                <Text style={styles.arCardTitle}>THE BLUE VILLA</Text>
                <Text style={styles.arCardSub}>8 Hotspots</Text>
              </View>
            </View>

            <View style={styles.arCard}>
              <Image source={require('../../assets/jardin-bambou.png')} style={styles.arCardImage} />
              <View style={styles.arCardContent}>
                <Text style={styles.arCardTitle}>BAMBOO FOREST</Text>
                <Text style={styles.arCardSub}>4 Hotspots</Text>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.headphonesBtn} onPress={() => Alert.alert('Audio', 'Starting Audio Tour for this zone...')}>
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
      <CameraView style={styles.container} facing="back">
        {renderContent()}
      </CameraView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A2B5E',
    letterSpacing: 1.5,
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
