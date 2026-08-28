export type UserRole = 'donor' | 'ngo';
export type SubscriptionPlan = 'free' | 'premium';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  subscriptionPlan: SubscriptionPlan;
  location?: string;
  latitude: number;
  longitude: number;
  emailVerified: boolean;
  onboarded: boolean;
  donorType?: 'Restaurant' | 'Hotel' | 'Caterer' | 'Household' | 'Individual' | 'Volunteer' | 'Other';
  organizationType?: string;
  createdAt: string;
}

export interface NGOEntity {
  id: string;
  userId: string;
  organizationName: string;
  organizationType: 'NGO' | 'Charity' | 'Community Kitchen' | 'Food Shelter' | 'Orphanage' | 'Old Age Home' | 'Relief Organization' | 'Other';
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  latitude: number;
  longitude: number;
  locationSharingEnabled: boolean;
  capacity: number;
  isPremium?: boolean;
  availability?: boolean;
  createdAt: string;
}

export type NGO = NGOEntity;

export interface NGOFoodRequirement {
  id: string;
  ngoId: string;
  requiredMeals: number;
  foodSpecifications: string[];
  foodType: 'veg' | 'non-veg' | 'either';
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  requiredBy: string;
  maximumRadius: number;
  specificRequirement?: string;
  status: 'ACTIVE' | 'FULFILLED' | 'CANCELLED';
  createdAt: string;
}

export interface DonorEntity {
  id: string;
  userId: string;
  donorType: 'Restaurant' | 'Hotel' | 'Caterer' | 'Household' | 'Individual' | 'Volunteer' | 'Other';
  organizationName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  latitude: number;
  longitude: number;
  isHousehold: boolean;
  createdAt: string;
}

export type DonationStatus =
  | 'AVAILABLE'
  | 'PENDING_REQUEST'
  | 'CONFIRMED'
  | 'RESERVED'
  | 'PICKUP_IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface FoodDonation {
  id: string;
  donorId: string;
  donorName: string;
  donorType?: string;
  foodName: string;
  foodCategory: string;
  category?: string;
  foodSpecifications: string[];
  foodType: 'veg' | 'non-veg';
  mealCount: number;
  quantity: string;
  description: string;
  imageUrl?: string;
  latitude: number;
  longitude: number;
  pickupLocation: string;
  pickupAddress?: string;
  availableFrom: string;
  pickupDeadline: string;
  status: DonationStatus;
  prepTime?: string;
  packagingAvailable: boolean;
  additionalNotes?: string;
  pendingRequestsCount?: number;
  createdAt: string;
}

export type FoodRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export interface FoodRequest {
  id: string;
  donationId: string;
  ngoId: string;
  ngoName: string;
  donorId: string;
  donorName: string;
  foodName: string;
  requestedMeals: number;
  matchScore: number;
  distanceScore: number;
  mealQuantityScore: number;
  mealScore?: number;
  foodSpecScore: number;
  urgencyScore: number;
  distanceKm: number;
  explanation: string;
  status: FoodRequestStatus;
  notes?: string;
  requestedAt: string;
  respondedAt?: string;
}

export type BookingStatus =
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'CONFIRMED'
  | 'PICKUP_IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Booking {
  id: string;
  donationId: string;
  requestId?: string;
  ngoId: string;
  ngoName: string;
  donorId: string;
  donorName: string;
  foodName: string;
  mealCount: number;
  pickupLocation: string;
  pickupAddress?: string;
  donorLatitude?: number;
  donorLongitude?: number;
  ngoLatitude?: number;
  ngoLongitude?: number;
  status: BookingStatus;
  pickupTime?: string;
  reservationExpiry?: string;
  liveTrackingEnabled: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface LocationUpdate {
  id: string;
  bookingId: string;
  userId: string;
  role: UserRole;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  message: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: 'active' | 'cancelled';
  startedAt: string;
  expiresAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'urgent';
  read: boolean;
  createdAt: string;
}

export interface MatchScoreResult {
  matchScore: number;
  distanceScore: number;
  mealQuantityScore: number;
  foodSpecScore: number;
  urgencyScore: number;
  premiumBonus: number;
  distanceKm: number;
  explanation: string;
}

export interface SearchFilters {
  location?: string;
  radiusKm?: number;
  foodType?: 'all' | 'veg' | 'non-veg';
  foodSpecifications?: string[];
  minMeals?: number;
  maxMeals?: number;
  urgency?: 'all' | 'urgent';
  sortBy?: 'best_match' | 'nearest' | 'most_meals' | 'most_urgent' | 'latest';
}
