export type UserRole = 'donor' | 'ngo';
export type SubscriptionPlan = 'free' | 'premium';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  subscriptionPlan: SubscriptionPlan;
  location: string;
  latitude: number;
  longitude: number;
  emailVerified: boolean;
  donorType?: 'Restaurant' | 'Hotel' | 'Caterer' | 'Household' | 'Volunteer';
  createdAt: string;
}

export type DonationStatus =
  | 'AVAILABLE'
  | 'PENDING_REQUEST'
  | 'CONFIRMED'
  | 'RESERVED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface FoodDonation {
  id: string;
  donorId: string;
  donorName: string;
  donorType?: string;
  foodName: string;
  foodType: 'veg' | 'non-veg';
  category: string;
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
  packagingAvailable?: boolean;
  additionalNotes?: string;
  pendingRequestsCount?: number;
  createdAt: string;
}

export interface NGO {
  id: string;
  userId: string;
  organizationName: string;
  capacity: number;
  latitude: number;
  longitude: number;
  address?: string;
  availability: boolean;
  isPremium?: boolean;
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
  mealScore: number;
  urgencyScore: number;
  distanceKm: number;
  explanation: string;
  status: FoodRequestStatus;
  notes?: string;
  requestedAt: string;
  respondedAt?: string;
}

export type BookingStatus =
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
  status: BookingStatus;
  pickupTime?: string;
  reservationExpiry?: string;
  completedAt?: string;
  createdAt: string;
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
  matchScore: number; // 0-100
  distanceScore: number;
  mealScore: number;
  urgencyScore: number;
  premiumBonus: number;
  distanceKm: number;
  explanation: string;
}

export interface SearchFilters {
  location?: string;
  radiusKm?: number;
  foodType?: 'all' | 'veg' | 'non-veg';
  minMeals?: number;
  maxMeals?: number;
  urgency?: 'all' | 'urgent';
  sortBy?: 'best_match' | 'nearest' | 'most_meals' | 'most_urgent' | 'latest';
}
