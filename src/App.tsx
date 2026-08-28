import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeLanguageProvider } from './context/ThemeLanguageContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Toast, ToastMessage } from './components/Toast';

// Auth Pages
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';

// Donor Pages
import { DonorDashboard } from './pages/DonorDashboard';
import { AddFood } from './pages/AddFood';
import { MyListings } from './pages/MyListings';
import { DonorRequests } from './pages/DonorRequests';

// NGO Pages
import { NGODashboard } from './pages/NGODashboard';
import { FindFood } from './pages/FindFood';
import { MyRequests } from './pages/MyRequests';

// Shared Pages
import { BookingsPage } from './pages/BookingsPage';
import { MessagesPage } from './pages/MessagesPage';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { ImpactDashboard } from './pages/ImpactDashboard';
import { SettingsPage } from './pages/SettingsPage';

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

  // Keep pending requests count fresh
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
            onRequestDonation={() => handleNavigate('find-food')}
          />
        );

      // Donor Specific Views (§2)
      case 'add-food':
        if (!isDonor) {
          return (
            <div className="p-8 text-center bg-red-50 text-red-700 rounded-3xl border border-red-200">
              Access Restricted: Only Food Donors may create food donation listings.
            </div>
          );
        }
        return (
          <AddFood
            onSuccessPublished={() => {
              setActiveTab('donations');
            }}
            onShowToast={showToast}
          />
        );

      case 'donations':
      case 'donations-available':
      case 'donations-reserved':
      case 'donations-completed':
        if (!isDonor) {
          return (
            <div className="p-8 text-center bg-red-50 text-red-700 rounded-3xl border border-red-200">
              Access Restricted: My Food Donations is available only for Food Donors.
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
            <div className="p-8 text-center bg-red-50 text-red-700 rounded-3xl border border-red-200">
              Access Restricted: NGO Requests inbox is only accessible to Food Donors.
            </div>
          );
        }
        return (
          <DonorRequests
            onNavigateBookings={() => setActiveTab('bookings')}
            onShowToast={showToast}
          />
        );

      // NGO Specific Views (§3)
      case 'find-food':
      case 'find-food-map':
      case 'find-food-list':
        if (isDonor) {
          return (
            <div className="p-8 text-center bg-red-50 text-red-700 rounded-3xl border border-red-200">
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
            <div className="p-8 text-center bg-red-50 text-red-700 rounded-3xl border border-red-200">
              Access Restricted: My Requests is exclusively for NGO Managers.
            </div>
          );
        }
        return (
          <MyRequests
            onNavigateFindFood={() => setActiveTab('find-food')}
            onNavigateBookings={() => setActiveTab('bookings')}
            onShowToast={showToast}
          />
        );

      // Shared Views
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
        return (
          <div className="bg-white rounded-3xl p-8 border border-amber-900/5 shadow-warm-sm space-y-4 max-w-xl">
            <h2 className="text-xl font-black text-brand-text">Organization Profile</h2>
            <div className="space-y-2 text-xs text-brand-muted">
              <p>
                Organization Name: <strong className="text-brand-text font-bold">{user.name}</strong>
              </p>
              <p>
                Registered Email: <strong className="text-brand-text font-bold">{user.email}</strong>
              </p>
              <p>
                Assigned Role: <strong className="uppercase text-brand-orange font-extrabold">{role === 'donor' ? 'Food Donor / Volunteer' : 'NGO Manager'}</strong>
              </p>
              <p>
                Location: <strong className="text-brand-text font-bold">{user.location}</strong>
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

      case 'settings':
        return <SettingsPage onShowToast={showToast} onNavigate={handleNavigate} />;

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
    <ThemeLanguageProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </ThemeLanguageProvider>
  );
}
