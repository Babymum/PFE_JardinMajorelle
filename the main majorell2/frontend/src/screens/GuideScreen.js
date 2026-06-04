import React, { useState, useEffect, useRef, cloneElement } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  ActivityIndicator,
  Keyboard,
  Platform,
  Image,
  KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Send, Bot, Volume2, ArrowLeft, Pause, Play } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { getZones, sendMessageToGuide, synthesizeSpeech } from '../../api/api';

export default function GuideScreen({ navigation }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome_1',
      sender: 'bot',
      text: "Bonjour et bienvenue au Jardin Majorelle. Je suis votre guide virtuel et je serai ravi de vous accompagner dans la découverte de ce lieu emblématique imaginé par Jacques Majorelle puis restauré par Yves Saint Laurent et Pierre Bergé. Vous pouvez me poser des questions sur l’histoire du jardin,les plantes exotiques et les cactus,l’architecture et le célèbre bleu Majorelle,les bassins, fontaines et espaces emblématiques,le Musée Berbère,ou encore les inspirations artistiques et culturelles du lieu. Je répondrai uniquement aux questions liées au Jardin Majorelle et à son univers. Je reste à votre disposition pour vous faire découvrir les merveilles du jardin !"
    }
  ]);
  const defaultZones = [
    {
      _id: 'default-villa',
      nom: 'Villa Bleue',
      typeZone: 'villa_bleue',
      description: 'La Villa Bleue est un symbole du Jardin Majorelle. Elle se distingue par son bleu cobalt, ses balcons et ses jardins luxuriants.',
    },
    {
      _id: 'default-cactus',
      nom: 'Jardins de Cactus',
      typeZone: 'jardin_cactus',
      description: 'Le jardin de cactus présente une collection de plantes grasses, d’agaves et d’aloès venues de climats arides.',
    },
    {
      _id: 'default-lilies',
      nom: 'Bassin central',
      typeZone: 'bassin',
      description: 'Le bassin central apporte calme et fraîcheur au jardin avec ses nénuphars et ses reflets bleus.',
    },
    {
      _id: 'default-museum',
      nom: 'Musée Berbère',
      typeZone: 'musee_berbere',
      description: 'Le Musée Berbère présente des objets, bijoux et textiles amazighs dans l’ancienne maison de Jacques Majorelle.',
    },
    {
      _id: 'default-bamboo',
      nom: 'Jardin de Bambous',
      typeZone: 'jardin_bambou',
      description: 'La forêt de bambous offre une promenade ombragée et apaisante au cœur du Jardin Majorelle.',
    },
    {
      _id: 'default-allee',
      nom: 'Allées du jardin',
      typeZone: 'allee_jardin',
      description: 'Les allées du jardin relient les espaces emblématiques et offrent de belles perspectives sur la végétation et l’architecture.',
    },
    {
      _id: 'default-cafe-majorelle',
      nom: 'Café Majorelle',
      typeZone: 'cafe_majorelle',
      description: 'Le Café Majorelle propose une pause gourmande dans un cadre verdoyant et élégant.',
    },
    {
      _id: 'default-cafe-bousafsaf',
      nom: 'Café Bousafsaf',
      typeZone: 'cafe_bousafsaf',
      description: 'Le Café Bousafsaf offre un moment de détente paisible à l’ombre des arbres.',
    },
    {
      _id: 'default-boutique',
      nom: 'Boutique',
      typeZone: 'boutique',
      description: 'La boutique propose des objets, livres et souvenirs inspirés par le Jardin Majorelle.',
    },
    {
      _id: 'default-librairie',
      nom: 'Librairie',
      typeZone: 'librairie',
      description: 'La librairie réunit des ouvrages sur l’art, la botanique et la culture marocaine.',
    },
  ];

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [gardenContext, setGardenContext] = useState('Jardin Majorelle in Marrakech.');
  const [zones, setZones] = useState(defaultZones);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeechPaused, setIsSpeechPaused] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [useElevenLabsVoice, setUseElevenLabsVoice] = useState(false);
  const [speechVoiceId, setSpeechVoiceId] = useState(null);
  const scrollViewRef = useRef(null);
  const speechRunRef = useRef(0);
  const pauseRequestedRef = useRef(false);
  const soundRef  = useRef(null);
  const playerRef = useRef(null);

  const zoneImageMap = {
    bassin: require('../../assets/images/bassin.png'),
    jardin_bambou: require('../../assets/images/jardin-bambou.png'),
    jardin_cactus: require('../../assets/images/jardin-cactus.png'),
    musee_berbere: require('../../assets/images/musee-berbere.png'),
    villa_bleue: require('../../assets/images/villa-bleue.png'),
    boutique: require('../../assets/images/boutique.jpg'),
    librairie: require('../../assets/images/librairie.jpg'),
    allee_jardin: require('../../assets/images/allees.jpg'),
    cafe_majorelle: require('../../assets/images/cafe-majorelle.jpg'),
    cafe_bousafsaf: require('../../assets/images/cafe-bousafsaf.jpeg'),
  };

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

  const zoneVoiceTextMap = {
    villa_bleue: 'La Villa Bleue est un symbole du Jardin Majorelle. Elle se distingue par son bleu cobalt, ses balcons et ses jardins luxuriants.',
    jardin_cactus: 'Le jardin de cactus présente une collection de plantes grasses, d’agaves et d’aloès venues de climats arides.',
    bassin: 'Le bassin central apporte calme et fraîcheur au jardin avec ses nénuphars et ses reflets bleus.',
    musee_berbere: 'Le Musée Berbère présente des objets, bijoux et textiles amazighs dans l’ancienne maison de Jacques Majorelle.',
    jardin_bambou: 'La forêt de bambous offre une promenade ombragée et apaisante au cœur du Jardin Majorelle.',
    allee_jardin: 'Les allées du jardin relient les espaces emblématiques et offrent de belles perspectives sur la végétation et l’architecture.',
    cafe_majorelle: 'Le Café Majorelle propose une pause gourmande dans un cadre verdoyant et élégant.',
    cafe_bousafsaf: 'Le Café Bousafsaf offre un moment de détente paisible à l’ombre des arbres.',
    boutique: 'La boutique propose des objets, livres et souvenirs inspirés par le Jardin Majorelle.',
    librairie: 'La librairie réunit des ouvrages sur l’art, la botanique et la culture marocaine.',
  };

  const normalizeText = (value) =>
    value
      ? value
          .toString()
          .trim()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
      : '';

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

const getZoneAudioSource = (zone) => {
const key = normalizeZoneType(zone?.typeZone);
return zoneAudioMap[key] || null;
};


  const playAudioSource = async (source, messageId = null) => {
    try {
      if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }


    const { sound } = await Audio.Sound.createAsync(
      source,
      { shouldPlay: true, progressUpdateIntervalMillis: 250 },
      (status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsSpeaking(false);
          setIsSpeechPaused(false);
          setSpeakingMessageId(null);
          if (soundRef.current) {
            soundRef.current.unloadAsync().catch(() => {});
          }
          soundRef.current = null;
        }
      }
    );

soundRef.current = sound;
setIsSpeaking(true);
setIsSpeechPaused(false);
setSpeakingMessageId(messageId);

} catch (error) {
console.error('Erreur lecture audio:', error.message);
}
};

 /* const getZoneAudioSource = (zone) => {
    const key = zone?.typeZone ? zone.typeZone.toLowerCase() : null;
    return zoneAudioMap[key] || null;
  };*/

  const getZoneImageSource = (zone) => {
    if (zone?.image && /^https?:\/\//i.test(zone.image)) {
      return { uri: zone.image };
    }

    const key = normalizeZoneType(zone?.typeZone);
    return zoneImageMap[key] || require('../../assets/images/villa-bleue.png');
  };

  const getZoneVoiceText = (zone) => {
    const key = normalizeZoneType(zone?.typeZone);
    return zoneVoiceTextMap[key] || zone?.description || 'Cette zone fait partie du Jardin Majorelle.';
  };

  const hasLocalZoneAudio = (zone) => !!getZoneAudioSource(zone);

  const getZoneName = (zone) => {
    const type = normalizeZoneType(zone?.typeZone);

    if (type === 'villa_bleue') return 'Villa Bleue';
    if (type === 'jardin_cactus') return 'jardin de cactus';
    if (type === 'bassin') return 'bassin central';
    if (type === 'musee_berbere') return 'musée berbère';
    if (type === 'jardin_bambou') return 'forêt de bambous';
    if (type === 'allee_jardin') return 'allées du jardin';
    if (type === 'cafe_majorelle') return 'Café Majorelle';
    if (type === 'cafe_bousafsaf') return 'Café Bousafsaf';
    if (type === 'boutique') return 'Boutique';
    if (type === 'librairie') return 'Librairie';

    return zone?.nom || zone?.typeZone?.replace(/_/g, ' ') || 'cette zone';
  };

  const getZoneArticle = (type) => {
    if (type === 'villa_bleue' || type === 'boutique' || type === 'librairie' || type === 'jardin_bambou') return 'La';
    if (type === 'allee_jardin') return 'Les';
    return 'Le';
  };

  const getZoneQuestionPrefix = (zone) => {
    const type = zone?.typeZone?.toLowerCase();

    if (type === 'allee_jardin') return 'des';
    if (type === 'villa_bleue' || type === 'boutique' || type === 'librairie' || type === 'jardin_bambou') return 'de la';

    return 'du';
  };

  const getZoneQuery = (zone) => {
    const zoneName = getZoneName(zone);
    if (zoneName) return `Parle-moi ${getZoneQuestionPrefix(zone)} ${zoneName}.`;
    return 'Parle-moi du Jardin Majorelle.';
  };

  const getLocalGuideReply = (text) => {
    const query = normalizeText(text);
    const allZones = [...defaultZones, ...zones];

    const zoneMatch = allZones.find((zone) => {
      const normalizedType = normalizeText(zone.typeZone).replace(/_/g, ' ');
      return query.includes(normalizeText(zone.nom)) || query.includes(normalizedType);
    });

    if (zoneMatch) {
      return getZoneVoiceText(zoneMatch);
    }

    if (
      query.includes('qui a cree') ||
      query.includes('createur') ||
      query.includes('fondateur') ||
      query.includes('jacques majorelle') ||
      query.includes('histoire') ||
      query.includes('yves') ||
      query.includes('saint laurent') ||
      query.includes('restauration')
    ) {
      return 'Le Jardin Majorelle a été créé par Jacques Majorelle en 1923. Yves Saint Laurent et Pierre Bergé l’ont ensuite restauré et préservé avec soin.';
    }

    if (query.includes('plant') || query.includes('plante') || query.includes('botan') || query.includes('espece') || query.includes('espèce')) {
      return 'Le Jardin Majorelle abrite une collection très riche de plantes. On y trouve des cactus, des palmiers, des bambous, des nénuphars et des bougainvilliers.';
    }

    if (query.includes('zone') || query.includes('zones') || query.includes('parties')) {
      return 'Le jardin comprend la Villa Bleue, le jardin de cactus, le bassin central, le musée berbère, la forêt de bambous, les allées du jardin, ainsi que les cafés, la boutique et la librairie.';
    }

    return 'Bienvenue au Jardin Majorelle ! Je peux vous renseigner sur la Villa Bleue, le musée berbère, le jardin de cactus, le bassin central, la forêt de bambous, les cafés, la boutique ou la librairie.';
  };

  // Monitor keyboard visibility to dynamically adjust input position
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Fetch context when the screen loads
  useEffect(() => {
    const fetchContext = async () => {
      try {
        const fetchedZones = await getZones();
        if (fetchedZones?.length) {
          setZones(fetchedZones);
        }
        const briefContext = (fetchedZones?.length ? fetchedZones : defaultZones)
          .map(z => `${z.nom}: ${z.description ? z.description.substring(0, 80) : 'Point of interest'}`)
          .join('\n');
        setGardenContext(briefContext);
      } catch (err) {
        console.warn("Could not fetch garden context", err);
      }
    };
    fetchContext();
  }, []);

  useEffect(() => {
    return () => {
      speechRunRef.current += 1;
      pauseRequestedRef.current = false;
      Speech.stop();
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadFrenchVoice = async () => {
      try {
        const voices = await Speech.getAvailableVoicesAsync();
        if (!mounted || !voices?.length) return;

        const preferredVoice =
          voices.find((voice) => normalizeText(voice.language).startsWith('fr')) ||
          voices.find((voice) => normalizeText(voice.name).includes('french')) ||
          voices.find((voice) => normalizeText(voice.name).includes('fr'));

        if (preferredVoice?.identifier) {
          setSpeechVoiceId(preferredVoice.identifier);
        }
      } catch (error) {
        // On garde la voix système par défaut si la liste n'est pas disponible
      }
    };

    loadFrenchVoice();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    // Add User Message
    const userMsg = { id: Date.now().toString(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Scroll to end
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      // 1. Attempt to communicate with the Backend AI Guide
      const guideText = `Réponds uniquement en français au sujet du Jardin Majorelle. ${text}`;
      console.log("Sending chat request to backend...");
      const response = await sendMessageToGuide(guideText);
      
      const botMsg = { id: Date.now().toString(), sender: 'bot', text: response };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      playGuideAudio(response, botMsg.id);
    } catch (error) {
      console.warn("Backend ChatGPT failed quickly:", error.message);
      const fallbackText = getLocalGuideReply(text);
      const localReply = {
        id: Date.now().toString(),
        sender: 'bot',
        text: fallbackText,
      };
      setMessages(prev => [...prev, localReply]);
      setIsTyping(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      playGuideAudio(fallbackText, localReply.id);
    }
  };

  const handleKnownZonePress = async (zone) => {
    const query = getZoneQuery(zone);
    const audioSource = getZoneAudioSource(zone);
    const replyText = getZoneVoiceText(zone);

    const userMsg = { id: Date.now().toString(), sender: 'user', text: query };
    const botMsg = {
      id: `${Date.now()}_zone`,
      sender: 'bot',
      text: replyText,
      audioSource,
    };

    setMessages(prev => [...prev, userMsg, botMsg]);
    setInputText('');
    setIsTyping(false);
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    if (audioSource) {
      await playLocalAudio(audioSource, botMsg.id);
      return;
    }

    playGuideAudio(replyText, botMsg.id);
  };

  const resetSpeechState = (runId) => {
    if (runId !== speechRunRef.current) return;
    setIsSpeaking(false);
    setIsSpeechPaused(false);
    setSpeakingMessageId(null);
  };

  const stopCurrentAudio = async () => {
    try {
      if (playerRef.current) {
        await playerRef.current.stopAsync();
        await playerRef.current.unloadAsync();
        playerRef.current = null;
      }
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    } catch (error) {
      // Ignorer les erreurs de libération
    }
    await Speech.stop();
  };

  const playLocalAudio = async (audioSource, messageId = null) => {
    try {
      speechRunRef.current += 1;
      pauseRequestedRef.current = false;
      const runId = speechRunRef.current;

      await stopCurrentAudio();

      setIsSpeaking(true);
      setIsSpeechPaused(false);
      setSpeakingMessageId(messageId);

      const { sound } = await Audio.Sound.createAsync(
        audioSource,
        { shouldPlay: true, progressUpdateIntervalMillis: 250 },
        (status) => {
          if (runId !== speechRunRef.current || !status.isLoaded) return;
          if (status.didJustFinish) {
            resetSpeechState(runId);
            stopCurrentAudio();
          }
        }
      );

      playerRef.current = sound;
    } catch (error) {
      pauseRequestedRef.current = false;
      setIsSpeaking(false);
      setIsSpeechPaused(false);
      setSpeakingMessageId(null);
      console.error('❌ Erreur lecture audio locale:', error.message);
    }
  };

  const playGuideAudio = async (text, messageId = null) => {
    try {
      await stopCurrentAudio();
      speechRunRef.current += 1;
      const runId = speechRunRef.current;
      setIsSpeaking(true);
      setIsSpeechPaused(false);
      setSpeakingMessageId(messageId);

      const speakLocally = () => {
        Speech.speak(text, {
          language: 'fr-FR',
          rate: 0.92,
          pitch: 0.97,
          voice: speechVoiceId || undefined,
          onDone: () => resetSpeechState(runId),
          onStopped: () => resetSpeechState(runId),
          onError: () => resetSpeechState(runId),
        });
      };

      if (useElevenLabsVoice) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 1800);
          const speech = await synthesizeSpeech(text, { signal: controller.signal });
          clearTimeout(timeoutId);

          const audioUri = `data:${speech.mimeType || 'audio/mpeg'};base64,${speech.audioContent}`;
          await playAudioSource({ uri: audioUri }, messageId);
          return;
        } catch (premiumError) {
          console.warn(
            'ElevenLabs indisponible, retour automatique a la voix locale:',
            premiumError.message
          );
        }
      }

      speakLocally();
    } catch (error) {
      console.error('Erreur lecture de secours:', error.message);
    }
  };

  const handleAudioButtonPress = async (messageId, text, audioSource = null) => {
    const isCurrentMessage = speakingMessageId === messageId;
    const isLocalAudio = !!audioSource;

    try {
      if (isCurrentMessage && isSpeechPaused) {
        pauseRequestedRef.current = false;
        if (isLocalAudio) {
          await playerRef.current?.playAsync();
        } else {
          await Speech.resume();
        }
        setIsSpeaking(true);
        setIsSpeechPaused(false);
        console.log('▶️ Reprise de la synthèse vocale');
        return;
      }

      if (isCurrentMessage && isSpeaking) {
        try {
          pauseRequestedRef.current = true;
          if (isLocalAudio) {
            await playerRef.current?.pauseAsync();
          } else {
            await Speech.pause();
          }
          setIsSpeaking(false);
          setIsSpeechPaused(true);
          console.log('⏸️ Pause de la synthèse vocale');
        } catch (pauseError) {
          pauseRequestedRef.current = false;
          if (isLocalAudio) {
            await playerRef.current?.stopAsync();
          } else {
            await Speech.stop();
          }
          setIsSpeaking(false);
          setIsSpeechPaused(false);
          setSpeakingMessageId(null);
          console.log('⏹️ Pause indisponible, synthèse vocale arrêtée');
        }
        return;
      }

      if (isLocalAudio) {
        await playLocalAudio(audioSource, messageId);
      } else {
        playGuideAudio(text, messageId);
      }
    } catch (error) {
      pauseRequestedRef.current = false;
      setIsSpeaking(false);
      setIsSpeechPaused(false);
      setSpeakingMessageId(null);
      console.error('❌ Erreur contrôle audio:', error.message);
    }
  };

  const getAudioIcon = (messageId) => {
    if (speakingMessageId === messageId && isSpeechPaused) {
      return <Play color="#127A3A" size={18} />;
    }

    if (speakingMessageId === messageId && isSpeaking) {
      return <Pause color="#127A3A" size={18} />;
    }

    return <Volume2 color="#0A2B5E" size={18} />;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={'padding'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={10}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backBtn}>
            <ArrowLeft color="#0A2B5E" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>JARDIN MAJORELLE</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={{ flex: 1 }}>
          <ScrollView 
            ref={scrollViewRef}
            style={styles.container} 
            contentContainerStyle={[styles.scrollContent, { paddingBottom: 140 }]}
            keyboardShouldPersistTaps='handled'
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
          <View style={styles.titleSection}>
            <View style={styles.titleHeaderRow}>
              <View style={styles.titleBadge}><Text style={styles.titleBadgeText}>GUIDE IA</Text></View>
              <Text style={styles.subtitle}>Jardin Majorelle</Text>
            </View>
            <Text style={styles.title1}>Demandez au</Text>
            <Text style={styles.title2}>Guide du <Text style={styles.titleHighlight}>Jardin Majorelle</Text></Text>
            <Text style={styles.description}>
              Posez des questions uniquement sur le Jardin Majorelle : histoire, botanique, architecture, musée, et zones iconiques.
            </Text>
          </View>

          <View style={styles.voiceModeRow}>
            <View style={styles.voiceModeTextBlock}>
              <Text style={styles.voiceModeLabel}>Mode voix</Text>
              <Text style={styles.voiceModeHint}>
                {useElevenLabsVoice ? 'Voix IA activée si le réseau répond vite' : 'Voix locale instantanée'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.voiceModeToggle, useElevenLabsVoice && styles.voiceModeToggleActive]}
              onPress={() => setUseElevenLabsVoice(prev => !prev)}
            >
              <Text style={[styles.voiceModeToggleText, useElevenLabsVoice && styles.voiceModeToggleTextActive]}>
                {useElevenLabsVoice ? 'ElevenLabs' : 'Local'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.contextCard}>
            <Text style={styles.contextTitle}>Contexte du jardin</Text>
            <Text style={styles.contextText}>{gardenContext || 'Chargement des informations...'}</Text>
            <Text style={styles.contextHint}>Le guide parle uniquement du Jardin Majorelle et de ses espaces.</Text>
          </View>

          {/* Interactive Zone Gallery */}
          <View style={styles.galleryWrapper}>
            <Text style={styles.galleryTitle}>CLIQUER SUR UNE ZONE POUR AVOIR PLUS D'INFORMATIONS</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.galleryContainer}
            >
              {zones.map((zone) => (
                <TouchableOpacity
                  key={zone._id || zone.nom}
                  style={styles.galleryCard}
                  onPress={() => handleKnownZonePress(zone)}
                >
                  <Image source={getZoneImageSource(zone)} style={styles.galleryImage} resizeMode="cover" />
                  {hasLocalZoneAudio(zone) && (
                    <View style={styles.audioBadge}>
                      <Text style={styles.audioBadgeText}>audio local</Text>
                    </View>
                  )}
                  <LinearGradient colors={['transparent', 'rgba(10, 43, 94, 0.95)']} style={styles.galleryGradient}>
                    <Text style={styles.galleryCardText}>{zone.nom}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Zone Information Cards liste des zones */}
          {/* <View style={styles.zoneListWrapper}>
            <Text style={styles.zoneListTitle}>Toutes les zones</Text> 
            {zones.map((zone) => (
              <View key={zone._id || zone.nom} style={styles.zoneInfoCard}>
                <View style={styles.zoneInfoHeader}>
                  <Text style={styles.zoneInfoName}>{zone.nom}</Text>
                  <TouchableOpacity onPress={() => handleSend(getZoneQuery(zone))} style={styles.zoneActionBtn}>
                    <Text style={styles.zoneActionText}>En savoir plus</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.zoneInfoDesc}>{zone.description || 'Description du jardin en cours de chargement.'}</Text>
              </View>
            ))}
          </View>*/}

          {/* Chat Area */}
          <View style={styles.chatArea}>
            {messages.map((msg) => {
              if (msg.sender === 'user') {
                return (
                  <View key={msg.id} style={styles.userMessageBlock}>
                    <View style={styles.userBubble}>
                      <Text style={styles.userText}>{msg.text}</Text>
                    </View>
                  </View>
                );
              } else {
                return (
                  <View key={msg.id} style={styles.botMessageBlock}>
                    <View style={styles.botIconRow}>
                      <View style={styles.botIconBg}><Bot color="#FFF" size={16} /></View>
                      <Text style={styles.botName}> Guide du Jardin Majorelle </Text>
                      {msg.audioSource && (
                        <View style={styles.botAudioBadge}>
                          <Text style={styles.botAudioBadgeText}>audio local</Text>
                        </View>
                      )}
                      <TouchableOpacity onPress={() => handleAudioButtonPress(msg.id, msg.text, msg.audioSource)} style={{ marginLeft: 'auto' }}>
                        {getAudioIcon(msg.id)}
                      </TouchableOpacity>
                    </View>
                    <View style={styles.botBubble}>
                      <Text style={styles.botDesc}>{msg.text}</Text>
                    </View>
                  </View>
                );
              }
            })}

            {isTyping && (
               <View style={styles.botMessageBlock}>
                 <View style={styles.botIconRow}>
                  <View style={styles.botIconBg}><Bot color="#FFF" size={16} /></View>
                  <Text style={styles.botName}> Guide du Jardin Majorelle </Text>
                </View>
                <ActivityIndicator size="small" color="#0A2B5E" style={{ alignSelf: 'flex-start', marginLeft: 20 }} />
              </View>
            )}
          </View>

          </ScrollView>
        </View>

        {/* Input Area */}
        <View style={[
          styles.inputContainer, 
          { marginBottom: isKeyboardVisible ? (Platform.OS === 'ios' ? 10 : 15) : 55 }
        ]}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity style={styles.addBtn} onPress={() => Alert.alert('Attachment', 'Attach an image to the AI Guide')}>
              <Plus color="#FFF" size={20} />
            </TouchableOpacity>
            <TextInput 
              style={styles.textInput} 
              placeholder="Posez votre question..." 
              placeholderTextColor="#8C9BB0"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => handleSend()}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={() => handleSend()}>
              <Send color="#FFF" size={18} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F8F4',
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
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  titleSection: {
    borderLeftWidth: 3,
    borderColor: '#4E5E2D',
    paddingLeft: 15,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 10,
    color: '#127A3A',
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 5,
  },
  title1: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0A2B5E',
  },
  title2: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0A2B5E',
    marginBottom: 10,
  },
  titleHighlight: {
    color: '#127A3A',
    fontStyle: 'italic',
  },
  voiceModeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(10, 43, 94, 0.08)',
  },
  voiceModeTextBlock: {
    flex: 1,
    paddingRight: 12,
  },
  voiceModeLabel: {
    color: '#0A2B5E',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 3,
  },
  voiceModeHint: {
    color: '#68778D',
    fontSize: 12,
    lineHeight: 17,
  },
  voiceModeToggle: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#EAE6DF',
    borderWidth: 1,
    borderColor: 'rgba(10, 43, 94, 0.12)',
  },
  voiceModeToggleActive: {
    backgroundColor: '#0A2B5E',
    borderColor: '#0A2B5E',
  },
  voiceModeToggleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0A2B5E',
    letterSpacing: 0.5,
  },
  voiceModeToggleTextActive: {
    color: '#FFF',
  },
  titleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleBadge: {
    backgroundColor: '#B4B813',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 10,
  },
  titleBadgeText: {
    color: '#0A2B5E',
    fontWeight: '700',
    fontSize: 10,
    letterSpacing: 1,
  },
  description: {
    color: '#68778D',
    lineHeight: 22,
    fontSize: 14,
  },
  contextCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  contextTitle: {
    fontSize: 12,
    color: '#127A3A',
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  contextText: {
    color: '#0A2B5E',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 10,
  },
  contextHint: {
    fontSize: 12,
    color: '#68778D',
  },
  galleryWrapper: {
    marginVertical: 15,
    marginBottom: 25,
  },
  galleryTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0A2B5E',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  galleryContainer: {
    flexDirection: 'row',
    paddingBottom: 10,
    paddingTop: 5,
  },
  galleryCard: {
    width: 130,
    height: 160,
    borderRadius: 22,
    overflow: 'hidden',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#B4B813',
    backgroundColor: '#F6F4EE',
  },
  audioBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
    backgroundColor: 'rgba(10, 43, 94, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  audioBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  galleryGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    padding: 10,
  },
  galleryCardText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  zoneListWrapper: {
    marginBottom: 20,
  },
  zoneListTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0A2B5E',
    letterSpacing: 1.3,
    marginBottom: 12,
  },
  zoneInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  zoneInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  zoneInfoName: {
    color: '#0A2B5E',
    fontWeight: '700',
    fontSize: 14,
    flex: 1,
    marginRight: 12,
  },
  zoneInfoDesc: {
    color: '#4B5563',
    fontSize: 13,
    lineHeight: 20,
  },
  zoneActionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#127A3A',
    borderRadius: 18,
  },
  zoneActionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  chatArea: {
    width: '100%',
  },
  userMessageBlock: {
    alignItems: 'flex-end',
    marginBottom: 30,
  },
  userBubble: {
    backgroundColor: '#0A3A69',
    padding: 20,
    borderRadius: 25,
    borderBottomRightRadius: 5,
    maxWidth: '85%',
  },
  userText: {
    color: '#FFF',
    fontSize: 14,
    lineHeight: 22,
  },
  botMessageBlock: {
    marginBottom: 30,
  },
  botIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  botIconBg: {
    backgroundColor: '#127A3A', // Cactus Green!
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  botName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#127A3A',
    letterSpacing: 1,
  },
  botAudioBadge: {
    marginLeft: 8,
    backgroundColor: '#E9F4ED',
    borderWidth: 1,
    borderColor: '#BEE3C5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  botAudioBadgeText: {
    color: '#127A3A',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  botBubble: {
    backgroundColor: '#FFF',
    borderRadius: 30,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  botDesc: {
    color: '#0A2B5E',
    fontSize: 14,
    lineHeight: 24,
  },
  inputContainer: {
    paddingHorizontal: 20,
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F1E9',
    borderRadius: 30,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  addBtn: {
    backgroundColor: '#127A3A', // Cactus Green!
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    marginHorizontal: 15,
    color: '#0A2B5E',
  },
  sendBtn: {
    backgroundColor: '#0A3A69',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
