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
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'ZeroPlate-Hackathon-App',
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
        const city = addr.city || addr.town || addr.village || addr.state_district || 'Mumbai';
        const state = addr.state || 'Maharashtra';
        const postcode = addr.postcode || '';

        const parts = [road, city, state, postcode].filter(Boolean);
        if (parts.length > 0) {
          return parts.join(', ');
        }
        return data.display_name.split(',').slice(0, 3).join(', ');
      }
    }
  } catch (e) {
    console.warn('Reverse geocode error, using coordinate string', e);
  }

  return `GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
}

/**
 * Fetch high-accuracy device GPS position using HTML5 Geolocation API
 */
export function getCurrentGPSLocation(): Promise<GPSLocationResult> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error('Geolocation is not supported by your browser/device.'));
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        try {
          const address = await reverseGeocode(latitude, longitude);
          resolve({
            latitude,
            longitude,
            accuracy: Math.round(accuracy),
            address,
          });
        } catch (e) {
          resolve({
            latitude,
            longitude,
            accuracy: Math.round(accuracy),
            address: `GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
          });
        }
      },
      (error) => {
        let msg = 'Unable to retrieve your location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission denied. Please allow GPS access in your browser.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'GPS signal unavailable. Please ensure location is enabled.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'GPS request timed out.';
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}
