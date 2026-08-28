import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import { MessagesPage } from './pages/MessagesPage';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { ImpactDashboard } from './pages/ImpactDashboard';

const MainLayout: React.FC = () => {
  const { user, role } = useAuth();

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
      <div className="min-h-screen bg-brand-bg font-sans">
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
            <div className="p-8 text-center bg-red-50 text-red-700 rounded-3xl border border-red-200 font-bold text-xs">
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
            <div className="p-8 text-center bg-red-50 text-red-700 rounded-3xl border border-red-200 font-bold text-xs">
              Access Restricted: Food Donations listings are available only for Food Donors.
            </div>
          );
        }
        return (
          <MyListings
            initialTab={activeTab}
            onNavigateAddFood={() => setActiveTab('add-food')}
            onNavigateRequests={() => setActiveTab('requests')}
          />
        );

      case 'requests':
        if (!isDonor) {
          return (
            <div className="p-8 text-center bg-red-50 text-red-700 rounded-3xl border border-red-200 font-bold text-xs">
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
            <div className="p-8 text-center bg-red-50 text-red-700 rounded-3xl border border-red-200 font-bold text-xs">
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
            <div className="p-8 text-center bg-red-50 text-red-700 rounded-3xl border border-red-200 font-bold text-xs">
              Access Restricted: Find Food discovery is exclusively for NGO Managers.
            </div>
          );
        }
        return (
          <FindFood
            initialViewMode={activeTab === 'find-food-map' ? 'map' : 'list'}
            onNavigateRequests={() => setActiveTab('my-requests')}
            onShowToast={showToast}
          />
        );

      case 'my-requests':
        if (isDonor) {
          return (
            <div className="p-8 text-center bg-red-50 text-red-700 rounded-3xl border border-red-200 font-bold text-xs">
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
            <div className="p-8 text-center bg-red-50 text-red-700 rounded-3xl border border-red-200 font-bold text-xs">
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

      case 'messages':
        return <MessagesPage />;

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
      case 'settings':
        return (
          <div className="bg-white rounded-3xl p-8 border border-amber-900/5 shadow-warm-sm space-y-4 max-w-xl">
            <h2 className="text-xl font-black text-brand-text">Organization Profile & Settings</h2>
            <div className="space-y-2.5 text-xs text-brand-muted">
              <p>
                Organization / Business Name: <strong className="text-brand-text font-bold">{user.name}</strong>
              </p>
              <p>
                Registered Email: <strong className="text-brand-text font-bold">{user.email}</strong>
              </p>
              <p>
                Phone: <strong className="text-brand-text font-bold">{user.phone || '+91 98200 12345'}</strong>
              </p>
              <p>
                Fixed Account Role: <strong className="uppercase text-brand-orange font-extrabold">{role === 'donor' ? 'Food Donor / Volunteer' : 'NGO Manager'}</strong>
              </p>
              <p>
                Location: <strong className="text-brand-text font-bold">{user.location || 'Mumbai, Maharashtra'}</strong>
              </p>
              <p>
                Status:{' '}
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  Verified Active
                </span>
              </p>
            </div>
          </div>
        );

      default:
        return <div className="p-8 text-brand-muted">Page not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans">
      <Navbar
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        activeView={activeTab}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
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

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {renderView()}
        </main>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
