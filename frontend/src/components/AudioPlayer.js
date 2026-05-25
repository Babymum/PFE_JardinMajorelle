import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react-native';

export default function AudioPlayer({ audioUrl }) {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Nettoyer le son si l'url change
  useEffect(() => {
    if (sound) {
      sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
      setPosition(0);
    }
  }, [audioUrl]);

  const onPlaybackStatusUpdate = (status) => {
    if (!isMounted.current) return;
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
      setIsLoading(status.isBuffering);
    } else if (status.error) {
      console.error(`Playback error: ${status.error}`);
    }
  };

  const loadAndPlay = async () => {
    if (!audioUrl) return;
    setIsLoading(true);
    try {
      // Configuration audio requise pour iOS/Android
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldRouteThroughEarpieceAndroid: false,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      if (isMounted.current) {
        setSound(newSound);
      }
    } catch (error) {
      console.warn("Failed to load audio", error.message);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const togglePlay = async () => {
    if (!sound) {
      await loadAndPlay();
      return;
    }

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (e) {
      console.warn("Play toggle failed", e);
    }
  };

  const resetAudio = async () => {
    if (sound) {
      try {
        await sound.setPositionAsync(0);
        await sound.playAsync();
      } catch (e) {
        console.warn("Reset failed", e);
      }
    }
  };

  const formatTime = (millis) => {
    if (!millis || isNaN(millis)) return '0:00';
    const totalSeconds = millis / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const getProgress = () => {
    if (duration === 0) return 0;
    return (position / duration) * 100;
  };

  return (
    <View style={styles.playerContainer}>
      <View style={styles.headerRow}>
        <Volume2 color="#0A2B5E" size={18} />
        <Text style={styles.playerTitle}>Guide Audio Narration</Text>
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity 
          style={styles.controlBtn} 
          onPress={togglePlay}
          disabled={isLoading || !audioUrl}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : isPlaying ? (
            <Pause color="#FFF" size={20} fill="#FFF" />
          ) : (
            <Play color="#FFF" size={20} fill="#FFF" style={{ marginLeft: 3 }} />
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.smallControlBtn, !sound && styles.disabledBtn]} 
          onPress={resetAudio}
          disabled={!sound}
        >
          <RotateCcw color="#0A2B5E" size={16} />
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <View style={styles.timelineBg}>
            <View style={[styles.timelineFill, { width: `${getProgress()}%` }]} />
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  playerContainer: {
    backgroundColor: '#EEEEE8',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1.5,
    borderColor: '#B4B813', // Jardin Majorelle Lemon Yellow
    marginVertical: 15,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  playerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0A2B5E',
    letterSpacing: 0.5,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  controlBtn: {
    backgroundColor: '#0A2B5E', // Majorelle Blue
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0A2B5E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  smallControlBtn: {
    backgroundColor: 'rgba(10, 43, 94, 0.08)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  progressContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  timelineBg: {
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
    width: '100%',
    overflow: 'hidden',
  },
  timelineFill: {
    height: '100%',
    backgroundColor: '#127A3A', // Cactus Green
    borderRadius: 2,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#68778D',
  },
});
