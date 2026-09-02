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
  isGpsPrecise?: boolean;
}

// Parse user agent to produce a clean human-readable device string (e.g., "Chrome on Android" or "Safari on iOS")
export function parseDeviceString(ua: string): string {
  if (!ua) return 'Web Browser';

  let browser = 'Browser';
  if (ua.includes('Edg/')) browser = 'Microsoft Edge';
  else if (ua.includes('Chrome/')) browser = 'Google Chrome';
  else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Firefox/')) browser = 'Firefox';
  else if (ua.includes('Opera') || ua.includes('OPR/')) browser = 'Opera';

  let os = 'Device';
  if (ua.includes('Android')) {
    // Detect mobile phone brand if possible
    if (ua.includes('Xiaomi') || ua.includes('Redmi') || ua.includes('POCO')) os = 'Xiaomi / Redmi Android';
    else if (ua.includes('SM-') || ua.includes('Samsung')) os = 'Samsung Android';
    else if (ua.includes('Pixel')) os = 'Google Pixel Android';
    else os = 'Android Mobile';
  } else if (ua.includes('iPhone')) {
    os = 'Apple iPhone';
  } else if (ua.includes('iPad')) {
    os = 'Apple iPad';
  } else if (ua.includes('Windows NT 10.0')) {
    os = 'Windows 10/11 PC';
  } else if (ua.includes('Windows')) {
    os = 'Windows PC';
  } else if (ua.includes('Macintosh') || ua.includes('Mac OS X')) {
    os = 'macOS Desktop';
  } else if (ua.includes('Linux')) {
    os = 'Linux OS';
  }

  return `${browser} on ${os}`;
}

// Cached client network info to avoid redundant fetches
let cachedNetworkInfo: ClientNetworkInfo | null = null;
let lastFetchTime = 0;

// Fetch client network info with fallback across reliable CORS-friendly APIs
export async function fetchClientNetworkInfo(forceRefresh = false): Promise<ClientNetworkInfo> {
  const now = Date.now();
  if (!forceRefresh && cachedNetworkInfo && now - lastFetchTime < 60000) {
    return cachedNetworkInfo;
  }

  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
  const device = parseDeviceString(userAgent);

  // 1. Try ipwho.is (CORS friendly, returns real IPv4/IPv6, city, region, ISP, lat, lon)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch('https://ipwho.is/', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.ip) {
        const info: ClientNetworkInfo = {
          ip: data.ip,
          city: data.city || undefined,
          region: data.region || undefined,
          country: data.country || 'Sri Lanka',
          isp: data.connection?.isp || data.connection?.org || undefined,
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
    // Proceed to next provider
  }

  // 2. Try freeipapi.com (Reliable, fast, high accuracy)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch('https://freeipapi.com/api/json', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.ipAddress) {
        const info: ClientNetworkInfo = {
          ip: data.ipAddress,
          city: data.cityName && data.cityName !== '-' ? data.cityName : undefined,
          region: data.regionName && data.regionName !== '-' ? data.regionName : undefined,
          country: data.countryName || 'Sri Lanka',
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
    // Proceed to next provider
  }

  // 3. Try ipapi.co
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
          city: data.city || undefined,
          region: data.region || undefined,
          country: data.country_name || 'Sri Lanka',
          isp: data.org || undefined,
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
    // Proceed to ipify for raw IP
  }

  // 4. Try api64.ipify.org (Fetches exact real IPv4 or IPv6)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch('https://api64.ipify.org?format=json', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.ip) {
        const info: ClientNetworkInfo = {
          ip: data.ip,
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
    // Fallback below
  }

  // Fallback if all network requests fail
  const fallbackInfo: ClientNetworkInfo = {
    ip: 'Connected (Online)',
    country: 'Sri Lanka',
    device,
    userAgent,
  };

  cachedNetworkInfo = fallbackInfo;
  lastFetchTime = now;
  return fallbackInfo;
}

// Request real high-precision GPS device location from browser/mobile device
export async function getExactGpsLocation(): Promise<{
  latitude: number;
  longitude: number;
  city?: string;
  district?: string;
  formattedLocation: string;
} | null> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        let city: string | undefined;
        let district: string | undefined;
        let formattedLocation = `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;

        try {
          // Free BigDataCloud client reverse geocoding
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
          );
          if (res.ok) {
            const geo = await res.json();
            city = geo.city || geo.locality || geo.principalSubdivision;
            district = geo.principalSubdivision || geo.countryName;
            if (city && district) {
              formattedLocation = `${city}, ${district}`;
            } else if (city) {
              formattedLocation = `${city}, Sri Lanka`;
            }
          }
        } catch {
          // Keep lat, lng coordinates formatted
        }

        // Update cached network info with exact GPS coordinates
        if (cachedNetworkInfo) {
          cachedNetworkInfo = {
            ...cachedNetworkInfo,
            latitude: lat,
            longitude: lng,
            city: city || cachedNetworkInfo.city,
            region: district || cachedNetworkInfo.region,
            isGpsPrecise: true,
          };
        }

        resolve({
          latitude: lat,
          longitude: lng,
          city,
          district,
          formattedLocation,
        });
      },
      () => {
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 30000 }
    );
  });
}
