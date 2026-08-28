import fs from 'fs';
import path from 'path';
import {
  User,
  FoodDonation,
  NGO,
  FoodRequest,
  Booking,
  Message,
  Subscription,
  NotificationItem,
} from '../src/types';
import { computeFullMatch } from '../src/services/matching/matchingEngine';

const DB_FILE = path.resolve(process.cwd(), 'zeroplate_db.json');

interface DBData {
  users: User[];
  ngos: NGO[];
  donations: FoodDonation[];
  requests: FoodRequest[];
  bookings: Booking[];
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
      donorType: 'Restaurant',
      subscriptionPlan: 'free',
      location: 'Bandra West, Mumbai',
      latitude: 19.076,
      longitude: 72.8777,
      emailVerified: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'donor_greenleaf',
      name: 'Green Leaf Cafe',
      email: 'donor@greenleaf.com',
      role: 'donor',
      donorType: 'Caterer',
      subscriptionPlan: 'premium',
      location: 'Juhu, Mumbai',
      latitude: 19.088,
      longitude: 72.826,
      emailVerified: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'donor_royalkitchen',
      name: 'Royal Kitchen Caterers',
      email: 'donor@royalkitchen.com',
      role: 'donor',
      donorType: 'Hotel',
      subscriptionPlan: 'free',
      location: 'Andheri East, Mumbai',
      latitude: 19.1197,
      longitude: 72.8464,
      emailVerified: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'donor_freshbites',
      name: 'Fresh Bites Community Volunteer',
      email: 'donor@freshbites.com',
      role: 'donor',
      donorType: 'Volunteer',
      subscriptionPlan: 'free',
      location: 'Powai, Mumbai',
      latitude: 19.1176,
      longitude: 72.906,
      emailVerified: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ngo_hope',
      name: 'Hope Foundation',
      email: 'ngo@hope.org',
      role: 'ngo',
      subscriptionPlan: 'premium',
      location: 'Bandra East, Mumbai',
      latitude: 19.062,
      longitude: 72.854,
      emailVerified: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ngo_helpinghands',
      name: 'Helping Hands NGO',
      email: 'ngo@helpinghands.org',
      role: 'ngo',
      subscriptionPlan: 'free',
      location: 'Santa Cruz West, Mumbai',
      latitude: 19.084,
      longitude: 72.836,
      emailVerified: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ngo_careshare',
      name: 'Care & Share Foundation',
      email: 'ngo@careshare.org',
      role: 'ngo',
      subscriptionPlan: 'premium',
      location: 'Dharavi, Mumbai',
      latitude: 19.04,
      longitude: 72.854,
      emailVerified: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ngo_communitykitchen',
      name: 'Community Kitchen Alliance',
      email: 'ngo@communitykitchen.org',
      role: 'ngo',
      subscriptionPlan: 'free',
      location: 'Kurla West, Mumbai',
      latitude: 19.07,
      longitude: 72.88,
      emailVerified: true,
      createdAt: new Date().toISOString(),
    },
  ],
  ngos: [
    {
      id: 'ngo_entity_hope',
      userId: 'ngo_hope',
      organizationName: 'Hope Foundation',
      capacity: 120,
      latitude: 19.062,
      longitude: 72.854,
      address: 'Bandra East Community Center, Mumbai',
      availability: true,
      isPremium: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ngo_entity_helpinghands',
      userId: 'ngo_helpinghands',
      organizationName: 'Helping Hands NGO',
      capacity: 80,
      latitude: 19.084,
      longitude: 72.836,
      address: 'Santa Cruz West Relief Hub, Mumbai',
      availability: true,
      isPremium: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ngo_entity_careshare',
      userId: 'ngo_careshare',
      organizationName: 'Care & Share Foundation',
      capacity: 150,
      latitude: 19.04,
      longitude: 72.854,
      address: 'Dharavi Social Kitchen, Mumbai',
      availability: true,
      isPremium: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ngo_entity_communitykitchen',
      userId: 'ngo_communitykitchen',
      organizationName: 'Community Kitchen Alliance',
      capacity: 60,
      latitude: 19.07,
      longitude: 72.88,
      address: 'Kurla West Food Hub, Mumbai',
      availability: true,
      isPremium: false,
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
      foodType: 'veg',
      category: 'Main Course',
      mealCount: 80,
      quantity: '40 kg (Serves 80)',
      description: 'Freshly prepared aromatic vegetarian biryani with raita. Packed in food-grade insulated containers.',
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
      latitude: 19.076,
      longitude: 72.8777,
      pickupLocation: 'SpiceVilla Restaurant, Hill Road, Bandra West, Mumbai',
      pickupAddress: 'Shop 4, Hill Road, Bandra West, Mumbai 400050',
      availableFrom: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      pickupDeadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      status: 'AVAILABLE',
      prepTime: 'Freshly prepared 1 hour ago',
      packagingAvailable: true,
      pendingRequestsCount: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'don_dalrice',
      donorId: 'donor_greenleaf',
      donorName: 'Green Leaf Cafe',
      donorType: 'Caterer',
      foodName: 'Dal Tadka & Steamed Basmati Rice',
      foodType: 'veg',
      category: 'Main Course',
      mealCount: 100,
      quantity: '50 kg (Serves 100)',
      description: 'Nutritious yellow dal tadka served with hot steamed basmati rice. Hygienically packed.',
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
      latitude: 19.088,
      longitude: 72.826,
      pickupLocation: 'Green Leaf Cafe, Juhu Tara Road, Juhu, Mumbai',
      pickupAddress: '12 Juhu Tara Road, Juhu, Mumbai 400049',
      availableFrom: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      pickupDeadline: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
      status: 'AVAILABLE',
      prepTime: 'Cooked 45 mins ago',
      packagingAvailable: true,
      pendingRequestsCount: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'don_paneer',
      donorId: 'donor_royalkitchen',
      donorName: 'Royal Kitchen Caterers',
      donorType: 'Hotel',
      foodName: 'Paneer Butter Masala & Rotis',
      foodType: 'veg',
      category: 'Curry & Bread',
      mealCount: 60,
      quantity: '30 kg + 120 Rotis',
      description: 'Rich cottage cheese gravy prepared for corporate event lunch surplus. Packed hot.',
      imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80',
      latitude: 19.1197,
      longitude: 72.8464,
      pickupLocation: 'Royal Kitchen, MIDC Main Rd, Andheri East, Mumbai',
      pickupAddress: 'Unit 8, MIDC Cross Road B, Andheri East, Mumbai 400093',
      availableFrom: new Date().toISOString(),
      pickupDeadline: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      status: 'AVAILABLE',
      prepTime: 'Prepared 30 mins ago',
      packagingAvailable: true,
      pendingRequestsCount: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'don_chapati',
      donorId: 'donor_freshbites',
      donorName: 'Fresh Bites Community Volunteer',
      donorType: 'Volunteer',
      foodName: 'Whole Wheat Chapati & Mix Veg Curry',
      foodType: 'veg',
      category: 'Combo Meal',
      mealCount: 120,
      quantity: '240 Chapatis + 35 kg Curry',
      description: 'Healthy whole wheat chapatis with fresh seasonal vegetable curry from local banquet drive.',
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
      latitude: 19.1176,
      longitude: 72.906,
      pickupLocation: 'Fresh Bites Hub, Hiranandani Gardens, Powai, Mumbai',
      pickupAddress: 'Galleria Mall Basement Dispatch, Powai, Mumbai 400076',
      availableFrom: new Date().toISOString(),
      pickupDeadline: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      status: 'AVAILABLE',
      prepTime: 'Fresh from banquet hall',
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
      pickupLocation: 'SpiceVilla Restaurant, Hill Road, Bandra West',
      status: 'COMPLETED',
      pickupTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    },
  ],
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
  notifications: [
    {
      id: 'notif_welcome_donor',
      userId: 'donor_spicevilla',
      title: 'Welcome to ZeroPlate!',
      message: 'Your food donor profile is verified. Publish surplus food to route meals directly to active NGOs.',
      type: 'info',
      read: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'notif_welcome_ngo',
      userId: 'ngo_hope',
      title: 'Priority Rescue Active',
      message: 'Your NGO profile is active with Priority Matching enabled.',
      type: 'success',
      read: false,
      createdAt: new Date().toISOString(),
    },
  ],
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

  /**
   * NGO submits a request for an available food donation (§3, §4, §11)
   */
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

    // Check if this NGO already has a pending request for this donation
    const existing = this.data.requests.find(
      (r) => r.donationId === donationId && r.ngoId === ngoId && r.status === 'PENDING'
    );
    if (existing) {
      return { success: false, error: 'Your organization already has a pending request for this donation.' };
    }

    // Find NGO coords
    const ngoUser = this.data.users.find((u) => u.id === ngoId);
    const ngoEntity = this.data.ngos.find((n) => n.userId === ngoId || n.id === ngoId);
    const ngoLat = ngoEntity?.latitude || ngoUser?.latitude || 19.062;
    const ngoLng = ngoEntity?.longitude || ngoUser?.longitude || 72.854;
    const isPremium = ngoEntity?.isPremium || ngoUser?.subscriptionPlan === 'premium';

    const match = computeFullMatch(
      { lat: donation.latitude, lng: donation.longitude },
      { lat: ngoLat, lng: ngoLng },
      donation.mealCount,
      ngoEntity?.capacity || 100,
      donation.pickupDeadline,
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
      mealScore: match.mealScore,
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

    // Notify donor
    this.data.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: donation.donorId,
      type: 'urgent',
      title: 'New Food Request Received!',
      message: `${ngoName} has requested your surplus food (${donation.foodName}, ${newRequest.requestedMeals} meals) with a ${match.matchScore}% match.`,
      read: false,
      createdAt: new Date().toISOString(),
    });

    this.save(this.data);
    return { success: true, request: newRequest };
  }

  /**
   * Food Donor accepts an incoming NGO request (§1, §4)
   * ATOMIC OPERATION:
   * 1. Marks request as ACCEPTED
   * 2. Marks all other PENDING requests on this donation as REJECTED
   * 3. Sets donation status to CONFIRMED
   * 4. Creates a confirmed Booking
   */
  public acceptFoodRequest(
    requestId: string,
    donorId: string
  ): { success: boolean; request?: FoodRequest; booking?: Booking; error?: string } {
    const requestIndex = this.data.requests.findIndex((r) => r.id === requestId);
    if (requestIndex === -1) {
      return { success: false, error: 'Request not found.' };
    }

    const request = this.data.requests[requestIndex];

    // Ownership check: Donor must own the donation
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

    // Atomic Guard: Check if donation was already locked by another accepted request
    if (donation.status === 'CONFIRMED' || donation.status === 'RESERVED' || donation.status === 'COMPLETED') {
      return { success: false, error: 'This donation has already been confirmed for another NGO.' };
    }

    const now = new Date().toISOString();

    // 1. Accept target request
    request.status = 'ACCEPTED';
    request.respondedAt = now;

    // 2. Auto-reject all other pending requests for this donation
    for (const otherReq of this.data.requests) {
      if (otherReq.donationId === donation.id && otherReq.id !== request.id && otherReq.status === 'PENDING') {
        otherReq.status = 'REJECTED';
        otherReq.respondedAt = now;

        // Notify competing NGOs
        this.data.notifications.unshift({
          id: `notif_${Date.now()}_rej_${otherReq.id}`,
          userId: otherReq.ngoId,
          type: 'info',
          title: 'Donation Assigned',
          message: `The donation "${donation.foodName}" was confirmed for another organization. Check other nearby surplus food!`,
          read: false,
          createdAt: now,
        });
      }
    }

    // 3. Update donation status
    donation.status = 'CONFIRMED';
    donation.pendingRequestsCount = 0;

    // 4. Create confirmed booking
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
      status: 'CONFIRMED',
      pickupTime: donation.pickupDeadline,
      createdAt: now,
    };

    this.data.bookings.unshift(newBooking);

    // 5. Notify winning NGO
    this.data.notifications.unshift({
      id: `notif_${Date.now()}_win`,
      userId: request.ngoId,
      type: 'success',
      title: 'Food Request Accepted! 🎉',
      message: `${donation.donorName} accepted your request for ${donation.foodName} (${request.requestedMeals} meals). Pickup confirmed!`,
      read: false,
      createdAt: now,
    });

    this.save(this.data);
    return { success: true, request, booking: newBooking };
  }

  /**
   * Food Donor rejects an incoming NGO request (§1, §2)
   */
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
      // Check if other pending requests remain
      const remainingPending = this.data.requests.filter(
        (r) => r.donationId === donation.id && r.status === 'PENDING'
      ).length;
      donation.pendingRequestsCount = remainingPending;
      if (remainingPending === 0 && donation.status === 'PENDING_REQUEST') {
        donation.status = 'AVAILABLE';
      }
    }

    // Notify NGO
    this.data.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: request.ngoId,
      type: 'warning',
      title: 'Food Request Declined',
      message: `${request.donorName} was unable to accept your request for ${request.foodName}.`,
      read: false,
      createdAt: new Date().toISOString(),
    });

    this.save(this.data);
    return { success: true, request };
  }

  /**
   * NGO cancels own pending request
   */
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

  /**
   * Confirm/Complete Pickup
   */
  public completePickup(
    bookingId: string,
    userId: string
  ): { success: boolean; booking?: Booking; error?: string } {
    const booking = this.data.bookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false, error: 'Booking not found.' };

    if (booking.donorId !== userId && booking.ngoId !== userId) {
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

  public addDonation(donationData: Omit<FoodDonation, 'id' | 'createdAt' | 'status' | 'pendingRequestsCount'>): FoodDonation {
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

    if (userData.role === 'ngo') {
      this.data.ngos.push({
        id: `ngo_entity_${newUser.id}`,
        userId: newUser.id,
        organizationName: newUser.name,
        capacity: 100,
        latitude: newUser.latitude,
        longitude: newUser.longitude,
        address: newUser.location,
        availability: true,
        isPremium: newUser.subscriptionPlan === 'premium',
        createdAt: new Date().toISOString(),
      });
    }

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
      ngo.isPremium = plan === 'premium';
    }
    this.save(this.data);
  }

  public resetSeed(): void {
    this.data = JSON.parse(JSON.stringify(initialSeedData));
    this.save(this.data);
  }
}

export const db = new Database();
