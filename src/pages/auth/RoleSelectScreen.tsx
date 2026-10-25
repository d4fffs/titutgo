import { useState } from 'react';
import {
  Utensils, Bike, Shield, ArrowRight, Zap, Coins, GraduationCap, LogIn, UserCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SiTitutMascot } from '../../components/shared/SiTitutMascot';
import { CampusNavbar } from '../../components/shared/CampusNavbar';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { ToastContainer, useToast } from '../../components/shared/Toast';
import { AuthModal } from '../../components/shared/AuthModal';

export function RoleSelectScreen() {
  const { setRole, resetDemo, authUser, authProfile, signIn, signOut } = useApp();
  const { toasts, showToast, removeToast } = useToast();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [infoModal, setInfoModal] = useState<{ title: string; content: string } | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSelectRole = async (targetRole: 'user' | 'kurir' | 'admin') => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      // If user is already authenticated with the correct role, navigate directly
      if (authUser && authProfile) {
        const currentAppRole = authProfile.role === 'courier' ? 'kurir' : authProfile.role;
        if (currentAppRole === targetRole) {
          setRole(targetRole);
          return;
        }
      }

      // Automatically authenticate with verified Supabase demo account
      if (targetRole === 'admin') {
        await signIn('admin@pens.ac.id', 'admin123');
      } else if (targetRole === 'kurir') {
        await signIn('kurir@pens.ac.id', 'kurir123');
      } else {
        await signIn('mahasiswa@pens.ac.id', 'user123');
      }
      setRole(targetRole);
    } catch (err) {
      console.warn('Auto signin note:', err);
      setRole(targetRole);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleResetConfirm = () => {
    resetDemo();
    setShowResetConfirm(false);
    showToast('Data berhasil disegarkan ke kondisi awal!', 'success');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8FAFC',
      color: '#0F172A',
      fontFamily: 'inherit',
    }}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Campus Top Navbar */}
      <CampusNavbar activeTab="roles" />

      {/* Main Container */}
      <div className="responsive-page-container">
        {/* Editorial Landing Hero Section (No boxed card boundary, prominent mascot spotlight) */}
        <section
          className="landing-hero-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.18fr 0.82fr',
            gap: 48,
            alignItems: 'center',
            padding: '24px 0 54px',
          }}
        >
          {/* Left Column: Bold Headline & Editorial Copy */}
          <div className="landing-hero-left">
            {/* Giant Display Headline */}
            <h1 style={{
              fontSize: 'clamp(2.3rem, 4vw, 3.6rem)',
              fontWeight: 900,
              color: '#0F1E3D',
              lineHeight: 1.15,
              letterSpacing: '-0.035em',
              marginBottom: 18,
            }}>
              Kelezatan Kantin PENS, <br />
              <span style={{ color: '#0265DC' }}>Diantar Sampai ke Meja Lab & Kelasmu.</span>
            </h1>

            {/* Subtitle / Description */}
            <p style={{
              fontSize: 15.5,
              color: '#475569',
              lineHeight: 1.6,
              marginBottom: 24,
              maxWidth: 540,
              fontWeight: 500,
            }}>
              Layanan jasa titip (jastip) makanan antar mahasiswa dan sivitas di lingkungan kampus PENS Sukolilo. Pesan menu favorit FoodLAB & Kantin PENS, diantar hangat sampai ke Gedung D3, D4, Pasca, atau Lab praktikummu tanpa perlu antre!
            </p>

            {/* Auth status or Auth Button */}
            {authUser ? (
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  padding: '14px 18px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 14px rgba(15, 30, 61, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  marginBottom: 28,
                  maxWidth: 520,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0265DC' }}>
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#0F1E3D' }}>
                      {authProfile?.full_name || authUser.email}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>
                      Peran: <strong style={{ textTransform: 'capitalize', color: '#0265DC' }}>{authProfile?.role || 'User'}</strong> • {authProfile?.study_program || 'Sivitas PENS'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => {
                      const appRole = authProfile?.role === 'courier' ? 'kurir' : (authProfile?.role || 'user');
                      setRole(appRole as any);
                    }}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 9999,
                      background: '#0265DC',
                      color: 'white',
                      border: 'none',
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Buka Dashboard
                  </button>
                  <button
                    onClick={() => signOut()}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 9999,
                      background: '#F1F5F9',
                      color: '#64748B',
                      border: 'none',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Keluar
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowAuthModal(true)}
                  style={{
                    padding: '12px 22px',
                    borderRadius: 9999,
                    background: '#0F1E3D',
                    color: 'white',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: 13.5,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 14px rgba(15, 30, 61, 0.2)',
                  }}
                >
                  <LogIn size={16} />
                  <span>Masuk / Daftar Akun PENS (Supabase Auth)</span>
                </button>
                <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>atau pilih akses cepat di bawah:</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="hero-btn-group" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 40 }}>
              <button
                onClick={() => handleSelectRole('user')}
                disabled={isLoggingIn}
                className="btn btn-primary"
                style={{
                  padding: '14px 28px',
                  fontSize: 15,
                  fontWeight: 800,
                  borderRadius: 9999,
                  boxShadow: '0 8px 24px rgba(2, 101, 220, 0.25)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <span>{isLoggingIn ? 'Menghubungkan...' : 'Pesan Makanan Sekarang'}</span>
                <ArrowRight size={17} />
              </button>

              <button
                onClick={() => handleSelectRole('kurir')}
                disabled={isLoggingIn}
                className="btn-pill"
                style={{
                  padding: '13px 22px',
                  fontSize: 14,
                  fontWeight: 800,
                  borderRadius: 9999,
                  background: '#FFFFFF',
                  color: '#0F1E3D',
                  boxShadow: '0 2px 10px rgba(15, 30, 61, 0.06)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Bike size={18} color="#0265DC" />
                <span>Mode Kurir Jastip</span>
              </button>
            </div>
          </div>

          {/* Right Column: BORDERLESS MODERN MASCOT SPOTLIGHT SHOWCASE */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            <div className="mascot-spotlight-stage">
              {/* Soft Ambient Glow Aura */}
              <div className="mascot-spotlight-glow" />

              {/* Warm Soft Borderless Backdrop Orb */}
              <div className="mascot-spotlight-backdrop" />

              {/* Ambient Floating Micro-Sparkles */}
              <span className="ambient-sparkle sparkle-1" aria-hidden="true">✨</span>
              <span className="ambient-sparkle sparkle-2" aria-hidden="true">⭐</span>
              <span className="ambient-sparkle sparkle-3" aria-hidden="true">⚡</span>

              {/* Desktop Floating Feature Badge 1: Speed (Top Left) */}
              <div className="mascot-floating-card card-speed">
                <div className="mascot-card-icon speed-icon">
                  <Zap size={16} />
                </div>
                <div>
                  <div className="card-title">Antar Hangat</div>
                  <div className="card-subtitle">Langsung dari Tenant PENS</div>
                </div>
              </div>

              {/* Desktop Floating Feature Badge 3: Reliable Courier (Right Center) */}
              <div className="mascot-floating-card card-community">
                <div className="mascot-card-icon community-icon">
                  <GraduationCap size={16} />
                </div>
                <div>
                  <div className="card-title">Kurir Terpercaya</div>
                  <div className="card-subtitle">Siap Antar ke Tujuanmu</div>
                </div>
              </div>

              {/* Center Stage: Highlighted Mascot with Dialogue and Ground Shadow */}
              <div className="mascot-spotlight-character">
                {/* Prominent High-Resolution Mascot */}
                <SiTitutMascot
                  size={260}
                  className="mascot-hero-size"
                  mood="wave"
                  interactive
                  animated
                />

                {/* Grounding Drop Shadow */}
                <div className="mascot-ground-shadow" />
              </div>
            </div>

            {/* Mobile-Only Highlights Row */}
            <div className="mascot-mobile-badges">
              <div className="mascot-mobile-badge-pill">
                <Zap size={14} color="#16A34A" />
                <span>Antar Cepat Hangat</span>
              </div>
              <div className="mascot-mobile-badge-pill">
                <Coins size={14} color="#D97706" />
                <span>Ongkir Flat Rp 2.000</span>
              </div>
              <div className="mascot-mobile-badge-pill">
                <GraduationCap size={14} color="#0265DC" />
                <span>Jastip PENS Terpercaya</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Main Role Action Cards */}
        <section style={{ marginBottom: 40, paddingTop: 10 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 11.5,
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#0265DC',
              marginBottom: 4,
            }}>
              AKSES UTAMA
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0F1E3D', margin: 0 }}>
              Pilih Akses Layanan Hari Ini
            </h2>
            <p style={{ fontSize: 13.5, color: '#64748B', marginTop: 4, fontWeight: 500 }}>
              Masuk sebagai mahasiswa/sivitas PENS yang mau titip makanan, kurir mahasiswa pengantar, atau admin operasional.
            </p>
          </div>

          <div className="role-cards-grid">
            {/* Card 1: User / Mahasiswa & Sivitas PENS */}
            <div
              onClick={() => handleSelectRole('user')}
              className="bento-card"
              style={{
                padding: '26px 24px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  background: '#0F1E3D',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(15, 30, 61, 0.15)',
                }}>
                  <Utensils size={22} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#0265DC', background: '#EFF6FF', padding: '3px 10px', borderRadius: 9999 }}>
                  Mahasiswa & Sivitas
                </span>
              </div>

              <h3 style={{ fontSize: 19, fontWeight: 800, color: '#0F1E3D', marginBottom: 6 }}>
                Pesan Makanan Kantin
              </h3>
              <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, marginBottom: 20, fontWeight: 500 }}>
                Titip jastip menu lezat FoodLAB & Kantin PENS, diantar hangat sampai ke Gedung D3, D4, Pasca, atau Lab praktikum!
              </p>
              <button
                id="btn-role-user"
                disabled={isLoggingIn}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectRole('user');
                }}
                className="btn btn-primary btn-full"
                style={{ marginTop: 'auto', borderRadius: 9999 }}
              >
                <span>{isLoggingIn ? 'MENGHUBUNGKAN...' : 'PESAN SEKARANG'}</span>
                <ArrowRight size={15} />
              </button>
            </div>

            {/* Card 2: Kurir Jastiper */}
            <div
              onClick={() => handleSelectRole('kurir')}
              className="bento-card"
              style={{
                padding: '26px 24px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                background: 'linear-gradient(180deg, #FFFFFF 0%, #F0F7FF 100%)',
                boxShadow: '0 6px 24px rgba(2, 101, 220, 0.08)',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  background: '#0265DC',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(2, 101, 220, 0.25)',
                }}>
                  <Bike size={22} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#16A34A', background: '#DCFCE7', padding: '3px 10px', borderRadius: 9999 }}>
                  Komisi Rp 2.000 / Antar
                </span>
              </div>

              <h3 style={{ fontSize: 19, fontWeight: 800, color: '#0F1E3D', marginBottom: 6 }}>
                Mitra Kurir PENS
              </h3>
              <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, marginBottom: 20, fontWeight: 500 }}>
                Sekalian jalan kuliah? Ambil orderan teman & raih komisi tunai tiap antar!
              </p>

              <button
                id="btn-role-kurir"
                disabled={isLoggingIn}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectRole('kurir');
                }}
                className="btn btn-accent btn-full"
                style={{ marginTop: 'auto', borderRadius: 9999 }}
              >
                <span>{isLoggingIn ? 'MENGHUBUNGKAN...' : 'GASPOL JADI KURIR'}</span>
                <Bike size={15} />
              </button>
            </div>

            {/* Card 3: Admin Kampus */}
            <div
              onClick={() => handleSelectRole('admin')}
              className="bento-card"
              style={{
                padding: '26px 24px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  background: '#F1F5F9',
                  color: '#0F1E3D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Shield size={22} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#475569', background: '#F1F5F9', padding: '3px 10px', borderRadius: 9999 }}>
                  Pengelola Kampus
                </span>
              </div>

              <h3 style={{ fontSize: 19, fontWeight: 800, color: '#0F1E3D', marginBottom: 6 }}>
                Admin Kantin & Ops
              </h3>
              <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, marginBottom: 20, fontWeight: 500 }}>
                Kelola menu tenant, atur ketersediaan makanan, dan pantau flow pesanan real-time.
              </p>
              <button
                id="btn-role-admin"
                disabled={isLoggingIn}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectRole('admin');
                }}
                className="btn btn-outline btn-full"
                style={{ marginTop: 'auto', borderRadius: 9999 }}
              >
                <span>{isLoggingIn ? 'MENGHUBUNGKAN...' : 'KONSOL ADMIN'}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </section>

        {/* Minimal Clean Footer (GoFood / Grab Style) */}
        <footer style={{
          borderTop: '1px solid #E2E8F0',
          paddingTop: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 12,
          color: '#94A3B8',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <div>
            © 2025 <strong>TitutGo PENS</strong> • Jastip Makanan Kampus PENS Sukolilo
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <span
              onClick={() =>
                setInfoModal({
                  title: 'Standar Operasional Jastiper PENS',
                  content: '1. Pengantaran maksimal 20 menit dari kantin ke lokasi lab/ruang kelas.\n2. Wadah makanan wajib tertutup rapat dan higienis.\n3. Serah terima pesanan dilakukan di titik temu resmi gedung.',
                })
              }
              style={{ cursor: 'pointer', color: '#64748B' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#0265DC')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#64748B')}
            >
              SOP Kurir
            </span>
            <span
              onClick={() =>
                setInfoModal({
                  title: 'Titik Temu Antar Kampus',
                  content: 'Titik temu resmi tersedia di Lobby Gedung D4, Meja Piket D3, Kafetaria Pascasarjana, dan Koridor Lab Komputer & Telekomunikasi.',
                })
              }
              style={{ cursor: 'pointer', color: '#64748B' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#0265DC')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#64748B')}
            >
              Titik Antar
            </span>
            <span
              onClick={() =>
                setInfoModal({
                  title: 'Pusat Bantuan & Layanan Kantin',
                  content: 'Jika Anda memerlukan bantuan pemesanan atau ingin mendaftarkan menu kantin baru, hubungi hotline kampus: (031) 594-7280 atau email jastip@pens.ac.id.',
                })
              }
              style={{ cursor: 'pointer', color: '#64748B' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#0265DC')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#64748B')}
            >
              Bantuan
            </span>
          </div>
        </footer>
      </div>

      {/* Clean Info Modal */}
      {infoModal && (
        <div
          onClick={() => setInfoModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              padding: '24px 26px',
              maxWidth: 440,
              width: '100%',
              boxShadow: '0 20px 50px rgba(15, 23, 42, 0.2)',
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 900, color: '#0F1E3D', marginBottom: 12 }}>
              {infoModal.title}
            </h3>
            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
              {infoModal.content}
            </p>
            <button
              onClick={() => setInfoModal(null)}
              style={{
                marginTop: 20,
                width: '100%',
                padding: '10px 16px',
                borderRadius: 10,
                background: '#0265DC',
                color: 'white',
                border: 'none',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showResetConfirm && (
        <ConfirmDialog
          title="Segarkan Data?"
          message="Katalog kantin dan status pesanan akan disegarkan ke kondisi awal PENS."
          confirmLabel="Ya, Segarkan"
          variant="primary"
          onConfirm={handleResetConfirm}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}

      {/* Supabase Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
