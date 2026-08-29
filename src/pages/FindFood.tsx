import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FoodDonation, MatchScoreResult } from '../types';
import { FoodCard } from '../components/FoodCard';
import { MapView } from '../components/MapView';
import { MatchScore } from '../components/MatchScore';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { Search, MapPin, List, RefreshCw, Filter, Sparkles, Clock, Building, ArrowRight, X, CheckCircle2 } from 'lucide-react';

interface FindFoodProps {
  initialViewMode?: 'map' | 'list';
  initialSelectedDonation?: FoodDonation | null;
  onNavigateRequests: () => void;
  onShowToast: (type: 'success' | 'error' | 'warning' | 'info', msg: string) => void;
}

export const FindFood: React.FC<FindFoodProps> = ({
  initialViewMode = 'list',
  initialSelectedDonation = null,
  onNavigateRequests,
  onShowToast,
}) => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'map' | 'list'>(initialViewMode);
  const [foodListings, setFoodListings] = useState<(FoodDonation & { match?: MatchScoreResult })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Sorting (§3)
  const [searchTerm, setSearchTerm] = useState('');
  const [radiusKm, setRadiusKm] = useState<number>(25);
  const [foodType, setFoodType] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [minMeals, setMinMeals] = useState<number>(0);
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'urgent'>('all');
  const [sortBy, setSortBy] = useState<'best_match' | 'nearest' | 'most_meals' | 'most_urgent' | 'latest'>('best_match');

  // Modals
  const [detailModalItem, setDetailModalItem] = useState<(FoodDonation & { match?: MatchScoreResult }) | null>(
    (initialSelectedDonation as any) || null
  );
  const [requestModalItem, setRequestModalItem] = useState<(FoodDonation & { match?: MatchScoreResult }) | null>(null);
  const [requestedMealsInput, setRequestedMealsInput] = useState<number>(80);
  const [requestNotes, setRequestNotes] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  useEffect(() => {
    fetchFood();
  }, [user, foodType, minMeals, radiusKm, sortBy]);

  const fetchFood = async () => {
    setIsLoading(true);
    try {
      let query = `/api/donations?ngoId=${user?.id || 'ngo_hope'}&sortBy=${sortBy}`;
      if (foodType !== 'all') query += `&foodType=${foodType}`;
      if (minMeals > 0) query += `&minMeals=${minMeals}`;
      if (radiusKm > 0) query += `&radiusKm=${radiusKm}`;
      if (searchTerm) query += `&search=${encodeURIComponent(searchTerm)}`;

      const res = await fetch(query);
      if (res.ok) {
        const data = await res.json();
        setFoodListings(data);
      }
    } catch (e) {
      console.warn('Fetch food error', e);
    } finally {
      setIsLoading(false);
    }
  };

  const openRequestModal = (item: FoodDonation & { match?: MatchScoreResult }) => {
    setRequestModalItem(item);
    setRequestedMealsInput(item.mealCount);
    setRequestNotes('');
  };

  const handleConfirmRequest = async () => {
    if (!requestModalItem) return;
    setIsSubmittingRequest(true);

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donationId: requestModalItem.id,
          ngoId: user?.id || 'ngo_hope',
          ngoName: user?.name || 'Hope Foundation',
          requestedMeals: requestedMealsInput,
          notes: requestNotes,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        onShowToast('success', `Request sent to ${requestModalItem.donorName}! Awaiting donor approval.`);
        setRequestModalItem(null);
        setDetailModalItem(null);
        onNavigateRequests();
      } else {
        onShowToast('error', data.error || 'Failed to submit request.');
      }
    } catch (e) {
      onShowToast('error', 'Network error while submitting request.');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  // Client-side urgency filter
  const filteredListings = foodListings.filter((item) => {
    if (urgencyFilter === 'urgent') {
      const deadlineHours = (new Date(item.pickupDeadline).getTime() - Date.now()) / (1000 * 60 * 60);
      return deadlineHours <= 3;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-text">Find Available Surplus Food</h1>
          <p className="text-xs font-medium text-brand-muted mt-1">
            Discover nearby surplus food ranked dynamically by distance, capacity fit, and urgency.
          </p>
        </div>

        {/* Map / List View Toggle (§3) */}
        <div className="bg-brand-cream border border-orange-200 rounded-2xl p-1 flex items-center shadow-warm-sm self-start sm:self-auto">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              viewMode === 'list'
                ? 'bg-brand-orange text-white shadow-sm'
                : 'text-brand-muted hover:text-brand-text'
            }`}
          >
            <List className="w-4 h-4" />
            <span>List View</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              viewMode === 'map'
                ? 'bg-brand-orange text-white shadow-sm'
                : 'text-brand-muted hover:text-brand-text'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Map View</span>
          </button>
        </div>
      </div>

      {/* Filter & Sort Bar (§3) */}
      <div className="bg-white rounded-3xl border border-amber-900/5 p-4 shadow-warm-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchFood()}
              placeholder="Search dishes, donors, or landmarks..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:border-brand-orange focus:outline-none"
            />
          </div>

          {/* Food Type */}
          <div>
            <select
              value={foodType}
              onChange={(e) => setFoodType(e.target.value as any)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-brand-text focus:outline-none"
            >
              <option value="all">All Dietary Types</option>
              <option value="veg">VEG ONLY</option>
              <option value="non-veg">NON-VEG ONLY</option>
            </select>
          </div>

          {/* Search Radius */}
          <div>
            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-brand-text focus:outline-none"
            >
              <option value={5}>Within 5 km</option>
              <option value={15}>Within 15 km</option>
              <option value={25}>Within 25 km</option>
              <option value={50}>Within 50 km</option>
            </select>
          </div>

          {/* Sort By (§3) */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-brand-light border border-orange-200 rounded-xl text-xs font-black text-brand-deep focus:outline-none"
            >
              <option value="best_match">Sort: Best Match (Default)</option>
              <option value="nearest">Sort: Nearest Distance</option>
              <option value="most_meals">Sort: Most Meals</option>
              <option value="most_urgent">Sort: Most Urgent Deadline</option>
              <option value="latest">Sort: Latest Published</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main View Mode Area */}
      {isLoading ? (
        <LoadingState message="Matching surplus food listings against your NGO location..." />
      ) : filteredListings.length === 0 ? (
        <EmptyState
          title="No Surplus Food Found"
          description="No available surplus food matched your filter criteria. Try expanding your search radius or changing dietary filters."
          actionLabel="Reset Filters"
          onAction={() => {
            setSearchTerm('');
            setFoodType('all');
            setRadiusKm(50);
            setMinMeals(0);
            setUrgencyFilter('all');
          }}
        />
      ) : viewMode === 'map' ? (
        /* Map View (§3) */
        <MapView
          donations={filteredListings}
          onSelectDonation={(d) => setDetailModalItem(d)}
          onRequestDonation={(d) => openRequestModal(d)}
        />
      ) : (
        /* List View (§3) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((item) => (
            <FoodCard
              key={item.id}
              donation={item}
              role="ngo"
              onRequest={(d) => openRequestModal(d as any)}
              onViewDetails={(d) => setDetailModalItem(d as any)}
            />
          ))}
        </div>
      )}

      {/* Food Details Modal (§3 /ngo/food/:id) */}
      {detailModalItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-warm-lg animate-status-pop max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    detailModalItem.foodType === 'veg' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {detailModalItem.foodType}
                </span>
                <span className="text-xs font-bold text-brand-muted">{detailModalItem.category}</span>
              </div>
              <button
                onClick={() => setDetailModalItem(null)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <img
              src={detailModalItem.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}
              alt={detailModalItem.foodName}
              className="w-full h-48 rounded-2xl object-cover border border-orange-100"
            />

            <div>
              <div className="flex items-baseline justify-between mb-1">
                <h3 className="text-xl font-black text-brand-text">{detailModalItem.foodName}</h3>
                <span className="text-lg font-black text-brand-orange">{detailModalItem.mealCount} Meals</span>
              </div>
              <p className="text-xs text-brand-muted leading-relaxed">{detailModalItem.description}</p>
            </div>

            {/* Donor & Pickup Info */}
            <div className="bg-brand-cream/80 p-4 rounded-2xl border border-orange-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-brand-muted">Donor Entity:</span>
                <span className="font-bold text-brand-text">
                  {detailModalItem.donorName} ({detailModalItem.donorType || 'Restaurant'})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-brand-muted">Distance:</span>
                <span className="font-bold text-brand-orange">
                  {detailModalItem.match ? `${detailModalItem.match.distanceKm} km away` : 'Nearby'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-brand-muted">Pickup Location:</span>
                <span className="font-bold text-brand-text">{detailModalItem.pickupLocation}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-brand-muted">Pickup Deadline:</span>
                <span className="font-bold text-red-600">
                  {new Date(detailModalItem.pickupDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Smart Match Breakdown (§3, §5) */}
            {detailModalItem.match && (
              <div className="bg-white p-4 rounded-2xl border-2 border-orange-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-brand-deep">Smart Match Analysis</span>
                  <MatchScore score={detailModalItem.match.matchScore} size="md" />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-brand-muted pt-1">
                  <div className="bg-orange-50 p-1.5 rounded-lg border border-orange-100">
                    Distance: {detailModalItem.match.distanceScore}/100
                  </div>
                  <div className="bg-orange-50 p-1.5 rounded-lg border border-orange-100">
                    Capacity: {detailModalItem.match.mealScore}/100
                  </div>
                  <div className="bg-orange-50 p-1.5 rounded-lg border border-orange-100">
                    Urgency: {detailModalItem.match.urgencyScore}/100
                  </div>
                </div>
                <p className="text-xs font-medium text-brand-text pt-1 leading-relaxed">
                  "{detailModalItem.match.explanation}"
                </p>
              </div>
            )}

            {/* Action CTA */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setDetailModalItem(null);
                  openRequestModal(detailModalItem);
                }}
                className="w-full py-3 bg-brand-orange hover:bg-brand-deep text-white font-black text-xs rounded-xl shadow-warm-sm transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Proceed to Request Food</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Confirmation Modal (§3) */}
      {requestModalItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-warm-lg animate-status-pop">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-black text-brand-text">Confirm Food Request</h3>
                <p className="text-xs text-brand-muted">
                  Sending request to <strong className="text-brand-text">{requestModalItem.donorName}</strong>
                </p>
              </div>
              <button
                onClick={() => setRequestModalItem(null)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-brand-cream/80 p-3.5 rounded-2xl border border-orange-100 space-y-1.5 text-xs">
              <div className="flex justify-between font-bold">
                <span>Food Item:</span>
                <span>{requestModalItem.foodName}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Available:</span>
                <span className="font-bold text-brand-deep">{requestModalItem.mealCount} Meals</span>
              </div>
              <div className="flex justify-between">
                <span>Pickup Address:</span>
                <span>{requestModalItem.pickupLocation}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text uppercase mb-1">
                Requested Meal Quantity
              </label>
              <input
                type="number"
                value={requestedMealsInput}
                onChange={(e) => setRequestedMealsInput(Number(e.target.value))}
                max={requestModalItem.mealCount}
                min={1}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text uppercase mb-1">
                Pickup Notes (Optional)
              </label>
              <textarea
                value={requestNotes}
                onChange={(e) => setRequestNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Volunteer vehicle arriving with insulated boxes..."
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRequestModalItem(null)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRequest}
                disabled={isSubmittingRequest}
                className="flex-1 py-3 bg-brand-orange hover:bg-brand-deep text-white font-black text-xs rounded-xl shadow-warm-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmittingRequest ? 'Submitting...' : 'Confirm Request'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
