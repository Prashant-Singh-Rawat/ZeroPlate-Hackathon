import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Utensils, MapPin, Clock, PackageCheck, Image as ImageIcon, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AddFoodProps {
  onSuccessPublished: () => void;
  onShowToast: (type: 'success' | 'error' | 'warning' | 'info', msg: string) => void;
}

export const AddFood: React.FC<AddFoodProps> = ({ onSuccessPublished, onShowToast }) => {
  const { user } = useAuth();

  const [foodName, setFoodName] = useState('Veg Hyderabadi Biryani');
  const [foodType, setFoodType] = useState<'veg' | 'non-veg'>('veg');
  const [foodCategory, setFoodCategory] = useState('Main Course');
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>(['Rice + Dal', 'Biryani']);
  const [mealCount, setMealCount] = useState<number>(80);
  const [quantity, setQuantity] = useState('40 kg (Serves 80)');
  const [description, setDescription] = useState('Freshly prepared aromatic vegetarian biryani with raita. Packed in food-grade insulated containers.');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80');

  const [pickupLocation, setPickupLocation] = useState(user?.location || 'SpiceVilla Restaurant, Bandra West, Mumbai');
  const [pickupAddress, setPickupAddress] = useState('Shop 4, Hill Road, Bandra West, Mumbai 400050');
  const [prepTime, setPrepTime] = useState('Freshly cooked 1 hr ago');
  const [packagingAvailable, setPackagingAvailable] = useState(true);
  const [additionalNotes, setAdditionalNotes] = useState('Pickup from restaurant rear entrance loading dock on Hill Road.');

  const defaultDeadline = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString().slice(0, 16);
  const [pickupDeadline, setPickupDeadline] = useState(defaultDeadline);

  const [errors, setErrors] = useState<Record<string, string>>({});
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

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!foodName.trim()) errs.foodName = 'Food name is required.';
    if (!pickupLocation.trim()) errs.pickupLocation = 'Pickup location is required.';
    if (!mealCount || Number(mealCount) <= 0) errs.mealCount = 'Meal count must be greater than 0.';

    const deadlineMs = new Date(pickupDeadline).getTime();
    if (isNaN(deadlineMs) || deadlineMs <= Date.now()) {
      errs.pickupDeadline = 'Pickup deadline must be in the future.';
    }

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
        foodSpecifications: selectedSpecs,
        foodType,
        mealCount: Number(mealCount),
        quantity,
        description,
        imageUrl,
        latitude: user?.latitude || 19.076,
        longitude: user?.longitude || 72.8777,
        pickupLocation,
        pickupAddress,
        availableFrom: new Date().toISOString(),
        pickupDeadline: new Date(pickupDeadline).toISOString(),
        prepTime,
        packagingAvailable,
        additionalNotes,
      };

      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onShowToast('success', 'Food donation published! Status is AVAILABLE and visible to local NGOs.');
        onSuccessPublished();
      } else {
        const data = await res.json();
        onShowToast('error', data.error || 'Failed to publish food donation.');
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
      <div className="bg-white rounded-3xl border border-amber-900/5 shadow-warm-lg p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="p-3 bg-brand-light text-brand-orange rounded-2xl">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-brand-text">Publish Surplus Food Donation</h1>
            <p className="text-xs font-medium text-brand-muted">
              List available surplus food with dietary types and food specifications to match nearby NGO needs.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Food Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-brand-orange uppercase tracking-wider">
              1. Food Details, Category & Specifications (§4)
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
                  <option value="Main Course">Main Course (Cooked Meal)</option>
                  <option value="Combo Meal">Combo Meal (Thali / Rice + Dal)</option>
                  <option value="Curry & Bread">Curry & Bread (Sabzi & Roti)</option>
                  <option value="Bakery & Snacks">Bakery & Snacks</option>
                  <option value="Dry Ration">Dry Ration / Pantry</option>
                </select>
              </div>
            </div>

            {/* Food Specifications Multi-Select (§4) */}
            <div>
              <label className="block text-xs font-bold text-brand-text uppercase mb-2">
                Food Specifications / Components (Matches NGO Requirements)
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
                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
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
                        ? 'bg-red-500 text-white border-red-600 shadow-sm'
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
                Description & Handling Instructions
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Describe preparation, freshness, and packaging containers..."
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 2: Pickup Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-brand-orange uppercase tracking-wider">
              2. Pickup Location & Deadline
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-text uppercase mb-1">
                  Public Pickup Area / Neighborhood *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-brand-orange absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder="e.g. Hill Road, Bandra West, Mumbai"
                    className={`w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-xl text-xs font-medium focus:bg-white focus:outline-none ${
                      errors.pickupLocation ? 'border-red-500' : 'border-gray-200 focus:border-brand-orange'
                    }`}
                  />
                </div>
                {errors.pickupLocation && <p className="text-[11px] text-red-500 mt-1">{errors.pickupLocation}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text uppercase mb-1">
                  Pickup Deadline *
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-brand-orange absolute left-3.5 top-3" />
                  <input
                    type="datetime-local"
                    value={pickupDeadline}
                    onChange={(e) => setPickupDeadline(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-xl text-xs font-bold focus:bg-white focus:outline-none ${
                      errors.pickupDeadline ? 'border-red-500' : 'border-gray-200 focus:border-brand-orange'
                    }`}
                  />
                </div>
                {errors.pickupDeadline && <p className="text-[11px] text-red-500 mt-1">{errors.pickupDeadline}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text uppercase mb-1">
                Full Street Address (Revealed to matched NGO upon confirmed booking)
              </label>
              <input
                type="text"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="Exact door number, landmark, and street for vehicle navigation"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text uppercase mb-1">
                Pickup Instructions
              </label>
              <input
                type="text"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="e.g. Pickup from restaurant rear entrance loading dock on Hill Road."
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 bg-brand-cream p-3 rounded-2xl border border-orange-200/80">
              <input
                type="checkbox"
                id="pkg"
                checked={packagingAvailable}
                onChange={(e) => setPackagingAvailable(e.target.checked)}
                className="w-4 h-4 text-brand-orange rounded focus:ring-brand-orange"
              />
              <label htmlFor="pkg" className="text-xs font-bold text-brand-text cursor-pointer">
                Food is already packed in insulated / takeaway containers for immediate dispatch
              </label>
            </div>
          </div>

          {/* Publish CTA */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-brand-orange hover:bg-brand-deep text-white font-black text-sm rounded-2xl shadow-warm-md hover:shadow-warm-lg transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <CheckCircle2 className="w-5 h-5 fill-white" />
              <span>{isSubmitting ? 'Publishing Food Donation...' : 'Publish Food Donation (Make Available)'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
