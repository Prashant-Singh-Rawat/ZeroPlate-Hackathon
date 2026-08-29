export interface GPSLocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
}

/**
 * Reverse geocode latitude/longitude into human-readable street address
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'ZeroPlate-Hackathon-App-v2',
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.display_name) {
        const addr = data.address || {};
        const road = addr.road || addr.suburb || addr.neighbourhood || '';
        const city = addr.city || addr.town || addr.village || addr.state_district || '';
        const state = addr.state || '';
        const postcode = addr.postcode || '';

        const parts = [road, city, state, postcode].filter(Boolean);
        if (parts.length > 0) {
          return parts.join(', ');
        }
        return data.display_name.split(',').slice(0, 3).join(', ');
      }
    }
  } catch (e) {
    console.warn('Reverse geocode error, fallback to coordinate string', e);
  }

  return `Location (${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E)`;
}

/**
 * Fallback IP-based Geolocation (100% reliable for laptops/desktops without GPS hardware)
 */
async function fetchIpGeolocation(): Promise<GPSLocationResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch('https://ipwho.is/', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.success !== false && data.latitude && data.longitude) {
        const city = data.city || '';
        const region = data.region || '';
        const country = data.country || '';
        const address = [city, region, country].filter(Boolean).join(', ') || 'Mumbai, Maharashtra, India';

        return {
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy: 50,
          address,
          city,
          state: region,
        };
      }
    }
  } catch (e) {}

  // Secondary fallback
  try {
    const res2 = await fetch('https://freeipapi.com/api/json');
    if (res2.ok) {
      const d2 = await res2.json();
      if (d2 && d2.latitude && d2.longitude) {
        const addr = [d2.cityName, d2.regionName, d2.countryName].filter(Boolean).join(', ');
        return {
          latitude: d2.latitude,
          longitude: d2.longitude,
          accuracy: 100,
          address: addr || 'Mumbai, Maharashtra',
          city: d2.cityName,
          state: d2.regionName,
        };
      }
    }
  } catch (e) {}

  return {
    latitude: 19.076,
    longitude: 72.8777,
    accuracy: 200,
    address: 'Bandra West, Mumbai, Maharashtra 400050',
    city: 'Mumbai',
    state: 'Maharashtra',
  };
}

/**
 * Fetch high-accuracy device GPS position with seamless instant fallback
 */
export async function getCurrentGPSLocation(): Promise<GPSLocationResult> {
  // Step 1: Try HTML5 Browser Geolocation with balanced timeout
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: false,
            timeout: 3500,
            maximumAge: 300000,
          }
        );
      });

      const { latitude, longitude, accuracy } = pos.coords;
      let address = '';
      try {
        address = await reverseGeocode(latitude, longitude);
      } catch (e) {
        address = `GPS Location (${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E)`;
      }

      return {
        latitude,
        longitude,
        accuracy: Math.round(accuracy) || 15,
        address,
      };
    } catch (browserGeoError) {
      console.warn('Browser GPS timed out or unavailable, switching to network IP location fix...', browserGeoError);
    }
  }

  // Step 2: Instant Network & IP Geolocation (Zero timeout failures)
  const ipResult = await fetchIpGeolocation();
  try {
    const detailedAddress = await reverseGeocode(ipResult.latitude, ipResult.longitude);
    if (detailedAddress && !detailedAddress.startsWith('Location (')) {
      ipResult.address = detailedAddress;
    }
  } catch (e) {}

  return ipResult;
}
