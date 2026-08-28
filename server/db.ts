import fs from 'fs';
import path from 'path';
import {
  User,
  FoodDonation,
  NGOEntity,
  DonorEntity,
  NGOFoodRequirement,
  FoodRequest,
  Booking,
  LocationUpdate,
  Message,
  Subscription,
  NotificationItem,
} from '../src/types';
import { computeFullMatch } from '../src/services/matching/matchingEngine';

const DB_FILE = path.resolve(process.cwd(), 'zeroplate_db.json');

interface DBData {
  users: User[];
  ngos: NGOEntity[];
  donors: DonorEntity[];
  requirements: NGOFoodRequirement[];
  donations: FoodDonation[];
  requests: FoodRequest[];
  bookings: Booking[];
  locationUpdates: LocationUpdate[];
  messages: Message[];
  subscriptions: Subscription[];
  notifications: NotificationItem[];
}

const initialSeedData: DBData = {
  users: [
    {
      id: 'donor_spicevilla',
      name: 'SpiceVilla Restaurant',
      email: 'donor@spicevilla.com',
      role: 'donor',
      phone: '+91 98200 12345',
      donorType: 'Restaurant',
      subscriptionPlan: 'free',
      location: 'Bandra West, Mumbai',
      latitude: 19.076,
      longitude: 72.8777,
      emailVerified: true,
      onboarded: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'donor_greenleaf',
      name: 'Green Leaf Cafe',
      email: 'donor@greenleaf.com',
      role: 'donor',
      phone: '+91 98201 67890',
      donorType: 'Caterer',
      subscriptionPlan: 'premium',
      location: 'Juhu, Mumbai',
      latitude: 19.088,
      longitude: 72.826,
      emailVerified: true,
      onboarded: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'donor_royalkitchen',
      name: 'Royal Kitchen Caterers',
      email: 'donor@royalkitchen.com',
      role: 'donor',
      phone: '+91 98202 34567',
      donorType: 'Hotel',
      subscriptionPlan: 'free',
      location: 'Andheri East, Mumbai',
      latitude: 19.1197,
      longitude: 72.8464,
      emailVerified: true,
      onboarded: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ngo_hope',
      name: 'Hope Foundation',
      email: 'ngo@hope.org',
      role: 'ngo',
      phone: '+91 98111 88888',
      organizationType: 'NGO',
      subscriptionPlan: 'premium',
      location: 'Bandra East, Mumbai',
      latitude: 19.062,
      longitude: 72.854,
      emailVerified: true,
      onboarded: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ngo_helpinghands',
      name: 'Helping Hands NGO',
      email: 'ngo@helpinghands.org',
      role: 'ngo',
      phone: '+91 98222 99999',
      organizationType: 'Charity',
      subscriptionPlan: 'free',
      location: 'Santa Cruz West, Mumbai',
      latitude: 19.084,
      longitude: 72.836,
      emailVerified: true,
      onboarded: true,
      createdAt: new Date().toISOString(),
    },
  ],
  ngos: [
    {
      id: 'ngo_entity_hope',
      userId: 'ngo_hope',
      organizationName: 'Hope Foundation',
      organizationType: 'NGO',
      contactPerson: 'Anjali Sharma',
      phone: '+91 98111 88888',
      email: 'ngo@hope.org',
      address: 'Bandra East Community Center, Mumbai',
      latitude: 19.062,
      longitude: 72.854,
      locationSharingEnabled: true,
      capacity: 120,
      createdAt: new Date().toISOString(),
    },
  ],
  donors: [
    {
      id: 'donor_entity_spicevilla',
      userId: 'donor_spicevilla',
      donorType: 'Restaurant',
      organizationName: 'SpiceVilla Restaurant',
      contactPerson: 'Chef Vikram Malhotra',
      phone: '+91 98200 12345',
      email: 'donor@spicevilla.com',
      address: 'Shop 4, Hill Road, Bandra West, Mumbai 400050',
      latitude: 19.076,
      longitude: 72.8777,
      isHousehold: false,
      createdAt: new Date().toISOString(),
    },
  ],
  requirements: [
    {
      id: 'req_hope_default',
      ngoId: 'ngo_hope',
      requiredMeals: 80,
      foodSpecifications: ['Rice', 'Dal', 'Rice + Dal', 'Biryani'],
      foodType: 'veg',
      urgency: 'high',
      requiredBy: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      maximumRadius: 15,
      specificRequirement: 'Nutritious lunch meal for 80 children at Bandra East shelter',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    },
  ],
  donations: [
    {
      id: 'don_biryani',
      donorId: 'donor_spicevilla',
      donorName: 'SpiceVilla Restaurant',
      donorType: 'Restaurant',
      foodName: 'Veg Hyderabadi Biryani',
      foodCategory: 'Main Course',
      category: 'Main Course',
      foodSpecifications: ['Rice', 'Dal', 'Rice + Dal', 'Biryani'],
      foodType: 'veg',
      mealCount: 80,
      quantity: '40 kg (Serves 80)',
      description: 'Freshly prepared aromatic vegetarian biryani with raita. Packed in food-grade insulated containers.',
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
      latitude: 19.076,
      longitude: 72.8777,
      pickupLocation: 'SpiceVilla Restaurant, Bandra West, Mumbai',
      pickupAddress: 'Shop 4, Hill Road, Bandra West, Mumbai 400050',
      availableFrom: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      pickupDeadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      status: 'AVAILABLE',
      prepTime: 'Freshly prepared 1 hour ago',
      packagingAvailable: true,
      additionalNotes: 'Pickup at rear kitchen loading dock on Hill Road.',
      pendingRequestsCount: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'don_dalrice',
      donorId: 'donor_greenleaf',
      donorName: 'Green Leaf Cafe',
      donorType: 'Caterer',
      foodName: 'Dal Tadka & Steamed Basmati Rice',
      foodCategory: 'Main Course',
      category: 'Main Course',
      foodSpecifications: ['Rice', 'Dal', 'Rice + Dal'],
      foodType: 'veg',
      mealCount: 100,
      quantity: '50 kg (Serves 100)',
      description: 'Nutritious yellow dal tadka served with hot steamed basmati rice. Hygienically packed.',
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
      latitude: 19.088,
      longitude: 72.826,
      pickupLocation: 'Green Leaf Cafe, Juhu, Mumbai',
      pickupAddress: '12 Juhu Tara Road, Juhu, Mumbai 400049',
      availableFrom: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      pickupDeadline: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
      status: 'AVAILABLE',
      prepTime: 'Cooked 45 mins ago',
      packagingAvailable: true,
      pendingRequestsCount: 0,
      createdAt: new Date().toISOString(),
    },
  ],
  requests: [],
  bookings: [
    {
      id: 'book_sample_completed',
      donationId: 'don_sample_past',
      ngoId: 'ngo_hope',
      ngoName: 'Hope Foundation',
      donorId: 'donor_spicevilla',
      donorName: 'SpiceVilla Restaurant',
      foodName: 'Kofta Curry & Jeera Rice',
      mealCount: 80,
      pickupLocation: 'SpiceVilla Restaurant, Bandra West',
      pickupAddress: 'Shop 4, Hill Road, Bandra West, Mumbai 400050',
      donorLatitude: 19.076,
      donorLongitude: 72.8777,
      ngoLatitude: 19.062,
      ngoLongitude: 72.854,
      status: 'COMPLETED',
      pickupTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      liveTrackingEnabled: true,
      completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    },
  ],
  locationUpdates: [],
  messages: [],
  subscriptions: [
    {
      id: 'sub_hope',
      userId: 'ngo_hope',
      plan: 'premium',
      status: 'active',
      startedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  notifications: [],
};

class Database {
  private data: DBData;

  constructor() {
    this.data = this.load();
  }

  private load(): DBData {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (!parsed.requests) parsed.requests = [];
        if (!parsed.requirements) parsed.requirements = initialSeedData.requirements;
        if (!parsed.donors) parsed.donors = initialSeedData.donors;
        if (!parsed.locationUpdates) parsed.locationUpdates = [];
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to read DB file, resetting to initial seed.');
    }
    this.save(initialSeedData);
    return initialSeedData;
  }

  private save(data: DBData) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  public getStore(): DBData {
    return this.data;
  }

  public setNGORequirement(
    ngoId: string,
    reqData: Omit<NGOFoodRequirement, 'id' | 'ngoId' | 'createdAt'>
  ): NGOFoodRequirement {
    let req = this.data.requirements.find((r) => r.ngoId === ngoId && r.status === 'ACTIVE');
    const now = new Date().toISOString();

    if (req) {
      req.requiredMeals = reqData.requiredMeals;
      req.foodSpecifications = reqData.foodSpecifications || [];
      req.foodType = reqData.foodType;
      req.urgency = reqData.urgency;
      req.requiredBy = reqData.requiredBy;
      req.maximumRadius = reqData.maximumRadius;
      req.specificRequirement = reqData.specificRequirement;
    } else {
      req = {
        id: `req_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        ngoId,
        requiredMeals: reqData.requiredMeals,
        foodSpecifications: reqData.foodSpecifications || [],
        foodType: reqData.foodType,
        urgency: reqData.urgency,
        requiredBy: reqData.requiredBy,
        maximumRadius: reqData.maximumRadius,
        specificRequirement: reqData.specificRequirement,
        status: 'ACTIVE',
        createdAt: now,
      };
      this.data.requirements.unshift(req);
    }
    this.save(this.data);
    return req;
  }

  public getNGORequirement(ngoId: string): NGOFoodRequirement | undefined {
    return this.data.requirements.find((r) => r.ngoId === ngoId && r.status === 'ACTIVE');
  }

  public createFoodRequest(
    donationId: string,
    ngoId: string,
    ngoName: string,
    requestedMeals?: number,
    notes?: string
  ): { success: boolean; request?: FoodRequest; error?: string } {
    const donation = this.data.donations.find((d) => d.id === donationId);
    if (!donation) {
      return { success: false, error: 'Food donation not found.' };
    }

    if (donation.status === 'CONFIRMED' || donation.status === 'RESERVED' || donation.status === 'COMPLETED') {
      return { success: false, error: 'This food donation is already confirmed and reserved for another organization.' };
    }

    const existing = this.data.requests.find(
      (r) => r.donationId === donationId && r.ngoId === ngoId && r.status === 'PENDING'
    );
    if (existing) {
      return { success: false, error: 'Your organization already has a pending request for this donation.' };
    }

    const ngoUser = this.data.users.find((u) => u.id === ngoId);
    const ngoEntity = this.data.ngos.find((n) => n.userId === ngoId || n.id === ngoId);
    const ngoReq = this.getNGORequirement(ngoId);

    const ngoLat = ngoEntity?.latitude || ngoUser?.latitude || 19.062;
    const ngoLng = ngoEntity?.longitude || ngoUser?.longitude || 72.854;
    const isPremium = ngoUser?.subscriptionPlan === 'premium';

    const match = computeFullMatch(
      { lat: donation.latitude, lng: donation.longitude },
      { lat: ngoLat, lng: ngoLng },
      donation.mealCount,
      ngoReq?.requiredMeals || ngoEntity?.capacity || 80,
      donation.pickupDeadline,
      donation.foodSpecifications || [donation.foodCategory || 'Cooked Food'],
      ngoReq?.foodSpecifications || ['Cooked Food'],
      isPremium,
      ngoName
    );

    const newRequest: FoodRequest = {
      id: `req_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      donationId,
      ngoId,
      ngoName,
      donorId: donation.donorId,
      donorName: donation.donorName,
      foodName: donation.foodName,
      requestedMeals: requestedMeals || donation.mealCount,
      matchScore: match.matchScore,
      distanceScore: match.distanceScore,
      mealQuantityScore: match.mealQuantityScore,
      mealScore: match.mealQuantityScore,
      foodSpecScore: match.foodSpecScore,
      urgencyScore: match.urgencyScore,
      distanceKm: match.distanceKm,
      explanation: match.explanation,
      status: 'PENDING',
      notes,
      requestedAt: new Date().toISOString(),
    };

    this.data.requests.unshift(newRequest);
    donation.status = 'PENDING_REQUEST';
    donation.pendingRequestsCount = (donation.pendingRequestsCount || 0) + 1;

    this.save(this.data);
    return { success: true, request: newRequest };
  }

  public acceptFoodRequest(
    requestId: string,
    donorId: string
  ): { success: boolean; request?: FoodRequest; booking?: Booking; error?: string } {
    const requestIndex = this.data.requests.findIndex((r) => r.id === requestId);
    if (requestIndex === -1) {
      return { success: false, error: 'Request not found.' };
    }

    const request = this.data.requests[requestIndex];

    if (request.donorId !== donorId) {
      return { success: false, error: 'Unauthorized. You can only accept requests for your own donations.' };
    }

    if (request.status !== 'PENDING') {
      return { success: false, error: `This request is already ${request.status.toLowerCase()}.` };
    }

    const donation = this.data.donations.find((d) => d.id === request.donationId);
    if (!donation) {
      return { success: false, error: 'Associated donation not found.' };
    }

    if (donation.status === 'CONFIRMED' || donation.status === 'RESERVED' || donation.status === 'COMPLETED') {
      return { success: false, error: 'This donation has already been confirmed for another NGO.' };
    }

    const ngoUser = this.data.users.find((u) => u.id === request.ngoId);
    const ngoEntity = this.data.ngos.find((n) => n.userId === request.ngoId);
    const now = new Date().toISOString();

    // 1. Accept target request
    request.status = 'ACCEPTED';
    request.respondedAt = now;

    // 2. Auto-reject competing requests
    for (const otherReq of this.data.requests) {
      if (otherReq.donationId === donation.id && otherReq.id !== request.id && otherReq.status === 'PENDING') {
        otherReq.status = 'REJECTED';
        otherReq.respondedAt = now;
      }
    }

    // 3. Update donation status
    donation.status = 'CONFIRMED';
    donation.pendingRequestsCount = 0;

    // 4. Create confirmed booking with live tracking enabled
    const newBooking: Booking = {
      id: `book_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      donationId: donation.id,
      requestId: request.id,
      ngoId: request.ngoId,
      ngoName: request.ngoName,
      donorId: donation.donorId,
      donorName: donation.donorName,
      foodName: donation.foodName,
      mealCount: request.requestedMeals,
      pickupLocation: donation.pickupLocation,
      pickupAddress: donation.pickupAddress || donation.pickupLocation,
      donorLatitude: donation.latitude,
      donorLongitude: donation.longitude,
      ngoLatitude: ngoEntity?.latitude || ngoUser?.latitude || 19.062,
      ngoLongitude: ngoEntity?.longitude || ngoUser?.longitude || 72.854,
      status: 'CONFIRMED',
      pickupTime: donation.pickupDeadline,
      liveTrackingEnabled: true,
      createdAt: now,
    };

    this.data.bookings.unshift(newBooking);
    this.save(this.data);
    return { success: true, request, booking: newBooking };
  }

  public rejectFoodRequest(
    requestId: string,
    donorId: string
  ): { success: boolean; request?: FoodRequest; error?: string } {
    const request = this.data.requests.find((r) => r.id === requestId);
    if (!request) return { success: false, error: 'Request not found.' };

    if (request.donorId !== donorId) {
      return { success: false, error: 'Unauthorized. You can only reject requests for your own donations.' };
    }

    if (request.status !== 'PENDING') {
      return { success: false, error: `This request is already ${request.status.toLowerCase()}.` };
    }

    request.status = 'REJECTED';
    request.respondedAt = new Date().toISOString();

    const donation = this.data.donations.find((d) => d.id === request.donationId);
    if (donation) {
      const remainingPending = this.data.requests.filter(
        (r) => r.donationId === donation.id && r.status === 'PENDING'
      ).length;
      donation.pendingRequestsCount = remainingPending;
      if (remainingPending === 0 && donation.status === 'PENDING_REQUEST') {
        donation.status = 'AVAILABLE';
      }
    }

    this.save(this.data);
    return { success: true, request };
  }

  public cancelFoodRequest(
    requestId: string,
    ngoId: string
  ): { success: boolean; error?: string } {
    const request = this.data.requests.find((r) => r.id === requestId);
    if (!request) return { success: false, error: 'Request not found.' };

    if (request.ngoId !== ngoId) {
      return { success: false, error: 'Unauthorized. You can only cancel your own requests.' };
    }

    if (request.status !== 'PENDING') {
      return { success: false, error: 'Only pending requests can be cancelled.' };
    }

    request.status = 'CANCELLED';
    request.respondedAt = new Date().toISOString();

    const donation = this.data.donations.find((d) => d.id === request.donationId);
    if (donation) {
      const remainingPending = this.data.requests.filter(
        (r) => r.donationId === donation.id && r.status === 'PENDING'
      ).length;
      donation.pendingRequestsCount = remainingPending;
      if (remainingPending === 0 && donation.status === 'PENDING_REQUEST') {
        donation.status = 'AVAILABLE';
      }
    }

    this.save(this.data);
    return { success: true };
  }

  public completePickup(
    bookingId: string,
    userId: string
  ): { success: boolean; booking?: Booking; error?: string } {
    const booking = this.data.bookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false, error: 'Booking not found.' };

    if (userId && booking.donorId !== userId && booking.ngoId !== userId) {
      return { success: false, error: 'Unauthorized to modify this booking.' };
    }

    const now = new Date().toISOString();
    booking.status = 'COMPLETED';
    booking.completedAt = now;

    const donation = this.data.donations.find((d) => d.id === booking.donationId);
    if (donation) {
      donation.status = 'COMPLETED';
    }

    this.save(this.data);
    return { success: true, booking };
  }

  public updateBookingLocation(
    bookingId: string,
    userId: string,
    role: 'donor' | 'ngo',
    latitude: number,
    longitude: number
  ): { success: boolean; update?: LocationUpdate; error?: string } {
    const booking = this.data.bookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false, error: 'Booking not found.' };

    if (booking.donorId !== userId && booking.ngoId !== userId) {
      return { success: false, error: 'Unauthorized. Tracking is strictly scoped to counterparties.' };
    }

    if (role === 'donor') {
      booking.donorLatitude = latitude;
      booking.donorLongitude = longitude;
    } else {
      booking.ngoLatitude = latitude;
      booking.ngoLongitude = longitude;
    }

    const newUpdate: LocationUpdate = {
      id: `loc_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      bookingId,
      userId,
      role,
      latitude,
      longitude,
      timestamp: new Date().toISOString(),
    };

    this.data.locationUpdates.push(newUpdate);
    this.save(this.data);
    return { success: true, update: newUpdate };
  }

  public updateBookingStatus(
    bookingId: string,
    userId: string,
    status: 'CONFIRMED' | 'PICKUP_IN_PROGRESS' | 'COMPLETED'
  ): { success: boolean; booking?: Booking; error?: string } {
    const booking = this.data.bookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false, error: 'Booking not found.' };

    if (booking.donorId !== userId && booking.ngoId !== userId) {
      return { success: false, error: 'Unauthorized.' };
    }

    booking.status = status;
    if (status === 'COMPLETED') {
      booking.completedAt = new Date().toISOString();
      const donation = this.data.donations.find((d) => d.id === booking.donationId);
      if (donation) donation.status = 'COMPLETED';
    }

    this.save(this.data);
    return { success: true, booking };
  }

  public addDonation(
    donationData: Omit<FoodDonation, 'id' | 'createdAt' | 'status' | 'pendingRequestsCount'>
  ): FoodDonation {
    const newDonation: FoodDonation = {
      ...donationData,
      id: `don_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      status: 'AVAILABLE',
      pendingRequestsCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.data.donations.unshift(newDonation);
    this.save(this.data);
    return newDonation;
  }

  public addUser(userData: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.save(this.data);
    return newUser;
  }

  public addMessage(msg: Omit<Message, 'id' | 'createdAt'>): Message {
    const newMsg: Message = {
      ...msg,
      id: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.messages.push(newMsg);
    this.save(this.data);
    return newMsg;
  }

  public updateUserPlan(userId: string, plan: 'free' | 'premium'): void {
    const user = this.data.users.find((u) => u.id === userId);
    if (user) {
      user.subscriptionPlan = plan;
    }
    const ngo = this.data.ngos.find((n) => n.userId === userId);
    if (ngo) {
      ngo.locationSharingEnabled = true;
    }
    this.save(this.data);
  }

  public onboardNGO(
    userId: string,
    orgName: string,
    orgType: any,
    contactPerson: string,
    phone: string,
    address: string,
    latitude: number,
    longitude: number,
    capacity: number = 80
  ): { user: User; entity: NGOEntity } {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');

    user.name = orgName;
    user.organizationType = orgType;
    user.phone = phone;
    user.location = address;
    user.latitude = latitude;
    user.longitude = longitude;
    user.onboarded = true;

    let ngoEntity = this.data.ngos.find((n) => n.userId === userId);
    if (ngoEntity) {
      ngoEntity.organizationName = orgName;
      ngoEntity.organizationType = orgType;
      ngoEntity.contactPerson = contactPerson;
      ngoEntity.phone = phone;
      ngoEntity.address = address;
      ngoEntity.latitude = latitude;
      ngoEntity.longitude = longitude;
    } else {
      ngoEntity = {
        id: `ngo_entity_${userId}`,
        userId,
        organizationName: orgName,
        organizationType: orgType,
        contactPerson,
        phone,
        email: user.email,
        address,
        latitude,
        longitude,
        locationSharingEnabled: true,
        capacity,
        createdAt: new Date().toISOString(),
      };
      this.data.ngos.push(ngoEntity);
    }

    this.save(this.data);
    return { user, entity: ngoEntity };
  }

  public onboardDonor(
    userId: string,
    donorType: any,
    orgName: string,
    contactPerson: string,
    phone: string,
    address: string,
    latitude: number,
    longitude: number,
    isHousehold: boolean = false
  ): { user: User; entity: DonorEntity } {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');

    user.name = orgName;
    user.donorType = donorType;
    user.phone = phone;
    user.location = address;
    user.latitude = latitude;
    user.longitude = longitude;
    user.onboarded = true;

    let donorEntity = this.data.donors.find((d) => d.userId === userId);
    if (donorEntity) {
      donorEntity.organizationName = orgName;
      donorEntity.donorType = donorType;
      donorEntity.contactPerson = contactPerson;
      donorEntity.phone = phone;
      donorEntity.address = address;
      donorEntity.latitude = latitude;
      donorEntity.longitude = longitude;
      donorEntity.isHousehold = isHousehold;
    } else {
      donorEntity = {
        id: `donor_entity_${userId}`,
        userId,
        donorType,
        organizationName: orgName,
        contactPerson,
        phone,
        email: user.email,
        address,
        latitude,
        longitude,
        isHousehold,
        createdAt: new Date().toISOString(),
      };
      this.data.donors.push(donorEntity);
    }

    this.save(this.data);
    return { user, entity: donorEntity };
  }

  public resetSeed(): void {
    this.data = JSON.parse(JSON.stringify(initialSeedData));
    this.save(this.data);
  }
}

export const db = new Database();
