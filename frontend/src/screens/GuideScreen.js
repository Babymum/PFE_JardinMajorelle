import React, { useState, useEffect, useRef } from 'react';
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
import { useTranslation } from 'react-i18next';

export default function GuideScreen({ navigation }) {
  const { t, i18n } = useTranslation();

  const [messages, setMessages] = useState([
    {
      id: 'welcome_1',
      sender: 'bot',
      text: '' // dynamically computed from t('guide_bot_welcome') in UI to support hot-swapping languages
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
  const soundRef = useRef(null);
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

  const getZoneImageSource = (zone) => {
    if (zone?.image && /^https?:\/\//i.test(zone.image)) {
      return { uri: zone.image };
    }
    const design = getZoneDesignProps(zone?.typeZone);
    return design?.fallbackImage || zoneImageMap[normalizeZoneType(zone?.typeZone)] || require('../../assets/majorelle_villa.png');
  };

  const getZoneVoiceText = (zone) => {
    return t('zone_desc_' + zone?.typeZone, zone?.description || 'Cette zone fait partie du Jardin Majorelle.');
  };

  const hasLocalZoneAudio = (zone) => !!getZoneAudioSource(zone);

  const getZoneName = (zone) => {
    return t('zone_name_' + zone?.typeZone, zone?.nom || 'cette zone');
  };

  const getZoneQuery = (zone) => {
    const zoneName = getZoneName(zone);
    return t('guide_prompt_prefix', { name: zoneName });
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
      query.includes('qui a cree') || query.includes('createur') || query.includes('fondateur') || query.includes('creator') || query.includes('founder') ||
      query.includes('jacques majorelle') ||
      query.includes('histoire') || query.includes('history') ||
      query.includes('yves') ||
      query.includes('saint laurent') ||
      query.includes('restauration') || query.includes('restore')
    ) {
      return t('guide_offline_history');
    }

    if (query.includes('plant') || query.includes('plante') || query.includes('botan') || query.includes('espece') || query.includes('espèce') || query.includes('species')) {
      return t('guide_offline_plants');
    }

    if (query.includes('zone') || query.includes('zones') || query.includes('parties') || query.includes('parts')) {
      return t('guide_offline_zones');
    }

    return t('guide_local_fallback');
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

    const loadVoiceForLang = async () => {
      try {
        const voices = await Speech.getAvailableVoicesAsync();
        if (!mounted || !voices?.length) return;

        const targetPrefix = i18n.language || 'en';
        const preferredVoice =
          voices.find((voice) => normalizeText(voice.language).startsWith(targetPrefix)) ||
          voices.find((voice) => normalizeText(voice.name).includes(targetPrefix));

        if (preferredVoice?.identifier) {
          setSpeechVoiceId(preferredVoice.identifier);
        } else {
          setSpeechVoiceId(null);
        }
      } catch (error) {
        setSpeechVoiceId(null);
      }
    };

    loadVoiceForLang();

    return () => {
      mounted = false;
    };
  }, [i18n.language]);

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
      // 1. Attempt to communicate with the Backend AI Guide in current language
      const systemInstructions = {
        en: "Respond only in English about Jardin Majorelle.",
        fr: "Réponds uniquement en français au sujet du Jardin Majorelle.",
        ar: "الرجاء الرد باللغة العربية فقط حول حديقة ماجوريل."
      };
      const langPrefix = systemInstructions[i18n.language] || systemInstructions.en;
      const guideText = `${langPrefix} ${text}`;

      console.log("Sending chat request to backend...");
      const response = await sendMessageToGuide(guideText);
      
      const botMsg = { id: Date.now().toString(), sender: 'bot', text: response };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      playGuideAudio(response, botMsg.id);
    } catch (error) {
      console.warn("Backend ChatGPT failed quickly:", error.message);
      
      // 2. Direct client-side fetch fallback to keyless Pollinations AI ChatGPT
      try {
        const targetLang = i18n.language || 'en';
        const systemPrompt = `You are the digital concierge for Jardin Majorelle. Respond under 3 sentences only in language: ${targetLang}.`;
        
        console.log("Querying keyless Pollinations AI ChatGPT directly from client via GET...");
        const pollinationResponse = await fetch(`https://text.pollinations.ai/${encodeURIComponent(text)}?system=${encodeURIComponent(systemPrompt)}`);

        if (!pollinationResponse.ok) {
          throw new Error(`Pollinations API failed with status ${pollinationResponse.status}`);
        }

        const reply = await pollinationResponse.text();
        console.log("✅ Client-side keyless ChatGPT fallback succeeded!");
        
        const botMsg = { id: Date.now().toString(), sender: 'bot', text: reply };
        setMessages(prev => [...prev, botMsg]);
        setIsTyping(false);
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        playGuideAudio(reply, botMsg.id);
      } catch (fallbackError) {
        console.warn("❌ Client-side fallback also failed:", fallbackError.message);
        
        // 3. Client-side offline response fallback
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

    // Play high quality local voice MP3 only if current language is French
    if (i18n.language === 'fr' && audioSource) {
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
      // Ignorer
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
      console.error('Erreur lecture audio locale:', error.message);
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
        const targetLang = i18n.language === 'ar' ? 'ar-SA' : (i18n.language === 'fr' ? 'fr-FR' : 'en-US');
        Speech.speak(text, {
          language: targetLang,
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
            'ElevenLabs indisponible, retour automatique à la voix locale:',
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
    const isLocalAudio = !!audioSource && i18n.language === 'fr';

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
        console.log('Reprise de la synthèse vocale');
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
          console.log('Pause de la synthèse vocale');
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
          console.log('Pause indisponible, synthèse vocale arrêtée');
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
      console.error('Erreur contrôle audio:', error.message);
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backBtn}>
            <ArrowLeft color="#0A2B5E" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('guide_title')}</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={{ flex: 1 }}>
          <ScrollView 
            ref={scrollViewRef}
            style={styles.container} 
            contentContainerStyle={[styles.scrollContent, { paddingBottom: 140 }]}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            <View style={styles.titleSection}>
              <View style={styles.titleHeaderRow}>
                <View style={styles.titleBadge}><Text style={styles.titleBadgeText}>{t('guide_concierge')}</Text></View>
                <Text style={styles.subtitle}>{t('app_title')}</Text>
              </View>
              <Text style={styles.title1}>{t('guide_explore_prefix')}</Text>
              <Text style={styles.title2}>
                {t('guide_explore_middle')} <Text style={styles.titleHighlight}>{t('guide_explore_highlight')}</Text>
              </Text>
              <Text style={styles.description}>
                {t('guide_bot_welcome')}
              </Text>
            </View>

            {/* Voice Mode Selector */}
            <View style={styles.voiceModeRow}>
              <View style={styles.voiceModeTextBlock}>
                <Text style={styles.voiceModeLabel}>{t('guide_voice_mode_label')}</Text>
                <Text style={styles.voiceModeHint}>
                  {useElevenLabsVoice ? t('guide_voice_mode_premium_hint') : t('guide_voice_mode_local_hint')}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.voiceModeToggle, useElevenLabsVoice && styles.voiceModeToggleActive]}
                onPress={() => setUseElevenLabsVoice(prev => !prev)}
              >
                <Text style={[styles.voiceModeToggleText, useElevenLabsVoice && styles.voiceModeToggleTextActive]}>
                  {useElevenLabsVoice ? 'ElevenLabs' : t('guide_voice_mode_local_btn')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Interactive Zone Gallery */}
            <View style={styles.galleryWrapper}>
              <Text style={styles.galleryTitle}>{t('guide_tap_zone')}</Text>
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
                    {hasLocalZoneAudio(zone) && i18n.language === 'fr' && (
                      <View style={styles.audioBadge}>
                        <Text style={styles.audioBadgeText}>{t('guide_audio_local_badge')}</Text>
                      </View>
                    )}
                    <LinearGradient colors={['transparent', 'rgba(10, 43, 94, 0.95)']} style={styles.galleryGradient}>
                      <Text style={styles.galleryCardText}>{getZoneName(zone)}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

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
                  const displayMessageText = msg.id === 'welcome_1' ? t('guide_bot_welcome') : msg.text;
                  const isFrenchLocalAudio = msg.audioSource && i18n.language === 'fr';
                  return (
                    <View key={msg.id} style={styles.botMessageBlock}>
                      <View style={styles.botIconRow}>
                        <View style={styles.botIconBg}><Bot color="#FFF" size={16} /></View>
                        <Text style={styles.botName}>{t('guide_bot_name')}</Text>
                        {isFrenchLocalAudio && (
                          <View style={styles.botAudioBadge}>
                            <Text style={styles.botAudioBadgeText}>{t('guide_audio_local_badge')}</Text>
                          </View>
                        )}
                        <TouchableOpacity 
                          onPress={() => handleAudioButtonPress(msg.id, displayMessageText, isFrenchLocalAudio ? msg.audioSource : null)} 
                          style={{ marginLeft: 'auto' }}
                        >
                          {getAudioIcon(msg.id)}
                        </TouchableOpacity>
                      </View>
                      <View style={styles.botBubble}>
                        <Text style={styles.botDesc}>{displayMessageText}</Text>
                      </View>
                    </View>
                  );
                }
              })}

              {isTyping && (
                 <View style={styles.botMessageBlock}>
                   <View style={styles.botIconRow}>
                    <View style={styles.botIconBg}><Bot color="#FFF" size={16} /></View>
                    <Text style={styles.botName}>{t('guide_bot_typing')}</Text>
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
          { bottom: isKeyboardVisible ? (Platform.OS === 'ios' ? 10 : 15) : 90 }
        ]}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity style={styles.addBtn} onPress={() => Alert.alert(t('guide_attachment_title'), t('guide_attachment_desc'))}>
              <Plus color="#FFF" size={20} />
            </TouchableOpacity>
            <TextInput 
              style={styles.textInput} 
              placeholder={t('guide_input_placeholder')} 
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
    gap: 10,
  },
  titleBadge: {
    backgroundColor: '#B4B813',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
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
    width: 140,
    height: 160,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 12,
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
    position: 'absolute',
    left: 20,
    right: 20,
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
