import { FoodDonation, FoodRequest, Booking, User } from '../types';
import { getLocalDonations, saveLocalDonation } from './donationStorage';
import { getLocalRequests, saveLocalRequests, getLocalBookings, saveLocalBookings } from './requestStorage';

// High-availability shared Cloud Sync endpoints
const CLOUD_NAMESPACE = 'zeroplate_hackathon_v1';
const KV_BASE_URL = `https://kvdb.io/4yKq2H8yY3P3bJ2b3vW7j5/${CLOUD_NAMESPACE}`;

/**
 * Robust JSON Cloud fetcher with timeout and fallback
 */
async function cloudGet<T>(key: string, fallback: T): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${KV_BASE_URL}_${key}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data !== null && data !== undefined) return data;
    }
  } catch (e) {
    // Fallback to local
  }
  return fallback;
}

/**
 * Robust JSON Cloud writer with timeout
 */
async function cloudSet<T>(key: string, data: T): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    await fetch(`${KV_BASE_URL}_${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return true;
  } catch (e) {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// DONATIONS CLOUD SYNC
// ─────────────────────────────────────────────────────────────

export async function syncCloudDonations(): Promise<FoodDonation[]> {
  const local = getLocalDonations();
  const cloud = await cloudGet<FoodDonation[]>('donations', []);

  if (Array.isArray(cloud) && cloud.length > 0) {
    // Merge cloud and local, cloud takes priority for newer/shared items
    const mergedMap = new Map<string, FoodDonation>();
    local.forEach((d) => mergedMap.set(d.id, d));
    cloud.forEach((d) => mergedMap.set(d.id, d));
    const merged = Array.from(mergedMap.values());
    try {
      localStorage.setItem('zeroplate_published_donations', JSON.stringify(merged));
    } catch (e) {}
    return merged;
  }

  // If cloud is empty, seed it with local donations
  if (local.length > 0) {
    cloudSet('donations', local).catch(() => {});
  }
  return local;
}

export async function publishDonationToCloud(donation: FoodDonation): Promise<FoodDonation> {
  // 1. Save locally immediately for 0ms UI delay
  saveLocalDonation(donation);

  // 2. Push to global cloud DB so all devices see it
  try {
    const currentCloud = await cloudGet<FoodDonation[]>('donations', getLocalDonations());
    const updated = [donation, ...currentCloud.filter((d) => d.id !== donation.id)];
    await cloudSet('donations', updated);
  } catch (e) {
    console.warn('Cloud donation sync failed, kept locally', e);
  }

  return donation;
}

// ─────────────────────────────────────────────────────────────
// REQUESTS CLOUD SYNC
// ─────────────────────────────────────────────────────────────

export async function syncCloudRequests(): Promise<FoodRequest[]> {
  const local = getLocalRequests();
  const cloud = await cloudGet<FoodRequest[]>('requests', []);

  if (Array.isArray(cloud) && cloud.length > 0) {
    const mergedMap = new Map<string, FoodRequest>();
    local.forEach((r) => mergedMap.set(r.id, r));
    cloud.forEach((r) => mergedMap.set(r.id, r));
    const merged = Array.from(mergedMap.values());
    saveLocalRequests(merged);
    return merged;
  }

  if (local.length > 0) {
    cloudSet('requests', local).catch(() => {});
  }
  return local;
}

export async function submitRequestToCloud(request: FoodRequest): Promise<FoodRequest> {
  // 1. Save locally
  const currentRequests = getLocalRequests();
  const updatedRequests = [request, ...currentRequests.filter((r) => r.id !== request.id)];
  saveLocalRequests(updatedRequests);

  // 2. Push to cloud
  try {
    const cloudRequests = await cloudGet<FoodRequest[]>('requests', currentRequests);
    const updatedCloud = [request, ...cloudRequests.filter((r) => r.id !== request.id)];
    await cloudSet('requests', updatedCloud);
  } catch (e) {
    console.warn('Cloud request sync failed', e);
  }

  return request;
}

export async function updateRequestStatusInCloud(
  requestId: string,
  status: 'ACCEPTED' | 'REJECTED' | 'CANCELLED',
  booking?: Booking
): Promise<boolean> {
  try {
    const requests = await syncCloudRequests();
    const target = requests.find((r) => r.id === requestId);
    if (target) {
      target.status = status;
      target.respondedAt = new Date().toISOString();

      if (status === 'ACCEPTED') {
        // Auto-reject competing requests for the same donation
        requests.forEach((r) => {
          if (r.donationId === target.donationId && r.id !== requestId && r.status === 'PENDING') {
            r.status = 'REJECTED';
            r.respondedAt = new Date().toISOString();
          }
        });

        // Update donation status to CONFIRMED
        const donations = await syncCloudDonations();
        const don = donations.find((d) => d.id === target.donationId);
        if (don) {
          don.status = 'CONFIRMED';
          await publishDonationToCloud(don);
        }

        // Add booking to cloud
        if (booking) {
          await addBookingToCloud(booking);
        }
      }

      saveLocalRequests(requests);
      await cloudSet('requests', requests);
      return true;
    }
  } catch (e) {
    console.warn('Update request in cloud error', e);
  }
  return false;
}

// ─────────────────────────────────────────────────────────────
// BOOKINGS CLOUD SYNC
// ─────────────────────────────────────────────────────────────

export async function syncCloudBookings(): Promise<Booking[]> {
  const local = getLocalBookings();
  const cloud = await cloudGet<Booking[]>('bookings', []);

  if (Array.isArray(cloud) && cloud.length > 0) {
    const mergedMap = new Map<string, Booking>();
    local.forEach((b) => mergedMap.set(b.id, b));
    cloud.forEach((b) => mergedMap.set(b.id, b));
    const merged = Array.from(mergedMap.values());
    saveLocalBookings(merged);
    return merged;
  }

  if (local.length > 0) {
    cloudSet('bookings', local).catch(() => {});
  }
  return local;
}

export async function addBookingToCloud(booking: Booking): Promise<Booking> {
  const local = getLocalBookings();
  const updatedLocal = [booking, ...local.filter((b) => b.id !== booking.id)];
  saveLocalBookings(updatedLocal);

  try {
    const cloud = await cloudGet<Booking[]>('bookings', local);
    const updatedCloud = [booking, ...cloud.filter((b) => b.id !== booking.id)];
    await cloudSet('bookings', updatedCloud);
  } catch (e) {
    console.warn('Save booking cloud error', e);
  }
  return booking;
}

export async function completeBookingInCloud(bookingId: string): Promise<boolean> {
  try {
    const bookings = await syncCloudBookings();
    const target = bookings.find((b) => b.id === bookingId);
    if (target) {
      target.status = 'COMPLETED';
      target.completedAt = new Date().toISOString();
      saveLocalBookings(bookings);
      await cloudSet('bookings', bookings);

      // Update donation status to COMPLETED
      const donations = await syncCloudDonations();
      const don = donations.find((d) => d.id === target.donationId);
      if (don) {
        don.status = 'COMPLETED';
        await publishDonationToCloud(don);
      }
      return true;
    }
  } catch (e) {
    console.warn('Complete booking in cloud error', e);
  }
  return false;
}
