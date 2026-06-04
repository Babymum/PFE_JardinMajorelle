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
import { Plus, Send, Bot, Clock, Leaf, Volume2, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getZones, sendMessageToGuide } from '../../api/api';
import { useTranslation } from 'react-i18next';

export default function GuideScreen({ navigation }) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([
    {
      id: 'welcome_1',
      sender: 'bot',
      text: ''
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [gardenContext, setGardenContext] = useState('Jardin Majorelle in Marrakech.');
  const [zones, setZones] = useState([]);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const scrollViewRef = useRef(null);

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
        const data = await getZones();
        setZones(data);
        const briefContext = data.map(z => `${z.nom}: ${z.description ? z.description.substring(0, 80) : 'Point of interest'}`).join('\n');
        setGardenContext(briefContext);
      } catch (err) {
        console.warn("Could not fetch garden context", err);
      }
    };
    fetchContext();
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
      console.log("Sending chat request to backend...");
      const response = await sendMessageToGuide(text);
      
      const botMsg = { id: Date.now().toString(), sender: 'bot', text: response };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      playElevenLabsAudio(response);
    } catch (error) {
      console.warn("Backend ChatGPT failed, falling back to direct client-side keyless ChatGPT:", error.message);

      // 2. Direct client-side fetch fallback to keyless Pollinations AI ChatGPT
      try {
        // KEEP SYSTEM PROMPT SHORT to avoid URL token bloat on GET request
        const systemPrompt = `You are the digital concierge for Jardin Majorelle. Respond in under 3 sentences.`;
        
        console.log("Querying keyless Pollinations AI ChatGPT directly from client via GET...");
        const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(text)}?system=${encodeURIComponent(systemPrompt)}`);

        if (!response.ok) {
          throw new Error(`Pollinations API failed with status ${response.status}`);
        }

        const reply = await response.text();
        console.log("✅ Client-side keyless ChatGPT fallback succeeded!");
        
        const botMsg = { id: Date.now().toString(), sender: 'bot', text: reply };
        setMessages(prev => [...prev, botMsg]);
        setIsTyping(false);
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        playElevenLabsAudio(reply);

      } catch (fallbackError) {
        console.warn("❌ Client-side fallback also failed:", fallbackError.message);
        
        const errorMsg = { 
          id: Date.now().toString(), 
          sender: 'bot', 
          text: t('guide_local_fallback') 
        };
        setMessages(prev => [...prev, errorMsg]);
        setIsTyping(false);
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      }
    }
  };

  const playElevenLabsAudio = async (text) => {
    try {
      console.log('Synthesizing speech with ElevenLabs:', text);
    } catch (error) {
      console.warn('ElevenLabs Audio Error:', error.message);
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

        <ScrollView 
          ref={scrollViewRef}
          style={styles.container} 
          contentContainerStyle={styles.scrollContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          <View style={styles.titleSection}>
            <Text style={styles.subtitle}>{t('guide_concierge')}</Text>
            <Text style={styles.title1}>{t('guide_explore_prefix')}</Text>
            <Text style={styles.title2}>{t('guide_explore_middle')} <Text style={styles.titleHighlight}>{t('guide_explore_highlight')}</Text></Text>
            <Text style={styles.description}>
              {t('guide_bot_welcome')}
            </Text>
          </View>

          {/* Interactive Zone Gallery */}
          <View style={styles.galleryWrapper}>
            <Text style={styles.galleryTitle}>{t('guide_tap_zone')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryContainer}>
              {zones.map((zone) => {
                const design = getZoneDesignProps(zone.typeZone);
                const isRemoteUrl = zone.image && (zone.image.startsWith('http://') || zone.image.startsWith('https://'));
                const mainImage = isRemoteUrl ? { uri: zone.image } : design.fallbackImage;
                return (
                  <TouchableOpacity 
                    key={zone._id} 
                    style={styles.galleryCard} 
                    onPress={() => handleSend(t('guide_prompt_prefix', { name: t('zone_name_' + zone.typeZone, zone.nom) }))}
                  >
                    <Image source={mainImage} style={styles.galleryImage} />
                    <LinearGradient colors={['transparent', 'rgba(10, 43, 94, 0.95)']} style={styles.galleryGradient}>
                      <Text style={styles.galleryCardText}>{t('zone_name_' + zone.typeZone, zone.nom)}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
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
                return (
                  <View key={msg.id} style={styles.botMessageBlock}>
                    <View style={styles.botIconRow}>
                      <View style={styles.botIconBg}><Bot color="#FFF" size={16} /></View>
                      <Text style={styles.botName}>{t('guide_bot_name')}</Text>
                      <TouchableOpacity onPress={() => playElevenLabsAudio(msg.id === 'welcome_1' ? t('guide_bot_welcome') : msg.text)} style={{ marginLeft: 'auto' }}>
                        <Volume2 color="#0A2B5E" size={16} />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.botBubble}>
                      <Text style={styles.botDesc}>
                        {msg.id === 'welcome_1' ? t('guide_bot_welcome') : msg.text}
                      </Text>
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

          <View style={{height: 160}} />
        </ScrollView>

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
  },
  galleryCard: {
    width: 140,
    height: 160,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#B4B813',
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
