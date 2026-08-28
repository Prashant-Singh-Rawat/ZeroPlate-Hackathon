import { UserSettings, UserRole, MatchingPreferences } from '../../types';

export const ALL_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export function getDefaultSettings(
  userId: string,
  role: UserRole,
  userLocation: string = 'Mumbai'
): UserSettings {
  const isNGO = role === 'ngo';

  return {
    userId,
    role,
    notifications: {
      newMatchingFood: true,
      requestUpdates: true,
      bookingConfirmed: true,
      pickupReminders: true,
      newMessages: true,
      expiringAlerts: true,
      frequency: 'instant',
    },
    matching: {
      maxRadiusKm: 25,
      minMeals: isNGO ? 10 : 20,
      preferredTypes: {
        vegetarian: true,
        nonVegetarian: true,
        cookedFood: true,
        packagedFood: isNGO,
      },
      showExpiringFirst: true,
      prioritizeUrgent: true,
    },
    pickup: {
      availableDays: isNGO
        ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        : ALL_DAYS,
      startTime: isNGO ? '08:00' : '10:00',
      endTime: isNGO ? '20:00' : '22:00',
      maxDistanceKm: 25,
      vehicleAvailable: isNGO,
      contactNumber: isNGO ? '+91 98201 54321' : '+91 98200 12345',
    },
    security: {
      twoFactorEnabled: false,
      lastPasswordChanged: 'Never (Demo Mode)',
    },
    general: {
      language: 'English',
      appearance: 'light',
      locationServices: true,
      location: userLocation || (isNGO ? 'Bandra East, Mumbai' : 'Bandra West, Mumbai'),
      distanceUnit: 'km',
      timeFormat: '12h',
    },
    updatedAt: new Date().toISOString(),
  };
}

const STORAGE_PREFIX = 'zeroplate_settings_';

export function getSettings(
  userId: string,
  role: UserRole,
  userLocation?: string
): UserSettings {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure merged with defaults in case of missing keys
      const defaults = getDefaultSettings(userId, role, userLocation);
      return {
        ...defaults,
        ...parsed,
        userId,
        role,
        notifications: { ...defaults.notifications, ...(parsed.notifications || {}) },
        matching: {
          ...defaults.matching,
          ...(parsed.matching || {}),
          preferredTypes: {
            ...defaults.matching.preferredTypes,
            ...(parsed.matching?.preferredTypes || {}),
          },
        },
        pickup: { ...defaults.pickup, ...(parsed.pickup || {}) },
        security: { ...defaults.security, ...(parsed.security || {}) },
        general: { ...defaults.general, ...(parsed.general || {}) },
      };
    }
  } catch (e) {
    console.warn('Failed to load user settings from storage', e);
  }

  return getDefaultSettings(userId, role, userLocation);
}

export function saveSettings(settings: UserSettings): void {
  try {
    const toSave = {
      ...settings,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(`${STORAGE_PREFIX}${settings.userId}`, JSON.stringify(toSave));
  } catch (e) {
    console.warn('Failed to save user settings to storage', e);
    throw new Error('Storage write failed');
  }
}

export function resetSettings(
  userId: string,
  role: UserRole,
  userLocation?: string
): UserSettings {
  const defaults = getDefaultSettings(userId, role, userLocation);
  saveSettings(defaults);
  return defaults;
}

export function getSavedMatchingPreferences(userId?: string): MatchingPreferences | null {
  if (!userId) return null;
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.matching) return parsed.matching;
    }
  } catch (e) {}
  return null;
}
