import { FoodDonation } from '../types';

const STORAGE_KEY = 'zeroplate_published_donations';

const INITIAL_SEED_DONATIONS: FoodDonation[] = [
  {
    id: 'don_biryani',
    donorId: 'donor_spicevilla',
    donorName: 'SpiceVilla Restaurant',
    donorType: 'Restaurant',
    foodName: 'Veg Hyderabadi Biryani',
    foodCategory: 'Main Course',
    category: 'Main Course',
    foodSpecifications: ['Biryani', 'Rice + Dal', 'Cooked Food'],
    foodType: 'veg',
    mealCount: 50,
    quantity: '50 meals (approx 25 kg)',
    description: 'Freshly prepared aromatic vegetable Hyderabadi biryani with saffron, mint, and fried onions. Kept in clean insulated hot-boxes.',
    packagingStatus: 'Already packed',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    latitude: 19.076,
    longitude: 72.8777,
    pickupLocation: 'Shop 4, Hill Road, Bandra West, Mumbai 400050',
    pickupAddress: 'Shop 4, Hill Road, Bandra West, Mumbai 400050',
    originAddress: 'Shop 4, Hill Road, Bandra West, Mumbai 400050',
    availableFrom: new Date().toISOString(),
    pickupDeadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    status: 'AVAILABLE',
    packagingAvailable: true,
    additionalNotes: 'Please bring food-grade transport bags or containers.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'don_paneer_curry',
    donorId: 'donor_spicevilla',
    donorName: 'SpiceVilla Restaurant',
    donorType: 'Restaurant',
    foodName: 'Paneer Butter Masala & Rotis',
    foodCategory: 'Curry & Bread',
    category: 'Curry & Bread',
    foodSpecifications: ['Cooked Food', 'Roti / Chapati', 'Curry'],
    foodType: 'veg',
    mealCount: 40,
    quantity: '40 portions + 80 butter rotis',
    description: 'Rich paneer butter masala gravy with fresh hand-rolled tandoori rotis. Prepared at lunch service.',
    packagingStatus: 'Already packed',
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=80',
    latitude: 19.076,
    longitude: 72.8777,
    pickupLocation: 'Shop 4, Hill Road, Bandra West, Mumbai 400050',
    pickupAddress: 'Shop 4, Hill Road, Bandra West, Mumbai 400050',
    originAddress: 'Shop 4, Hill Road, Bandra West, Mumbai 400050',
    availableFrom: new Date().toISOString(),
    pickupDeadline: new Date(Date.now() + 3.5 * 60 * 60 * 1000).toISOString(),
    status: 'AVAILABLE',
    packagingAvailable: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'don_dal_rice',
    donorId: 'donor_greenleaf',
    donorName: 'Green Leaf Cafe',
    donorType: 'Caterer',
    foodName: 'Dal Tadka & Steamed Jeera Rice',
    foodCategory: 'Rice & Dal',
    category: 'Rice & Dal',
    foodSpecifications: ['Dal', 'Rice', 'Cooked Food'],
    foodType: 'veg',
    mealCount: 60,
    quantity: '60 meals',
    description: 'Home-style yellow dal tadka with aromatic cumin rice. Packed in clean containers.',
    packagingStatus: 'Already packed',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
    latitude: 19.088,
    longitude: 72.826,
    pickupLocation: '12 Juhu Tara Road, Juhu, Mumbai 400049',
    pickupAddress: '12 Juhu Tara Road, Juhu, Mumbai 400049',
    originAddress: '12 Juhu Tara Road, Juhu, Mumbai 400049',
    availableFrom: new Date().toISOString(),
    pickupDeadline: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    status: 'AVAILABLE',
    packagingAvailable: true,
    createdAt: new Date().toISOString(),
  },
];

export function getLocalDonations(): FoodDonation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading local donations', e);
  }
  return INITIAL_SEED_DONATIONS;
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
