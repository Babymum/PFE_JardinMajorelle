import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../theme/theme';
import { getZoneDesignProps } from '../utils/zoneDesign';
import { useTheme } from '../context/ThemeContext';

export default function ZoneCard({ zone, onPress }) {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();

  const props = getZoneDesignProps(zone.typeZone);
  const cardImage = props.fallbackImage;

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: isDark ? theme.chatBotBg : theme.cardBg }]} onPress={onPress}>
      <Image source={cardImage} style={styles.cardImage} />
      <View style={styles.cardInfo}>
        <View style={[styles.badge, { backgroundColor: isDark ? theme[props.type.toLowerCase() + 'Bg'] || theme.cardBg : props.typeColor }]}>
          <Text style={[styles.badgeText, { color: isDark ? theme.textDark : props.typeTextColor }]}>{props.type}</Text>
        </View>
        <Text style={[styles.cardTitle, { color: theme.textDark }]} numberOfLines={1}>{t('zone_name_' + zone.typeZone, zone.nom)}</Text>
        <Text style={[styles.cardDesc, { color: theme.textGray }]} numberOfLines={2}>{t('zone_desc_' + zone.typeZone, zone.description)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 15,
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 15,
  },
  cardInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 3,
  },
  cardDesc: {
    fontSize: 11,
    color: COLORS.textGray,
    lineHeight: 15,
  },
});
