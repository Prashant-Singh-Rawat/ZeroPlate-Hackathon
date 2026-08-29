import { FoodDonation } from '../types';

const STORAGE_KEY = 'zeroplate_v2_donations';

const INITIAL_SEED_DONATIONS: FoodDonation[] = [];

export function getLocalDonations(): FoodDonation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error reading local donations', e);
  }
  return INITIAL_SEED_DONATIONS;
}

export function saveAllLocalDonations(donations: FoodDonation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(donations));
  } catch (e) {
    console.warn('Error saving local donations', e);
  }
}

export function saveLocalDonation(donation: any): FoodDonation {
  const existing = getLocalDonations();
  const newDonation: FoodDonation = {
    id: donation.id || `don_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    donorId: donation.donorId || 'donor_spicevilla',
    donorName: donation.donorName || 'Food Donor',
    donorType: donation.donorType || 'Restaurant',
    foodName: donation.foodName,
    foodCategory: donation.foodCategory || 'Main Course',
    category: donation.category || donation.foodCategory || 'Main Course',
    foodSpecifications: donation.foodSpecifications || ['Cooked Food'],
    foodType: donation.foodType || 'veg',
    mealCount: Number(donation.mealCount) || 50,
    quantity: donation.quantity || `${donation.mealCount} meals`,
    description: donation.description || 'Surplus food ready for collection.',
    packagingStatus: donation.packagingStatus || 'Already packed',
    imageUrl:
      donation.imageUrl ||
      (donation.foodType === 'non-veg'
        ? 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80'),
    latitude: donation.latitude || 19.076,
    longitude: donation.longitude || 72.8777,
    pickupLocation: donation.pickupLocation || donation.pickupAddress || 'Bandra West, Mumbai',
    pickupAddress: donation.pickupAddress || donation.pickupLocation || 'Bandra West, Mumbai',
    originAddress: donation.originAddress || donation.pickupLocation || 'Bandra West, Mumbai',
    availableFrom: donation.availableFrom || new Date().toISOString(),
    pickupDeadline: donation.pickupDeadline || new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    status: donation.status || 'AVAILABLE',
    packagingAvailable: donation.packagingAvailable ?? true,
    createdAt: new Date().toISOString(),
  };

  const updated = [newDonation, ...existing.filter((d) => d.id !== newDonation.id)];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error saving local donation', e);
  }
  return newDonation;
}
