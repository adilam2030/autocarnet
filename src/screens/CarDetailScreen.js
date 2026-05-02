// src/screens/CarDetailScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Alert, FlatList,
} from 'react-native';
import { useCars } from '../context/CarsContext';
import { COLORS } from '../utils/theme';
import {
  fmtKm, fmtDate, fmtMoney, getRevisionStatus, getAssuranceStatus,
  getVTStatus, getVignetteStatus, getAdBlueStatus, getCarAge,
  isVTApplicable, getNextRevKm, getTotalDepenses, getDepensesByType, getDepensesByYear,
} from '../utils/helpers';
import { Card, InfoRow, StatusBadge, Button, ConfirmModal, EmptyState, SmallButton } from '../components/UI';
import { exportCarnetPDF } from '../utils/pdfExport';

const TABS = [
  { key: 'entretien', label: 'Entretien' },
  { key: 'historique', label: 'Historique' },
  { key: 'depenses', label: 'Dépenses' },
  { key: 'infos', label: 'Infos' },
];

export default function CarDetailScreen({ route, navigation }) {
  const { carId } = route.params;
  const { cars, operations, subscribeCarOps, updateKm, removeCar, archive } = useCars();
  const car = cars.find((c) => c.id === carId);
  const ops = operations[carId] || [];
  const [tab, setTab] = useState('entretien');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!carId) return;
    const unsub = subscribeCarOps(carId);
    return unsub;
  }, [carId]);

  if (!car) return null;

  const revStatus = getRevisionStatus(car);
  const assStatus = getAssuranceStatus(car);
  const vtStatus = getVTStatus(car);
  const vigStatus = getVignetteStatus(car);
  const adblueStatus = getAdBlueStatus(car);
  const nextRev = getNextRevKm(car);
  const vtApplicable = isVTApplicable(car.dateMEC);
  const age = getCarAge(car.dateMEC);
  const totalDep = getTotalDepenses(ops);

  const handleDelete = async () => {
    await removeCar(carId);
    setConfirmDelete(false);
    navigation.goBack();
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportCarnetPDF(car, ops);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de générer le PDF');
    } finally {
      setExporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={{ color: '#fff', fontSize: 18 }}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{car.marque} {car.modele}</Text>
            <Text style={styles.headerSub}>{car.immat} · {car.annee}</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('AddEditCar', { mode: 'edit', carId })}
            style={styles.editBtn}
          >
            <Text style={{ color: '#fff', fontSize: 16 }}>✏️</Text>
          </TouchableOpacity>
        </View>

        {/* KM Hero */}
        <View style={styles.kmHero}>
          <View>
            <Text style={styles.kmLabel}>Kilométrage actuel</Text>
            <Text style={styles.kmValue}>{car.km?.toLocaleString('fr-FR')} km</Text>
          </View>
          <TouchableOpacity
            style={styles.kmBtn}
            onPress={() => {
              Alert.prompt(
                'Mettre à jour le kilométrage',
                `Actuel : ${fmtKm(car.km)}`,
                [
                  { text: 'Annuler', style: 'cancel' },
                  {
                    text: 'Enregistrer',
                    onPress: (val) => {
                      const n = parseInt(val, 10);
                      if (!isNaN(n) && n >= car.km) updateKm(carId, n);
                      else Alert.alert('Erreur', 'Le kilométrage doit être supérieur ou égal au kilométrage actuel');
                    },
                  },
                ],
                'plain-text',
                String(car.km),
                'numeric'
              );
            }}
          >
            <Text style={styles.kmBtnText}>Mettre à jour</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setTab(t.key)}
            style={[styles.tab, tab === t.key && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── ENTRETIEN ───────────────────────────────────────────────────── */}
        {tab === 'entretien' && (
          <>
            {/* Révision */}
            <Card>
              <View style={styles.moduleHeader}>
                <Text style={styles.moduleTitle}>🔧 Révision</Text>
                <StatusBadge status={revStatus} label={revStatus === 'ok' ? 'À jour' : revStatus === 'warning' ? 'Bientôt' : 'En retard'} />
              </View>
              <InfoRow label="Dernière révision" value={`${fmtKm(car.revision?.dernierKm)} · ${fmtDate(car.revision?.derniereDate)}`} />
              <InfoRow label="Fréquence" value={fmtKm(car.revision?.frequence || 10000)} />
              <InfoRow label="Prochaine révision" value={fmtKm(nextRev)} />
              <InfoRow label="Restant" value={`${(nextRev - car.km).toLocaleString('fr-FR')} km`} />
              {car.revision?.garage && <InfoRow label="Garage" value={car.revision.garage} />}
              <InfoRow label="Dernier coût" value={fmtMoney(car.revision?.montant)} last />
              <TouchableOpacity
                style={styles.moduleAction}
                onPress={() => navigation.navigate('AddEditCar', { mode: 'edit', carId, section: 'revision' })}
              >
                <Text style={styles.moduleActionText}>Modifier la révision</Text>
              </TouchableOpacity>
            </Card>

            {/* Assurance */}
            <Card>
              <View style={styles.moduleHeader}>
                <Text style={styles.moduleTitle}>🛡️ Assurance</Text>
                <StatusBadge status={assStatus} label={assStatus === 'ok' ? 'Valide' : assStatus === 'warning' ? 'Bientôt' : 'Expirée'} />
              </View>
              <InfoRow label="Compagnie" value={car.assurance?.compagnie || '—'} />
              <InfoRow label="Début" value={fmtDate(car.assurance?.debut)} />
              <InfoRow label="Échéance" value={fmtDate(car.assurance?.echeance)} />
              <InfoRow label="Montant annuel" value={fmtMoney(car.assurance?.montant)} last />
            </Card>

            {/* Visite technique */}
            <Card>
              <View style={styles.moduleHeader}>
                <Text style={styles.moduleTitle}>✅ Visite technique</Text>
                <StatusBadge status={vtStatus} label={!vtApplicable ? 'N/A' : vtStatus === 'ok' ? 'À jour' : vtStatus === 'warning' ? 'Bientôt' : 'Expirée'} />
              </View>
              {!vtApplicable ? (
                <Text style={styles.naText}>
                  Non applicable — véhicule de {age} an{age > 1 ? 's' : ''}.{'\n'}
                  Obligatoire à partir de 5 ans.
                </Text>
              ) : car.vt?.echeance ? (
                <>
                  <InfoRow label="Dernière VT" value={fmtDate(car.vt.derniere)} />
                  <InfoRow label="Échéance" value={fmtDate(car.vt.echeance)} />
                  <InfoRow label="Centre" value={car.vt.centre} />
                  <InfoRow label="Montant" value={fmtMoney(car.vt.montant)} last />
                </>
              ) : (
                <Text style={[styles.naText, { color: COLORS.danger }]}>
                  ⚠️ Visite technique non renseignée
                </Text>
              )}
            </Card>

            {/* Vignette */}
            <Card>
              <View style={styles.moduleHeader}>
                <Text style={styles.moduleTitle}>🏷️ Vignette</Text>
                <StatusBadge status={vigStatus} label={car.vignette?.payee ? 'Payée' : 'À payer'} />
              </View>
              <InfoRow label="Année" value={String(car.vignette?.annee || new Date().getFullYear())} />
              <InfoRow label="Montant" value={fmtMoney(car.vignette?.montant)} last />
            </Card>

            {/* AdBlue */}
            {car.adblue && (
              <Card>
                <View style={styles.moduleHeader}>
                  <Text style={styles.moduleTitle}>💧 AdBlue</Text>
                  <StatusBadge status={adblueStatus} label={adblueStatus === 'ok' ? 'OK' : adblueStatus === 'warning' ? 'Bientôt' : 'À remplir'} />
                </View>
                <InfoRow label="Dernier remplissage" value={`${fmtKm(car.adblueData?.dernierKm)} · ${fmtDate(car.adblueData?.derniereDate)}`} />
                <InfoRow label="Prochain remplissage" value={fmtKm(car.adblueData?.prochainKm)} last />
              </Card>
            )}

            {/* Actions rapides */}
            <Card>
              <Text style={styles.moduleTitle}>Actions rapides</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                <Button
                  label="+ Opération"
                  onPress={() => navigation.navigate('AddOperation', { carId })}
                  style={{ flex: 1 }}
                />
                <Button
                  label="📄 Exporter"
                  variant="outline"
                  onPress={handleExport}
                  loading={exporting}
                  style={{ flex: 1 }}
                />
              </View>
            </Card>
          </>
        )}

        {/* ── HISTORIQUE ──────────────────────────────────────────────────── */}
        {tab === 'historique' && (
          <>
            <View style={styles.histHeader}>
              <Text style={styles.histTitle}>Historique ({ops.length})</Text>
              <SmallButton label="+ Ajouter" onPress={() => navigation.navigate('AddOperation', { carId })} />
            </View>
            {ops.length === 0 ? (
              <EmptyState emoji="📋" title="Aucune opération" subtitle="Ajoutez votre première opération d'entretien" />
            ) : (
              ops.sort((a, b) => b.date?.localeCompare(a.date)).map((op) => (
                <Card key={op.id}>
                  <View style={styles.opRow}>
                    <View style={styles.opIcon}>
                      <Text style={{ fontSize: 20 }}>🔧</Text>
                    </View>
                    <View style={styles.opInfo}>
                      <View style={styles.opHeader}>
                        <Text style={styles.opType}>{op.type}</Text>
                        <Text style={styles.opMontant}>{fmtMoney(op.montant)}</Text>
                      </View>
                      <Text style={styles.opMeta}>{fmtDate(op.date)} · {fmtKm(op.km)}</Text>
                      {op.garage ? <Text style={styles.opGarage}>{op.garage}</Text> : null}
                      {op.note ? <Text style={styles.opNote}>{op.note}</Text> : null}
                    </View>
                  </View>
                </Card>
              ))
            )}
          </>
        )}

        {/* ── DÉPENSES ────────────────────────────────────────────────────── */}
        {tab === 'depenses' && (
          <>
            <Card style={{ alignItems: 'center', padding: 24 }}>
              <Text style={{ fontSize: 13, color: COLORS.textLight }}>Total dépensé</Text>
              <Text style={{ fontSize: 36, fontWeight: '800', color: COLORS.primary, marginTop: 4 }}>{fmtMoney(totalDep)}</Text>
              <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>{ops.length} opérations</Text>
            </Card>

            {getDepensesByType(ops).length > 0 && (
              <Card>
                <Text style={styles.moduleTitle}>Par type d'opération</Text>
                <View style={{ marginTop: 12, gap: 10 }}>
                  {getDepensesByType(ops).map(({ type, montant }, i) => (
                    <View key={type}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={{ fontSize: 13, color: COLORS.textMed }}>{type}</Text>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.text }}>{fmtMoney(montant)}</Text>
                      </View>
                      <View style={{ height: 6, backgroundColor: COLORS.neutralLight, borderRadius: 3, overflow: 'hidden' }}>
                        <View style={{
                          height: '100%', borderRadius: 3,
                          width: `${Math.round(montant / totalDep * 100)}%`,
                          backgroundColor: [COLORS.primary, '#0e9f6e', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5],
                        }} />
                      </View>
                    </View>
                  ))}
                </View>
              </Card>
            )}

            {getDepensesByYear(ops).length > 0 && (
              <Card>
                <Text style={styles.moduleTitle}>Par année</Text>
                <View style={{ marginTop: 12, gap: 6 }}>
                  {getDepensesByYear(ops).map(([year, montant]) => (
                    <InfoRow key={year} label={year} value={fmtMoney(montant)} />
                  ))}
                </View>
              </Card>
            )}
          </>
        )}

        {/* ── INFOS ───────────────────────────────────────────────────────── */}
        {tab === 'infos' && (
          <>
            <Card>
              <Text style={styles.moduleTitle}>Informations générales</Text>
              <View style={{ marginTop: 10 }}>
                <InfoRow label="Marque" value={car.marque} />
                <InfoRow label="Modèle" value={car.modele} />
                <InfoRow label="Version" value={car.version || '—'} />
                <InfoRow label="Immatriculation" value={car.immat} />
                <InfoRow label="Année" value={String(car.annee)} />
                <InfoRow label="1ère MEC" value={fmtDate(car.dateMEC)} />
                <InfoRow label="Âge" value={`${age} an${age > 1 ? 's' : ''}`} />
                <InfoRow label="Carburant" value={car.carburant} />
                <InfoRow label="AdBlue" value={car.adblue ? 'Oui' : 'Non'} last />
              </View>
            </Card>

            <Card>
              <Text style={styles.moduleTitle}>Notes</Text>
              <Text style={{ fontSize: 13, color: car.notes ? COLORS.textMed : COLORS.textMuted, marginTop: 8, lineHeight: 20 }}>
                {car.notes || 'Aucune note.'}
              </Text>
            </Card>

            {/* Danger zone */}
            <Card style={{ borderWidth: 1, borderColor: '#fee2e2' }}>
              <Text style={[styles.moduleTitle, { color: COLORS.danger }]}>Zone de danger</Text>
              <View style={{ gap: 10, marginTop: 12 }}>
                <Button label="Archiver ce véhicule" variant="outline" onPress={() => {
                  Alert.alert('Archiver', 'Ce véhicule sera archivé et n\'apparaîtra plus dans la liste.', [
                    { text: 'Annuler' },
                    { text: 'Archiver', onPress: () => { archive(carId); navigation.goBack(); } },
                  ]);
                }} />
                <Button label="Supprimer ce véhicule" variant="danger" onPress={() => setConfirmDelete(true)} />
              </View>
            </Card>
          </>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      <ConfirmModal
        visible={confirmDelete}
        title="Supprimer le véhicule"
        message={`Voulez-vous vraiment supprimer ${car.marque} ${car.modele} (${car.immat}) ? Cette action est irréversible.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
        danger
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.primary, padding: 20, paddingBottom: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  editBtn: { backgroundColor: 'rgba(255,255,255,0.15)', width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  kmHero: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kmLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  kmValue: { fontSize: 28, fontWeight: '800', color: '#fff', marginTop: 2 },
  kmBtn: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  kmBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: COLORS.primary },
  tabText: { fontSize: 12, fontWeight: '600', color: COLORS.textLight },
  tabTextActive: { color: COLORS.primary },
  content: { padding: 16 },
  moduleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  moduleTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  moduleAction: { marginTop: 12, alignSelf: 'flex-start' },
  moduleActionText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  naText: { fontSize: 13, color: COLORS.textLight, lineHeight: 20 },
  histHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  histTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  opRow: { flexDirection: 'row', gap: 12 },
  opIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  opInfo: { flex: 1 },
  opHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  opType: { fontSize: 14, fontWeight: '700', color: COLORS.text, flex: 1 },
  opMontant: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  opMeta: { fontSize: 12, color: COLORS.textLight, marginTop: 3 },
  opGarage: { fontSize: 12, color: COLORS.textLight, marginTop: 1 },
  opNote: { fontSize: 12, color: COLORS.textMed, marginTop: 4, fontStyle: 'italic' },
});
