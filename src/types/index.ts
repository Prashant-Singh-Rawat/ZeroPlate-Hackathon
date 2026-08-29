export type UserRole = 'donor' | 'ngo' | 'delivery';
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
  packagingStatus?: 'Already packed' | 'Needs packaging' | 'Not applicable';
  imageUrl?: string;
  latitude: number;
  longitude: number;
  pickupLocation: string;
  pickupAddress?: string;
  originAddress?: string;
  originLatitude?: number;
  originLongitude?: number;
  availableFrom: string;
  pickupDeadline: string;
  status: DonationStatus;
  prepTime?: string;
  packagingAvailable: boolean;
  additionalNotes?: string;
  pendingRequestsCount?: number;
  rating?: number;
  ratingCount?: number;
  createdAt: string;
}

export interface DonorRatingFeedback {
  id: string;
  bookingId: string;
  donorId: string;
  donorName: string;
  ngoId: string;
  ngoName: string;
  foodName: string;
  foodQualityScore: number;       // 1) Quality of the food given by donor (1-5)
  deliveryScore: number;          // 2) Delivery Experience (1-5)
  quantityAccuracyScore: number;  // 3) Quantity Accuracy (1-5)
  overallScore: number;           // Average of the 3 questions
  feedbackNotes?: string;
  createdAt: string;
}

export interface DonorRatingSummary {
  donorId: string;
  averageRating: number;
  totalReviews: number;
  qualityAverage: number;
  deliveryAverage: number;
  quantityAverage: number;
  ratings: DonorRatingFeedback[];
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

export type DeliveryRole = 'Driver' | 'Volunteer' | 'Delivery Person' | 'Staff' | 'Other';
export type VehicleType = 'Bike' | 'Scooter' | 'Car' | 'Van' | 'Other';

export interface DeliveryPerson {
  id: string;
  donorId: string;
  name: string;
  phone: string;
  role: DeliveryRole;
  vehicleType: VehicleType;
  vehicleNumber?: string;
  profilePhoto?: string;
  availability: 'Available' | 'Unavailable';
  activeBookingId?: string;
  currentLatitude?: number;
  currentLongitude?: number;
  createdAt: string;
}

export type BookingStatus =
  | 'CONFIRMED'
  | 'DELIVERY_ASSIGNED'
  | 'PICKUP_IN_PROGRESS'
  | 'FOOD_PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'NEAR_DESTINATION'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Booking {
  id: string;
  donationId: string;
  requestId?: string;
  ngoId: string;
  ngoName: string;
  ngoPhone?: string;
  donorId: string;
  donorName: string;
  donorPhone?: string;
  foodName: string;
  mealCount: number;
  foodSpecifications?: string[];
  pickupLocation: string;
  pickupAddress?: string;
  originAddress?: string;
  originLatitude?: number;
  originLongitude?: number;
  destinationAddress?: string;
  destinationLatitude?: number;
  destinationLongitude?: number;
  donorLatitude?: number;
  donorLongitude?: number;
  ngoLatitude?: number;
  ngoLongitude?: number;
  deliveryPersonId?: string;
  deliveryPersonName?: string;
  deliveryPersonPhone?: string;
  deliveryVehicleType?: VehicleType;
  deliveryVehicleNumber?: string;
  deliveryPersonLatitude?: number;
  deliveryPersonLongitude?: number;
  routeDistanceKm?: number;
  estimatedMinutes?: number;
  trafficStatus?: 'Low' | 'Moderate' | 'Heavy' | 'Unavailable';
  trafficAwareEta?: string;
  status: BookingStatus;
  pickupTime?: string;
  reservationExpiry?: string;
  liveTrackingEnabled: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface DeliveryLocationUpdate {
  id: string;
  bookingId: string;
  deliveryPersonId: string;
  latitude: number;
  longitude: number;
  speedKmh?: number;
  heading?: number;
  timestamp: string;
}

export type LocationUpdate = DeliveryLocationUpdate;

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
  mealScore?: number;
  foodSpecScore: number;
  urgencyScore: number;
  premiumBonus: number;
  distanceKm: number;
  explanation: string;
}
