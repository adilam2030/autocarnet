// src/screens/AddEditCarScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  StatusBar, TouchableOpacity, Alert, Switch,
} from 'react-native';
import { useCars } from '../context/CarsContext';
import { COLORS, CAR_COLORS, FUEL_TYPES } from '../utils/theme';
import { today, isVTApplicable, getCarAge } from '../utils/helpers';
import { Input, Button, ChipSelect, Card } from '../components/UI';

const EMPTY_CAR = {
  marque: '', modele: '', version: '', immat: '',
  annee: String(new Date().getFullYear()),
  dateMEC: today(), km: '', carburant: 'Essence',
  adblue: false, color: COLORS.primary, notes: '',
  assurance: { compagnie: '', debut: '', echeance: '', montant: '', payee: false },
  revision: { dernierKm: '0', derniereDate: today(), frequence: '10000', garage: '', montant: '' },
  vignette: { payee: false, annee: String(new Date().getFullYear()), montant: '' },
  vt: { faite: false, derniere: '', echeance: '', centre: '', montant: '' },
  adblueData: { dernierKm: '', derniereDate: '', prochainKm: '' },
};

export default function AddEditCarScreen({ route, navigation }) {
  const { mode, carId } = route.params || {};
  const { cars, createCar, editCar } = useCars();
  const existing = carId ? cars.find((c) => c.id === carId) : null;

  const [form, setForm] = useState(existing ? {
    ...EMPTY_CAR, ...existing,
    annee: String(existing.annee),
    km: String(existing.km),
    assurance: { ...EMPTY_CAR.assurance, ...existing.assurance, montant: String(existing.assurance?.montant || '') },
    revision: { ...EMPTY_CAR.revision, ...existing.revision, dernierKm: String(existing.revision?.dernierKm || 0), frequence: String(existing.revision?.frequence || 10000), montant: String(existing.revision?.montant || '') },
    vignette: { ...EMPTY_CAR.vignette, ...existing.vignette, montant: String(existing.vignette?.montant || '') },
    vt: existing.vt ? { ...EMPTY_CAR.vt, ...existing.vt, montant: String(existing.vt?.montant || '') } : EMPTY_CAR.vt,
    adblueData: { ...EMPTY_CAR.adblueData, ...existing.adblueData },
  } : EMPTY_CAR);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const vtApplicable = form.dateMEC ? isVTApplicable(form.dateMEC) : false;

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const setSub = (sub, key, val) => setForm((f) => ({ ...f, [sub]: { ...f[sub], [key]: val } }));

  const validate = () => {
    const e = {};
    if (!form.marque.trim()) e.marque = 'Champ obligatoire';
    if (!form.modele.trim()) e.modele = 'Champ obligatoire';
    if (!form.immat.trim()) e.immat = 'Champ obligatoire';
    if (!form.dateMEC) e.dateMEC = 'Champ obligatoire';
    if (!form.km || isNaN(Number(form.km))) e.km = 'Kilométrage invalide';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const data = {
        ...form,
        annee: Number(form.annee),
        km: Number(form.km),
        assurance: { ...form.assurance, montant: Number(form.assurance.montant) || 0 },
        revision: { ...form.revision, dernierKm: Number(form.revision.dernierKm), frequence: Number(form.revision.frequence), montant: Number(form.revision.montant) || 0 },
        vignette: { ...form.vignette, montant: Number(form.vignette.montant) || 0 },
        vt: vtApplicable ? { ...form.vt, montant: Number(form.vt?.montant) || 0 } : null,
        adblueData: form.adblue ? { ...form.adblueData, dernierKm: Number(form.adblueData.dernierKm) || 0, prochainKm: Number(form.adblueData.prochainKm) || 0 } : null,
      };
      if (mode === 'edit') await editCar(carId, data);
      else await createCar(data);
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
        <Text style={styles.headerTitle}>{mode === 'edit' ? 'Modifier le véhicule' : 'Ajouter un véhicule'}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* ── INFOS GÉNÉRALES ─────────────────────────────────────────────── */}
        <Text style={styles.section}>Informations générales</Text>
        <Input label="Marque" required value={form.marque} onChangeText={(v) => set('marque', v)} placeholder="Ex : Volkswagen" error={errors.marque} />
        <Input label="Modèle" required value={form.modele} onChangeText={(v) => set('modele', v)} placeholder="Ex : T-Roc" error={errors.modele} />
        <Input label="Version" value={form.version} onChangeText={(v) => set('version', v)} placeholder="Ex : 1.5 TSI R-Line" />
        <Input label="Immatriculation" required value={form.immat} onChangeText={(v) => set('immat', v)} placeholder="Ex : A-12345-B" autoCapitalize="characters" error={errors.immat} />
        <Input label="Année" value={form.annee} onChangeText={(v) => set('annee', v)} keyboardType="number-pad" />
        <Input label="Date 1ère mise en circulation" required value={form.dateMEC} onChangeText={(v) => set('dateMEC', v)} placeholder="AAAA-MM-JJ" error={errors.dateMEC} />
        <Input label="Kilométrage actuel" required value={form.km} onChangeText={(v) => set('km', v)} keyboardType="number-pad" placeholder="Ex : 18400" error={errors.km} />
        <ChipSelect label="Carburant" options={FUEL_TYPES} value={form.carburant} onChange={(v) => set('carburant', v)} />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>AdBlue</Text>
          <Switch value={form.adblue} onValueChange={(v) => set('adblue', v)} trackColor={{ true: COLORS.primary }} />
        </View>

        {/* Couleur */}
        <View style={{ marginBottom: 16 }}>
          <Text style={styles.inputLabel}>Couleur</Text>
          <View style={styles.colorRow}>
            {CAR_COLORS.map((c) => (
              <TouchableOpacity key={c} onPress={() => set('color', c)}
                style={[styles.colorDot, { backgroundColor: c }, form.color === c && styles.colorDotSelected]} />
            ))}
          </View>
        </View>

        <Input label="Notes" value={form.notes} onChangeText={(v) => set('notes', v)} placeholder="Optionnel" multiline numberOfLines={3} style={{ minHeight: 80 }} />

        {/* ── RÉVISION ─────────────────────────────────────────────────────── */}
        <Text style={styles.section}>🔧 Révision</Text>
        <Input label="Kilométrage dernière révision" value={form.revision.dernierKm} onChangeText={(v) => setSub('revision', 'dernierKm', v)} keyboardType="number-pad" />
        <Input label="Date dernière révision" value={form.revision.derniereDate} onChangeText={(v) => setSub('revision', 'derniereDate', v)} placeholder="AAAA-MM-JJ" />
        <Input label="Fréquence (km)" value={form.revision.frequence} onChangeText={(v) => setSub('revision', 'frequence', v)} keyboardType="number-pad" />
        <Input label="Garage" value={form.revision.garage} onChangeText={(v) => setSub('revision', 'garage', v)} placeholder="Nom du garage" />
        <Input label="Coût dernière révision (DH)" value={form.revision.montant} onChangeText={(v) => setSub('revision', 'montant', v)} keyboardType="number-pad" />

        {/* ── ASSURANCE ────────────────────────────────────────────────────── */}
        <Text style={styles.section}>🛡️ Assurance</Text>
        <Input label="Compagnie" value={form.assurance.compagnie} onChangeText={(v) => setSub('assurance', 'compagnie', v)} />
        <Input label="Date début" value={form.assurance.debut} onChangeText={(v) => setSub('assurance', 'debut', v)} placeholder="AAAA-MM-JJ" />
        <Input label="Date échéance" value={form.assurance.echeance} onChangeText={(v) => setSub('assurance', 'echeance', v)} placeholder="AAAA-MM-JJ" />
        <Input label="Montant annuel (DH)" value={form.assurance.montant} onChangeText={(v) => setSub('assurance', 'montant', v)} keyboardType="number-pad" />
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Payée</Text>
          <Switch value={form.assurance.payee} onValueChange={(v) => setSub('assurance', 'payee', v)} trackColor={{ true: COLORS.primary }} />
        </View>

        {/* ── VIGNETTE ─────────────────────────────────────────────────────── */}
        <Text style={styles.section}>🏷️ Vignette</Text>
        <Input label="Année" value={form.vignette.annee} onChangeText={(v) => setSub('vignette', 'annee', v)} keyboardType="number-pad" />
        <Input label="Montant (DH)" value={form.vignette.montant} onChangeText={(v) => setSub('vignette', 'montant', v)} keyboardType="number-pad" />
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Payée</Text>
          <Switch value={form.vignette.payee} onValueChange={(v) => setSub('vignette', 'payee', v)} trackColor={{ true: COLORS.primary }} />
        </View>

        {/* ── VISITE TECHNIQUE ──────────────────────────────────────────────── */}
        {vtApplicable && (
          <>
            <Text style={styles.section}>✅ Visite technique</Text>
            <Input label="Date dernière VT" value={form.vt?.derniere} onChangeText={(v) => setSub('vt', 'derniere', v)} placeholder="AAAA-MM-JJ" />
            <Input label="Date échéance VT" value={form.vt?.echeance} onChangeText={(v) => setSub('vt', 'echeance', v)} placeholder="AAAA-MM-JJ" />
            <Input label="Centre de contrôle" value={form.vt?.centre} onChangeText={(v) => setSub('vt', 'centre', v)} />
            <Input label="Montant (DH)" value={form.vt?.montant} onChangeText={(v) => setSub('vt', 'montant', v)} keyboardType="number-pad" />
          </>
        )}

        {/* ── ADBLUE ───────────────────────────────────────────────────────── */}
        {form.adblue && (
          <>
            <Text style={styles.section}>💧 AdBlue</Text>
            <Input label="Kilométrage dernier remplissage" value={form.adblueData.dernierKm} onChangeText={(v) => setSub('adblueData', 'dernierKm', v)} keyboardType="number-pad" />
            <Input label="Date dernier remplissage" value={form.adblueData.derniereDate} onChangeText={(v) => setSub('adblueData', 'derniereDate', v)} placeholder="AAAA-MM-JJ" />
            <Input label="Prochain remplissage (km)" value={form.adblueData.prochainKm} onChangeText={(v) => setSub('adblueData', 'prochainKm', v)} keyboardType="number-pad" />
          </>
        )}

        <Button label={mode === 'edit' ? 'Enregistrer les modifications' : 'Ajouter le véhicule'} onPress={handleSave} loading={loading} style={{ marginTop: 8, marginBottom: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  closeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.neutralLight, borderRadius: 10 },
  content: { padding: 20 },
  section: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginTop: 24, marginBottom: 16, paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: COLORS.primaryLight },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingVertical: 4 },
  switchLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textMed },
  inputLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textMed, marginBottom: 8 },
  colorRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  colorDot: { width: 34, height: 34, borderRadius: 17 },
  colorDotSelected: { borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
});
