/**
 * Service Threshold Alert & Browser Notification Engine for Bajaj Pulsar N160
 * Triggers when odometer is within 500 km of the scheduled service target or overdue.
 */

export const SERVICE_ALERT_THRESHOLD_KM = 500;

export interface AlertSnoozeState {
  targetKm: number;
  snoozeUntilKm?: number;
  snoozeUntilTime?: number;
  dismissedForSession?: boolean;
}

const SNOOZE_STORAGE_KEY = 'n160_service_alert_snooze';
const SESSION_DISMISS_KEY = 'n160_service_alert_session_dismiss';

/**
 * Check if the current odometer has reached the 500 km alert threshold
 */
export function isThresholdReached(
  currentOdo: number,
  targetKm: number,
  thresholdKm: number = SERVICE_ALERT_THRESHOLD_KM
): boolean {
  const remaining = targetKm - currentOdo;
  return remaining <= thresholdKm;
}

/**
 * Get status of threshold
 */
export function getThresholdStatus(
  currentOdo: number,
  targetKm: number,
  thresholdKm: number = SERVICE_ALERT_THRESHOLD_KM
): 'safe' | 'due_soon' | 'overdue' {
  const remaining = targetKm - currentOdo;
  if (remaining <= 0) return 'overdue';
  if (remaining <= thresholdKm) return 'due_soon';
  return 'safe';
}

/**
 * Check if alert is currently snoozed
 */
export function isAlertSnoozed(targetKm: number, currentOdo: number): boolean {
  try {
    // Check session dismissal
    const sessionDismiss = sessionStorage.getItem(`${SESSION_DISMISS_KEY}_${targetKm}`);
    if (sessionDismiss === 'true') return true;

    // Check persistent snooze
    const raw = localStorage.getItem(SNOOZE_STORAGE_KEY);
    if (!raw) return false;

    const data: AlertSnoozeState = JSON.parse(raw);
    if (data.targetKm !== targetKm) return false;

    // Snooze by km
    if (data.snoozeUntilKm && currentOdo < data.snoozeUntilKm) {
      return true;
    }

    // Snooze by time
    if (data.snoozeUntilTime && Date.now() < data.snoozeUntilTime) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Snooze alert
 */
export function snoozeAlert(
  targetKm: number,
  type: '50km' | '100km' | '24h' | 'session',
  currentOdo: number
): void {
  try {
    if (type === 'session') {
      sessionStorage.setItem(`${SESSION_DISMISS_KEY}_${targetKm}`, 'true');
      return;
    }

    const payload: AlertSnoozeState = {
      targetKm,
    };

    if (type === '50km') {
      payload.snoozeUntilKm = currentOdo + 50;
    } else if (type === '100km') {
      payload.snoozeUntilKm = currentOdo + 100;
    } else if (type === '24h') {
      payload.snoozeUntilTime = Date.now() + 24 * 60 * 60 * 1000;
    }

    localStorage.setItem(SNOOZE_STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('Could not save snooze state:', e);
  }
}

/**
 * Clear snooze state
 */
export function clearSnooze(targetKm?: number): void {
  try {
    if (targetKm) {
      sessionStorage.removeItem(`${SESSION_DISMISS_KEY}_${targetKm}`);
    }
    localStorage.removeItem(SNOOZE_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Check if Web Notifications are supported in current browser
 */
export function isBrowserNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current browser notification permission
 */
export function getBrowserNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isBrowserNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Request notification permission from the user
 */
export async function requestBrowserNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isBrowserNotificationSupported()) return 'unsupported';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return 'unsupported';
  }
}

/**
 * Dispatch a native browser notification if granted
 */
export function sendBrowserServiceNotification(
  vehicleModel: string,
  regNo: string,
  currentOdo: number,
  targetKm: number,
  remainingKm: number
): boolean {
  if (!isBrowserNotificationSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  const isOverdue = remainingKm <= 0;
  const tag = `pulsar-service-alert-${targetKm}-${isOverdue ? 'overdue' : 'duesoon'}`;

  // Rate-limit: don't show the exact same notification more than once every 6 hours
  const lastSentKey = `n160_notif_last_sent_${tag}`;
  const lastSent = localStorage.getItem(lastSentKey);
  const now = Date.now();
  if (lastSent && now - Number(lastSent) < 6 * 60 * 60 * 1000) {
    return false;
  }

  try {
    const title = isOverdue
      ? `⚠️ Service Overdue: ${vehicleModel || 'Pulsar N160'} (${regNo})`
      : `⚠️ Maintenance Due Soon: ${vehicleModel || 'Pulsar N160'} (${regNo})`;

    const body = isOverdue
      ? `Odometer is ${currentOdo.toLocaleString()} km. You have exceeded target interval ${targetKm.toLocaleString()} km by ${Math.abs(remainingKm).toLocaleString()} km. Log service to protect your engine.`
      : `Only ${remainingKm.toLocaleString()} km remaining before scheduled ${targetKm.toLocaleString()} km service target. Prepare recommended maintenance.`;

    const notification = new Notification(title, {
      body,
      icon: '/pulsar_n160.svg',
      badge: '/app_icon.svg',
      tag,
      requireInteraction: isOverdue,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    localStorage.setItem(lastSentKey, now.toString());
    return true;
  } catch (err) {
    console.warn('Browser notification dispatch failed:', err);
    return false;
  }
}

/**
 * Synthetic cockpit acoustic alert chime via Web Audio API
 */
export function playAlertChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Tone 1: 587 Hz (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.04, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.14);

    // Tone 2: 880 Hz (A5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.15);
    gain2.gain.setValueAtTime(0.05, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.35);
  } catch {
    // Browser autoplay policy might restrict until user interacts
  }
}
