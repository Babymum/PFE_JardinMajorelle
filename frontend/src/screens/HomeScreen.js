import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, I18nManager, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ticket, Menu, ScanFace, Compass, Bot, Sparkles, Lock, Moon, Sun } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { getZones } from '../../api/api';
import { getZoneDesignProps } from '../utils/zoneDesign';
export default function HomeScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const { theme, isDark, toggleTheme } = useTheme();
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchZones = async () => {
      setLoading(true);
      try {
        const data = await getZones();
        setZones(data);
      } catch (error) {
        console.log('Error fetching zones in Home:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchZones();
  }, []);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Jardin Majorelle</Text>
          
          <View style={styles.headerRight}>
            <View style={styles.langSelector}>
              <TouchableOpacity onPress={() => changeLanguage('en')} style={[styles.langBtn, i18n.language === 'en' && styles.langBtnActive]}>
                <Text style={[styles.langBtnText, i18n.language === 'en' && styles.langBtnTextActive]}>EN</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => changeLanguage('fr')} style={[styles.langBtn, i18n.language === 'fr' && styles.langBtnActive]}>
                <Text style={[styles.langBtnText, i18n.language === 'fr' && styles.langBtnTextActive]}>FR</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => changeLanguage('ar')} style={[styles.langBtn, i18n.language === 'ar' && styles.langBtnActive]}>
                <Text style={[styles.langBtnText, i18n.language === 'ar' && styles.langBtnTextActive]}>AR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Welcome Text */}
        <View style={styles.titleSection}>
          <Text style={styles.subtitle}>{t('living_oasis')}</Text>
          <Text style={styles.title1}>{t('welcome')}</Text>
          <Text style={styles.title2}>
            <Text style={styles.titleHighlight}>{t('discover_spirit').split(' ')[0]} </Text>
            {t('discover_spirit').split(' ').slice(1).join(' ')}
          </Text>
        </View>

        {/* 3D Tour Main Card */}
        <TouchableOpacity style={styles.mainCard} onPress={() => navigation.navigate('3DTour')}>
          <Image 
            source={require('../../assets/images/villa-bleue.png')} 
            style={styles.mainCardImage} 
          />
          <LinearGradient
            colors={['transparent', 'rgba(10, 43, 94, 0.9)']}
            style={styles.mainCardGradient}
          >
            <View style={styles.mainCardContentBox}>
              <View>
                <Text style={styles.mainCardTitle}>Villa</Text>
                <Text style={styles.mainCardTitle}>Bleue</Text>
                <Text style={styles.mainCardSubtitle}>{t('immersive_3d_exp')}</Text>
              </View>
              <TouchableOpacity style={styles.tourBtn} onPress={() => navigation.navigate('3DTour')}>
                <Text style={styles.tourBtnText}>{t('start_3d_tour')}</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </TouchableOpacity>
 
        {/* AR and Map Cards */}
        <View style={styles.rowCards}>
          <TouchableOpacity 
            style={[styles.halfCard, {backgroundColor: isDark ? theme.cardBg : '#0A3A69'}]}
            onPress={() => navigation?.navigate('AR')}
          >
            <ScanFace color="#FFF" size={28} />
            <Text style={[styles.halfCardTitle, {color: '#FFF'}]}>{t('launch_ar')}</Text>
            <Text style={[styles.halfCardSubtitle, {color: 'rgba(255,255,255,0.7)'}]}>{t('scan_garden')}</Text>
          </TouchableOpacity>
 
          <TouchableOpacity style={[styles.halfCard, {backgroundColor: isDark ? theme.chatBotBg : '#EAE6DF'}]} onPress={() => navigation.navigate('Map')}>
            <Compass color={isDark ? theme.textDark : '#0A2B5E'} size={28} />
            <Text style={[styles.halfCardTitle, {color: isDark ? theme.textDark : '#0A2B5E'}]}>{t('live_map')}</Text>
            <Text style={[styles.halfCardSubtitle, {color: isDark ? theme.textGray : 'rgba(10,43,94,0.6)'}]}>{t('navigate_paths')}</Text>
          </TouchableOpacity>
        </View>
 
        {/* Garden Wonders Section */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionSubtitle, { color: theme.textDark }]}>{t('the_collection')}</Text>
            <Text style={[styles.sectionTitle, { color: theme.textDark }]}>{t('garden_wonders')}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Collection')}>
            <Text style={[styles.viewAllText, { color: theme.textDark, borderColor: theme.textDark }]}>{t('view_all')}</Text>
          </TouchableOpacity>
        </View>
 
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {zones.map((zone, index) => {
            const design = getZoneDesignProps(zone.typeZone);
            const mainImage = design.fallbackImage;
            return (
              <TouchableOpacity 
                key={zone._id} 
                style={styles.botanicalCard} 
                onPress={() => navigation.navigate('ZoneDetail', { zone })}
              >
                <Image 
                  source={mainImage} 
                  style={styles.botanicalImage} 
                />
                {index === 0 && (
                  <View style={[styles.newBadge, { backgroundColor: theme.badgeBg }]}>
                    <Text style={styles.newBadgeText}>{t('badge_new')}</Text>
                  </View>
                )}
                <Text style={[styles.botanicalTitle, { color: theme.textDark }]}>{t('zone_name_' + zone.typeZone, zone.nom)}</Text>
                <Text style={[styles.botanicalDesc, { color: theme.textGray }]} numberOfLines={1}>{t('zone_desc_' + zone.typeZone, zone.description)}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
 
        {/* AI Curator Section */}
        <View style={[styles.aiCard, { backgroundColor: theme.chatBotBg }]}>
          <Bot color={theme.success} size={28} />
          <Text style={[styles.aiLabel, { color: theme.success }]}>{t('ai_curator')}</Text>
          <Text style={[styles.aiQuote, { color: theme.textDark }]}>{t('quote_text')}</Text>
          <Text style={[styles.aiAuthor, { color: theme.textDark }]}>{t('quote_author')}</Text>
          <TouchableOpacity style={[styles.aiBtn, { backgroundColor: theme.chatUserBg }]} onPress={() => navigation.navigate('Guide')}>
            <Text style={styles.aiBtnText}>{t('talk_to_guide')}</Text>
          </TouchableOpacity>
        </View>

        {/* Spacer for bottom tab bar and floating button */}
        <View style={{height: 120}} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => Linking.openURL('https://tickets.jardinmajorelle.com/visite')}
      >
        <Ticket color="#0A2B5E" size={28} />
        <View style={styles.fabDecor} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F5EE',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A2B5E',
    letterSpacing: 2,
  },
  lockBtn: {
    backgroundColor: 'rgba(10, 43, 94, 0.05)',
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(10, 43, 94, 0.1)',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  langSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(10, 43, 94, 0.05)',
    borderRadius: 15,
    padding: 2,
  },
  langBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  langBtnActive: {
    backgroundColor: '#0A2B5E',
  },
  langBtnText: {
    fontSize: 9,
    fontWeight: '750',
    color: '#68778D',
  },
  langBtnTextActive: {
    color: '#FFF',
  },
  titleSection: {
    marginBottom: 25,
  },
  subtitle: {
    fontSize: 10,
    color: '#348B59',
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 5,
  },
  title1: {
    fontSize: 38,
    fontWeight: '800',
    color: '#0A2B5E',
  },
  title2: {
    fontSize: 38,
    fontWeight: '800',
    color: '#0A2B5E',
  },
  titleHighlight: {
    color: '#127A3A',
    fontStyle: 'italic',
  },
  mainCard: {
    width: '100%',
    height: 380,
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 20,
  },
  mainCardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  mainCardGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  mainCardContentBox: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    margin: 20,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  mainCardTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '700',
  },
  mainCardSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginTop: 5,
  },
  tourBtn: {
    backgroundColor: '#B4B813',
    padding: 15,
    borderRadius: 15,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tourBtnText: {
    color: '#0A2B5E',
    fontWeight: '700',
    fontSize: 10,
    textAlign: 'center',
  },
  rowCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  halfCard: {
    width: '48%',
    height: 160,
    borderRadius: 25,
    padding: 20,
    justifyContent: 'space-between',
  },
  halfCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 20,
  },
  halfCardSubtitle: {
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  sectionSubtitle: {
    fontSize: 10,
    color: '#0A2B5E',
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0A2B5E',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0A2B5E',
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderColor: '#0A2B5E',
  },
  horizontalScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  botanicalCard: {
    width: 220,
    marginRight: 20,
  },
  botanicalImage: {
    width: '100%',
    height: 280,
    borderTopLeftRadius: 110,
    borderTopRightRadius: 110,
    marginBottom: 15,
  },
  historicalImage: {
    width: '100%',
    height: 280,
    borderTopLeftRadius: 110,
    borderTopRightRadius: 110,
    marginBottom: 15,
  },
  historyBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#0A3A69',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
  },
  historyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  newBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#C5C90A',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  botanicalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A2B5E',
    marginBottom: 4,
  },
  botanicalDesc: {
    fontSize: 12,
    color: '#68778D',
  },
  aiCard: {
    backgroundColor: '#EAE6D8',
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  aiLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4E5E2D',
    letterSpacing: 2,
    marginTop: 15,
    marginBottom: 10,
  },
  aiQuote: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A2B5E',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 15,
  },
  aiAuthor: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#0A2B5E',
    marginBottom: 25,
  },
  aiBtn: {
    backgroundColor: '#0A3A69',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
  },
  aiBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 95,
    right: 20,
    width: 60,
    height: 60,
    backgroundColor: '#60EE8A',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#60EE8A',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  fabIcon: {
    width: 24,
    height: 24,
    tintColor: '#0A2B5E',
  },
  fabDecor: {
    position: 'absolute',
    width: 10,
    height: 4,
    backgroundColor: '#0A2B5E',
    borderRadius: 2,
  }
});
