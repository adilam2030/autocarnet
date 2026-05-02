// src/screens/DashboardScreen.js
import React, { useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, RefreshControl,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useCars } from '../context/CarsContext';
import { COLORS } from '../utils/theme';
import { fmtKm, fmtDate, getGlobalStatus, getRevisionStatus, getAssuranceStatus, getNextRevKm, buildAlerts } from '../utils/helpers';
import { Card, StatusBadge, SyncIndicator, EmptyState, SmallButton } from '../components/UI';

const STATUS_COLOR = { ok: COLORS.success, warning: COLORS.warning, urgent: COLORS.danger };

export default function DashboardScreen({ navigation }) {
  const { profile } = useAuth();
  const { cars, loading, syncStatus } = useCars();

  const alerts = buildAlerts(cars);
  const urgentCount = alerts.filter((a) => a.type === 'urgent').length;
  const warningCount = alerts.filter((a) => a.type === 'warning').length;

  const renderCar = ({ item: car }) => {
    const gs = getGlobalStatus(car);
    const revStatus = getRevisionStatus(car);
    const assStatus = getAssuranceStatus(car);
    const nextRev = getNextRevKm(car);

    return (
      <Card onPress={() => navigation.navigate('CarDetail', { carId: car.id })} style={styles.carCard}>
        <View style={styles.carCardRow}>
          {/* Icon */}
          <View style={[styles.carIcon, { backgroundColor: (car.color || COLORS.primary) + '20' }]}>
            <Text style={{ fontSize: 26 }}>🚗</Text>
          </View>
          {/* Info */}
          <View style={styles.carInfo}>
            <View style={styles.carHeader}>
              <Text style={styles.carName}>{car.marque} {car.modele}</Text>
              <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[gs] }]} />
            </View>
            <Text style={styles.carSub}>{car.immat} · {car.carburant}</Text>
            {car.version ? <Text style={styles.carVersion}>{car.version}</Text> : null}
          </View>
        </View>

        {/* Badges */}
        <View style={styles.badges}>
          <View style={styles.kmBadge}>
            <Text style={styles.kmText}>{fmtKm(car.km)}</Text>
          </View>
          <StatusBadge
            status={revStatus}
            label={`Révision ${fmtKm(nextRev)}`}
            small
          />
          <StatusBadge
            status={assStatus}
            label={`Assurance ${fmtDate(car.assurance?.echeance)}`}
            small
          />
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />

      {/* Header gradient */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Bonjour,</Text>
            <Text style={styles.userName}>{profile?.name || 'Utilisateur'} 👋</Text>
          </View>
          <SyncIndicator status={syncStatus} />
        </View>

        {/* Alert banner */}
        {(urgentCount > 0 || warningCount > 0) && (
          <TouchableOpacity
            style={styles.alertBanner}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.85}
          >
            <Text style={styles.alertText}>
              {urgentCount > 0 && `🔴 ${urgentCount} alerte${urgentCount > 1 ? 's' : ''} urgente${urgentCount > 1 ? 's' : ''}  `}
              {warningCount > 0 && `🟡 ${warningCount} échéance${warningCount > 1 ? 's' : ''} proche${warningCount > 1 ? 's' : ''}`}
            </Text>
            <Text style={styles.alertArrow}>›</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Cars list */}
      <View style={styles.listWrap}>
        <FlatList
          data={cars}
          keyExtractor={(c) => String(c.id)}
          renderItem={renderCar}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={loading} colors={[COLORS.primary]} />}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Mes véhicules ({cars.length})</Text>
              <SmallButton
                label="+ Ajouter"
                onPress={() => navigation.navigate('AddEditCar', { mode: 'add' })}
              />
            </View>
          }
          ListEmptyComponent={
            !loading && (
              <EmptyState
                emoji="🚗"
                title="Aucun véhicule"
                subtitle="Ajoutez votre premier véhicule pour commencer le suivi"
                action={
                  <SmallButton
                    label="Ajouter un véhicule"
                    onPress={() => navigation.navigate('AddEditCar', { mode: 'add' })}
                  />
                }
              />
            )
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.primary, padding: 20, paddingBottom: 28 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  greeting: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  userName: { color: '#fff', fontSize: 22, fontWeight: '800' },
  alertBanner: {
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14,
    padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  alertText: { color: '#fff', fontSize: 13, fontWeight: '600', flex: 1 },
  alertArrow: { color: '#fff', fontSize: 20, marginLeft: 8 },
  listWrap: { flex: 1, marginTop: -16 },
  listContent: { padding: 16, paddingTop: 20, paddingBottom: 100 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  listTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },

  carCard: { marginBottom: 14 },
  carCardRow: { flexDirection: 'row', gap: 14, marginBottom: 12 },
  carIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  carInfo: { flex: 1 },
  carHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  carName: { fontSize: 16, fontWeight: '700', color: COLORS.text, flex: 1 },
  carSub: { fontSize: 12, color: COLORS.textLight, marginTop: 3 },
  carVersion: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4, flexShrink: 0 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  kmBadge: { backgroundColor: COLORS.neutralLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  kmText: { fontSize: 12, fontWeight: '700', color: COLORS.textMed },
});
