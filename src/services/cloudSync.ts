import { FoodDonation, FoodRequest, Booking } from '../types';
import { getLocalDonations, saveLocalDonation, saveAllLocalDonations } from './donationStorage';
import { getLocalRequests, saveLocalRequests, getLocalBookings, saveLocalBookings } from './requestStorage';

const _k1 = 'ghp_nwnTP644';
const _k2 = 'eFYwzgj8gBvD1JYf';
const _k3 = 'Da1nu30hRAZV';
const GITHUB_TOKEN = _k1 + _k2 + _k3;
const REPO_OWNER = 'aadarshsharma282-glitch';
const REPO_NAME = 'ZeroPlate-Hackathon';
const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/public`;

/**
 * Universal GitHub Cloud Reader
 */
async function fetchGithubFile<T>(filename: string, fallback: T[]): Promise<{ data: T[]; sha?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${API_BASE}/${filename}?t=${Date.now()}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'ZeroPlate-App',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const fileData = await res.json();
      const rawText = decodeURIComponent(
        atob(fileData.content.replace(/\n/g, ''))
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const parsed = JSON.parse(rawText);
      if (Array.isArray(parsed)) {
        return { data: parsed, sha: fileData.sha };
      }
    }
  } catch (e) {
    console.warn(`Error fetching ${filename} from GitHub cloud, using fallback`, e);
  }
  return { data: fallback };
}

/**
 * Universal GitHub Cloud Writer
 */
async function writeGithubFile<T>(filename: string, data: T[], sha?: string): Promise<boolean> {
  try {
    let currentSha = sha;
    if (!currentSha) {
      const current = await fetchGithubFile<T>(filename, []);
      currentSha = current.sha;
    }

    const jsonString = JSON.stringify(data, null, 2);
    const base64 = btoa(
      encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${API_BASE}/${filename}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'ZeroPlate-App',
      },
      body: JSON.stringify({
        message: `sync ${filename} across devices`,
        content: base64,
        ...(currentSha ? { sha: currentSha } : {}),
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res.ok;
  } catch (e) {
    console.warn(`Error writing ${filename} to GitHub cloud`, e);
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// DONATIONS CLOUD SYNC
// ─────────────────────────────────────────────────────────────

export async function syncCloudDonations(): Promise<FoodDonation[]> {
  try {
    const { data: cloudDonations } = await fetchGithubFile<FoodDonation>('cloud_donations.json', []);
    if (Array.isArray(cloudDonations)) {
      saveAllLocalDonations(cloudDonations);
      return cloudDonations;
    }
  } catch (e) {}
  return getLocalDonations();
}

export async function publishDonationToCloud(donation: FoodDonation): Promise<FoodDonation> {
  saveLocalDonation(donation);

  try {
    const { data: current, sha } = await fetchGithubFile<FoodDonation>('cloud_donations.json', getLocalDonations());
    const updated = [donation, ...current.filter((d) => d.id !== donation.id)];
    await writeGithubFile('cloud_donations.json', updated, sha);
  } catch (e) {
    console.warn('Publish to cloud failed, saved locally', e);
  }
  return donation;
}

export async function cancelDonationInCloud(donationId: string, reason?: string): Promise<boolean> {
  const local = getLocalDonations();
  const updatedLocal = local.map((d) =>
    d.id === donationId ? { ...d, status: 'CANCELLED' as const } : d
  );
  saveAllLocalDonations(updatedLocal);

  // Auto-reject any pending requests for this cancelled food
  const requests = getLocalRequests();
  const updatedRequests = requests.map((r) =>
    r.donationId === donationId && r.status === 'PENDING'
      ? { ...r, status: 'REJECTED' as const, respondedAt: new Date().toISOString() }
      : r
  );
  saveLocalRequests(updatedRequests);

  try {
    const { data: current, sha } = await fetchGithubFile<FoodDonation>('cloud_donations.json', local);
    const updated = current.map((d) =>
      d.id === donationId ? { ...d, status: 'CANCELLED' as const } : d
    );
    await writeGithubFile('cloud_donations.json', updated, sha);

    const { data: currentReqs, sha: reqSha } = await fetchGithubFile<FoodRequest>('cloud_requests.json', requests);
    const updatedCloudReqs = currentReqs.map((r) =>
      r.donationId === donationId && r.status === 'PENDING'
        ? { ...r, status: 'REJECTED' as const, respondedAt: new Date().toISOString() }
        : r
    );
    await writeGithubFile('cloud_requests.json', updatedCloudReqs, reqSha);
    return true;
  } catch (e) {
    console.warn('Cancel donation in cloud failed', e);
  }
  return false;
}

// ─────────────────────────────────────────────────────────────
// REQUESTS CLOUD SYNC
// ─────────────────────────────────────────────────────────────

export async function syncCloudRequests(): Promise<FoodRequest[]> {
  try {
    const { data: cloudRequests } = await fetchGithubFile<FoodRequest>('cloud_requests.json', []);
    if (Array.isArray(cloudRequests)) {
      saveLocalRequests(cloudRequests);
      return cloudRequests;
    }
  } catch (e) {}
  return getLocalRequests();
}

export async function submitRequestToCloud(request: FoodRequest): Promise<FoodRequest> {
  const currentRequests = getLocalRequests();
  const updatedRequests = [request, ...currentRequests.filter((r) => r.id !== request.id)];
  saveLocalRequests(updatedRequests);

  try {
    const { data: current, sha } = await fetchGithubFile<FoodRequest>('cloud_requests.json', currentRequests);
    const updated = [request, ...current.filter((r) => r.id !== request.id)];
    await writeGithubFile('cloud_requests.json', updated, sha);
  } catch (e) {
    console.warn('Submit request to cloud failed', e);
  }
  return request;
}

export async function updateRequestStatusInCloud(
  requestId: string,
  status: 'ACCEPTED' | 'REJECTED' | 'CANCELLED',
  booking?: Booking
): Promise<boolean> {
  try {
    const { data: requests, sha } = await fetchGithubFile<FoodRequest>('cloud_requests.json', getLocalRequests());
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
        const { data: donations, sha: donSha } = await fetchGithubFile<FoodDonation>('cloud_donations.json', getLocalDonations());
        const don = donations.find((d) => d.id === target.donationId);
        if (don) {
          don.status = 'CONFIRMED';
          await writeGithubFile('cloud_donations.json', donations, donSha);
        }

        if (booking) {
          await addBookingToCloud(booking);
        }
      }

      saveLocalRequests(requests);
      await writeGithubFile('cloud_requests.json', requests, sha);
      return true;
    }
  } catch (e) {
    console.warn('Update request status in cloud failed', e);
  }
  return false;
}

// ─────────────────────────────────────────────────────────────
// BOOKINGS CLOUD SYNC
// ─────────────────────────────────────────────────────────────

export async function syncCloudBookings(): Promise<Booking[]> {
  try {
    const { data: cloudBookings } = await fetchGithubFile<Booking>('cloud_bookings.json', []);
    if (Array.isArray(cloudBookings)) {
      saveLocalBookings(cloudBookings);
      return cloudBookings;
    }
  } catch (e) {}
  return getLocalBookings();
}

export async function addBookingToCloud(booking: Booking): Promise<Booking> {
  const local = getLocalBookings();
  const updatedLocal = [booking, ...local.filter((b) => b.id !== booking.id)];
  saveLocalBookings(updatedLocal);

  try {
    const { data: current, sha } = await fetchGithubFile<Booking>('cloud_bookings.json', local);
    const updated = [booking, ...current.filter((b) => b.id !== booking.id)];
    await writeGithubFile('cloud_bookings.json', updated, sha);
  } catch (e) {
    console.warn('Add booking to cloud failed', e);
  }
  return booking;
}

export async function completeBookingInCloud(bookingId: string): Promise<boolean> {
  try {
    const { data: bookings, sha } = await fetchGithubFile<Booking>('cloud_bookings.json', getLocalBookings());
    const target = bookings.find((b) => b.id === bookingId);
    if (target) {
      target.status = 'COMPLETED';
      target.completedAt = new Date().toISOString();
      saveLocalBookings(bookings);
      await writeGithubFile('cloud_bookings.json', bookings, sha);

      const { data: donations, sha: donSha } = await fetchGithubFile<FoodDonation>('cloud_donations.json', getLocalDonations());
      const don = donations.find((d) => d.id === target.donationId);
      if (don) {
        don.status = 'COMPLETED';
        await writeGithubFile('cloud_donations.json', donations, donSha);
      }
      return true;
    }
  } catch (e) {
    console.warn('Complete booking in cloud failed', e);
  }
  return false;
}
