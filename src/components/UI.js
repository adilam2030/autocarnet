// src/components/UI.js
import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  TextInput, ScrollView, Modal, Platform,
} from 'react-native';
import { COLORS, RADIUS, SHADOW, STATUS_CONFIG, FONTS } from '../utils/theme';

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
export const StatusBadge = ({ status, label, small }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.na;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <View style={[styles.badgeDot, { backgroundColor: cfg.dot }]} />
      <Text style={[styles.badgeText, { color: cfg.color }, small && { fontSize: 10 }]}>
        {label || cfg.label}
      </Text>
    </View>
  );
};

// ─── CARD ─────────────────────────────────────────────────────────────────────
export const Card = ({ children, style, onPress }) => {
  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[styles.card, style]}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
};

// ─── SECTION TITLE ────────────────────────────────────────────────────────────
export const SectionTitle = ({ title, action }) => (
  <View style={styles.sectionTitle}>
    <Text style={styles.sectionTitleText}>{title}</Text>
    {action}
  </View>
);

// ─── ROW INFO ─────────────────────────────────────────────────────────────────
export const InfoRow = ({ label, value, status, last }) => (
  <View style={[styles.infoRow, last && { borderBottomWidth: 0 }]}>
    <Text style={styles.infoLabel}>{label}</Text>
    {status ? (
      <StatusBadge status={status} label={value} small />
    ) : (
      <Text style={styles.infoValue}>{value || '—'}</Text>
    )}
  </View>
);

// ─── BUTTON ───────────────────────────────────────────────────────────────────
export const Button = ({ label, onPress, variant = 'primary', icon, loading, style, disabled }) => {
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';

  const bgColor = isPrimary ? COLORS.primary
    : isDanger ? COLORS.danger
    : isOutline || isGhost ? 'transparent'
    : COLORS.primary;

  const textColor = isPrimary || isDanger ? '#fff'
    : isOutline ? COLORS.primary
    : COLORS.textLight;

  const borderColor = isOutline ? COLORS.primary
    : isDanger ? COLORS.danger
    : COLORS.border;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={loading || disabled}
      style={[
        styles.button,
        { backgroundColor: bgColor, borderColor, borderWidth: isOutline || isDanger ? 2 : 0 },
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon && <View style={{ marginRight: 8, width: 18, height: 18 }}>{icon}</View>}
          <Text style={[styles.buttonText, { color: textColor }]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

// ─── SMALL BUTTON ─────────────────────────────────────────────────────────────
export const SmallButton = ({ label, onPress, variant = 'primary' }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={onPress}
    style={[styles.smallBtn, variant === 'primary' ? { backgroundColor: COLORS.primary } : { backgroundColor: COLORS.neutralLight }]}
  >
    <Text style={[styles.smallBtnText, { color: variant === 'primary' ? '#fff' : COLORS.textMed }]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// ─── INPUT ────────────────────────────────────────────────────────────────────
export const Input = ({ label, required, error, style, ...props }) => (
  <View style={[styles.inputWrap, style]}>
    {label && (
      <Text style={styles.inputLabel}>
        {label}{required && <Text style={{ color: COLORS.danger }}> *</Text>}
      </Text>
    )}
    <TextInput
      style={[styles.input, error && { borderColor: COLORS.danger }]}
      placeholderTextColor={COLORS.textMuted}
      {...props}
    />
    {error && <Text style={styles.inputError}>{error}</Text>}
  </View>
);

// ─── SELECT CHIPS ─────────────────────────────────────────────────────────────
export const ChipSelect = ({ label, options, value, onChange }) => (
  <View style={styles.inputWrap}>
    {label && <Text style={styles.inputLabel}>{label}</Text>}
    <View style={styles.chips}>
      {options.map((opt) => {
        const selected = opt === value || (opt.value !== undefined && opt.value === value);
        const display = opt.label || opt;
        const val = opt.value !== undefined ? opt.value : opt;
        return (
          <TouchableOpacity
            key={String(val)}
            onPress={() => onChange(val)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{display}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

// ─── SYNC STATUS ─────────────────────────────────────────────────────────────
export const SyncIndicator = ({ status }) => {
  const cfg = {
    synced: { color: COLORS.success, label: 'Synchronisé' },
    pending: { color: COLORS.warning, label: 'En attente...' },
    error: { color: COLORS.danger, label: 'Erreur sync' },
  }[status] || { color: COLORS.neutral, label: '' };

  return (
    <View style={styles.syncWrap}>
      <View style={[styles.syncDot, { backgroundColor: cfg.color }]} />
      <Text style={[styles.syncText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
};

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────
export const EmptyState = ({ emoji, title, subtitle, action }) => (
  <View style={styles.empty}>
    <Text style={styles.emptyEmoji}>{emoji || '📭'}</Text>
    <Text style={styles.emptyTitle}>{title}</Text>
    {subtitle && <Text style={styles.emptySub}>{subtitle}</Text>}
    {action}
  </View>
);

// ─── CONFIRM MODAL ────────────────────────────────────────────────────────────
export const ConfirmModal = ({ visible, title, message, onConfirm, onCancel, danger }) => (
  <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
    <View style={styles.modalOverlay}>
      <View style={styles.confirmBox}>
        <Text style={styles.confirmTitle}>{title}</Text>
        <Text style={styles.confirmMsg}>{message}</Text>
        <View style={styles.confirmBtns}>
          <Button label="Annuler" variant="outline" onPress={onCancel} style={{ flex: 1 }} />
          <View style={{ width: 10 }} />
          <Button label="Confirmer" variant={danger ? 'danger' : 'primary'} onPress={onConfirm} style={{ flex: 1 }} />
        </View>
      </View>
    </View>
  </Modal>
);

// ─── BOTTOM SHEET ─────────────────────────────────────────────────────────────
export const BottomSheet = ({ visible, onClose, title, children }) => (
  <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
    <TouchableOpacity style={styles.bsOverlay} activeOpacity={1} onPress={onClose} />
    <View style={styles.bsContainer}>
      <View style={styles.bsHandle} />
      {title && <Text style={styles.bsTitle}>{title}</Text>}
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </View>
  </Modal>
);

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full, gap: 5 },
  badgeDot: { width: 7, height: 7, borderRadius: 4 },
  badgeText: { fontSize: 12, fontWeight: '700' },

  card: { backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: 16, ...SHADOW.sm, marginBottom: 12 },

  sectionTitle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 10 },
  sectionTitleText: { fontSize: 15, fontWeight: '700', color: COLORS.text },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  infoLabel: { fontSize: 13, color: COLORS.textLight },
  infoValue: { fontSize: 13, fontWeight: '600', color: COLORS.text, maxWidth: '60%', textAlign: 'right' },

  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 20, borderRadius: RADIUS.md, gap: 6 },
  buttonText: { fontSize: 15, fontWeight: '700' },

  smallBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.sm },
  smallBtnText: { fontSize: 13, fontWeight: '600' },

  inputWrap: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textMed, marginBottom: 6 },
  input: { backgroundColor: '#fafafa', borderWidth: 2, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 14 : 10, fontSize: 14, color: COLORS.text },
  inputError: { fontSize: 11, color: COLORS.danger, marginTop: 4 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.sm, borderWidth: 2, borderColor: COLORS.border, backgroundColor: '#fff' },
  chipSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  chipText: { fontSize: 13, fontWeight: '600', color: COLORS.textMed },
  chipTextSelected: { color: COLORS.primary },

  syncWrap: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  syncDot: { width: 8, height: 8, borderRadius: 4 },
  syncText: { fontSize: 11, fontWeight: '600' },

  empty: { alignItems: 'center', padding: 40, gap: 8 },
  emptyEmoji: { fontSize: 48, marginBottom: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  emptySub: { fontSize: 13, color: COLORS.textLight, textAlign: 'center', lineHeight: 20 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  confirmBox: { backgroundColor: '#fff', borderRadius: RADIUS.xl, padding: 24, width: '100%', maxWidth: 400 },
  confirmTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: COLORS.text },
  confirmMsg: { fontSize: 14, color: COLORS.textLight, marginBottom: 24, lineHeight: 20 },
  confirmBtns: { flexDirection: 'row' },

  bsOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
  bsContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  bsHandle: { width: 40, height: 4, backgroundColor: COLORS.border, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  bsTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 20 },
});
