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
      description: "Véritable symbole du Jardin Majorelle, la Villa Bleue attire le regard par son architecture unique et son célèbre bleu intense devenu emblématique dans le monde entier. Inspirée des influences marocaines et artistiques, elle incarne la rencontre entre créativité, élégance et patrimoine culturel. Chaque détail de la villa célèbre l’imaginaire de Jacques Majorelle et son amour pour Marrakech. La façade cobalt, les balcons ornés et les jardins luxuriants qui l’entourent créent une atmosphère magique et intemporelle. La Villa Bleue est un lieu de contemplation et d’émerveillement, invitant les visiteurs à plonger dans l’univers artistique du jardin tout en découvrant l’histoire fascinante de ce lieu unique au monde.",
    },
    {
      _id: 'default-cactus',
      nom: 'Jardins de Cactus',
      typeZone: 'jardin_cactus',
      description: "Le jardin des cactus dévoile une collection fascinante de plantes venues des régions arides du monde entier. Entre formes sculpturales, textures étonnantes et silhouettes majestueuses, chaque cactus raconte l’ingéniosité de la nature face au désert. Cet espace offre un contraste saisissant entre la force minérale des plantes et la douceur artistique du jardin. C’est un lieu de découverte et d’émerveillement où les visiteurs peuvent admirer des espèces rares et exotiques, tout en ressentant la magie du Jardin Majorelle à travers la diversité botanique et l’atmosphère unique qui règne dans ce coin du jardin.",
    },
    {
      _id: 'default-lilies',
      nom: 'Bassin central',
      typeZone: 'bassin',
      description: "Au cœur du jardin, le bassin apporte une sensation immédiate de calme et de fraîcheur. Ses eaux paisibles reflètent les nuances éclatantes du bleu Majorelle, les silhouettes des palmiers et la végétation luxuriante qui l’entoure. Le murmure délicat de l’eau accompagne les visiteurs dans une parenthèse de sérénité où nature et poésie semblent dialoguer en harmonie. Le bassin central est un véritable havre de paix au sein du Jardin Majorelle, invitant à la contemplation et à la rêverie. Il accueille des nénuphars, des lotus et d’autres plantes aquatiques qui ajoutent une touche de mystère et de beauté à ce lieu emblématique du jardin.",
    },
    {
      _id: 'default-museum',
      nom: 'Musee Berbere',
      typeZone: 'musee_berbere',
      description: "Le Musée Berbère invite les visiteurs à découvrir la richesse et la diversité de la culture amazighe à travers une collection exceptionnelle d’objets traditionnels, bijoux, textiles et œuvres artisanales. Plus qu’un musée, c’est un voyage au cœur de l’histoire, des savoir-faire et des traditions ancestrales du Maroc. Installé dans l’ancienne maison du peintre Jacques Majorelle, le musée offre un cadre intime et authentique pour explorer les trésors de l’art berbère. Chaque pièce exposée raconte une histoire, témoignant de la créativité et de l’identité d’un peuple fier de son héritage. Le Musée Berbère est un lieu de découverte culturelle incontournable au sein du Jardin Majorelle, permettant aux visiteurs de mieux comprendre les racines et les influences qui ont façonné ce jardin unique au monde.",
    },
    {
      _id: 'default-bamboo',
      nom: 'Jardin de Bambous',
      typeZone: 'jardin_bambou',
      description: "Dans le jardin des bambous, l’atmosphère devient presque mystérieuse. Les longues tiges élancées filtrent doucement la lumière et créent une promenade ombragée où le bruissement du vent accompagne chaque pas. Cet espace invite à ralentir, écouter et ressentir la quiétude d’une nature vivante et apaisante. C’est un lieu de sérénité où les visiteurs peuvent se perdre dans la beauté simple et élégante des bambous, tout en profitant d’un moment de calme au cœur du Jardin Majorelle.",
    },
    {
      _id: 'default-allee',
      nom: 'Allees du jardin',
      typeZone: 'allee_jardin',
      description: "Les allées du jardin guident les visiteurs à travers une succession de couleurs, de parfums et de paysages exotiques. Bordées de plantes rares et d’arbres majestueux, elles offrent une promenade immersive où chaque détour révèle une nouvelle perspective, un jeu d’ombre ou un détail architectural fascinant. Les allées du Jardin Majorelle sont bien plus que de simples chemins, elles sont le fil conducteur d’une expérience sensorielle et esthétique, invitant à la découverte et à l’émerveillement à chaque pas. Elles relient les différentes zones du jardin tout en offrant des points de vue uniques sur les merveilles botaniques et artistiques qui font la renommée du Jardin Majorelle.",
    },
    {
      _id: 'default-cafe-majorelle',
      nom: 'Cafe Majorelle',
      typeZone: 'cafe_majorelle',
      description: "Le Café Majorelle propose une pause gourmande dans un cadre élégant et verdoyant. Entre saveurs marocaines et ambiance raffinée, ce lieu invite à prolonger l’expérience du jardin autour d’un thé à la menthe, d’un café ou d’une cuisine inspirée des traditions locales. C’est un endroit idéal pour se détendre après la visite, tout en profitant de la vue sur les plantes luxuriantes et l’architecture emblématique du Jardin Majorelle. Le Café Majorelle est un véritable havre de paix où les visiteurs peuvent savourer des moments de convivialité et de détente au cœur de ce jardin unique au monde.",
    },
    {
      _id: 'default-cafe-bousafsaf',
      nom: 'Cafe Bousafsaf',
      typeZone: 'cafe_bousafsaf',
      description: "Niché dans un espace paisible du jardin, le Café Bousafsaf séduit par son atmosphère intime et authentique. À l’ombre des arbres et bercé par la douceur du lieu, il offre un moment de détente idéal pour savourer la tranquillité du Jardin Majorelle. Le café propose une sélection de boissons rafraîchissantes et de douceurs inspirées des saveurs marocaines, parfaites pour accompagner une pause bien méritée après la découverte des merveilles du jardin. C’est un endroit où les visiteurs peuvent se ressourcer tout en profitant d’une ambiance chaleureuse et conviviale au cœur de ce lieu emblématique.",
    },
    {
      _id: 'default-boutique',
      nom: 'Boutique',
      typeZone: 'boutique',
      description: "La boutique du jardin rassemble une sélection raffinée d’objets inspirés de l’art marocain, du design et de l’univers du Jardin Majorelle. Livres, créations artisanales, accessoires et souvenirs prolongent l’expérience du visiteur à travers des pièces élégantes et empreintes de culture. C’est un lieu de découverte où l’on peut trouver des trésors uniques pour emporter un morceau de la magie du jardin chez soi. La boutique est un véritable écrin de créativité, offrant une gamme d’articles qui célèbrent l’esthétique et l’esprit du Jardin Majorelle, tout en soutenant les artisans locaux et en perpétuant les traditions artistiques marocaines.",
    },
    {
      _id: 'default-librairie',
      nom: 'Librairie',
      typeZone: 'librairie',
      description: "La librairie est un espace dédié à l’art, à l’histoire, à la botanique et à la culture marocaine. Les visiteurs y découvrent des ouvrages soigneusement sélectionnés qui permettent d’explorer plus profondément l’univers du Jardin Majorelle, son héritage artistique et les inspirations qui ont façonné ce lieu unique. C’est un endroit idéal pour les passionnés de lecture et de culture, offrant une collection riche et variée qui complète parfaitement la visite du jardin. La librairie du Jardin Majorelle est un véritable trésor pour ceux qui souhaitent prolonger leur expérience et approfondir leurs connaissances sur ce lieu emblématique et son contexte culturel fascinant.",
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

  const zoneGuideContent = {
    fr: {
      villa_bleue: {
        name: 'Villa Bleue',
        description: "Véritable symbole du Jardin Majorelle, la Villa Bleue attire le regard par son architecture unique et son célèbre bleu intense devenu emblématique dans le monde entier. Inspirée des influences marocaines et artistiques, elle incarne la rencontre entre créativité, élégance et patrimoine culturel. Chaque détail de la villa célèbre l’imaginaire de Jacques Majorelle et son amour pour Marrakech. La façade cobalt, les balcons ornés et les jardins luxuriants qui l’entourent créent une atmosphère magique et intemporelle. La Villa Bleue est un lieu de contemplation et d’émerveillement, invitant les visiteurs à plonger dans l’univers artistique du jardin tout en découvrant l’histoire fascinante de ce lieu unique au monde.",
      },
      jardin_cactus: {
        name: 'Jardins de Cactus',
        description: "Le jardin des cactus dévoile une collection fascinante de plantes venues des régions arides du monde entier. Entre formes sculpturales, textures étonnantes et silhouettes majestueuses, chaque cactus raconte l’ingéniosité de la nature face au désert. Cet espace offre un contraste saisissant entre la force minérale des plantes et la douceur artistique du jardin. C’est un lieu de découverte et d’émerveillement où les visiteurs peuvent admirer des espèces rares et exotiques, tout en ressentant la magie du Jardin Majorelle à travers la diversité botanique et l’atmosphère unique qui règne dans ce coin du jardin.",
      },
      bassin: {
        name: 'Bassin central',
        description: "Au cœur du jardin, le bassin apporte une sensation immédiate de calme et de fraîcheur. Ses eaux paisibles reflètent les nuances éclatantes du bleu Majorelle, les silhouettes des palmiers et la végétation luxuriante qui l’entoure. Le murmure délicat de l’eau accompagne les visiteurs dans une parenthèse de sérénité où nature et poésie semblent dialoguer en harmonie. Le bassin central est un véritable havre de paix au sein du Jardin Majorelle, invitant à la contemplation et à la rêverie. Il accueille des nénuphars, des lotus et d’autres plantes aquatiques qui ajoutent une touche de mystère et de beauté à ce lieu emblématique du jardin.",
      },
      musee_berbere: {
        name: 'Musée Berbère',
        description: "Le Musée Berbère invite les visiteurs à découvrir la richesse et la diversité de la culture amazighe à travers une collection exceptionnelle d’objets traditionnels, bijoux, textiles et œuvres artisanales. Plus qu’un musée, c’est un voyage au cœur de l’histoire, des savoir-faire et des traditions ancestrales du Maroc. Installé dans l’ancienne maison du peintre Jacques Majorelle, le musée offre un cadre intime et authentique pour explorer les trésors de l’art berbère. Chaque pièce exposée raconte une histoire, témoignant de la créativité et de l’identité d’un peuple fier de son héritage. Le Musée Berbère est un lieu de découverte culturelle incontournable au sein du Jardin Majorelle, permettant aux visiteurs de mieux comprendre les racines et les influences qui ont façonné ce jardin unique au monde.",
      },
      jardin_bambou: {
        name: 'Jardin de Bambous',
        description: "Dans le jardin des bambous, l’atmosphère devient presque mystérieuse. Les longues tiges élancées filtrent doucement la lumière et créent une promenade ombragée où le bruissement du vent accompagne chaque pas. Cet espace invite à ralentir, écouter et ressentir la quiétude d’une nature vivante et apaisante. C’est un lieu de sérénité où les visiteurs peuvent se perdre dans la beauté simple et élégante des bambous, tout en profitant d’un moment de calme au cœur du Jardin Majorelle.",
      },
      allee_jardin: {
        name: 'Allées du jardin',
        description: "Les allées du jardin guident les visiteurs à travers une succession de couleurs, de parfums et de paysages exotiques. Bordées de plantes rares et d’arbres majestueux, elles offrent une promenade immersive où chaque détour révèle une nouvelle perspective, un jeu d’ombre ou un détail architectural fascinant. Les allées du Jardin Majorelle sont bien plus que de simples chemins, elles sont le fil conducteur d’une expérience sensorielle et esthétique, invitant à la découverte et à l’émerveillement à chaque pas. Elles relient les différentes zones du jardin tout en offrant des points de vue uniques sur les merveilles botaniques et artistiques qui font la renommée du Jardin Majorelle.",
      },
      cafe_majorelle: {
        name: 'Café Majorelle',
        description: "Le Café Majorelle propose une pause gourmande dans un cadre élégant et verdoyant. Entre saveurs marocaines et ambiance raffinée, ce lieu invite à prolonger l’expérience du jardin autour d’un thé à la menthe, d’un café ou d’une cuisine inspirée des traditions locales. C’est un endroit idéal pour se détendre après la visite, tout en profitant de la vue sur les plantes luxuriantes et l’architecture emblématique du Jardin Majorelle. Le Café Majorelle est un véritable havre de paix où les visiteurs peuvent savourer des moments de convivialité et de détente au cœur de ce jardin unique au monde.",
      },
      cafe_bousafsaf: {
        name: 'Café Bousafsaf',
        description: "Niché dans un espace paisible du jardin, le Café Bousafsaf séduit par son atmosphère intime et authentique. À l’ombre des arbres et bercé par la douceur du lieu, il offre un moment de détente idéal pour savourer la tranquillité du Jardin Majorelle. Le café propose une sélection de boissons rafraîchissantes et de douceurs inspirées des saveurs marocaines, parfaites pour accompagner une pause bien méritée après la découverte des merveilles du jardin. C’est un endroit où les visiteurs peuvent se ressourcer tout en profitant d’une ambiance chaleureuse et conviviale au cœur de ce lieu emblématique.",
      },
      boutique: {
        name: 'Boutique',
        description: "La boutique du jardin rassemble une sélection raffinée d’objets inspirés de l’art marocain, du design et de l’univers du Jardin Majorelle. Livres, créations artisanales, accessoires et souvenirs prolongent l’expérience du visiteur à travers des pièces élégantes et empreintes de culture. C’est un lieu de découverte où l’on peut trouver des trésors uniques pour emporter un morceau de la magie du jardin chez soi. La boutique est un véritable écrin de créativité, offrant une gamme d’articles qui célèbrent l’esthétique et l’esprit du Jardin Majorelle, tout en soutenant les artisans locaux et en perpétuant les traditions artistiques marocaines.",
      },
      librairie: {
        name: 'Librairie',
        description: "La librairie est un espace dédié à l’art, à l’histoire, à la botanique et à la culture marocaine. Les visiteurs y découvrent des ouvrages soigneusement sélectionnés qui permettent d’explorer plus profondément l’univers du Jardin Majorelle, son héritage artistique et les inspirations qui ont façonné ce lieu unique. C’est un endroit idéal pour les passionnés de lecture et de culture, offrant une collection riche et variée qui complète parfaitement la visite du jardin. La librairie du Jardin Majorelle est un véritable trésor pour ceux qui souhaitent prolonger leur expérience et approfondir leurs connaissances sur ce lieu emblématique et son contexte culturel fascinant.",
      },
    },
    en: {
      villa_bleue: {
        name: 'Blue Villa',
        description: "The Blue Villa is one of the most striking symbols of the Jardin Majorelle. Its vivid cobalt facade, elegant balconies, and lush surroundings create a landmark that immediately captures attention. Inspired by Moroccan craftsmanship and artistic vision, it reflects a meeting point between creativity, refinement, and cultural heritage. Every architectural detail speaks to Jacques Majorelle's imagination and his affection for Marrakech. It is a place of wonder and contemplation, inviting visitors to step into the artistic world of the garden and discover the history behind this unforgettable site.",
      },
      jardin_cactus: {
        name: 'Cactus Garden',
        description: "The Cactus Garden reveals a fascinating collection of plants from arid regions around the world. Sculptural forms, surprising textures, and majestic silhouettes make each cactus feel like a work of living art. The space creates a striking contrast between the raw strength of desert plants and the artistic softness of the garden's design. It is a place of discovery and wonder where visitors can admire rare and exotic species while experiencing the unique botanical atmosphere that defines the Jardin Majorelle.",
      },
      bassin: {
        name: 'Central Pond',
        description: "At the heart of the garden, the pond brings an immediate sense of calm and freshness. Its still waters reflect the brilliant shades of Majorelle blue, the silhouettes of palm trees, and the lush vegetation around it. The gentle sound of water accompanies visitors through a moment of serenity where nature and poetry seem to speak together in harmony. The central pond is a true haven of peace inside the Jardin Majorelle, inviting contemplation and quiet reflection. Water lilies, lotus flowers, and other aquatic plants add mystery and beauty to this emblematic space.",
      },
      musee_berbere: {
        name: 'Berber Museum',
        description: "The Berber Museum invites visitors to discover the richness and diversity of Amazigh culture through an exceptional collection of traditional objects, jewelry, textiles, and handcrafted works. More than a museum, it is a journey into the history, craftsmanship, and ancestral traditions of Morocco. Located in the former home of painter Jacques Majorelle, the museum offers an intimate and authentic setting to explore the treasures of Berber art. Each displayed piece tells a story, reflecting the creativity and identity of a people proud of their heritage. It is an essential cultural stop within the Jardin Majorelle, helping visitors understand the roots and influences that shaped this unique garden.",
      },
      jardin_bambou: {
        name: 'Bamboo Garden',
        description: "In the Bamboo Garden, the atmosphere becomes almost mysterious. Tall, slender stems filter the light softly and create a shaded walk where the rustle of the wind accompanies every step. This space invites visitors to slow down, listen, and feel the quiet presence of a living, soothing nature. It is a place of serenity where you can lose yourself in the simple elegance of bamboo while enjoying a peaceful moment at the heart of the Jardin Majorelle.",
      },
      allee_jardin: {
        name: 'Garden Pathways',
        description: "The garden pathways guide visitors through a succession of colors, scents, and exotic landscapes. Lined with rare plants and majestic trees, they offer an immersive walk where every turn reveals a new perspective, a play of shadow, or a fascinating architectural detail. More than simple routes, the paths of the Jardin Majorelle act as the thread that connects the sensory and aesthetic experience of the garden, inviting discovery and wonder at every step. They link the different zones while offering unique views of the botanical and artistic treasures that make the garden famous.",
      },
      cafe_majorelle: {
        name: 'Café Majorelle',
        description: "Café Majorelle offers a delicious pause in an elegant and green setting. Blending Moroccan flavors with refined ambiance, it invites visitors to extend their garden experience over mint tea, coffee, or dishes inspired by local traditions. It is the ideal place to relax after the visit while enjoying the lush plants and iconic architecture of the Jardin Majorelle. Café Majorelle is a true haven of peace where visitors can enjoy moments of comfort and conviviality in this unique garden.",
      },
      cafe_bousafsaf: {
        name: 'Café Bousafsaf',
        description: "Tucked away in a peaceful part of the garden, Café Bousafsaf charms with its intimate and authentic atmosphere. Beneath the trees and surrounded by the calm of the place, it offers the perfect moment to relax and enjoy the tranquility of the Jardin Majorelle. The café serves refreshing drinks and Moroccan-inspired treats, ideal for a well-deserved break after exploring the garden's highlights. It is a warm and welcoming place where visitors can recharge in the heart of this emblematic site.",
      },
      boutique: {
        name: 'Boutique',
        description: "The garden boutique brings together a refined selection of objects inspired by Moroccan art, design, and the world of the Jardin Majorelle. Books, handcrafted creations, accessories, and souvenirs extend the visitor experience through elegant, culturally rich pieces. It is a place of discovery where unique treasures can be found to bring a piece of the garden's magic home. The boutique is a true showcase of creativity, celebrating the aesthetic and spirit of the Jardin Majorelle while supporting local artisans and preserving Moroccan artistic traditions.",
      },
      librairie: {
        name: 'Bookstore',
        description: "The bookstore is a space dedicated to art, history, botany, and Moroccan culture. Visitors discover carefully selected works that allow them to explore the world of the Jardin Majorelle more deeply, along with its artistic legacy and the inspirations that shaped this unique place. It is an ideal stop for readers and culture lovers, offering a rich and varied collection that perfectly complements the garden visit. The Jardin Majorelle bookstore is a true treasure for those who want to extend their experience and deepen their understanding of this iconic place and its fascinating cultural context.",
      },
    },
    ar: {
      villa_bleue: {
        name: 'الفيلا الزرقاء',
        description: 'تُعد الفيلا الزرقاء أحد أبرز رموز حديقة ماجوريل، فواجهتها الزرقاء الكوبالتية الجريئة وشرفاتها الأنيقة وحدائقها المحيطة تمنح المكان حضورًا لا يُنسى. تستلهم هذه المعلمة من الحرفية المغربية والرؤية الفنية، لتجسد لقاءً بين الإبداع والرقي والتراث الثقافي. كل تفصيل فيها يعكس خيال جاك ماجوريل وحبه لمراكش. إنها مساحة للتأمل والانبهار، تدعو الزوار إلى دخول العالم الفني للحديقة واكتشاف تاريخ هذا المكان الاستثنائي.',
      },
      jardin_cactus: {
        name: 'حديقة الصبار',
        description: 'تكشف حديقة الصبار عن مجموعة مدهشة من النباتات القادمة من المناطق الجافة حول العالم. فالأشكال النحتية والملمس المفاجئ والظلال المهيبة تجعل كل صبار يبدو كقطعة فنية حية. يخلق هذا الفضاء تباينًا جميلًا بين قوة نباتات الصحراء الخام ونعومة التصميم الفني للحديقة. إنها مساحة اكتشاف وإعجاب، حيث يمكن للزوار التأمل في أنواع نادرة وغريبة مع الإحساس بالجو النباتي الفريد الذي يميز حديقة ماجوريل.',
      },
      bassin: {
        name: 'الحوض المركزي',
        description: 'في قلب الحديقة يمنح الحوض إحساسًا فوريًا بالهدوء والانتعاش. تعكس مياهه الهادئة درجات الأزرق الماجوريل الزاهية، وظلال النخيل، والنباتات الكثيفة المحيطة به. يرافق خرير الماء الزائرين في لحظة من السكينة حيث يبدو أن الطبيعة والشعر يتحاوران بتناغم. يُعد الحوض المركزي ملاذًا حقيقيًا للطمأنينة داخل حديقة ماجوريل، ويدعو إلى التأمل والهدوء. كما تحتضنه زنابق الماء ونباتات مائية أخرى تضيف لمسة من الغموض والجمال إلى هذا المكان الرمزي.',
      },
      musee_berbere: {
        name: 'المتحف الأمازيغي',
        description: 'يدعو المتحف الأمازيغي الزوار إلى اكتشاف ثراء وتنوع الثقافة الأمازيغية عبر مجموعة استثنائية من القطع التقليدية والمجوهرات والمنسوجات والأعمال الحرفية. وهو أكثر من مجرد متحف، بل رحلة إلى عمق تاريخ المغرب وحِرفه وتقاليده العريقة. يقع في المنزل السابق للفنان جاك ماجوريل، ويقدم فضاءً حميمًا وأصيلًا لاستكشاف كنوز الفن الأمازيغي. كل قطعة معروضة تروي قصة، وتعكس الإبداع والهوية لدى شعب يعتز بإرثه. إنه محطة ثقافية أساسية داخل حديقة ماجوريل تساعد الزوار على فهم الجذور والتأثيرات التي شكّلت هذه الحديقة الفريدة.',
      },
      jardin_bambou: {
        name: 'حديقة الخيزران',
        description: 'في حديقة الخيزران يصبح الجو شبه غامض. فالأعمدة الطويلة الرفيعة ترشح الضوء بلطف وتخلق ممشى مظللًا ترافقه همسات الرياح مع كل خطوة. هذه المساحة تدعو الزائر إلى التمهل، والاستماع، والشعور بسكينة الطبيعة الحية والمريحة. إنها مكان للهدوء يمكن فيه للزوار أن يذوبوا في جمال الخيزران البسيط والأنيق مع الاستمتاع بلحظة هدوء في قلب حديقة ماجوريل.',
      },
      allee_jardin: {
        name: 'ممرات الحديقة',
        description: 'تقود ممرات الحديقة الزوار عبر تتابع من الألوان والروائح والمناظر الغريبة. وتحيط بها النباتات النادرة والأشجار المهيبة، فتمنحهم جولة غامرة يكشف فيها كل منعطف منظورًا جديدًا أو لعبة ظل أو تفصيلة معمارية آسرة. إن ممرات حديقة ماجوريل أكثر من مجرد طرق، فهي الخيط الذي يربط التجربة الحسية والجمالية للحديقة، وتدعو إلى الاكتشاف والدهشة في كل خطوة. كما تصل بين المناطق المختلفة وتتيح إطلالات فريدة على الكنوز النباتية والفنية التي جعلت الحديقة مشهورة.',
      },
      cafe_majorelle: {
        name: 'مقهى ماجوريل',
        description: 'يقدم مقهى ماجوريل استراحة لذيذة في أجواء أنيقة وخضراء. إذ يجمع بين النكهات المغربية والأجواء الراقية، ويدعو الزوار إلى إطالة تجربة الحديقة مع شاي النعناع أو القهوة أو أطباق مستوحاة من التقاليد المحلية. إنه المكان المثالي للاسترخاء بعد الجولة مع الاستمتاع بالنباتات الكثيفة والهندسة المعمارية الأيقونية لحُديقة ماجوريل. ويُعد المقهى ملاذًا حقيقيًا للراحة حيث يمكن للزوار قضاء لحظات من الألفة والهدوء داخل هذه الحديقة الفريدة.',
      },
      cafe_bousafsaf: {
        name: 'مقهى بوصفصاف',
        description: 'يقع مقهى بوصفصاف في جزء هادئ من الحديقة ويتميز بأجوائه الحميمة والأصيلة. وتحت ظلال الأشجار وبحضور سكينة المكان، يوفر لحظة مثالية للاسترخاء والاستمتاع بهدوء حديقة ماجوريل. يقدم المقهى مشروبات منعشة وحلويات مستوحاة من النكهات المغربية، وهي مناسبة تمامًا لاستراحة مستحقة بعد اكتشاف معالم الحديقة. إنه مكان دافئ ومرحب يتيح للزوار استعادة نشاطهم في قلب هذا الموقع الرمزي.',
      },
      boutique: {
        name: 'المتجر',
        description: 'يجمع متجر الحديقة مجموعة راقية من القطع المستوحاة من الفن المغربي والتصميم وعالم حديقة ماجوريل. فهناك الكتب والإبداعات الحرفية والإكسسوارات والتذكارات التي تُكمل تجربة الزائر من خلال قطع أنيقة ومفعمة بالثقافة. إنه مكان للاكتشاف يمكن فيه العثور على كنوز فريدة تأخذ معك شيئًا من سحر الحديقة إلى البيت. ويعد المتجر واجهة حقيقية للإبداع تحتفي بجمال وروح حديقة ماجوريل، مع دعم الحرفيين المحليين والحفاظ على التقاليد الفنية المغربية.',
      },
      librairie: {
        name: 'المكتبة',
        description: 'المكتبة فضاء مخصص للفن والتاريخ وعلم النبات والثقافة المغربية. يكتشف الزوار فيها كتبًا مختارة بعناية تتيح لهم استكشاف عالم حديقة ماجوريل بعمق أكبر، إلى جانب إرثها الفني والإلهامات التي شكّلت هذا المكان الفريد. إنها محطة مثالية لعشاق القراءة والثقافة، وتقدم مجموعة غنية ومتنوعة تكمل زيارة الحديقة بشكل ممتاز. تُعد مكتبة حديقة ماجوريل كنزًا حقيقيًا لمن يرغب في مواصلة التجربة وتعميق معرفته بهذا المكان الرمزي وسياقه الثقافي المدهش.',
      },
    },
  };

  const getZoneGuideContent = (zone) => {
    const normalizedType = normalizeZoneType(zone?.typeZone);
    const lang = i18n.language?.startsWith('ar')
      ? 'ar'
      : i18n.language?.startsWith('en')
        ? 'en'
        : 'fr';
    const localized = zoneGuideContent[lang]?.[normalizedType] || zoneGuideContent.fr?.[normalizedType];

    return {
      name: localized?.name || zone?.nom || 'this area',
      description: localized?.description || zone?.description || 'This area is part of the Jardin Majorelle.',
    };
  };

  const getDefaultZoneDescription = (zone) => {
    return getZoneGuideContent(zone).description;
  };

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
    if (zone?.image && /^https?:\/\//i.test(zone.image) && !zone.image.includes('unsplash.com')) {
      return { uri: zone.image };
    }
    const design = getZoneDesignProps(zone?.typeZone);
    return design?.fallbackImage || zoneImageMap[normalizeZoneType(zone?.typeZone)] || require('../../assets/majorelle_villa.png');
  };

  const getZoneVoiceText = (zone) => {
    return getDefaultZoneDescription(zone);
  };

  const hasLocalZoneAudio = (zone) => !!getZoneAudioSource(zone);

  const getZoneName = (zone) => {
    return getZoneGuideContent(zone).name;
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
          .map(z => `${getZoneName(z)}: ${getDefaultZoneDescription(z).substring(0, 80)}`)
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
        console.log("Client-side keyless ChatGPT fallback succeeded!");
        
        const botMsg = { id: Date.now().toString(), sender: 'bot', text: reply };
        setMessages(prev => [...prev, botMsg]);
        setIsTyping(false);
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        playGuideAudio(reply, botMsg.id);
      } catch (fallbackError) {
        console.warn("âŒ Client-side fallback also failed:", fallbackError.message);
        
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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
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
            contentContainerStyle={[styles.scrollContent, { paddingBottom: isKeyboardVisible ? 20 : 100 }]}
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
          { marginBottom: isKeyboardVisible ? 10 : 90 }
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
    width: '100%',
    paddingHorizontal: 20,
    zIndex: 20,
    elevation: 20,
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

