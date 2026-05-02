// src/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image,
  SafeAreaView, ActivityIndicator, Alert, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../utils/theme';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de se connecter. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#1a56db', '#0e3a8a', '#071d5a']} style={styles.container}>
        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoBox}>
            <Text style={styles.logoEmoji}>🚗</Text>
          </View>
          <Text style={styles.appName}>AutoCarnet</Text>
          <Text style={styles.tagline}>Votre carnet d'entretien intelligent</Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          {[
            ['☁️', 'Synchronisation automatique'],
            ['🚗', 'Multi-véhicules'],
            ['🔔', 'Rappels intelligents'],
            ['📄', 'Export PDF'],
          ].map(([emoji, label]) => (
            <View key={label} style={styles.feature}>
              <Text style={styles.featureEmoji}>{emoji}</Text>
              <Text style={styles.featureText}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bienvenue</Text>
          <Text style={styles.cardSub}>
            Connectez-vous pour accéder à vos véhicules et synchroniser vos données automatiquement.
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleLogin}
            disabled={loading}
            style={styles.googleBtn}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.googleText}>Continuer avec Google</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.legal}>
            Vos données sont privées et sécurisées via Firebase.{'\n'}
            Aucune clé ou code à saisir.
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', padding: 24 },
  logoWrap: { alignItems: 'center', paddingTop: 32 },
  logoBox: {
    width: 88, height: 88, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logoEmoji: { fontSize: 44 },
  appName: { fontSize: 34, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 4 },

  features: { gap: 12 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: 14 },
  featureEmoji: { fontSize: 22 },
  featureText: { fontSize: 14, color: '#fff', fontWeight: '600' },

  card: { backgroundColor: '#fff', borderRadius: 24, padding: 28 },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 6 },
  cardSub: { fontSize: 13, color: '#6b7280', lineHeight: 20, marginBottom: 24 },

  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 12, padding: 16, borderRadius: 14,
    borderWidth: 2, borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  googleIcon: { fontSize: 20, fontWeight: '800', color: '#4285F4' },
  googleText: { fontSize: 15, fontWeight: '700', color: '#374151' },

  legal: { fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 16, lineHeight: 16 },
});
