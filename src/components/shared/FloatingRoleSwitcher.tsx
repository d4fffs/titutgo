import { useState } from 'react';
import { RefreshCw, Users, Shield, Bike, User, X, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Role } from '../../types';

export function FloatingRoleSwitcher() {
  const { state, setRole, resetDemo, cartCount } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // If on role select screen, we can keep switcher hidden
  if (!state.currentRole) return null;

  const currentRoleConfig: Record<Role, { label: string; icon: typeof Shield; color: string; bg: string }> = {
    admin: { label: 'Admin Console', icon: Shield, color: '#1E40AF', bg: '#EFF6FF' },
    kurir: { label: 'Mitra Kurir', icon: Bike, color: '#0369A1', bg: '#E0F2FE' },
    user: { label: 'Pelanggan (User)', icon: User, color: '#15803D', bg: '#DCFCE7' },
  };

  const current = currentRoleConfig[state.currentRole];
  const CurrentIcon = current.icon;

  const handleRoleChange = (newRole: Role | null) => {
    setRole(newRole);
    setIsOpen(false);
  };

  const handleReset = () => {
    resetDemo();
    setShowResetConfirm(false);
    setIsOpen(false);
  };

  const hasCartBar = cartCount > 0 && state.currentRole === 'user';

  return (
    <>
      {/* Floating Pill Container with Responsive Collision Offset */}
      <div className={`floating-role-switcher-container ${hasCartBar ? 'has-floating-cart' : ''}`}>
        {isOpen && (
          <div
            className="bento-card"
            style={{
              marginBottom: 12,
              padding: 16,
              minWidth: 260,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              boxShadow: '0 20px 48px -12px rgba(16, 29, 58, 0.25)',
              border: 'none',
              animation: 'fadeIn 0.15s ease-out',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span className="delight-tag" style={{ fontSize: 9.5, padding: '2px 8px' }}>
                <Sparkles size={10} color="var(--color-accent)" />
                GANTI PERAN
              </span>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 2,
                  color: 'var(--color-neutral-400)',
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Role Options */}
            <button
              onClick={() => handleRoleChange('user')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 9999,
                border: 'none',
                background: state.currentRole === 'user' ? '#DCFCE7' : 'var(--color-neutral-50)',
                color: state.currentRole === 'user' ? '#15803D' : 'var(--color-neutral-800)',
                fontWeight: state.currentRole === 'user' ? 800 : 600,
                fontSize: 12.5,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease',
              }}
            >
              <User size={15} color="#15803D" />
              <span>Pelanggan (User)</span>
              {state.currentRole === 'user' && (
                <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 800, background: '#BBF7D0', padding: '2px 8px', borderRadius: 9999 }}>
                  Aktif
                </span>
              )}
            </button>

            <button
              onClick={() => handleRoleChange('kurir')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 9999,
                border: 'none',
                background: state.currentRole === 'kurir' ? '#E0F2FE' : 'var(--color-neutral-50)',
                color: state.currentRole === 'kurir' ? '#0369A1' : 'var(--color-neutral-800)',
                fontWeight: state.currentRole === 'kurir' ? 800 : 600,
                fontSize: 12.5,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease',
              }}
            >
              <Bike size={15} color="#0369A1" />
              <span>Kurir Jastip</span>
              {state.currentRole === 'kurir' && (
                <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 800, background: '#BAE6FD', padding: '2px 8px', borderRadius: 9999 }}>
                  Aktif
                </span>
              )}
            </button>

            <button
              onClick={() => handleRoleChange('admin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 9999,
                border: 'none',
                background: state.currentRole === 'admin' ? '#EFF6FF' : 'var(--color-neutral-50)',
                color: state.currentRole === 'admin' ? '#1E40AF' : 'var(--color-neutral-800)',
                fontWeight: state.currentRole === 'admin' ? 800 : 600,
                fontSize: 12.5,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease',
              }}
            >
              <Shield size={15} color="#1E40AF" />
              <span>Admin Kampus</span>
              {state.currentRole === 'admin' && (
                <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 800, background: '#DBEAFE', padding: '2px 8px', borderRadius: 9999 }}>
                  Aktif
                </span>
              )}
            </button>

            <div style={{ height: 1, background: 'var(--color-neutral-100)', margin: '4px 0' }} />

            {/* Return to Role Selector */}
            <button
              onClick={() => handleRoleChange(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                borderRadius: 9999,
                border: 'none',
                background: 'transparent',
                color: 'var(--color-neutral-600)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <Users size={14} />
              <span>Pilih Peran Utama</span>
            </button>

            {/* Reset Data */}
            <button
              onClick={() => setShowResetConfirm(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                borderRadius: 9999,
                border: 'none',
                background: 'transparent',
                color: '#DC2626',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <RefreshCw size={14} />
              <span>Segarkan Data</span>
            </button>
          </div>
        )}

        {/* Trigger Pill Button (Duolingo Style without heavy border) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 9999,
            background: '#FFFFFF',
            border: 'none',
            boxShadow: '0 8px 24px rgba(15, 30, 61, 0.12)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="Klik untuk beralih peran"
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: current.bg,
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CurrentIcon size={14} color={current.color} />
          </div>
          <span className="floating-role-label" style={{ fontSize: 13, fontWeight: 900, color: '#0F1E3D' }}>
            {current.label}
          </span>
          <span
            className="badge badge-accent"
            style={{
              fontSize: 10.5,
              fontWeight: 900,
              padding: '2px 8px',
            }}
          >
            Ganti 🔄
          </span>
        </button>
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            backdropFilter: 'blur(6px)',
          }}
        >
          <div className="bento-card" style={{ maxWidth: 360, width: '100%', padding: 24, textAlign: 'center' }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 8, color: 'var(--color-navy)' }}>
              Muat Ulang Data Awal?
            </h3>
            <p style={{ fontSize: 13, color: 'var(--color-neutral-600)', lineHeight: 1.5, marginBottom: 20 }}>
              Semua status pesanan, keranjang, dan perubahan katalog akan disegarkan ke data awal kampus PENS Sukolilo.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                className="btn-pill"
                onClick={() => setShowResetConfirm(false)}
                style={{ fontSize: 13 }}
              >
                Batal
              </button>
              <button
                className="btn-pill"
                onClick={handleReset}
                style={{ background: '#0265DC', color: 'white', borderColor: '#0265DC', fontSize: 13 }}
              >
                Muat Ulang Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
