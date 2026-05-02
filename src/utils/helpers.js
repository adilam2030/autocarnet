// src/utils/helpers.js
import { differenceInDays, differenceInYears, format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

// ─── FORMATTERS ───────────────────────────────────────────────────────────────
export const fmtKm = (n) => {
  if (n == null) return '—';
  return `${Number(n).toLocaleString('fr-FR')} km`;
};

export const fmtMoney = (n) => {
  if (n == null || n === 0) return '—';
  return `${Number(n).toLocaleString('fr-FR')} DH`;
};

export const fmtDate = (d) => {
  if (!d) return '—';
  try {
    return format(typeof d === 'string' ? parseISO(d) : d, 'dd/MM/yyyy');
  } catch {
    return '—';
  }
};

export const fmtDateShort = (d) => {
  if (!d) return '—';
  try {
    return format(typeof d === 'string' ? parseISO(d) : d, 'MMM yyyy', { locale: fr });
  } catch {
    return '—';
  }
};

export const today = () => new Date().toISOString().split('T')[0];

// ─── CALCULS VÉHICULE ─────────────────────────────────────────────────────────
export const getCarAge = (dateMEC) => {
  if (!dateMEC) return 0;
  return differenceInYears(new Date(), parseISO(dateMEC));
};

export const isVTApplicable = (dateMEC) => getCarAge(dateMEC) >= 5;

export const getDaysUntil = (dateStr) => {
  if (!dateStr) return null;
  return differenceInDays(parseISO(dateStr), new Date());
};

// ─── STATUTS ──────────────────────────────────────────────────────────────────
export const getRevisionStatus = (car) => {
  const next = (car.revision?.dernierKm || 0) + (car.revision?.frequence || 10000);
  const diff = next - (car.km || 0);
  if (diff <= 0) return 'urgent';
  if (diff <= 1000) return 'warning';
  return 'ok';
};

export const getAssuranceStatus = (car) => {
  const d = getDaysUntil(car.assurance?.echeance);
  if (d === null) return 'na';
  if (d < 0) return 'urgent';
  if (d <= 30) return 'warning';
  return 'ok';
};

export const getVTStatus = (car) => {
  if (!isVTApplicable(car.dateMEC)) return 'na';
  if (!car.vt?.echeance) return 'urgent';
  const d = getDaysUntil(car.vt.echeance);
  if (d < 0) return 'urgent';
  if (d <= 30) return 'warning';
  return 'ok';
};

export const getVignetteStatus = (car) => {
  if (!car.vignette) return 'na';
  return car.vignette.payee ? 'ok' : 'warning';
};

export const getAdBlueStatus = (car) => {
  if (!car.adblue) return 'na';
  if (!car.adblueData?.prochainKm) return 'na';
  const diff = car.adblueData.prochainKm - car.km;
  if (diff <= 0) return 'urgent';
  if (diff <= 1000) return 'warning';
  return 'ok';
};

export const getGlobalStatus = (car) => {
  const statuses = [
    getRevisionStatus(car),
    getAssuranceStatus(car),
    getVTStatus(car),
    getVignetteStatus(car),
  ];
  if (car.adblue) statuses.push(getAdBlueStatus(car));
  if (statuses.includes('urgent')) return 'urgent';
  if (statuses.includes('warning')) return 'warning';
  return 'ok';
};

export const getNextRevKm = (car) =>
  (car.revision?.dernierKm || 0) + (car.revision?.frequence || 10000);

// ─── CALCUL DÉPENSES ──────────────────────────────────────────────────────────
export const getTotalDepenses = (historique) =>
  (historique || []).reduce((s, op) => s + (Number(op.montant) || 0), 0);

export const getDepensesByType = (historique) => {
  const byType = {};
  (historique || []).forEach((op) => {
    byType[op.type] = (byType[op.type] || 0) + (Number(op.montant) || 0);
  });
  return Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .map(([type, montant]) => ({ type, montant }));
};

export const getDepensesByYear = (historique) => {
  const byYear = {};
  (historique || []).forEach((op) => {
    const year = op.date ? op.date.substring(0, 4) : 'Inconnu';
    byYear[year] = (byYear[year] || 0) + (Number(op.montant) || 0);
  });
  return Object.entries(byYear).sort((a, b) => a[0].localeCompare(b[0]));
};

// ─── ALERTES NOTIFICATIONS ────────────────────────────────────────────────────
export const buildAlerts = (cars) => {
  const alerts = [];
  cars.forEach((car) => {
    const name = `${car.marque} ${car.modele}`;

    // Révision
    const revStatus = getRevisionStatus(car);
    const nextRev = getNextRevKm(car);
    if (revStatus === 'urgent') {
      alerts.push({ type: 'urgent', car: name, msg: `Révision dépassée ! (${fmtKm(car.km)} / ${fmtKm(nextRev)})` });
    } else if (revStatus === 'warning') {
      alerts.push({ type: 'warning', car: name, msg: `Révision dans ${(nextRev - car.km).toLocaleString('fr-FR')} km` });
    }

    // Assurance
    const assStatus = getAssuranceStatus(car);
    if (assStatus === 'urgent') {
      alerts.push({ type: 'urgent', car: name, msg: `Assurance expirée le ${fmtDate(car.assurance?.echeance)}` });
    } else if (assStatus === 'warning') {
      const d = getDaysUntil(car.assurance?.echeance);
      alerts.push({ type: 'warning', car: name, msg: `Assurance expire dans ${d} jours` });
    }

    // VT
    const vtStatus = getVTStatus(car);
    if (vtStatus === 'urgent' && isVTApplicable(car.dateMEC)) {
      alerts.push({ type: 'urgent', car: name, msg: 'Visite technique expirée ou non faite' });
    } else if (vtStatus === 'warning') {
      const d = getDaysUntil(car.vt?.echeance);
      alerts.push({ type: 'warning', car: name, msg: `Visite technique dans ${d} jours` });
    }

    // Vignette
    if (!car.vignette?.payee) {
      alerts.push({ type: 'warning', car: name, msg: `Vignette ${new Date().getFullYear()} non payée` });
    }

    // AdBlue
    if (car.adblue && getAdBlueStatus(car) !== 'na') {
      const s = getAdBlueStatus(car);
      if (s === 'urgent') alerts.push({ type: 'urgent', car: name, msg: 'AdBlue à remplir maintenant' });
      else if (s === 'warning') alerts.push({ type: 'warning', car: name, msg: 'AdBlue à remplir bientôt' });
    }
  });
  return alerts;
};
