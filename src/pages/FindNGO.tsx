import React, { useState, useEffect } from 'react';
import { FoodDonation, NGO, MatchScoreResult } from '../types';
import { NGOCard } from '../components/NGOCard';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { Sparkles, Utensils, CheckCircle2, ArrowRight } from 'lucide-react';

interface FindNGOProps {
  selectedDonation?: FoodDonation | null;
  onReservedSuccess: (booking: any, donation: FoodDonation) => void;
  onNavigateAddFood: () => void;
}

export const FindNGO: React.FC<FindNGOProps> = ({
  selectedDonation,
  onReservedSuccess,
  onNavigateAddFood,
}) => {
  const [donation, setDonation] = useState<FoodDonation | null>(selectedDonation || null);
  const [bestMatch, setBestMatch] = useState<(NGO & { match?: MatchScoreResult }) | null>(null);
  const [otherMatches, setOtherMatches] = useState<(NGO & { match?: MatchScoreResult })[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReserving, setIsReserving] = useState(false);

  useEffect(() => {
    if (!donation) {
      // Fetch latest available donation as default demo target
      fetchLatestDonation();
    } else {
      fetchNGOMatches(donation.id);
    }
  }, [donation?.id]);

  const fetchLatestDonation = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/donations?status=AVAILABLE');
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setDonation(data[0]);
          fetchNGOMatches(data[0].id);
          return;
        }
      }
    } catch (e) {
      console.warn('Fetch latest donation error', e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNGOMatches = async (donationId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/ngos?donationId=${donationId}`);
      if (res.ok) {
        const data = await res.json();
        setBestMatch(data.bestMatch);
        setOtherMatches(data.otherMatches || []);
      }
    } catch (e) {
      console.warn('Fetch NGO matches error', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReserveForNGO = async (targetNGO: NGO) => {
    if (!donation) return;
    setIsReserving(true);
    try {
      const res = await fetch(`/api/donations/${donation.id}/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ngoId: targetNGO.id,
          ngoName: targetNGO.organizationName,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        onReservedSuccess(result.booking, result.donation);
      } else {
        alert(result.error || 'Reservation failed.');
      }
    } catch (e: any) {
      alert('Error connecting to server.');
    } finally {
      setIsReserving(false);
    }
  };

  if (!donation && !isLoading) {
    return (
      <EmptyState
        title="No Surplus Food Selected"
        description="Add a surplus food listing first to get instant, explainable NGO matches."
        actionLabel="Add Surplus Food"
        onAction={onNavigateAddFood}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner: Selected Food Summary */}
      {donation && (
        <div className="bg-white rounded-3xl border border-amber-900/5 p-6 shadow-warm-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={donation.imageUrl || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80'}
              alt={donation.foodName}
              className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-orange-200"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-brand-light text-brand-deep border border-orange-200 uppercase">
                  {donation.foodType}
                </span>
                <h2 className="text-xl font-extrabold text-brand-text">{donation.foodName}</h2>
              </div>
              <p className="text-xs text-brand-muted mt-1">
                <strong className="text-brand-orange">{donation.mealCount} Meals</strong> • Pickup: {donation.pickupLocation}
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateAddFood}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl border shrink-0"
          >
            Change Food Item
          </button>
        </div>
      )}

      {/* Header Title */}
      <div>
        <h1 className="text-2xl font-black text-brand-text flex items-center gap-2">
          <span>Smart Matching Engine Recommendations</span>
          <Sparkles className="w-5 h-5 text-brand-orange" />
        </h1>
        <p className="text-xs font-medium text-brand-muted mt-1">
          Ranked using 40% Distance + 40% Capacity Fit + 20% Pickup Urgency + Priority Plan Bonus.
        </p>
      </div>

      {isLoading ? (
        <LoadingState message="Running deterministic matching algorithm against active NGO partners..." />
      ) : (
        <div className="space-y-6">
          {/* Best Match Highlighted (§8) */}
          {bestMatch ? (
            <div>
              <h2 className="text-sm font-black uppercase text-brand-orange tracking-wider mb-3">
                #1 Recommended Match
              </h2>
              <NGOCard
                ngo={bestMatch}
                isBestMatch={true}
                onReserve={(ngo) => handleReserveForNGO(ngo)}
              />
            </div>
          ) : (
            <EmptyState
              title="No Compatible NGO Found"
              description="No NGO partner in your current radius has capacity. Try increasing search radius or breaking into smaller portions."
            />
          )}

          {/* Other Compatible NGOs */}
          {otherMatches.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-black uppercase text-brand-muted tracking-wider">
                Other Compatible NGO Partners ({otherMatches.length})
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {otherMatches.map((ngo) => (
                  <NGOCard
                    key={ngo.id}
                    ngo={ngo}
                    isBestMatch={false}
                    onReserve={(targetNgo) => handleReserveForNGO(targetNgo)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
