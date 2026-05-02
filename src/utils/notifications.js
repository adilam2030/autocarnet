// src/utils/notifications.js
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getRevisionStatus, getAssuranceStatus, getVTStatus,
  getVignetteStatus, getAdBlueStatus, getDaysUntil,
  getNextRevKm, isVTApplicable,
} from './helpers';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const requestNotifPermission = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

const scheduleNotif = async (id, title, body, trigger) => {
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: { title, body, sound: true },
    trigger,
  });
};

export const scheduleCarNotifications = async (car, settings = {}) => {
  const { delayDays = [7, 15, 30], kmAlert = 1000 } = settings;
  const name = `${car.marque} ${car.modele}`;

  // ── Assurance ────────────────────────────────────────────────────────────
  if (car.assurance?.echeance) {
    for (const days of delayDays) {
      const d = getDaysUntil(car.assurance.echeance);
      if (d > 0 && d <= days) {
        await scheduleNotif(
          `assurance_${car.id}_${days}`,
          `🛡️ Assurance — ${name}`,
          `Votre assurance expire dans ${d} jours`,
          { seconds: Math.max(1, (d - days) * 86400) }
        );
      }
    }
  }

  // ── Visite technique ──────────────────────────────────────────────────────
  if (isVTApplicable(car.dateMEC) && car.vt?.echeance) {
    for (const days of delayDays) {
      const d = getDaysUntil(car.vt.echeance);
      if (d > 0 && d <= days) {
        await scheduleNotif(
          `vt_${car.id}_${days}`,
          `✅ Visite technique — ${name}`,
          `Votre VT expire dans ${d} jours`,
          { seconds: 1 }
        );
      }
    }
  }

  // ── Révision km ───────────────────────────────────────────────────────────
  const nextRev = getNextRevKm(car);
  const kmRemaining = nextRev - car.km;
  if (kmRemaining > 0 && kmRemaining <= kmAlert) {
    await scheduleNotif(
      `revision_${car.id}`,
      `🔧 Révision proche — ${name}`,
      `Révision dans ${kmRemaining.toLocaleString('fr-FR')} km`,
      { seconds: 1 }
    );
  }

  // ── Vignette ──────────────────────────────────────────────────────────────
  if (!car.vignette?.payee) {
    await scheduleNotif(
      `vignette_${car.id}`,
      `🏷️ Vignette — ${name}`,
      `Vignette ${new Date().getFullYear()} non payée`,
      { seconds: 1 }
    );
  }
};

export const scheduleAllNotifications = async (cars, settings) => {
  await cancelAllNotifications();
  const granted = await requestNotifPermission();
  if (!granted) return;
  for (const car of cars) {
    await scheduleCarNotifications(car, settings);
  }
};

// Sauvegarder les préférences notif
export const saveNotifSettings = async (settings) => {
  await AsyncStorage.setItem('notif_settings', JSON.stringify(settings));
};

export const loadNotifSettings = async () => {
  const raw = await AsyncStorage.getItem('notif_settings');
  return raw ? JSON.parse(raw) : { enabled: true, delayDays: [7, 15, 30], kmAlert: 1000 };
};
