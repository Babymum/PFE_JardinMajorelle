import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/theme';
import { AlertOctagon } from 'lucide-react-native';

export default function ErrorState({ message, onRetry }) {
  return (
    <View style={styles.container}>
      <AlertOctagon color={COLORS.danger} size={48} />
      <Text style={styles.errorText}>{message || 'Une erreur est survenue lors de la récupération des données.'}</Text>
      {onRetry ? (
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
          <Text style={styles.retryText}>Réessayer</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    paddingHorizontal: 30,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
    lineHeight: 20,
  },
  retryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: COLORS.textLight,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.5,
  },
});
