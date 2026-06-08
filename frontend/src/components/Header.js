import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

export default function Header({ title, onBack, rightElement }) {
  const { theme } = useTheme();
  return (
    <View style={styles.header}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={[styles.backBtn, { borderColor: theme.accent, backgroundColor: theme.inputBg }]}>
          <ArrowLeft color={theme.primary} size={24} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 44 }} />
      )}
      <Text style={[styles.headerTitle, { color: theme.textDark }]}>{title || 'JARDIN MAJORELLE'}</Text>
      {rightElement ? (
        rightElement
      ) : (
        <View style={{ width: 44 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
    color: COLORS.primary,
    letterSpacing: 2,
    textAlign: 'center',
    flex: 1,
  },
  backBtn: {
    backgroundColor: 'rgba(10, 43, 94, 0.1)',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
