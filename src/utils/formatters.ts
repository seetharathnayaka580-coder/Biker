import { AppState, ServiceRecord } from '../types';
import { SEED_STATE } from '../data/seed';

export const STORAGE_KEY = 'n160-service-log-bkt1374-v2';

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

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(SEED_STATE));
    const parsed: AppState = JSON.parse(raw);

    // Merge missing attributes safely
    if (!parsed.serviceInterval) parsed.serviceInterval = SEED_STATE.serviceInterval;
    if (!parsed.targets || !parsed.targets.length) parsed.targets = [...SEED_STATE.targets];
    if (!parsed.services) parsed.services = [];
    if (!parsed.notes) parsed.notes = [];
    if (!parsed.vehicle) parsed.vehicle = { ...SEED_STATE.vehicle };

    // Ensure locked seed services are always safely preserved
    SEED_STATE.services.forEach((seedSvc) => {
      const existingIndex = parsed.services.findIndex((s) => s.id === seedSvc.id);
      if (existingIndex === -1) {
        parsed.services.push({ ...seedSvc });
      } else {
        // Keep seed's core locked properties consistent
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

    return parsed;
  } catch (e) {
    console.error('Error loading state from localStorage:', e);
    return JSON.parse(JSON.stringify(SEED_STATE));
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
