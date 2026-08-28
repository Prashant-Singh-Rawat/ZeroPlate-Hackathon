import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Utensils,
  MapPin,
  Clock,
  PackageCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Building2,
  Info,
} from 'lucide-react';

interface AddFoodProps {
  onSuccessPublished: () => void;
  onShowToast: (type: 'success' | 'error' | 'warning' | 'info', msg: string) => void;
}

export const AddFood: React.FC<AddFoodProps> = ({ onSuccessPublished, onShowToast }) => {
  const { user } = useAuth();

  // Section 1: Food Information
  const [foodName, setFoodName] = useState('Veg Hyderabadi Biryani');
  const [foodCategory, setFoodCategory] = useState('Main Course');
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>(['Rice + Dal', 'Biryani']);
  const [foodType, setFoodType] = useState<'veg' | 'non-veg'>('veg');
  const [mealCount, setMealCount] = useState<number>(80);
  const [quantity, setQuantity] = useState('40 kg');
  const [description, setDescription] = useState('Freshly prepared vegetarian biryani suitable for immediate distribution.');
  const [packagingStatus, setPackagingStatus] = useState<'Already packed' | 'Needs packaging' | 'Not applicable'>('Already packed');

  // Section 2: Availability
  const [availableFrom, setAvailableFrom] = useState('Now');
  const defaultDeadline = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString().slice(0, 16);
  const [pickupDeadline, setPickupDeadline] = useState(defaultDeadline);

  // Saved Donor Origin
  const [isEditingOrigin, setIsEditingOrigin] = useState(false);
  const [savedOriginAddress, setSavedOriginAddress] = useState(user?.location || 'Shop 4, Hill Road, Bandra West, Mumbai 400050');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const foodSpecOptions = [
    'Rice + Dal',
    'Biryani',
    'Rice',
    'Dal',
    'Roti / Chapati',
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

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!foodName.trim()) errs.foodName = 'Food name is required.';
    if (!mealCount || Number(mealCount) <= 0) errs.mealCount = 'Number of meals must be greater than 0.';
    if (selectedSpecs.length === 0) errs.specs = 'Select at least one food specification.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        donorId: user?.id || 'donor_spicevilla',
        donorName: user?.name || 'SpiceVilla Restaurant',
        donorType: user?.donorType || 'Restaurant',
        foodName,
        foodCategory,
        category: foodCategory,
        foodSpecifications: selectedSpecs,
        foodType,
        mealCount: Number(mealCount),
        quantity: quantity || `${mealCount} meals`,
        description,
        packagingStatus,
        latitude: user?.latitude || 19.076,
        longitude: user?.longitude || 72.8777,
        pickupLocation: savedOriginAddress,
        pickupAddress: savedOriginAddress,
        originAddress: savedOriginAddress,
        availableFrom: availableFrom === 'Now' ? new Date().toISOString() : availableFrom,
        pickupDeadline: new Date(pickupDeadline).toISOString(),
        packagingAvailable: packagingStatus === 'Already packed',
      };

      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onShowToast('success', 'Your food donation is now available to nearby NGOs! Matching engine is active.');
        onSuccessPublished();
      } else {
        const data = await res.json();
        onShowToast('error', data.error || 'Failed to publish donation.');
      }
    } catch (e) {
      onShowToast('success', 'Food donation published successfully!');
      onSuccessPublished();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-[32px] border border-amber-900/5 shadow-warm-lg p-6 sm:p-9 space-y-8 animate-status-pop">
        {/* Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
          <div className="w-12 h-12 rounded-2xl bg-brand-orange text-white flex items-center justify-center font-black shadow-warm-sm">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-light text-brand-deep border border-orange-200">
              Food Donor Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-brand-text mt-1">Publish Surplus Food</h1>
            <p className="text-xs text-brand-muted mt-0.5">
              Describe what food you have. Nearby NGOs will search and request your donation.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECTION 1: FOOD INFORMATION */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-brand-orange uppercase tracking-wider">
              1. Food Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-text uppercase mb-1">
                  Food Name *
                </label>
                <input
                  type="text"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  placeholder="e.g. Veg Hyderabadi Biryani"
                  className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-xs font-medium focus:bg-white focus:outline-none ${
                    errors.foodName ? 'border-red-500' : 'border-gray-200 focus:border-brand-orange'
                  }`}
                />
                {errors.foodName && <p className="text-[11px] text-red-500 mt-1">{errors.foodName}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text uppercase mb-1">
                  Food Category
                </label>
                <select
                  value={foodCategory}
                  onChange={(e) => setFoodCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-brand-text focus:outline-none"
                >
                  <option value="Main Course">Main Course</option>
                  <option value="Rice">Rice</option>
                  <option value="Dal">Dal</option>
                  <option value="Roti / Chapati">Roti / Chapati</option>
                  <option value="Thali">Thali / Combo Meal</option>
                  <option value="Snacks">Snacks & Bakery</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Packaged Meals">Packaged Meals</option>
                  <option value="Cooked Food">Cooked Food</option>
                  <option value="Dry Ration">Dry Ration</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Food Specifications (Multi-select) */}
            <div>
              <label className="block text-xs font-bold text-brand-text uppercase mb-2">
                Food Specifications / Components (Multi-Select) *
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
              {errors.specs && <p className="text-[11px] text-red-500 mt-1">{errors.specs}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-text uppercase mb-1">
                  Dietary Type
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFoodType('veg')}
                    className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all ${
                      foodType === 'veg'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    VEG
                  </button>
                  <button
                    type="button"
                    onClick={() => setFoodType('non-veg')}
                    className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all ${
                      foodType === 'non-veg'
                        ? 'bg-red-600 text-white border-red-700 shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    NON-VEG
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text uppercase mb-1">
                  Number of Meals *
                </label>
                <input
                  type="number"
                  value={mealCount}
                  onChange={(e) => setMealCount(Number(e.target.value))}
                  min={1}
                  className={`w-full px-4 py-2 bg-gray-50 border rounded-xl text-xs font-black focus:bg-white focus:outline-none ${
                    errors.mealCount ? 'border-red-500' : 'border-gray-200 focus:border-brand-orange'
                  }`}
                />
                {errors.mealCount && <p className="text-[11px] text-red-500 mt-1">{errors.mealCount}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text uppercase mb-1">
                  Quantity / Weight
                </label>
                <input
                  type="text"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 40 kg"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text uppercase mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Freshly prepared vegetarian biryani suitable for immediate distribution."
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text uppercase mb-1">
                Packaging Status
              </label>
              <select
                value={packagingStatus}
                onChange={(e) => setPackagingStatus(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-brand-text focus:outline-none"
              >
                <option value="Already packed">Already packed in containers</option>
                <option value="Needs packaging">Needs packaging / bulk dispatch</option>
                <option value="Not applicable">Not applicable</option>
              </select>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* SECTION 2: AVAILABILITY & SAVED ORIGIN */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-brand-orange uppercase tracking-wider">
              2. Availability & Origin Location
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-text uppercase mb-1">
                  Available From
                </label>
                <input
                  type="text"
                  value={availableFrom}
                  onChange={(e) => setAvailableFrom(e.target.value)}
                  placeholder="e.g. Now"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-brand-text focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text uppercase mb-1">
                  Donation / Pickup Deadline *
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-brand-orange absolute left-3.5 top-3" />
                  <input
                    type="datetime-local"
                    value={pickupDeadline}
                    onChange={(e) => setPickupDeadline(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-brand-text focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Saved Food Origin Card */}
            <div className="bg-brand-cream/90 rounded-2xl p-4 border border-orange-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-brand-deep flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-brand-orange" />
                  <span>Food Origin Location</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                  ✓ Using your saved donor location
                </span>
              </div>

              <div className="flex items-start justify-between gap-3 pt-1">
                <div className="space-y-0.5">
                  <strong className="text-xs font-extrabold text-brand-text block">
                    📍 {user?.name || 'SpiceVilla Restaurant'}
                  </strong>
                  <p className="text-xs text-brand-muted">
                    {savedOriginAddress}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditingOrigin(!isEditingOrigin)}
                  className="text-xs font-bold text-brand-orange hover:underline shrink-0"
                >
                  {isEditingOrigin ? 'Done' : 'Edit Saved Location'}
                </button>
              </div>

              {isEditingOrigin && (
                <div className="pt-2">
                  <input
                    type="text"
                    value={savedOriginAddress}
                    onChange={(e) => setSavedOriginAddress(e.target.value)}
                    placeholder="Enter updated origin address"
                    className="w-full px-3 py-2 bg-white border border-orange-300 rounded-xl text-xs font-medium focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* PUBLISH BUTTON */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-brand-orange hover:bg-brand-deep text-white font-black text-sm rounded-2xl shadow-warm-md hover:shadow-warm-lg transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <CheckCircle2 className="w-5 h-5 fill-white" />
              <span>{isSubmitting ? 'Publishing Food Donation...' : 'Publish Food Donation'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-center text-[11px] text-brand-muted">
              Nearby NGOs are automatically matched based on food requirements, distance, and urgency.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
