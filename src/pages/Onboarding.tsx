import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  MapPin,
  Utensils,
  ShieldCheck,
  Navigation,
  Clock,
  Heart,
  CheckCircle2,
  ArrowRight,
  Info,
  Sparkles,
} from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
  onShowToast: (type: 'success' | 'error' | 'warning' | 'info', msg: string) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onShowToast }) => {
  const { user, role, onboardNGO, onboardDonor } = useAuth();
  const isNGO = role === 'ngo';

  // Common Fields
  const [orgName, setOrgName] = useState(user?.name || (isNGO ? 'Hope Foundation' : 'SpiceVilla Restaurant'));
  const [contactPerson, setContactPerson] = useState(isNGO ? 'Anjali Sharma' : 'Chef Vikram Malhotra');
  const [phone, setPhone] = useState('+91 98200 12345');
  const [address, setAddress] = useState(
    isNGO ? 'Bandra East Community Center, Mumbai 400051' : 'Shop 4, Hill Road, Bandra West, Mumbai 400050'
  );
  const [latitude, setLatitude] = useState<number>(isNGO ? 19.062 : 19.076);
  const [longitude, setLongitude] = useState<number>(isNGO ? 72.854 : 72.8777);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string>('');

  // NGO Specific Fields (§3)
  const [orgType, setOrgType] = useState<string>('NGO');
  const [capacity, setCapacity] = useState<number>(100);
  const [requiredMeals, setRequiredMeals] = useState<number>(80);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>(['Rice + Dal', 'Biryani']);
  const [foodType, setFoodType] = useState<'veg' | 'non-veg' | 'either'>('veg');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'emergency'>('high');
  const [maxRadius, setMaxRadius] = useState<number>(15);
  const [specificReq, setSpecificReq] = useState('Hot lunch meals for children and shelter residents.');

  // Donor Specific Fields (§4)
  const [donorType, setDonorType] = useState<string>('Restaurant');
  const [isHousehold, setIsHousehold] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const foodSpecOptions = [
    'Rice + Dal',
    'Biryani',
    'Rice',
    'Dal',
    'Roti/Chapati',
    'Sabzi',
    'Paneer',
    'Thali',
    'Packaged Meals',
    'Cooked Food',
    'Dry Ration',
    'Other',
  ];

  const handleToggleSpec = (spec: string) => {
    if (selectedSpecs.includes(spec)) {
      setSelectedSpecs(selectedSpecs.filter((s) => s !== spec));
    } else {
      setSelectedSpecs([...selectedSpecs, spec]);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      onShowToast('warning', 'Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationStatus('Requesting browser GPS permission...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        setIsLocating(false);
        setLocationStatus('GPS Coordinates captured accurately.');
        setAddress(`GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)}) - Bandra, Mumbai`);
        onShowToast('success', 'Location updated successfully via GPS.');
      },
      (err) => {
        setIsLocating(false);
        setLocationStatus('Permission denied or GPS unavailable. Using default landmark coordinates.');
        onShowToast('info', 'Default Mumbai landmark location used.');
      },
      { timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (isNGO) {
      const payload = {
        organizationName: orgName,
        organizationType: orgType,
        contactPerson,
        phone,
        address,
        latitude,
        longitude,
        requirements: {
          requiredMeals: Number(requiredMeals),
          foodSpecifications: selectedSpecs,
          foodType,
          urgency,
          requiredBy: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
          maximumRadius: Number(maxRadius),
          specificRequirement: specificReq,
        },
      };
      const res = await onboardNGO(payload);
      if (res.success) {
        onShowToast('success', 'NGO Profile & Food Requirements configured successfully!');
        onComplete();
      } else {
        onShowToast('error', res.error || 'Onboarding failed.');
      }
    } else {
      const payload = {
        donorType,
        organizationName: orgName,
        contactPerson,
        phone,
        address,
        latitude,
        longitude,
        isHousehold,
      };
      const res = await onboardDonor(payload);
      if (res.success) {
        onShowToast('success', 'Food Donor Profile configured successfully!');
        onComplete();
      } else {
        onShowToast('error', res.error || 'Onboarding failed.');
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-brand-bg py-8 px-4 sm:px-6 flex justify-center items-center">
      <div className="max-w-3xl w-full bg-white rounded-[32px] border border-amber-900/5 shadow-warm-lg p-6 sm:p-10 space-y-8 animate-status-pop">
        {/* Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
          <div className="w-12 h-12 rounded-2xl bg-brand-orange text-white flex items-center justify-center font-black shadow-warm-sm">
            {isNGO ? <Heart className="w-6 h-6 fill-white" /> : <Utensils className="w-6 h-6" />}
          </div>
          <div>
            <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-light text-brand-deep border border-orange-200">
              {isNGO ? 'NGO Manager Onboarding' : 'Food Donor Onboarding'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-brand-text mt-1">
              {isNGO ? 'Set Up Your NGO Profile & Food Needs' : 'Set Up Your Food Donor Profile'}
            </h1>
            <p className="text-xs text-brand-muted mt-0.5">
              {isNGO
                ? 'Configure your operating location and food requirements to receive instant, smart matches.'
                : 'Configure your surplus food dispatch details to connect with verified nearby NGOs.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Entity Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-brand-orange uppercase tracking-wider flex items-center gap-2">
              <span>1. Organization & Contact Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-text uppercase mb-1">
                  {isNGO ? 'Organization Name *' : 'Business / Entity Name *'}
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  required
                  placeholder={isNGO ? 'e.g. Hope Foundation' : 'e.g. SpiceVilla Restaurant'}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:border-brand-orange focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text uppercase mb-1">
                  {isNGO ? 'Organization Type' : 'Donor Classification'}
                </label>
                {isNGO ? (
                  <select
                    value={orgType}
                    onChange={(e) => setOrgType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-brand-text focus:outline-none"
                  >
                    <option value="NGO">NGO (Non-Governmental Org)</option>
                    <option value="Charity">Charity</option>
                    <option value="Community Kitchen">Community Kitchen</option>
                    <option value="Food Shelter">Food Shelter</option>
                    <option value="Orphanage">Orphanage</option>
                    <option value="Old Age Home">Old Age Home</option>
                    <option value="Relief Organization">Disaster Relief Organization</option>
                    <option value="Other">Other Community Organization</option>
                  </select>
                ) : (
                  <select
                    value={donorType}
                    onChange={(e) => setDonorType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-brand-text focus:outline-none"
                  >
                    <option value="Restaurant">Restaurant</option>
                    <option value="Hotel">Hotel / Resort</option>
                    <option value="Caterer">Event Caterer / Banquet</option>
                    <option value="Household">Household / Individual</option>
                    <option value="Volunteer">Community Food Volunteer</option>
                    <option value="Other">Other Food Provider</option>
                  </select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-text uppercase mb-1">
                  Contact Person Name
                </label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Full name of representative"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:border-brand-orange focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text uppercase mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98XXX XXXXX"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:border-brand-orange focus:outline-none"
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 2: Location & Transparent Geolocation (§3, §4) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-brand-orange uppercase tracking-wider">
                2. Operating Location & GPS
              </h3>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Transparent Location
              </span>
            </div>

            {/* Geolocation Explanation Alert */}
            <div className="bg-brand-light/70 p-3.5 rounded-2xl border border-orange-200/80 flex items-start gap-3 text-xs text-brand-deep font-medium">
              <Info className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
              <div>
                <strong>Why we request location:</strong> Your GPS location helps ZeroPlate calculate accurate Haversine distances, route surplus meals before expiration, and power live pickup coordination.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-brand-text uppercase mb-1">
                    Street Address / Landmark
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-brand-orange absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Bandra East Community Center, Mumbai"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:border-brand-orange focus:outline-none"
                    />
                  </div>
                </div>

                {/* Geolocation Button */}
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                  className="w-full py-2.5 px-4 bg-white hover:bg-orange-50 border border-brand-orange text-brand-deep font-bold text-xs rounded-xl shadow-warm-sm transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Navigation className="w-4 h-4 text-brand-orange" />
                  <span>{isLocating ? 'Acquiring GPS...' : 'Use My Current Location (GPS)'}</span>
                </button>

                {locationStatus && (
                  <p className="text-[11px] text-brand-muted font-medium italic">{locationStatus}</p>
                )}
              </div>

              {/* Map Coordinates Preview */}
              <div className="bg-stone-900 text-white rounded-2xl p-4 flex flex-col justify-between border border-amber-950/40 relative overflow-hidden">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-orange-400">Target Coordinates</span>
                  <div className="text-sm font-mono font-bold">
                    Lat: {latitude.toFixed(4)}, Lng: {longitude.toFixed(4)}
                  </div>
                  <p className="text-[10px] text-stone-400">
                    Adjustable pinpoint centered in Mumbai metro rescue zone.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 text-[10px] text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Ready for Haversine Distance Calculation</span>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 3: NGO Food Requirements (§3) */}
          {isNGO ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-brand-orange uppercase tracking-wider">
                  3. NGO Food Requirements (Active Matching Profile)
                </h3>
                <span className="text-[11px] font-bold text-brand-deep bg-orange-100 px-2.5 py-0.5 rounded-full">
                  Matching Engine Inputs
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-text uppercase mb-1">
                    Required Meals Count *
                  </label>
                  <input
                    type="number"
                    value={requiredMeals}
                    onChange={(e) => setRequiredMeals(Number(e.target.value))}
                    min={1}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-text uppercase mb-1">
                    Dietary Preference
                  </label>
                  <select
                    value={foodType}
                    onChange={(e) => setFoodType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-brand-text focus:outline-none"
                  >
                    <option value="veg">Vegetarian Only</option>
                    <option value="non-veg">Non-Vegetarian Only</option>
                    <option value="either">Either (Both Veg & Non-Veg)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-text uppercase mb-1">
                    Maximum Radius (km)
                  </label>
                  <select
                    value={maxRadius}
                    onChange={(e) => setMaxRadius(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-brand-text focus:outline-none"
                  >
                    <option value={5}>Within 5 km (Fast Pickup)</option>
                    <option value={15}>Within 15 km (Standard)</option>
                    <option value={25}>Within 25 km (Extended)</option>
                  </select>
                </div>
              </div>

              {/* Multi-select Food Specifications */}
              <div>
                <label className="block text-xs font-bold text-brand-text uppercase mb-2">
                  Food Components / Menu Specifications (Multi-Select)
                </label>
                <div className="flex flex-wrap gap-2">
                  {foodSpecOptions.map((spec) => {
                    const isSelected = selectedSpecs.includes(spec);
                    return (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => handleToggleSpec(spec)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all ${
                          isSelected
                            ? 'bg-brand-orange text-white border-brand-orange shadow-warm-sm'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-orange-200'
                        }`}
                      >
                        {spec}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text uppercase mb-1">
                  Specific Beneficiary Need (Optional Notes)
                </label>
                <input
                  type="text"
                  value={specificReq}
                  onChange={(e) => setSpecificReq(e.target.value)}
                  placeholder="e.g. Cooked lunch for 80 children at shelter"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          ) : (
            /* Donor Household Privacy Notice (§4, §7) */
            <div className="bg-brand-cream p-4 rounded-2xl border border-orange-200/70 space-y-2 text-xs text-brand-deep">
              <div className="flex items-center gap-2 font-black">
                <ShieldCheck className="w-5 h-5 text-brand-orange" />
                <span>Donor Privacy Protection Guarantee</span>
              </div>
              <p className="leading-relaxed text-brand-muted">
                For household and individual donors, exact street addresses remain confidential during initial discovery. Matched NGOs see your approximate neighborhood until a booking is accepted and confirmed.
              </p>
            </div>
          )}

          {/* Submit CTA */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-brand-orange hover:bg-brand-deep text-white font-black text-sm rounded-2xl shadow-warm-md hover:shadow-warm-lg transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <CheckCircle2 className="w-5 h-5 fill-white" />
              <span>{isSubmitting ? 'Saving Profile & Requirements...' : 'Complete Setup & Enter Dashboard'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
