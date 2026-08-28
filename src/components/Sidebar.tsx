import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  Search,
  ListFilter,
  Inbox,
  CalendarDays,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Settings,
  LogOut,
  Building2,
  MapPin,
  UtensilsCrossed,
  User,
} from 'lucide-react';

interface SubNavItem {
  id: string;
  label: string;
  icon: any;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: number;
  subLinks?: SubNavItem[];
}

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string, extraData?: any) => void;
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

  const donorLinks: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'donations',
      label: 'Food Donations',
      icon: UtensilsCrossed,
      subLinks: [
        { id: 'add-food', label: 'Add Food', icon: PlusCircle },
        { id: 'donations-available', label: 'Available', icon: ListFilter },
        { id: 'donations-reserved', label: 'Reserved / Pending', icon: ListFilter },
        { id: 'donations-completed', label: 'Completed', icon: ListFilter },
      ],
    },
    {
      id: 'requests',
      label: 'NGO Requests',
      icon: Inbox,
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined,
    },
    { id: 'bookings', label: 'Bookings', icon: CalendarDays },
    { id: 'impact', label: 'Impact Dashboard', icon: TrendingUp },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
  ];

  const ngoLinks: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'find-food',
      label: 'Find Food',
      icon: Search,
      subLinks: [
        { id: 'find-food-map', label: 'Map View', icon: MapPin },
        { id: 'find-food-list', label: 'List View', icon: ListFilter },
      ],
    },
    { id: 'my-requests', label: 'My Requests', icon: Inbox },
    { id: 'bookings', label: 'Bookings', icon: CalendarDays },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'impact', label: 'Impact Dashboard', icon: TrendingUp },
  ];

  const mainLinks = isDonor ? donorLinks : ngoLinks;

  const secondaryLinks = [
    { id: 'subscription', label: 'Subscription', icon: Sparkles },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-amber-900/5 flex flex-col justify-between transition-transform duration-300 transform ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-5 overflow-y-auto">
          {/* Portal Identifier Badge */}
          <div className="px-3.5 py-2.5 bg-brand-light rounded-2xl border border-orange-200/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-orange" />
              <span className="text-xs font-black text-brand-deep uppercase tracking-wider">
                {isDonor ? 'Food Donor Portal' : 'NGO Rescue Portal'}
              </span>
            </div>
          </div>

          {/* Main Role-Specific Navigation Tree */}
          <nav className="space-y-1">
            {mainLinks.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeTab === item.id ||
                (item.subLinks && item.subLinks.some((sub) => activeTab === sub.id));

              return (
                <div key={item.id} className="space-y-1">
                  <button
                    onClick={() => {
                      onSelectTab(item.id);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-extrabold text-sm transition-all ${
                      isActive
                        ? 'bg-brand-orange text-white shadow-warm-sm'
                        : 'text-brand-muted hover:bg-brand-light hover:text-brand-orange'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-black bg-white text-brand-deep shadow-sm">
                        {item.badge}
                      </span>
                    )}
                  </button>

                  {/* Sub-links if active */}
                  {item.subLinks && isActive && (
                    <div className="pl-6 space-y-1 pt-1 border-l-2 border-orange-200 ml-4">
                      {item.subLinks.map((sub) => {
                        const SubIcon = sub.icon;
                        const isSubActive = activeTab === sub.id;

                        return (
                          <button
                            key={sub.id}
                            onClick={() => {
                              onSelectTab(sub.id);
                              if (onCloseMobile) onCloseMobile();
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              isSubActive
                                ? 'text-brand-orange bg-orange-50 font-black'
                                : 'text-brand-muted hover:text-brand-text'
                            }`}
                          >
                            <SubIcon className="w-3.5 h-3.5" />
                            <span>{sub.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <hr className="border-gray-100" />

          {/* Secondary Links */}
          <nav className="space-y-1">
            {secondaryLinks.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl font-bold text-xs transition-all ${
                    isActive
                      ? 'bg-brand-orange text-white shadow-warm-sm'
                      : 'text-brand-muted hover:bg-brand-light hover:text-brand-orange'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User profile summary & logout */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          <div className="px-2 py-1 flex items-center gap-2 text-xs">
            <div className="w-7 h-7 rounded-full bg-brand-light text-brand-deep font-bold flex items-center justify-center border border-orange-200">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-brand-text truncate">{user?.name}</p>
              <p className="text-[10px] text-brand-muted capitalize">{isDonor ? user?.donorType || 'Donor' : 'NGO Manager'}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-xs text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
