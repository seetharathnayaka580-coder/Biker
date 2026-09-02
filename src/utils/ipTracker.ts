export interface ClientNetworkInfo {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  isp?: string;
  device: string;
  userAgent: string;
  latitude?: number;
  longitude?: number;
}

// Parse user agent to produce a clean human-readable device string (e.g., "Chrome on Android" or "Safari on iOS")
export function parseDeviceString(ua: string): string {
  if (!ua) return 'Web Browser';

  let browser = 'Browser';
  if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('Chrome/')) browser = 'Chrome';
  else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Firefox/')) browser = 'Firefox';
  else if (ua.includes('Opera') || ua.includes('OPR/')) browser = 'Opera';

  let os = 'Device';
  if (ua.includes('Android')) os = 'Android Mobile';
  else if (ua.includes('iPhone')) os = 'Apple iPhone';
  else if (ua.includes('iPad')) os = 'Apple iPad';
  else if (ua.includes('Windows NT 10.0')) os = 'Windows 10/11';
  else if (ua.includes('Windows')) os = 'Windows PC';
  else if (ua.includes('Macintosh') || ua.includes('Mac OS X')) os = 'macOS Desktop';
  else if (ua.includes('Linux')) os = 'Linux OS';

  return `${browser} on ${os}`;
}

// Cached client network info to avoid unnecessary multiple queries
let cachedNetworkInfo: ClientNetworkInfo | null = null;
let lastFetchTime = 0;

// Get current client's network info and public IP address
export async function fetchClientNetworkInfo(forceRefresh = false): Promise<ClientNetworkInfo> {
  const now = Date.now();
  if (!forceRefresh && cachedNetworkInfo && now - lastFetchTime < 60000) {
    return cachedNetworkInfo;
  }

  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
  const device = parseDeviceString(userAgent);

  // Default fallback
  const fallbackInfo: ClientNetworkInfo = {
    ip: '127.0.0.1 (Local)',
    city: 'Kurunegala',
    region: 'North Western',
    country: 'Sri Lanka',
    isp: 'Sri Lanka Telecom / Dialog',
    device,
    userAgent,
  };

  // 1. Try ipapi.co first for IP + geo-location
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch('https://ipapi.co/json/', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.ip) {
        const info: ClientNetworkInfo = {
          ip: data.ip,
          city: data.city || 'Kurunegala',
          region: data.region || 'North Western',
          country: data.country_name || 'Sri Lanka',
          isp: data.org || data.asn || 'Internet Provider',
          latitude: data.latitude,
          longitude: data.longitude,
          device,
          userAgent,
        };
        cachedNetworkInfo = info;
        lastFetchTime = now;
        return info;
      }
    }
  } catch {
    // Proceed to next fallback
  }

  // 2. Try ipwho.is as second fallback
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch('https://ipwho.is/', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.ip) {
        const info: ClientNetworkInfo = {
          ip: data.ip,
          city: data.city || 'Colombo',
          region: data.region || 'Western Province',
          country: data.country || 'Sri Lanka',
          isp: data.connection?.isp || data.connection?.org,
          latitude: data.latitude,
          longitude: data.longitude,
          device,
          userAgent,
        };
        cachedNetworkInfo = info;
        lastFetchTime = now;
        return info;
      }
    }
  } catch {
    // Proceed to ipify
  }

  // 3. Try api64.ipify.org fallback
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch('https://api64.ipify.org?format=json', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.ip) {
        const info: ClientNetworkInfo = {
          ip: data.ip,
          city: 'Sri Lanka',
          region: 'Western / North Western',
          country: 'Sri Lanka',
          device,
          userAgent,
        };
        cachedNetworkInfo = info;
        lastFetchTime = now;
        return info;
      }
    }
  } catch {
    // Return fallback
  }

  cachedNetworkInfo = fallbackInfo;
  lastFetchTime = now;
  return fallbackInfo;
}

