// src/utils/theme.js
export const COLORS = {
  primary: '#1a56db',
  primaryDark: '#0e3a8a',
  primaryLight: '#eff6ff',
  success: '#10b981',
  successLight: '#d1fae5',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  danger: '#ef4444',
  dangerLight: '#fee2e2',
  neutral: '#9ca3af',
  neutralLight: '#f3f4f6',
  text: '#111827',
  textMed: '#374151',
  textLight: '#6b7280',
  textMuted: '#9ca3af',
  border: '#e5e7eb',
  bg: '#f8fafc',
  white: '#ffffff',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  sizes: {
    xs: 11,
    sm: 12,
    base: 14,
    md: 15,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 28,
    '5xl': 32,
  },
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const SHADOW = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const STATUS_CONFIG = {
  ok: { bg: '#d1fae5', color: '#065f46', dot: '#10b981', label: 'À jour' },
  warning: { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b', label: 'Bientôt' },
  urgent: { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444', label: 'Urgent' },
  na: { bg: '#f3f4f6', color: '#6b7280', dot: '#9ca3af', label: 'N/A' },
};

export const CAR_COLORS = [
  '#1a56db', '#0e9f6e', '#ef4444', '#f59e0b',
  '#8b5cf6', '#ec4899', '#374151', '#0891b2',
];

export const FUEL_TYPES = ['Essence', 'Diesel', 'Hybride', 'Électrique'];

export const OP_TYPES = [
  'Vidange', 'Filtre à huile', 'Filtre à air', 'Filtre gasoil',
  'Filtre habitacle', 'Pneus', 'Freins', 'Batterie', 'Courroie',
  'Climatisation', 'Amortisseurs', 'Bougies', 'Liquide de frein',
  'Liquide refroidissement', 'Boîte automatique', 'AdBlue',
  'Assurance', 'Vignette', 'Visite technique', 'Autre',
];

export const NOTIF_DELAYS = [1, 7, 15, 30];
export const KM_ALERTS = [500, 1000, 2000];
