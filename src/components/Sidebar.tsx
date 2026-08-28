import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  UtensilsCrossed,
  PlusCircle,
  Clock,
  CheckCircle,
  Inbox,
  CalendarCheck,
  Search,
  MapPin,
  ClipboardList,
  Sparkles,
  BarChart3,
  MessageSquare,
  CreditCard,
  User,
  Settings,
  LogOut,
  X,
  Truck,
  Users,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  pendingRequestsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile = false,
  onCloseMobile,
  pendingRequestsCount = 0,
}) => {
  const { role, logout, user } = useAuth();
  const isDonor = role === 'donor';

  const navItemClass = (id: string) => `
    w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all
    ${
      activeTab === id
        ? 'bg-brand-orange text-white shadow-warm-sm font-extrabold'
        : 'text-brand-muted hover:text-brand-text hover:bg-brand-light'
    }
  `;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed md:static top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-amber-900/5 p-4 flex flex-col justify-between
          transition-transform duration-300 ease-in-out md:translate-x-0
          ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="space-y-6">
          {/* Mobile Header & Close */}
          <div className="flex items-center justify-between md:hidden pb-2 border-b border-gray-100">
            <span className="font-extrabold text-sm text-brand-text">Navigation</span>
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-brand-muted hover:text-brand-text"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role Header Banner (Fixed Role) */}
          <div className="px-3 py-2 bg-brand-light rounded-2xl border border-orange-200">
            <span className="text-[10px] font-black uppercase text-brand-deep tracking-wider block">
              {isDonor ? 'Food Donor Portal' : 'NGO Manager Portal'}
            </span>
            <strong className="text-xs font-bold text-brand-text truncate block mt-0.5">
              {user?.name || (isDonor ? 'SpiceVilla Restaurant' : 'Hope Foundation')}
            </strong>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {/* 1. Dashboard */}
            <button onClick={() => onSelectTab('dashboard')} className={navItemClass('dashboard')}>
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </div>
            </button>

            {/* DONOR NAVIGATION (§5, §8) */}
            {isDonor && (
              <>
                <div className="pt-3 pb-1 px-3 text-[10px] font-black uppercase text-brand-muted tracking-wider">
                  Food Donations
                </div>

                <button onClick={() => onSelectTab('add-food')} className={navItemClass('add-food')}>
                  <div className="flex items-center gap-2.5">
                    <PlusCircle className="w-4 h-4 text-brand-orange" />
                    <span>Publish Food</span>
                  </div>
                </button>

                <button onClick={() => onSelectTab('donations')} className={navItemClass('donations')}>
                  <div className="flex items-center gap-2.5">
                    <UtensilsCrossed className="w-4 h-4" />
                    <span>My Food Listings</span>
                  </div>
                </button>

                <button onClick={() => onSelectTab('requests')} className={navItemClass('requests')}>
                  <div className="flex items-center gap-2.5">
                    <Inbox className="w-4 h-4" />
                    <span>NGO Requests</span>
                  </div>
                  {pendingRequestsCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-extrabold bg-brand-orange text-white rounded-full">
                      {pendingRequestsCount} new
                    </span>
                  )}
                </button>

                <div className="pt-3 pb-1 px-3 text-[10px] font-black uppercase text-brand-muted tracking-wider">
                  Deliveries & Fleet
                </div>

                <button onClick={() => onSelectTab('deliveries')} className={navItemClass('deliveries')}>
                  <div className="flex items-center gap-2.5">
                    <Truck className="w-4 h-4 text-brand-orange" />
                    <span>Active Deliveries</span>
                  </div>
                </button>

                <button onClick={() => onSelectTab('delivery-persons')} className={navItemClass('delivery-persons')}>
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4" />
                    <span>Delivery Fleet</span>
                  </div>
                </button>

                <button onClick={() => onSelectTab('bookings')} className={navItemClass('bookings')}>
                  <div className="flex items-center gap-2.5">
                    <CalendarCheck className="w-4 h-4" />
                    <span>Confirmed Bookings</span>
                  </div>
                </button>
              </>
            )}

            {/* NGO NAVIGATION (§5, §8) */}
            {!isDonor && (
              <>
                <div className="pt-3 pb-1 px-3 text-[10px] font-black uppercase text-brand-muted tracking-wider">
                  Food Rescue
                </div>

                <button onClick={() => onSelectTab('find-food')} className={navItemClass('find-food')}>
                  <div className="flex items-center gap-2.5">
                    <Search className="w-4 h-4 text-brand-orange" />
                    <span>Find Food</span>
                  </div>
                </button>

                <button onClick={() => onSelectTab('my-requests')} className={navItemClass('my-requests')}>
                  <div className="flex items-center gap-2.5">
                    <ClipboardList className="w-4 h-4" />
                    <span>My Requests</span>
                  </div>
                </button>

                <div className="pt-3 pb-1 px-3 text-[10px] font-black uppercase text-brand-muted tracking-wider">
                  Live Dispatch
                </div>

                <button onClick={() => onSelectTab('deliveries')} className={navItemClass('deliveries')}>
                  <div className="flex items-center gap-2.5">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    <span>Track Deliveries</span>
                  </div>
                </button>

                <button onClick={() => onSelectTab('bookings')} className={navItemClass('bookings')}>
                  <div className="flex items-center gap-2.5">
                    <CalendarCheck className="w-4 h-4" />
                    <span>Confirmed Bookings</span>
                  </div>
                </button>
              </>
            )}

            {/* SHARED SECTION */}
            <div className="pt-3 pb-1 px-3 text-[10px] font-black uppercase text-brand-muted tracking-wider">
              General
            </div>

            <button onClick={() => onSelectTab('impact')} className={navItemClass('impact')}>
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4" />
                <span>Impact Dashboard</span>
              </div>
            </button>

            <button onClick={() => onSelectTab('messages')} className={navItemClass('messages')}>
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4" />
                <span>Messages</span>
              </div>
            </button>

            <button onClick={() => onSelectTab('subscription')} className={navItemClass('subscription')}>
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4" />
                <span>Subscription</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Footer Settings & Logout */}
        <div className="pt-4 border-t border-gray-100 space-y-1">
          <button onClick={() => onSelectTab('profile')} className={navItemClass('profile')}>
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4" />
              <span>Profile & Settings</span>
            </div>
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
