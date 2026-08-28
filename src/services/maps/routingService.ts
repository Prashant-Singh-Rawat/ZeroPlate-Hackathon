import { VehicleType } from '../../types';
import { calculateHaversineDistance } from '../matching/matchingEngine';

export interface RouteInfo {
  distanceKm: number;
  durationMinutes: number;
  trafficAwareMinutes: number;
  trafficStatus: 'Low' | 'Moderate' | 'Heavy' | 'Unavailable';
  etaTimestamp: string;
  isLiveTraffic: boolean;
  disclaimer?: string;
  waypoints?: { lat: number; lng: number }[];
}

/**
 * Calculate Traffic-Aware Routing & ETA
 * Uses Google Maps Routes API if configured or provides realistic urban geospatial routing with explicit fallback labeling.
 */
export async function calculateRouteETA(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  currentPosition?: { lat: number; lng: number },
  vehicleType: VehicleType = 'Bike'
): Promise<RouteInfo> {
  const start = currentPosition || origin;

  // Base straight-line distance
  const straightLineKm = calculateHaversineDistance(start.lat, start.lng, destination.lat, destination.lng);

  // Urban road network tortuosity factor in metro areas (avg 1.32x - 1.40x)
  const roadDistanceKm = Number((Math.max(0.2, straightLineKm * 1.35)).toFixed(1));

  // Average vehicle urban speeds (km/h) accounting for city intersections
  let avgSpeedKmh = 18; // Default Bike / Scooter in Mumbai
  if (vehicleType === 'Van' || vehicleType === 'Car') {
    avgSpeedKmh = 22;
  } else if (vehicleType === 'Scooter') {
    avgSpeedKmh = 20;
  }

  // Base travel time in minutes
  const normalTravelMinutes = Math.max(3, Math.round((roadDistanceKm / avgSpeedKmh) * 60));

  // Check if live Google Maps Routes API is available via backend or key
  const googleApiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY;

  if (googleApiKey && typeof window !== 'undefined' && (window as any).google?.maps?.DirectionsService) {
    try {
      const directionsService = new (window as any).google.maps.DirectionsService();
      const result = await new Promise<any>((resolve, reject) => {
        directionsService.route(
          {
            origin: new (window as any).google.maps.LatLng(start.lat, start.lng),
            destination: new (window as any).google.maps.LatLng(destination.lat, destination.lng),
            travelMode: (window as any).google.maps.TravelMode.DRIVING,
            drivingOptions: {
              departureTime: new Date(),
              trafficModel: 'bestguess',
            },
          },
          (res: any, status: any) => {
            if (status === 'OK') resolve(res);
            else reject(new Error(`Directions failed: ${status}`));
          }
        );
      });

      const leg = result.routes[0]?.legs[0];
      if (leg) {
        const liveDistKm = Number((leg.distance.value / 1000).toFixed(1));
        const liveDurationMin = Math.round(leg.duration.value / 60);
        const liveTrafficDurationMin = leg.duration_in_traffic
          ? Math.round(leg.duration_in_traffic.value / 60)
          : liveDurationMin;

        let trafficStatus: 'Low' | 'Moderate' | 'Heavy' = 'Moderate';
        if (liveTrafficDurationMin > liveDurationMin * 1.3) trafficStatus = 'Heavy';
        else if (liveTrafficDurationMin <= liveDurationMin * 1.05) trafficStatus = 'Low';

        const eta = new Date(Date.now() + liveTrafficDurationMin * 60 * 1000).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });

        return {
          distanceKm: liveDistKm,
          durationMinutes: liveDurationMin,
          trafficAwareMinutes: liveTrafficDurationMin,
          trafficStatus,
          etaTimestamp: eta,
          isLiveTraffic: true,
        };
      }
    } catch (e) {
      console.info('Google Maps Live routing API unavailable or unconfigured, using standard fallback.');
    }
  }

  // Graceful Fallback (Transparent, never fabricating live traffic)
  const etaDate = new Date(Date.now() + normalTravelMinutes * 60 * 1000);
  const formattedEta = etaDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return {
    distanceKm: roadDistanceKm,
    durationMinutes: normalTravelMinutes,
    trafficAwareMinutes: normalTravelMinutes,
    trafficStatus: 'Unavailable',
    etaTimestamp: formattedEta,
    isLiveTraffic: false,
    disclaimer: 'Estimated travel time — live traffic data unavailable.',
  };
}
