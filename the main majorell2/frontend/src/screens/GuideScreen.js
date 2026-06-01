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
import { getZones, sendMessageToGuide } from '../../api/api';

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
      description: 'Véritable symbole du Jardin Majorelle, la Villa Bleue attire le regard par son architecture unique et son célèbre bleu intense devenu emblématique dans le monde entier. Inspirée des influences marocaines et artistiques, elle incarne la rencontre entre créativité, élégance et patrimoine culturel. Chaque détail de la villa célèbre l’imaginaire de Jacques Majorelle et son amour pour Marrakech. La façade cobalt, les balcons ornés et les jardins luxuriants qui l’entourent créent une atmosphère magique et intemporelle. La Villa Bleue est un lieu de contemplation et d’émerveillement, invitant les visiteurs à plonger dans l’univers artistique du jardin tout en découvrant l’histoire fascinante de ce lieu unique au monde.',
    },
    {
      _id: 'default-cactus',
      nom: 'Jardins de Cactus',
      typeZone: 'jardin_cactus',
      description: 'Le jardin des cactus dévoile une collection fascinante de plantes venues des régions arides du monde entier. Entre formes sculpturales, textures étonnantes et silhouettes majestueuses, chaque cactus raconte l’ingéniosité de la nature face au désert. Cet espace offre un contraste saisissant entre la force minérale des plantes et la douceur artistique du jardin. C’est un lieu de découverte et d’émerveillement où les visiteurs peuvent admirer des espèces rares et exotiques, tout en ressentant la magie du Jardin Majorelle à travers la diversité botanique et l’atmosphère unique qui règne dans ce coin du jardin.',
    },
    {
      _id: 'default-lilies',
      nom: 'Bassin central',
      typeZone: 'bassin',
      description: 'Au cœur du jardin, le bassin apporte une sensation immédiate de calme et de fraîcheur. Ses eaux paisibles reflètent les nuances éclatantes du bleu Majorelle, les silhouettes des palmiers et la végétation luxuriante qui l’entoure. Le murmure délicat de l’eau accompagne les visiteurs dans une parenthèse de sérénité où nature et poésie semblent dialoguer en harmonie. Le bassin central est un véritable havre de paix au sein du Jardin Majorelle, invitant à la contemplation et à la rêverie. Il accueille des nénuphars, des lotus et d’autres plantes aquatiques qui ajoutent une touche de mystère et de beauté à ce lieu emblématique du jardin.',
    },
    {
      _id: 'default-museum',
      nom: 'Musée Berbère',
      typeZone: 'musee_berbere',
      description: 'Le Musée Berbère invite les visiteurs à découvrir la richesse et la diversité de la culture amazighe à travers une collection exceptionnelle d’objets traditionnels, bijoux, textiles et œuvres artisanales. Plus qu’un musée, c’est un voyage au cœur de l’histoire, des savoir-faire et des traditions ancestrales du Maroc. Installé dans l’ancienne maison du peintre Jacques Majorelle, le musée offre un cadre intime et authentique pour explorer les trésors de l’art berbère. Chaque pièce exposée raconte une histoire, témoignant de la créativité et de l’identité d’un peuple fier de son héritage. Le Musée Berbère est un lieu de découverte culturelle incontournable au sein du Jardin Majorelle, permettant aux visiteurs de mieux comprendre les racines et les influences qui ont façonné ce jardin unique au monde.',
    },
    {
      _id: 'default-bamboo',
      nom: 'Jardin de Bambous',
      typeZone: 'jardin_bambou',
      description: 'Dans le jardin des bambous, l’atmosphère devient presque mystérieuse. Les longues tiges élancées filtrent doucement la lumière et créent une promenade ombragée où le bruissement du vent accompagne chaque pas. Cet espace invite à ralentir, écouter et ressentir la quiétude d’une nature vivante et apaisante. C’est un lieu de sérénité où les visiteurs peuvent se perdre dans la beauté simple et élégante des bambous, tout en profitant d’un moment de calme au cœur du Jardin Majorelle.',
    },
    {
      _id: 'default-allee',
      nom: 'Allées du jardin',
      typeZone: 'allee_jardin',
      description: 'Les allées du jardin guident les visiteurs à travers une succession de couleurs, de parfums et de paysages exotiques. Bordées de plantes rares et d’arbres majestueux, elles offrent une promenade immersive où chaque détour révèle une nouvelle perspective, un jeu d’ombre ou un détail architectural fascinant. Les allées du Jardin Majorelle sont bien plus que de simples chemins,elles sont le fil conducteur d’une expérience sensorielle et esthétique, invitant à la découverte et à l’émerveillement à chaque pas. Elles relient les différentes zones du jardin tout en offrant des points de vue uniques sur les merveilles botaniques et artistiques qui font la renommée du Jardin Majorelle.',
    },
    {
      _id: 'default-cafe-majorelle',
      nom: 'Café Majorelle',
      typeZone: 'cafe_majorelle',
      description: 'Le Café Majorelle propose une pause gourmande dans un cadre élégant et verdoyant. Entre saveurs marocaines et ambiance raffinée, ce lieu invite à prolonger l’expérience du jardin autour d’un thé à la menthe, d’un café ou d’une cuisine inspirée des traditions locales. C’est un endroit idéal pour se détendre après la visite, tout en profitant de la vue sur les plantes luxuriantes et l’architecture emblématique du Jardin Majorelle. Le Café Majorelle est un véritable havre de paix où les visiteurs peuvent savourer des moments de convivialité et de détente au cœur de ce jardin unique au monde.',
    },
    {
      _id: 'default-cafe-bousafsaf',
      nom: 'Café Bousafsaf',
      typeZone: 'cafe_bousafsaf',
      description: 'Niché dans un espace paisible du jardin, le Café Bousafsaf séduit par son atmosphère intime et authentique. À l’ombre des arbres et bercé par la douceur du lieu, il offre un moment de détente idéal pour savourer la tranquillité du Jardin Majorelle. Le café propose une sélection de boissons rafraîchissantes et de douceurs inspirées des saveurs marocaines, parfaites pour accompagner une pause bien méritée après la découverte des merveilles du jardin. C’est un endroit où les visiteurs peuvent se ressourcer tout en profitant d’une ambiance chaleureuse et conviviale au cœur de ce lieu emblématique.',
    },
    {
      _id: 'default-boutique',
      nom: 'Boutique',
      typeZone: 'boutique',
      description: 'La boutique du jardin rassemble une sélection raffinée d’objets inspirés de l’art marocain, du design et de l’univers du Jardin Majorelle. Livres, créations artisanales, accessoires et souvenirs prolongent l’expérience du visiteur à travers des pièces élégantes et empreintes de culture. C’est un lieu de découverte où l’on peut trouver des trésors uniques pour emporter un morceau de la magie du jardin chez soi. La boutique est un véritable écrin de créativité, offrant une gamme d’articles qui célèbrent l’esthétique et l’esprit du Jardin Majorelle, tout en soutenant les artisans locaux et en perpétuant les traditions artistiques marocaines.',
    },
    {
      _id: 'default-librairie',
      nom: 'Librairie',
      typeZone: 'librairie',
      description: 'La librairie est un espace dédié à l’art, à l’histoire, à la botanique et à la culture marocaine. Les visiteurs y découvrent des ouvrages soigneusement sélectionnés qui permettent d’explorer plus profondément l’univers du Jardin Majorelle, son héritage artistique et les inspirations qui ont façonné ce lieu unique. C’est un endroit idéal pour les passionnés de lecture et de culture, offrant une collection riche et variée qui complète parfaitement la visite du jardin. La librairie du Jardin Majorelle est un véritable trésor pour ceux qui souhaitent prolonger leur expérience et approfondir leurs connaissances sur ce lieu emblématique et son contexte culturel fascinant.',
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
  const scrollViewRef = useRef(null);
  const speechRunRef = useRef(0);
  const pauseRequestedRef = useRef(false);

  const zoneImageMap = {
    bassin: require('../../assets/bassin.png'),
    jardin_bambou: require('../../assets/jardin-bambou.png'),
    jardin_cactus: require('../../assets/jardin-cactus.png'),
    musee_berbere: require('../../assets/musee-berbere.png'),
    villa_bleue: require('../../assets/villa-bleue.png'),
    boutique: require('../../assets/boutique.jpg'),
    librairie: require('../../assets/librairie.jpg'),
    allee_jardin: require('../../assets/allees.jpg'),
    cafe_majorelle: require('../../assets/cafe-majorelle.jpg'),
    cafe_bousafsaf: require('../../assets/cafe-bousafsaf.jpeg'),
  };

  const getZoneImageSource = (zone) => {
    if (zone?.image) {
      return { uri: zone.image };
    }

    const key = zone?.typeZone ? zone.typeZone.toLowerCase() : null;
    return zoneImageMap[key] || require('../../assets/villa-bleue.png');
  };

  const getZoneName = (zone) => {
    const type = zone?.typeZone?.toLowerCase();

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
    const query = text.toLowerCase();
    const allZones = [...defaultZones, ...zones];

    const zoneMatch = allZones.find((zone) => {
      const normalizedType = zone.typeZone ? zone.typeZone.replace(/_/g, ' ') : '';
      return query.includes(zone.nom?.toLowerCase()) || query.includes(normalizedType);
    });

    if (zoneMatch) {
      const zoneType = zoneMatch.typeZone?.toLowerCase();
      const zoneName = getZoneName(zoneMatch);
      const article = getZoneArticle(zoneType);

      if (zoneType === 'allee_jardin') {
        return zoneMatch.description || `Les allées du jardin relient les principales zones et offrent de belles perspectives sur les plantes et l’architecture du Jardin Majorelle.`;
      }

      if (zoneMatch.description) {
        return zoneMatch.description;
      }

      return `${article} ${zoneName} est une zone emblématique du Jardin Majorelle.`;
    }

    if (query.includes('histoire') || query.includes('yves') || query.includes('saint laurent') || query.includes('restauration')) {
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
      const guideText = `Please answer only about Jardin Majorelle. ${text}`;
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
      // Ajouter la synthèse vocale au fallback aussi
      playGuideAudio(fallbackText, localReply.id);
    }
  };

  const resetSpeechState = (runId) => {
    if (runId !== speechRunRef.current) return;
    setIsSpeaking(false);
    setIsSpeechPaused(false);
    setSpeakingMessageId(null);
  };

  const playGuideAudio = async (text, messageId = null) => {
    try {
      console.log('🔊 Début synthèse vocale');
      
      // Arrêter toute lecture précédente
      speechRunRef.current += 1;
      pauseRequestedRef.current = false;
      const runId = speechRunRef.current;
      await Speech.stop();
      
      if (!text || text.trim().length === 0) {
        console.warn('⚠️ Texte vide pour la synthèse vocale');
        return;
      }

      setIsSpeaking(true);
      setIsSpeechPaused(false);
      setSpeakingMessageId(messageId);
      console.log('🔊 Synthèse vocale:', text.substring(0, 50) + '...');

      // Utilise expo-speech pour la synthèse vocale native
      Speech.speak(text, {
        language: 'fr',
        rate: 0.95,
        pitch: 1.0,
        volume: 1.0,
        onStart: () => {
          if (runId !== speechRunRef.current) return;
          setIsSpeaking(true);
          setIsSpeechPaused(false);
          setSpeakingMessageId(messageId);
        },
        onDone: () => {
          resetSpeechState(runId);
          console.log('✅ Synthèse vocale terminée');
        },
        onStopped: () => {
          if (runId === speechRunRef.current && pauseRequestedRef.current) return;
          resetSpeechState(runId);
        },
        onError: (error) => {
          resetSpeechState(runId);
          console.error('❌ Erreur synthèse vocale:', error.message);
        },
      });
      
    } catch (error) {
      pauseRequestedRef.current = false;
      setIsSpeaking(false);
      setIsSpeechPaused(false);
      setSpeakingMessageId(null);
      console.error('❌ Erreur synthèse vocale:', error.message);
    }
  };

  const handleAudioButtonPress = async (messageId, text) => {
    const isCurrentMessage = speakingMessageId === messageId;

    try {
      if (isCurrentMessage && isSpeechPaused) {
        pauseRequestedRef.current = false;
        await Speech.resume();
        setIsSpeaking(true);
        setIsSpeechPaused(false);
        console.log('▶️ Reprise de la synthèse vocale');
        return;
      }

      if (isCurrentMessage && isSpeaking) {
        try {
          pauseRequestedRef.current = true;
          await Speech.pause();
          setIsSpeaking(false);
          setIsSpeechPaused(true);
          console.log('⏸️ Pause de la synthèse vocale');
        } catch (pauseError) {
          pauseRequestedRef.current = false;
          await Speech.stop();
          setIsSpeaking(false);
          setIsSpeechPaused(false);
          setSpeakingMessageId(null);
          console.log('⏹️ Pause indisponible, synthèse vocale arrêtée');
        }
        return;
      }

      playGuideAudio(text, messageId);
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
                  onPress={() => handleSend(getZoneQuery(zone))}
                >
                  <Image source={getZoneImageSource(zone)} style={styles.galleryImage} resizeMode="cover" />
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
                      <TouchableOpacity onPress={() => handleAudioButtonPress(msg.id, msg.text)} style={{ marginLeft: 'auto' }}>
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
