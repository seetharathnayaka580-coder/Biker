import { AppState, ServiceRecord } from '../types';
import { SEED_STATE, getSeedStateForBike } from '../data/seed';

export const getStorageKey = (bikeId: string = 'BKT-1374') => `n160-service-log-${bikeId.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}-v2`;

export function uid(prefix: string = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function ordinalSuffix(n: number): string {
  const j = n % 10;
  const k = n % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}

export function fmtDate(d?: string): string {
  if (!d) return '—';
  try {
    const dt = new Date(d + (d.includes('T') ? '' : 'T00:00:00'));
    if (isNaN(dt.getTime())) return d;
    return dt.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return d;
  }
}

export function fmtKm(n?: number | null): string {
  if (n === undefined || n === null) return '0 km';
  return `${Number(n).toLocaleString('en-US')} km`;
}

export function loadState(bikeId: string = 'BKT-1374'): AppState {
  const defaultState = getSeedStateForBike(bikeId);
  try {
    const key = getStorageKey(bikeId);
    const raw = localStorage.getItem(key);
    if (!raw) return JSON.parse(JSON.stringify(defaultState));
    const parsed: AppState = JSON.parse(raw);

    // Merge missing attributes safely
    if (!parsed.serviceInterval) parsed.serviceInterval = defaultState.serviceInterval || 2500;
    if (!parsed.targets || !parsed.targets.length) parsed.targets = [...(defaultState.targets || [2500])];
    if (!parsed.services) parsed.services = [];
    if (!parsed.notes) parsed.notes = [];
    if (!parsed.vehicle) parsed.vehicle = { ...defaultState.vehicle };

    // If it's Sachi's primary bike BKT-1374, preserve the verified seed services
    if (bikeId === 'BKT-1374') {
      SEED_STATE.services.forEach((seedSvc) => {
        const existingIndex = parsed.services.findIndex((s) => s.id === seedSvc.id);
        if (existingIndex === -1) {
          parsed.services.push({ ...seedSvc });
        } else {
          parsed.services[existingIndex] = {
            ...parsed.services[existingIndex],
            label: seedSvc.label,
            date: seedSvc.date,
            km: seedSvc.km,
            dealer: seedSvc.dealer,
            note: seedSvc.note,
            locked: true,
          };
        }
      });
    }

    return parsed;
  } catch (e) {
    console.error('Error loading state from localStorage:', e);
    return JSON.parse(JSON.stringify(defaultState));
  }
}

export function saveState(state: AppState, bikeId: string = 'BKT-1374'): void {
  try {
    const key = getStorageKey(bikeId);
    localStorage.setItem(key, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving state to localStorage:', e);
  }
}

export function calculateServiceStats(services: ServiceRecord[], currentOdo: number, targetKm: number) {
  const lastKm = services.length ? Math.max(...services.map((s) => s.km)) : 0;
  const target = targetKm || lastKm + 2500;
  const riddenSinceLast = Math.max(currentOdo - lastKm, 0);
  const remaining = Math.max(target - currentOdo, 0);
  const totalIntervalSpan = Math.max(target - lastKm, 1);
  const progressRatio = Math.min(Math.max((currentOdo - lastKm) / totalIntervalSpan, 0), 1);
  const isOverdue = currentOdo > target;
  const isDueSoon = !isOverdue && remaining <= 300;

  return {
    lastKm,
    target,
    riddenSinceLast,
    remaining,
    totalIntervalSpan,
    progressRatio,
    isOverdue,
    isDueSoon,
  };
}
