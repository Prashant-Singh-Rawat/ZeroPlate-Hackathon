import { FoodRequest, Booking, FoodDonation, User } from '../types';
import { getLocalDonations, saveLocalDonation } from './donationStorage';
import { computeFullMatch } from './matching/matchingEngine';

const REQUESTS_KEY = 'zeroplate_requests';
const BOOKINGS_KEY = 'zeroplate_bookings';

const INITIAL_SEED_REQUESTS: FoodRequest[] = [
  {
    id: 'req_seed_1',
    donationId: 'don_biryani',
    ngoId: 'ngo_hope',
    ngoName: 'Hope Foundation',
    donorId: 'donor_spicevilla',
    donorName: 'SpiceVilla Restaurant',
    foodName: 'Veg Hyderabadi Biryani',
    requestedMeals: 50,
    matchScore: 94,
    distanceScore: 92,
    mealQuantityScore: 100,
    foodSpecScore: 90,
    urgencyScore: 95,
    distanceKm: 2.1,
    explanation: 'Recommended because Hope Foundation is 2.1 km away, pickup needed within 4 hours, and has capacity for all 50 meals.',
    status: 'PENDING',
    notes: 'Volunteers ready with vehicle for immediate pickup.',
    requestedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
];

export function getLocalRequests(): FoodRequest[] {
  try {
    const raw = localStorage.getItem(REQUESTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading local requests', e);
  }
  return INITIAL_SEED_REQUESTS;
}

export function saveLocalRequests(requests: FoodRequest[]) {
  try {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  } catch (e) {
    console.warn('Error saving local requests', e);
  }
}

export function createLocalRequest(
  donation: FoodDonation,
  ngoUser: User | null,
  requestedMeals: number,
  notes: string = ''
): FoodRequest {
  const existing = getLocalRequests();
  const ngoLat = ngoUser?.latitude || 19.062;
  const ngoLng = ngoUser?.longitude || 72.854;

  const match = computeFullMatch(
    { lat: donation.latitude, lng: donation.longitude },
    { lat: ngoLat, lng: ngoLng },
    donation.mealCount,
    100,
    donation.pickupDeadline,
    ngoUser?.subscriptionPlan === 'premium',
    ngoUser?.name || 'Hope Foundation'
  );

  const newRequest: FoodRequest = {
    id: `req_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    donationId: donation.id,
    ngoId: ngoUser?.id || 'ngo_hope',
    ngoName: ngoUser?.name || 'Hope Foundation',
    donorId: donation.donorId,
    donorName: donation.donorName,
    foodName: donation.foodName,
    requestedMeals: requestedMeals || donation.mealCount,
    matchScore: match.matchScore,
    distanceScore: match.distanceScore,
    mealQuantityScore: match.mealQuantityScore,
    foodSpecScore: match.foodSpecScore || 90,
    urgencyScore: match.urgencyScore,
    distanceKm: match.distanceKm,
    explanation: match.explanation,
    status: 'PENDING',
    notes,
    requestedAt: new Date().toISOString(),
  };

  const updated = [newRequest, ...existing];
  saveLocalRequests(updated);

  // Update donation status to PENDING_REQUEST
  const donations = getLocalDonations();
  const targetDonation = donations.find((d) => d.id === donation.id);
  if (targetDonation && targetDonation.status === 'AVAILABLE') {
    targetDonation.status = 'PENDING_REQUEST';
    targetDonation.pendingRequestsCount = (targetDonation.pendingRequestsCount || 0) + 1;
    saveLocalDonation(targetDonation);
  }

  return newRequest;
}

export function acceptLocalRequest(requestId: string, donorUser: User | null): { success: boolean; booking?: Booking } {
  const requests = getLocalRequests();
  const target = requests.find((r) => r.id === requestId);
  if (!target) return { success: false };

  target.status = 'ACCEPTED';
  target.respondedAt = new Date().toISOString();

  // Auto-reject competing requests
  requests.forEach((r) => {
    if (r.donationId === target.donationId && r.id !== requestId && r.status === 'PENDING') {
      r.status = 'REJECTED';
      r.respondedAt = new Date().toISOString();
    }
  });
  saveLocalRequests(requests);

  // Update donation status to CONFIRMED
  const donations = getLocalDonations();
  const targetDonation = donations.find((d) => d.id === target.donationId);
  if (targetDonation) {
    targetDonation.status = 'CONFIRMED';
    saveLocalDonation(targetDonation);
  }

  // Create confirmed Booking
  const bookings = getLocalBookings();
  const newBooking: Booking = {
    id: `book_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    donationId: target.donationId,
    requestId: target.id,
    ngoId: target.ngoId,
    ngoName: target.ngoName,
    donorId: target.donorId,
    donorName: target.donorName,
    foodName: target.foodName,
    mealCount: target.requestedMeals,
    pickupLocation: targetDonation?.pickupLocation || 'Bandra West, Mumbai',
    pickupAddress: targetDonation?.pickupAddress || 'Bandra West, Mumbai',
    status: 'CONFIRMED',
    liveTrackingEnabled: true,
    createdAt: new Date().toISOString(),
  };

  saveLocalBookings([newBooking, ...bookings]);
  return { success: true, booking: newBooking };
}

export function cancelLocalRequest(requestId: string): boolean {
  const requests = getLocalRequests();
  const target = requests.find((r) => r.id === requestId);
  if (!target) return false;
  target.status = 'CANCELLED';
  saveLocalRequests(requests);
  return true;
}

export function getLocalBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error reading local bookings', e);
  }
  return [
    {
      id: 'book_seed_1',
      donationId: 'don_dal_rice',
      ngoId: 'ngo_hope',
      ngoName: 'Hope Foundation',
      donorId: 'donor_spicevilla',
      donorName: 'SpiceVilla Restaurant',
      foodName: 'Dal Tadka & Steamed Jeera Rice',
      mealCount: 60,
      pickupLocation: 'Shop 4, Hill Road, Bandra West, Mumbai 400050',
      pickupAddress: 'Shop 4, Hill Road, Bandra West, Mumbai 400050',
      status: 'CONFIRMED',
      liveTrackingEnabled: true,
      createdAt: new Date().toISOString(),
    },
  ];
}

export function saveLocalBookings(bookings: Booking[]) {
  try {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  } catch (e) {
    console.warn('Error saving local bookings', e);
  }
}
