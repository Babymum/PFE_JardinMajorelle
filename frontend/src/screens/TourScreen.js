import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Box, Maximize2, PlayCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function TourScreen({ navigation }) {
  const handleRetour = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  const handleFullscreen = () => {
    Alert.alert(
      'Plein Écran (Aperçu)',
      'Le mode gyroscope et plein écran 360° sera activé dans la version finale du pilote.'
    );
  };

  const handleStartTour = () => {
    Alert.alert(
      'Visite Guidée 3D (Aperçu)',
      'Démarre un parcours narratif en 3D guidé à travers les points d\'intérêt historiques et botaniques du jardin.'
    );
  };

  const handleSelectZone = (zoneName) => {
    Alert.alert(
      'Sélection de Zone (Aperçu)',
      `Chargement du modèle 3D haute définition pour la zone : "${zoneName}" (Bientôt disponible).`
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
            <Text style={styles.headerTitle}>VISITE VIRTUELLE 3D</Text>
            <TouchableOpacity style={styles.expandBtn} onPress={handleFullscreen}>
              <Maximize2 color="#FFF" size={20} />
            </TouchableOpacity>
          </View>

          {/* Center Play Area */}
          <View style={styles.centerArea}>
            <TouchableOpacity style={styles.playBtn} onPress={handleStartTour}>
               <PlayCircle color="#FFF" size={64} strokeWidth={1.5} />
            </TouchableOpacity>
            <Text style={styles.panoText}>Faites glisser pour explorer le panorama 360°</Text>
          </View>

          {/* Bottom Thumbnails */}
          <View style={styles.bottomSection}>
             <Text style={styles.zoneText}>PREVIEW DES ZONES IMMERSIVES</Text>
             <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gallery}>
                <TouchableOpacity style={[styles.thumbBox, styles.thumbBoxActive]} onPress={() => handleSelectZone('La Villa Bleue')}>
                   <ImageBackground source={require('../../assets/majorelle_villa.png')} style={styles.thumbImg} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.thumbBox} onPress={() => handleSelectZone('Jardin des Cactus')}>
                   <ImageBackground source={require('../../assets/majorelle_cactus.png')} style={styles.thumbImg} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.thumbBox} onPress={() => handleSelectZone('Musée Berbère')}>
                   <ImageBackground source={require('../../assets/majorelle_museum.png')} style={styles.thumbImg} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.thumbBox} onPress={() => handleSelectZone('Forêt de Bambous')}>
                   <ImageBackground source={require('../../assets/majorelle_bamboo.png')} style={styles.thumbImg} />
                </TouchableOpacity>
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
