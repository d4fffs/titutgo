import { useState } from 'react';
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed, Store, Bike,
  Users, Settings, LogOut, Shield
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CampusNavbar } from '../components/shared/CampusNavbar';
import type { ReactNode } from 'react';

// Admin pages
import { AdminOverview } from '../pages/admin/AdminOverview';
import { AdminOrders } from '../pages/admin/AdminOrders';
import { AdminFoodMenu } from '../pages/admin/AdminFoodMenu';
import { AdminCanteens } from '../pages/admin/AdminCanteens';
import { AdminCouriers } from '../pages/admin/AdminCouriers';
import { AdminUsers } from '../pages/admin/AdminUsers';
import { AdminSettings } from '../pages/admin/AdminSettings';

type AdminPage = 'overview' | 'orders' | 'menu' | 'canteens' | 'couriers' | 'users' | 'settings';

const NAV_ITEMS: { key: AdminPage; label: string; icon: ReactNode }[] = [
  { key: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> },
  { key: 'orders', label: 'Pesanan', icon: <ShoppingBag size={16} /> },
  { key: 'menu', label: 'Menu Makanan', icon: <UtensilsCrossed size={16} /> },
  { key: 'canteens', label: 'Kantin', icon: <Store size={16} /> },
  { key: 'couriers', label: 'Kurir', icon: <Bike size={16} /> },
  { key: 'users', label: 'Pengguna', icon: <Users size={16} /> },
  { key: 'settings', label: 'Pengaturan', icon: <Settings size={16} /> },
];

export function AdminLayout() {
  const { state, setRole } = useApp();
  const [activePage, setActivePage] = useState<AdminPage>('overview');
  const pendingCount = state.orders.filter((o) => o.status === 'pending_courier').length;

  const renderPage = () => {
    switch (activePage) {
      case 'overview': return <AdminOverview onNavigate={setActivePage} />;
      case 'orders': return <AdminOrders />;
      case 'menu': return <AdminFoodMenu />;
      case 'canteens': return <AdminCanteens />;
      case 'couriers': return <AdminCouriers />;
      case 'users': return <AdminUsers />;
      case 'settings': return <AdminSettings />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', color: '#0F172A', display: 'flex', flexDirection: 'column' }}>
      {/* Universal Top Campus Navbar */}
      <CampusNavbar activeTab="admin" />

      {/* Main Body with Sidebar */}
      <div className="dashboard-wrapper" style={{ display: 'flex', flex: 1 }}>
        {/* Left Sidebar */}
        <aside
          className="dashboard-sidebar-responsive"
          style={{
            width: 220,
            background: '#FFFFFF',
            boxShadow: '1px 0 3px rgba(15, 30, 61, 0.04)',
            padding: '20px 14px',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
          }}
        >
          {/* Logo with Mascot */}
          <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 4px 16px' }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: '#0F1E3D',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(15, 30, 61, 0.15)',
            }}>
              <Shield size={20} />
            </div>
            <div>
              <span style={{ fontSize: 16, fontWeight: 900, color: '#0F1E3D', display: 'block' }}>
                Admin Console
              </span>
              <span style={{ fontSize: 11, color: '#64748B', fontWeight: 700 }}>PENS Sukolilo</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="dashboard-sidebar-nav-responsive" style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
            {NAV_ITEMS.map(({ key, label, icon }) => {
              const isActive = activePage === key;
              return (
                <button
                  key={key}
                  onClick={() => setActivePage(key)}
                  className={isActive ? 'btn btn-primary' : 'btn-pill'}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 12px',
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 900,
                    cursor: 'pointer',
                    textAlign: 'left',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ color: isActive ? '#FFFFFF' : '#64748B' }}>{icon}</span>
                  <span style={{ flex: 1 }}>{label}</span>
                  {key === 'orders' && pendingCount > 0 && (
                    <span className="badge badge-accent" style={{ fontSize: 10.5, padding: '1px 6px' }}>
                      {pendingCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Switch */}
          <div className="hide-on-mobile" style={{ paddingTop: 14 }}>
            <button
              onClick={() => setRole(null)}
              className="btn-pill"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '10px 12px',
                borderRadius: 12,
                fontSize: 12.5,
                fontWeight: 800,
                color: '#64748B',
                justifyContent: 'center',
              }}
            >
              <LogOut size={15} />
              <span>Ganti Role / Beranda</span>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="responsive-main-padding" style={{ flex: 1, padding: '24px 28px', background: '#F8FAFC', overflowY: 'auto' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%' }}>
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}
