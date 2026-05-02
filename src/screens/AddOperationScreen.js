// src/screens/AddOperationScreen.js
import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  StatusBar, TouchableOpacity, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useCars } from '../context/CarsContext';
import { useAuth } from '../context/AuthContext';
import { COLORS, OP_TYPES } from '../utils/theme';
import { today } from '../utils/helpers';
import { Input, Button, ChipSelect, Card } from '../components/UI';
import { uploadDocument } from '../utils/firebase';

export default function AddOperationScreen({ route, navigation }) {
  const { carId } = route.params;
  const { cars, createOperation } = useCars();
  const { user } = useAuth();
  const car = cars.find((c) => c.id === carId);

  const [form, setForm] = useState({
    date: today(), km: String(car?.km || ''), type: 'Vidange',
    garage: '', montant: '', note: '',
  });
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission refusée'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const handleSave = async () => {
    if (!form.date || !form.km) { Alert.alert('Erreur', 'Date et kilométrage sont obligatoires'); return; }
    setLoading(true);
    try {
      let photoURL = null;
      if (photo) {
        const path = `documents/${user.uid}/${carId}/${Date.now()}.jpg`;
        photoURL = await uploadDocument(photo, path);
      }
      await createOperation({
        ...form, carId, km: Number(form.km), montant: Number(form.montant) || 0,
        photoURL,
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de sauvegarder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Text style={{ fontSize: 18 }}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvelle opération</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.carName}>{car?.marque} {car?.modele} · {car?.immat}</Text>

        <Input label="Date" required value={form.date} onChangeText={(v) => set('date', v)} placeholder="AAAA-MM-JJ" />
        <Input label="Kilométrage" required value={form.km} onChangeText={(v) => set('km', v)} keyboardType="number-pad" />
        <ChipSelect
          label="Type d'opération"
          options={OP_TYPES}
          value={form.type}
          onChange={(v) => set('type', v)}
        />
        <Input label="Garage / Prestataire" value={form.garage} onChangeText={(v) => set('garage', v)} placeholder="Optionnel" />
        <Input label="Montant (DH)" value={form.montant} onChangeText={(v) => set('montant', v)} keyboardType="number-pad" placeholder="0" />
        <Input label="Commentaire" value={form.note} onChangeText={(v) => set('note', v)} placeholder="Optionnel" multiline numberOfLines={3} />

        {/* Photo facture */}
        <TouchableOpacity onPress={pickPhoto} style={styles.photoBtn}>
          <Text style={styles.photoBtnText}>{photo ? '✅ Photo ajoutée' : '📷 Ajouter une facture/photo'}</Text>
        </TouchableOpacity>

        <Button label="Enregistrer l'opération" onPress={handleSave} loading={loading} style={{ marginTop: 8, marginBottom: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── NOTIFICATIONS SCREEN ─────────────────────────────────────────────────────
export function NotificationsScreen({ navigation }) {
  const { cars } = useCars();
  const { buildAlerts, fmtKm, fmtDate } = require('../utils/helpers');
  const alerts = buildAlerts(cars);
  const urgent = alerts.filter((a) => a.type === 'urgent');
  const warning = alerts.filter((a) => a.type === 'warning');

  const renderAlert = (alert, i) => (
    <Card key={i} style={{ marginBottom: 10 }}>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
        <View style={[styles2.alertIcon, { backgroundColor: alert.type === 'urgent' ? '#fee2e2' : '#fef3c7' }]}>
          <Text style={{ fontSize: 18 }}>{alert.type === 'urgent' ? '🔴' : '🟡'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.text }}>{alert.car}</Text>
          <Text style={{ fontSize: 13, color: COLORS.textLight, marginTop: 2 }}>{alert.msg}</Text>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StatusBar barStyle="dark-content" />
      <View style={styles2.header}>
        <Text style={styles2.title}>🔔 Alertes</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {alerts.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Text style={{ fontSize: 56 }}>✅</Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: 12 }}>Tout est à jour !</Text>
            <Text style={{ fontSize: 14, color: COLORS.textLight, marginTop: 6 }}>Aucune alerte en cours</Text>
          </View>
        ) : (
          <>
            {urgent.length > 0 && (
              <>
                <Text style={styles2.sectionLabel}>🔴 Urgents ({urgent.length})</Text>
                {urgent.map(renderAlert)}
              </>
            )}
            {warning.length > 0 && (
              <>
                <Text style={styles2.sectionLabel}>🟡 À surveiller ({warning.length})</Text>
                {warning.map(renderAlert)}
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── DEPENSES SCREEN ──────────────────────────────────────────────────────────
export function DepensesScreen() {
  const { cars, operations } = useCars();
  const { getTotalDepenses, getDepensesByType, fmtMoney } = require('../utils/helpers');

  const allOps = Object.values(operations).flat();
  const totalGlobal = allOps.reduce((s, op) => s + (Number(op.montant) || 0), 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StatusBar barStyle="dark-content" />
      <View style={styles2.header}>
        <Text style={styles2.title}>💰 Dépenses</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Card style={{ alignItems: 'center', padding: 24, marginBottom: 12 }}>
          <Text style={{ fontSize: 13, color: COLORS.textLight }}>Total tous véhicules</Text>
          <Text style={{ fontSize: 36, fontWeight: '800', color: COLORS.primary, marginTop: 4 }}>{fmtMoney(totalGlobal)}</Text>
          <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>{allOps.length} opérations · {cars.length} véhicule{cars.length > 1 ? 's' : ''}</Text>
        </Card>
        {cars.map((car) => {
          const ops = operations[car.id] || [];
          const total = getTotalDepenses(ops);
          if (ops.length === 0) return null;
          return (
            <Card key={car.id} style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', marginBottom: 12 }}>{car.marque} {car.modele}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={{ fontSize: 13, color: COLORS.textLight }}>Total</Text>
                <Text style={{ fontSize: 16, fontWeight: '800', color: COLORS.primary }}>{fmtMoney(total)}</Text>
              </View>
              {getDepensesByType(ops).slice(0, 4).map(({ type, montant }, i) => (
                <View key={type} style={{ marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                    <Text style={{ fontSize: 12, color: COLORS.textLight }}>{type}</Text>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.text }}>{fmtMoney(montant)}</Text>
                  </View>
                  <View style={{ height: 4, backgroundColor: COLORS.neutralLight, borderRadius: 2 }}>
                    <View style={{ height: '100%', width: `${Math.round(montant / total * 100)}%`, borderRadius: 2, backgroundColor: [COLORS.primary, '#0e9f6e', '#f59e0b', '#ef4444'][i % 4] }} />
                  </View>
                </View>
              ))}
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── SETTINGS SCREEN ─────────────────────────────────────────────────────────
export function SettingsScreen({ navigation }) {
  const { profile, signOut } = useAuth();
  const { cars, syncStatus } = useCars();

  const items = [
    { emoji: '☁️', label: 'Synchronisation', sub: syncStatus === 'synced' ? 'Synchronisé' : 'En attente', badge: syncStatus === 'synced' ? '✅' : '🔄' },
    { emoji: '🔔', label: 'Notifications', sub: 'Gérer les rappels' },
    { emoji: '🌙', label: 'Thème', sub: 'Clair' },
    { emoji: '📏', label: 'Unité', sub: 'Kilomètres' },
    { emoji: '🌍', label: 'Langue', sub: 'Français' },
    { emoji: '📄', label: 'Exporter mes données', sub: 'PDF · CSV' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StatusBar barStyle="dark-content" />
      <View style={styles2.header}><Text style={styles2.title}>⚙️ Paramètres</Text></View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Profil */}
        <Card style={{ alignItems: 'center', padding: 24, marginBottom: 16 }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 26, color: '#fff', fontWeight: '700' }}>
              {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={{ fontSize: 17, fontWeight: '700', color: COLORS.text }}>{profile?.name}</Text>
          <Text style={{ fontSize: 13, color: COLORS.textLight, marginTop: 2 }}>{profile?.email}</Text>
          <Text style={{ fontSize: 11, color: COLORS.success, marginTop: 6, fontWeight: '600' }}>✅ Synchronisé avec Google</Text>
        </Card>

        <Card>
          {items.map((item, i) => (
            <TouchableOpacity key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: i < items.length - 1 ? 1 : 0, borderBottomColor: COLORS.border }}>
              <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '600', fontSize: 14, color: COLORS.text }}>{item.label}</Text>
                <Text style={{ fontSize: 12, color: COLORS.textLight, marginTop: 2 }}>{item.sub}</Text>
              </View>
              {item.badge && <Text>{item.badge}</Text>}
              <Text style={{ color: COLORS.textMuted, fontSize: 18 }}>›</Text>
            </TouchableOpacity>
          ))}
        </Card>

        <View style={{ marginTop: 24, gap: 10 }}>
          <Button
            label="Se déconnecter"
            variant="outline"
            onPress={() => {
              Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
                { text: 'Annuler' },
                { text: 'Déconnecter', onPress: signOut },
              ]);
            }}
          />
          <Text style={{ textAlign: 'center', fontSize: 11, color: COLORS.textMuted }}>
            AutoCarnet v1.0.0 · {cars.length} véhicule{cars.length > 1 ? 's' : ''}
          </Text>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Documents screen placeholder
export function DocumentsScreen({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={styles2.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
          <Text style={{ fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles2.title}>📄 Documents</Text>
      </View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 48 }}>📄</Text>
        <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.text, marginTop: 12 }}>Documents</Text>
        <Text style={{ fontSize: 13, color: COLORS.textLight, marginTop: 6, textAlign: 'center', padding: 24 }}>
          Vos factures et documents sont attachés à chaque opération d'entretien.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  closeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.neutralLight, borderRadius: 10 },
  content: { padding: 20 },
  carName: { fontSize: 14, fontWeight: '600', color: COLORS.textLight, marginBottom: 20 },
  photoBtn: { borderWidth: 2, borderColor: COLORS.border, borderRadius: 12, borderStyle: 'dashed', padding: 16, alignItems: 'center', marginBottom: 16 },
  photoBtnText: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
});

const styles2 = StyleSheet.create({
  header: { backgroundColor: '#fff', padding: 20, paddingTop: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border, flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  alertIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginTop: 8, marginBottom: 8 },
});
