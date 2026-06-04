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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground 
        source={require('../../assets/images/villa-bleue.png')} 
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
            <Text style={styles.headerTitle}>IMMERSIVE TOUR</Text>
            <TouchableOpacity style={styles.expandBtn} onPress={() => Alert.alert('Fullscreen', 'Entering fullscreen panorama mode')}>
              <Maximize2 color="#FFF" size={20} />
            </TouchableOpacity>
          </View>

          {/* Center Play Area */}
          <View style={styles.centerArea}>
            <TouchableOpacity style={styles.playBtn} onPress={() => Alert.alert('Play', 'Starting Guided 3D Tour')}>
               <PlayCircle color="#FFF" size={64} strokeWidth={1.5} />
            </TouchableOpacity>
            <Text style={styles.panoText}>Drag to explore 360° Panorama</Text>
          </View>

          {/* Bottom Thumbnails */}
          <View style={styles.bottomSection}>
             <Text style={styles.zoneText}>EXPLORE ZONES</Text>
             <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gallery}>
                <TouchableOpacity style={[styles.thumbBox, styles.thumbBoxActive]} onPress={() => Alert.alert('Zone Selected', 'Loading The Blue Villa 3D View')}>
                  <ImageBackground source={require('../../assets/images/villa-bleue.png')} style={styles.thumbImg} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.thumbBox} onPress={() => Alert.alert('Zone Selected', 'Loading The Cactus Garden 3D View')}>
                  <ImageBackground source={require('../../assets/images/jardin-cactus.png')} style={styles.thumbImg} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.thumbBox} onPress={() => Alert.alert('Zone Selected', 'Loading The Berber Museum 3D View')}>
                  <ImageBackground source={require('../../assets/images/musee-berbere.png')} style={styles.thumbImg} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.thumbBox} onPress={() => Alert.alert('Zone Selected', 'Loading The Bamboo Forest 3D View')}>
                  <ImageBackground source={require('../../assets/images/jardin-bambou.png')} style={styles.thumbImg} />
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
