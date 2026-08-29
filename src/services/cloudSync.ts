import { FoodDonation, FoodRequest, Booking } from '../types';
import { getLocalDonations, saveLocalDonation } from './donationStorage';
import { getLocalRequests, saveLocalRequests, getLocalBookings, saveLocalBookings } from './requestStorage';

const DONATIONS_URL = 'https://api.restful-api.dev/objects/ff808181a04ccf2d01a04d3113d10335';
const REQUESTS_URL = 'https://api.restful-api.dev/objects/ff808181a04ccf2d01a04d308d8e0330';
const BOOKINGS_URL = 'https://api.restful-api.dev/objects/ff808181a04ccf2d01a04d308e360331';

// ─────────────────────────────────────────────────────────────
// DONATIONS CLOUD SYNC
// ─────────────────────────────────────────────────────────────

export async function syncCloudDonations(): Promise<FoodDonation[]> {
  const local = getLocalDonations();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(DONATIONS_URL, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const cloudList = (data?.data?.donations as FoodDonation[]) || [];

      if (Array.isArray(cloudList) && cloudList.length > 0) {
        // Merge cloud items with local
        const map = new Map<string, FoodDonation>();
        local.forEach((d) => map.set(d.id, d));
        cloudList.forEach((d) => map.set(d.id, d));
        const merged = Array.from(map.values());
        try {
          localStorage.setItem('zeroplate_published_donations', JSON.stringify(merged));
        } catch (e) {}
        return merged;
      }
    }
  } catch (e) {
    console.warn('Cloud donations fetch error, using local cache', e);
  }
  return local;
}

export async function publishDonationToCloud(donation: FoodDonation): Promise<FoodDonation> {
  // 1. Immediately save locally for 0ms delay
  saveLocalDonation(donation);

  // 2. Push to global shared Cloud Database
  try {
    const all = await syncCloudDonations();
    const updated = [donation, ...all.filter((d) => d.id !== donation.id)];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    await fetch(DONATIONS_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'zeroplate_prod_donations_v1',
        data: { donations: updated },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch (e) {
    console.warn('Publish to cloud error, preserved in local storage', e);
  }
  return donation;
}

// ─────────────────────────────────────────────────────────────
// REQUESTS CLOUD SYNC
// ─────────────────────────────────────────────────────────────

export async function syncCloudRequests(): Promise<FoodRequest[]> {
  const local = getLocalRequests();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(REQUESTS_URL, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const cloudList = (data?.data?.list as FoodRequest[]) || [];

      if (Array.isArray(cloudList)) {
        const map = new Map<string, FoodRequest>();
        local.forEach((r) => map.set(r.id, r));
        cloudList.forEach((r) => map.set(r.id, r));
        const merged = Array.from(map.values());
        saveLocalRequests(merged);
        return merged;
      }
    }
  } catch (e) {
    console.warn('Cloud requests fetch error, using local cache', e);
  }
  return local;
}

export async function submitRequestToCloud(request: FoodRequest): Promise<FoodRequest> {
  // 1. Save locally
  const currentRequests = getLocalRequests();
  const updatedRequests = [request, ...currentRequests.filter((r) => r.id !== request.id)];
  saveLocalRequests(updatedRequests);

  // 2. Push to Cloud
  try {
    const all = await syncCloudRequests();
    const updated = [request, ...all.filter((r) => r.id !== request.id)];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    await fetch(REQUESTS_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'zeroplate_prod_requests_v1',
        data: { list: updated },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch (e) {
    console.warn('Submit request to cloud error', e);
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

        if (booking) {
          await addBookingToCloud(booking);
        }
      }

      saveLocalRequests(requests);

      await fetch(REQUESTS_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'zeroplate_prod_requests_v1',
          data: { list: requests },
        }),
      });
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
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(BOOKINGS_URL, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const cloudList = (data?.data?.list as Booking[]) || [];

      if (Array.isArray(cloudList)) {
        const map = new Map<string, Booking>();
        local.forEach((b) => map.set(b.id, b));
        cloudList.forEach((b) => map.set(b.id, b));
        const merged = Array.from(map.values());
        saveLocalBookings(merged);
        return merged;
      }
    }
  } catch (e) {
    console.warn('Cloud bookings fetch error, using local cache', e);
  }
  return local;
}

export async function addBookingToCloud(booking: Booking): Promise<Booking> {
  const local = getLocalBookings();
  const updatedLocal = [booking, ...local.filter((b) => b.id !== booking.id)];
  saveLocalBookings(updatedLocal);

  try {
    const all = await syncCloudBookings();
    const updated = [booking, ...all.filter((b) => b.id !== booking.id)];

    await fetch(BOOKINGS_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'zeroplate_prod_bookings_v1',
        data: { list: updated },
      }),
    });
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

      await fetch(BOOKINGS_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'zeroplate_prod_bookings_v1',
          data: { list: bookings },
        }),
      });

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
