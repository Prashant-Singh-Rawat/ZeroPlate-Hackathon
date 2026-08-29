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
import { publishDonationToCloud } from '../services/cloudSync';

interface AddFoodProps {
  onSuccessPublished: () => void;
  onShowToast: (type: 'success' | 'error' | 'warning' | 'info', msg: string) => void;
}

export const AddFood: React.FC<AddFoodProps> = ({ onSuccessPublished, onShowToast }) => {
  const { user } = useAuth();

  // Section 1: Food Information — Initial blank for typing
  const [foodName, setFoodName] = useState('');
  const [foodCategory, setFoodCategory] = useState('Main Course');
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [foodType, setFoodType] = useState<'veg' | 'non-veg'>('veg');
  const [mealCount, setMealCount] = useState<string>('');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [packagingStatus, setPackagingStatus] = useState<'Already packed' | 'Needs packaging' | 'Not applicable'>('Already packed');

  // Section 2: Availability
  const [availableFrom, setAvailableFrom] = useState('Now');
  const defaultDeadline = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString().slice(0, 16);
  const [pickupDeadline, setPickupDeadline] = useState(defaultDeadline);

  // Saved Donor Origin
  const [isEditingOrigin, setIsEditingOrigin] = useState(false);
  const [savedOriginAddress, setSavedOriginAddress] = useState(user?.location || 'Bandra West, Mumbai');

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
    if (!mealCount || Number(mealCount) <= 0) errs.mealCount = 'Please enter a valid number of meals (> 0).';
    if (selectedSpecs.length === 0) errs.specs = 'Select at least one food component tag.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const donorIdentifier = user?.email || user?.id || 'donor_spicevilla';
    const donorDisplayName = user?.name || (user?.email ? user.email.split('@')[0] : 'Food Donor');

    const payload = {
      id: `don_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      donorId: donorIdentifier,
      donorName: donorDisplayName,
      donorType: user?.donorType || 'Restaurant',
      foodName: foodName.trim(),
      foodCategory,
      category: foodCategory,
      foodSpecifications: selectedSpecs.length > 0 ? selectedSpecs : ['Cooked Food'],
      foodType,
      mealCount: Number(mealCount),
      quantity: quantity.trim() || `${mealCount} meals`,
      description: description.trim() || 'Fresh surplus food ready for NGO rescue.',
      packagingStatus,
      latitude: user?.latitude || 19.076,
      longitude: user?.longitude || 72.8777,
      pickupLocation: savedOriginAddress,
      pickupAddress: savedOriginAddress,
      originAddress: savedOriginAddress,
      availableFrom: availableFrom === 'Now' ? new Date().toISOString() : availableFrom,
      pickupDeadline: new Date(pickupDeadline).toISOString(),
      status: 'AVAILABLE' as const,
      packagingAvailable: packagingStatus === 'Already packed',
      createdAt: new Date().toISOString(),
    };

    // 1. Immediately persist locally and push to multi-device cloud database
    publishDonationToCloud(payload as any);

    // 2. Sync to backend API in background
    fetch('/api/donations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});

    setTimeout(() => {
      setIsSubmitting(false);
      onShowToast('success', 'Your food donation has been published! Nearby NGOs across all devices will now receive alerts.');
      onSuccessPublished();
    }, 350);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-amber-900/5 dark:border-slate-800 shadow-warm-lg p-6 sm:p-9 space-y-8 animate-status-pop transition-colors">
        {/* Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-brand-orange text-white flex items-center justify-center font-black shadow-warm-sm shrink-0">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-light dark:bg-orange-950/40 text-brand-deep dark:text-orange-300 border border-orange-200 dark:border-orange-800">
              Food Donor Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-brand-text dark:text-slate-100 mt-1">Publish Surplus Food</h1>
            <p className="text-xs text-brand-muted dark:text-slate-400 mt-0.5">
              Enter your food details below. Nearby NGOs will search and request your donation.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECTION 1: FOOD INFORMATION */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-brand-orange dark:text-orange-400 uppercase tracking-wider">
              1. Food Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-text dark:text-slate-200 uppercase mb-1">
                  Food Name *
                </label>
                <input
                  type="text"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  placeholder="Type food name (e.g. Veg Pulao, Paneer Masala)"
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800/80 border rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none ${
                    errors.foodName ? 'border-red-500' : 'border-gray-200 dark:border-slate-700 focus:border-brand-orange dark:focus:border-orange-400'
                  }`}
                />
                {errors.foodName && <p className="text-[11px] text-red-500 mt-1">{errors.foodName}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text dark:text-slate-200 uppercase mb-1">
                  Food Category
                </label>
                <select
                  value={foodCategory}
                  onChange={(e) => setFoodCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
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
              <label className="block text-xs font-bold text-brand-text dark:text-slate-200 uppercase mb-2">
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
                          : 'bg-gray-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-gray-200 dark:border-slate-700 hover:border-orange-300'
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
                <label className="block text-xs font-bold text-brand-text dark:text-slate-200 uppercase mb-1">
                  Dietary Type
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFoodType('veg')}
                    className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all ${
                      foodType === 'veg'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                        : 'bg-gray-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-gray-200 dark:border-slate-700'
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
                        : 'bg-gray-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-gray-200 dark:border-slate-700'
                    }`}
                  >
                    NON-VEG
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text dark:text-slate-200 uppercase mb-1">
                  Number of Meals *
                </label>
                <input
                  type="number"
                  value={mealCount}
                  onChange={(e) => setMealCount(e.target.value)}
                  placeholder="e.g. 50"
                  min={1}
                  className={`w-full px-4 py-2 bg-gray-50 dark:bg-slate-800/80 border rounded-xl text-xs font-black text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none ${
                    errors.mealCount ? 'border-red-500' : 'border-gray-200 dark:border-slate-700 focus:border-brand-orange'
                  }`}
                />
                {errors.mealCount && <p className="text-[11px] text-red-500 mt-1">{errors.mealCount}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text dark:text-slate-200 uppercase mb-1">
                  Quantity / Weight
                </label>
                <input
                  type="text"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 25 kg / 4 boxes"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text dark:text-slate-200 uppercase mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Add preparation details, allergen info, or collection notes..."
                className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text dark:text-slate-200 uppercase mb-1">
                Packaging Status
              </label>
              <select
                value={packagingStatus}
                onChange={(e) => setPackagingStatus(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
              >
                <option value="Already packed">Already packed in containers</option>
                <option value="Needs packaging">Needs packaging / bulk dispatch</option>
                <option value="Not applicable">Not applicable</option>
              </select>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-slate-800" />

          {/* SECTION 2: AVAILABILITY & SAVED ORIGIN */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-brand-orange dark:text-orange-400 uppercase tracking-wider">
              2. Availability & Origin Location
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-text dark:text-slate-200 uppercase mb-1">
                  Available From
                </label>
                <input
                  type="text"
                  value={availableFrom}
                  onChange={(e) => setAvailableFrom(e.target.value)}
                  placeholder="e.g. Now, or 8:00 PM"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text dark:text-slate-200 uppercase mb-1">
                  Donation / Pickup Deadline *
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-brand-orange absolute left-3.5 top-3" />
                  <input
                    type="datetime-local"
                    value={pickupDeadline}
                    onChange={(e) => setPickupDeadline(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Saved Food Origin Card */}
            <div className="bg-brand-cream/90 dark:bg-slate-800/90 rounded-2xl p-4 border border-orange-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-brand-deep dark:text-orange-300 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-brand-orange" />
                  <span>Food Origin Location</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                  ✓ Using your saved donor location
                </span>
              </div>

              <div className="flex items-start justify-between gap-3 pt-1">
                <div className="space-y-0.5">
                  <strong className="text-xs font-extrabold text-brand-text dark:text-slate-100 block">
                    📍 {user?.name || 'Food Donor'}
                  </strong>
                  <p className="text-xs text-brand-muted dark:text-slate-400">
                    {savedOriginAddress}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditingOrigin(!isEditingOrigin)}
                  className="text-xs font-bold text-brand-orange dark:text-orange-400 hover:underline shrink-0"
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
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-orange-300 dark:border-slate-600 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none"
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
            <p className="text-center text-[11px] text-brand-muted dark:text-slate-400">
              Nearby NGOs are automatically matched based on food requirements, distance, and urgency.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
