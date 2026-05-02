// src/utils/pdfExport.js
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { fmtDate, fmtKm, fmtMoney, getCarAge } from './helpers';

export const exportCarnetPDF = async (car, operations = []) => {
  const age = getCarAge(car.dateMEC).toFixed(1);
  const totalDepenses = operations.reduce((s, op) => s + (Number(op.montant) || 0), 0);

  const opsRows = operations
    .sort((a, b) => b.date?.localeCompare(a.date))
    .map(
      (op) => `
      <tr>
        <td>${fmtDate(op.date)}</td>
        <td>${fmtKm(op.km)}</td>
        <td><strong>${op.type}</strong></td>
        <td>${op.garage || '—'}</td>
        <td>${fmtMoney(op.montant)}</td>
        <td>${op.note || ''}</td>
      </tr>`
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: Arial, sans-serif; color: #111; padding: 20px; }
    h1 { color: #1a56db; border-bottom: 3px solid #1a56db; padding-bottom: 8px; }
    h2 { color: #374151; font-size: 16px; margin-top: 24px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin: 12px 0; }
    .info-item { font-size: 13px; }
    .info-label { color: #6b7280; font-size: 11px; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
    th { background: #1a56db; color: #fff; padding: 8px; text-align: left; }
    td { padding: 7px 8px; border-bottom: 1px solid #e5e7eb; }
    tr:nth-child(even) td { background: #f8fafc; }
    .total { text-align: right; font-weight: bold; font-size: 14px; color: #1a56db; margin-top: 12px; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; }
    .ok { background: #d1fae5; color: #065f46; }
    .warning { background: #fef3c7; color: #92400e; }
    .urgent { background: #fee2e2; color: #991b1b; }
    footer { margin-top: 30px; font-size: 11px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 12px; }
  </style>
</head>
<body>
  <h1>🚗 Carnet d'entretien — ${car.marque} ${car.modele}</h1>

  <h2>Informations véhicule</h2>
  <div class="info-grid">
    <div class="info-item"><div class="info-label">Immatriculation</div>${car.immat}</div>
    <div class="info-item"><div class="info-label">Année</div>${car.annee}</div>
    <div class="info-item"><div class="info-label">Carburant</div>${car.carburant}</div>
    <div class="info-item"><div class="info-label">Âge</div>${age} ans</div>
    <div class="info-item"><div class="info-label">Kilométrage actuel</div>${fmtKm(car.km)}</div>
    <div class="info-item"><div class="info-label">1ère MEC</div>${fmtDate(car.dateMEC)}</div>
  </div>

  <h2>Assurance</h2>
  <div class="info-grid">
    <div class="info-item"><div class="info-label">Compagnie</div>${car.assurance?.compagnie || '—'}</div>
    <div class="info-item"><div class="info-label">Échéance</div>${fmtDate(car.assurance?.echeance)}</div>
    <div class="info-item"><div class="info-label">Montant</div>${fmtMoney(car.assurance?.montant)}</div>
  </div>

  <h2>Révision</h2>
  <div class="info-grid">
    <div class="info-item"><div class="info-label">Dernière révision</div>${fmtKm(car.revision?.dernierKm)} — ${fmtDate(car.revision?.derniereDate)}</div>
    <div class="info-item"><div class="info-label">Prochaine révision</div>${fmtKm((car.revision?.dernierKm || 0) + (car.revision?.frequence || 10000))}</div>
    <div class="info-item"><div class="info-label">Fréquence</div>${fmtKm(car.revision?.frequence || 10000)}</div>
    <div class="info-item"><div class="info-label">Garage</div>${car.revision?.garage || '—'}</div>
  </div>

  <h2>Historique des entretiens (${operations.length} opérations)</h2>
  <table>
    <thead>
      <tr><th>Date</th><th>Km</th><th>Opération</th><th>Garage</th><th>Montant</th><th>Note</th></tr>
    </thead>
    <tbody>${opsRows}</tbody>
  </table>
  <div class="total">Total dépensé : ${fmtMoney(totalDepenses)}</div>

  <footer>
    Généré le ${fmtDate(new Date().toISOString())} par AutoCarnet
  </footer>
</body>
</html>`;

  const { uri } = await Print.printToFileAsync({ html, base64: false });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Carnet — ${car.marque} ${car.modele}`,
    });
  }
  return uri;
};
