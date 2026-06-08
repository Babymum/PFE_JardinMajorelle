import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { getZones } from '../../api/api';
import ZoneCard from '../components/ZoneCard';
import { useTheme } from '../context/ThemeContext';

export default function CollectionScreen({ navigation }) {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');

  useEffect(() => {
    const fetchZones = async () => {
      setLoading(true);
      try {
        const data = await getZones();
        setZones(data);
      } catch (error) {
        console.log('Error fetching zones in Collection:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchZones();
  }, []);

  const handleBack = () => {
    navigation.goBack();
  };

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

  const filteredZones = useMemo(() => {
    if (activeFilter === 'HISTORICAL') {
      return zones.filter(z => ['villa_bleue', 'musee_berbere'].includes(normalizeZoneType(z.typeZone)));
    }
    if (activeFilter === 'BOTANICAL') {
      return zones.filter(z => ['bassin', 'jardin_bambou', 'jardin_cactus'].includes(normalizeZoneType(z.typeZone)));
    }
    return zones;
  }, [zones, activeFilter]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { backgroundColor: isDark ? theme.chatBotBg : 'rgba(10, 43, 94, 0.05)' }]}>
          <ArrowLeft color={theme.textDark} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textDark }]}>{t('garden_wonders')}</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabContainer, { backgroundColor: isDark ? theme.chatBotBg : 'rgba(230,230,225,0.6)' }]}>
        {['ALL', 'HISTORICAL', 'BOTANICAL'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.tab,
              activeFilter === filter && [styles.tabActive, { backgroundColor: theme.cardBg }]
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text
              style={[
                styles.tabText,
                { color: theme.textGray },
                activeFilter === filter && [styles.tabTextActive, { color: theme.textDark }]
              ]}
            >
              {t(`map_filter_${filter.toLowerCase()}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {filteredZones.map((zone) => (
            <ZoneCard
              key={zone._id}
              zone={zone}
              onPress={() => navigation.navigate('ZoneDetail', { zone })}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 5,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  tabActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tabTextActive: {
    fontWeight: '800',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
});
