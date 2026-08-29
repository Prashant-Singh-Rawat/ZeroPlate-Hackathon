import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Toast, ToastMessage } from './components/Toast';

// Auth & Onboarding Pages
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { Onboarding } from './pages/Onboarding';

// Donor Pages
import { DonorDashboard } from './pages/DonorDashboard';
import { AddFood } from './pages/AddFood';
import { MyListings } from './pages/MyListings';
import { DonorRequests } from './pages/DonorRequests';
import { DeliveryPersonsPage } from './pages/DeliveryPersonsPage';
import { DeliveriesPage } from './pages/DeliveriesPage';

// NGO Pages
import { NGODashboard } from './pages/NGODashboard';
import { FindFood } from './pages/FindFood';
import { MyRequests } from './pages/MyRequests';
import { HireDeliveryPartnerPage } from './pages/HireDeliveryPartnerPage';

// Shared Pages
import { BookingsPage } from './pages/BookingsPage';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { ImpactDashboard } from './pages/ImpactDashboard';
import { SettingsPage } from './pages/SettingsPage';
import { MapPin } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { user, role, refreshGPSLocation } = useAuth();
  const { t } = useLanguage();

  const [authView, setAuthView] = useState<'login' | 'signup' | 'forgot'>('login');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [pendingCount, setPendingCount] = useState(0);

  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setToast({
      id: String(Date.now()),
      type,
      message,
    });
  };

  // Keep pending requests count fresh for donors
  useEffect(() => {
    if (activeTab === 'messages') {
      setActiveTab('dashboard');
    }
    if (user && role === 'donor') {
      fetch(`/api/requests?donorId=${user.id}&status=PENDING`)
        .then((res) => res.json())
        .then((data) => setPendingCount(data.length || 0))
        .catch(() => {});
    }
  }, [user, role, activeTab]);

  // Auth pages if user is not logged in
  if (!user) {
    if (authView === 'signup') {
      return <Signup onNavigateLogin={() => setAuthView('login')} />;
    }
    if (authView === 'forgot') {
      return <ForgotPassword onNavigateLogin={() => setAuthView('login')} />;
    }
    return (
      <Login
        onNavigateSignup={() => setAuthView('signup')}
        onNavigateForgot={() => setAuthView('forgot')}
      />
    );
  }

  // Onboarding gate: if user is not yet onboarded, show role-specific setup
  if (user.onboarded === false) {
    return (
      <div className="min-h-screen bg-brand-bg dark:bg-[#0B1120] text-brand-text dark:text-slate-100 font-sans transition-colors duration-200">
        <Onboarding
          onComplete={() => setActiveTab('dashboard')}
          onShowToast={showToast}
        />
        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    );
  }

  const handleNavigate = (tab: string, extraData?: any) => {
    setActiveTab(tab);
  };

  // Render role-protected views
  const renderView = () => {
    const isDonor = role === 'donor';

    switch (activeTab) {
      case 'dashboard':
        return isDonor ? (
          <DonorDashboard onNavigate={handleNavigate} />
        ) : (
          <NGODashboard
            onNavigate={handleNavigate}
            onRequestDonation={(donation) => {
              handleNavigate('find-food', { selectedDonation: donation });
            }}
          />
        );

      // Donor Specific Views
      case 'add-food':
        if (!isDonor) {
          return (
            <div className="p-8 text-center bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-3xl border border-red-200 dark:border-red-800">
              Access Restricted: Only Food Donors may publish food donations.
            </div>
          );
        }
        return (
          <AddFood
            onSuccessPublished={() => setActiveTab('donations')}
            onShowToast={showToast}
          />
        );

      case 'donations':
      case 'donations-available':
      case 'donations-reserved':
      case 'donations-completed':
        if (!isDonor) {
          return (
            <div className="p-8 text-center bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-3xl border border-red-200 dark:border-red-800">
              Access Restricted: Food Donations listings are available only for Food Donors.
            </div>
          );
        }
        return (
          <MyListings
            initialTab={activeTab}
            onNavigateAddFood={() => setActiveTab('add-food')}
            onNavigateRequests={() => setActiveTab('requests')}
            onShowToast={showToast}
          />
        );

      case 'requests':
        if (!isDonor) {
          return (
            <div className="p-8 text-center bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-3xl border border-red-200 dark:border-red-800">
              Access Restricted: NGO Requests inbox is only accessible to Food Donors.
            </div>
          );
        }
        return (
          <DonorRequests
            onNavigateBookings={() => setActiveTab('deliveries')}
            onShowToast={showToast}
          />
        );

      case 'delivery-persons':
        if (!isDonor) {
          return (
            <div className="p-8 text-center bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-3xl border border-red-200 dark:border-red-800">
              Access Restricted: Delivery fleet management is available to Food Donors.
            </div>
          );
        }
        return <DeliveryPersonsPage onShowToast={showToast} />;

      // NGO Specific Views
      case 'find-food':
      case 'find-food-map':
      case 'find-food-list':
      case 'nearby-donors':
        if (isDonor) {
          return (
            <div className="p-8 text-center bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-3xl border border-red-200 dark:border-red-800">
              Access Restricted: Find Food discovery is exclusively for NGO Managers.
            </div>
          );
        }
        return (
          <FindFood
            key={activeTab === 'find-food-map' ? 'map' : 'list'}
            initialViewMode={activeTab === 'find-food-map' ? 'map' : 'list'}
            onViewModeChange={(mode) => setActiveTab(mode === 'map' ? 'find-food-map' : 'find-food-list')}
            onNavigateRequests={() => setActiveTab('my-requests')}
            onShowToast={showToast}
          />
        );

      case 'my-requests':
        if (isDonor) {
          return (
            <div className="p-8 text-center bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-3xl border border-red-200 dark:border-red-800">
              Access Restricted: My Requests is exclusively for NGO Managers.
            </div>
          );
        }
        return (
          <MyRequests
            onNavigateFindFood={() => setActiveTab('find-food')}
            onNavigateBookings={() => setActiveTab('active-deliveries')}
            onShowToast={showToast}
          />
        );

      case 'hire-delivery':
        if (isDonor) {
          return (
            <div className="p-8 text-center bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-3xl border border-red-200 dark:border-red-800">
              Access Restricted: Hire Delivery Partner is exclusively for NGO Managers.
            </div>
          );
        }
        return (
          <HireDeliveryPartnerPage
            onNavigateDeliveries={() => setActiveTab('active-deliveries')}
            onShowToast={showToast}
          />
        );

      // Shared Deliveries & Bookings
      case 'deliveries':
      case 'active-deliveries':
      case 'delivery-history':
        return <DeliveriesPage onShowToast={showToast} />;

      case 'bookings':
        return <BookingsPage onShowToast={showToast} />;

      case 'subscription':
        return (
          <SubscriptionPage
            onUpgradeSuccess={(msg) => {
              showToast('success', msg);
            }}
          />
        );

      case 'impact':
        return <ImpactDashboard />;

      case 'profile':
        return (
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-8 border border-amber-900/5 dark:border-slate-800 shadow-warm-sm space-y-5 max-w-xl transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-black text-brand-text dark:text-slate-100">{t('orgProfile', 'Organization Profile')}</h2>
                <p className="text-xs text-brand-muted dark:text-slate-400">Manage account information & live location</p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const addr = await refreshGPSLocation();
                  if (addr) showToast('success', `Live GPS location synced: ${addr}`);
                  else showToast('info', 'GPS location updated from live hardware/network telemetry.');
                }}
                className="px-3.5 py-2 text-xs font-black bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 hover:dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 rounded-xl transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-sm shrink-0"
              >
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                <span>Sync Live GPS Location</span>
              </button>
            </div>
            <div className="space-y-2.5 text-xs text-brand-muted dark:text-slate-400">
              <p>
                {t('orgName', 'Organization Name')}: <strong className="text-brand-text dark:text-slate-200 font-bold">{user.name}</strong>
              </p>
              <p>
                {t('registeredEmail', 'Registered Email')}: <strong className="text-brand-text dark:text-slate-200 font-bold">{user.email}</strong>
              </p>
              <p>
                {t('assignedRole', 'Portal Role')}: <strong className="uppercase text-brand-orange dark:text-orange-400 font-extrabold">{role === 'donor' ? 'Food Donor / Volunteer' : 'NGO Manager'}</strong>
              </p>
              <p className="flex items-start gap-1">
                <span>{t('locationLabel', 'Location')}:</span>{' '}
                <strong className="text-brand-text dark:text-slate-200 font-bold flex-1">{user.location || 'Current GPS Location'}</strong>
              </p>
              <p>
                {t('statusLabel', 'Account Status')}:{' '}
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                  {t('verifiedActive', 'Verified Active')}
                </span>
              </p>
            </div>
          </div>
        );

      case 'settings':
        return <SettingsPage onShowToast={showToast} />;

      default:
        return <div className="p-8 text-brand-muted dark:text-slate-400">Page not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFCF7] dark:bg-[#0B1120] text-[#1F2937] dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        activeView={activeTab}
        onNavigateHome={() => setActiveTab('dashboard')}
      />

      <div className="flex-1 flex w-full min-h-0">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setIsMobileSidebarOpen(false);
          }}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          pendingRequestsCount={pendingCount}
        />

        <main className="flex-1 p-3.5 sm:p-5 md:p-6 lg:p-8 xl:p-10 min-w-0 overflow-y-auto overflow-x-hidden w-full">
          {renderView()}
        </main>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <MainLayout />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
