import {
  Check, Phone, Clock, Radio,
  Store, Building2, ArrowRight, CheckCircle2,
  DollarSign
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SiTitutMascot } from '../../components/shared/SiTitutMascot';
import { SafeImage } from '../../components/shared/SafeImage';
import { formatIDR } from '../../utils/currency';
import { ToastContainer, useToast } from '../../components/shared/Toast';

type CourierPage = 'home' | 'cari' | 'pengantaran' | 'pendapatan' | 'profil';

interface Props {
  onNavigate?: (page: CourierPage) => void;
}

export function CourierDashboard({ onNavigate }: Props) {
  const { state, currentCourier, setCourierAvailability, transitionOrder } = useApp();
  const { toasts, showToast, removeToast } = useToast();

  if (!currentCourier) return null;

  const myOrders = state.orders.filter((o) => o.courierId === currentCourier.id);
  const completedOrders = myOrders.filter((o) => o.status === 'completed');
  const activeOrder = myOrders.find((o) => !['completed', 'cancelled'].includes(o.status));
  const activeCanteen = activeOrder ? state.canteens.find((c) => c.id === activeOrder.canteenId) : null;
  const waitingOrders = state.orders.filter((o) => o.status === 'pending_courier').slice(0, 3);

  // Baseline simulated earnings plus real completed orders fees
  const earnings = completedOrders.reduce((s, o) => s + o.serviceFee, 15000);

  // Step labels for active delivery
  const STEP_LABELS = [
    { num: 1, label: 'Tiba di Kantin', status: 'courier_assigned' },
    { num: 2, label: 'Membeli', status: 'purchasing_food' },
    { num: 3, label: 'Makanan Siap', status: 'ready_for_delivery' },
    { num: 4, label: 'Menuju Pemesan', status: 'delivering' },
    { num: 5, label: 'Klaim Komisi', status: 'completed' },
  ];

  const getActiveStep = (status?: string): number => {
    switch (status) {
      case 'courier_assigned': return 1;
      case 'purchasing_food': return 2;
      case 'ready_for_delivery': return 3;
      case 'delivering': return 4;
      case 'completed': return 5;
      default: return 1;
    }
  };

  const activeStep = activeOrder ? getActiveStep(activeOrder.status) : 1;

  const handleAdvanceStep = () => {
    if (!activeOrder) return;
    if (activeOrder.status === 'courier_assigned') {
      transitionOrder(activeOrder.id, 'purchasing_food');
      showToast('Status: Membeli makanan di kantin...', 'success');
    } else if (activeOrder.status === 'purchasing_food') {
      transitionOrder(activeOrder.id, 'ready_for_delivery');
      showToast('Status: Makanan selesai dimasak & dikemas!', 'success');
    } else if (activeOrder.status === 'ready_for_delivery') {
      transitionOrder(activeOrder.id, 'delivering');
      showToast(`Status: Mulai mengantar ke ${activeOrder.deliveryPoint}!`, 'success');
    } else if (activeOrder.status === 'delivering') {
      transitionOrder(activeOrder.id, 'completed');
      showToast(`Pesanan #${activeOrder.id} selesai diantar! +${formatIDR(activeOrder.serviceFee)} komisi berhasil diklaim 🎉`, 'success');
    }
  };

  const handleAcceptOrder = (orderId: string, dest: string, fee: number) => {
    if (!currentCourier.isAvailable) {
      showToast('Aktifkan status "Siap Antar" terlebih dahulu di toggle atas!', 'error');
      return;
    }
    transitionOrder(orderId, 'courier_assigned', currentCourier.id);
    showToast(`Pesanan #${orderId} diterima! Rute: ${dest} (+${formatIDR(fee)})`, 'success');
  };

  // Find first food item of active order for image preview
  const firstActiveFood = activeOrder && activeOrder.items.length > 0
    ? state.foodItems.find(f => f.id === activeOrder.items[0].foodItemId)
    : null;

  return (
    <div style={{ width: '100%' }}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Top Greeting & Status Card */}
      <div className="bento-card" style={{
        padding: '20px 24px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F0F7FF 100%)',
      }}>
        {/* Left: Mascot Avatar + Speech Bubble */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: '1 1 400px' }}>
          <div style={{
            position: 'relative',
            width: 64,
            height: 64,
            borderRadius: 22,
            background: '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(2, 101, 220, 0.12)',
          }}>
            <SiTitutMascot size={52} mood={activeOrder ? 'delivering' : 'happy'} interactive />
            <span style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: currentCourier.isAvailable ? '#16A34A' : '#94A3B8',
              boxShadow: '0 0 0 2px white',
            }} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0F1E3D', margin: 0 }}>
                Halo, {currentCourier.name.split(' ')[0]} Ananda! 🛵
              </h2>
              <span className="badge" style={{
                fontSize: 11,
                fontWeight: 800,
                background: '#F1F5F9',
                color: '#475569',
                padding: '3px 10px',
                borderRadius: 8,
              }}>
                D4 Telekomunikasi '21
              </span>
            </div>

            {/* Mascot Speech Bubble */}
            <div className="duo-speech-bubble" style={{
              marginTop: 8,
              padding: '6px 14px',
              fontSize: 12.5,
              fontWeight: 800,
              color: '#0265DC',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <span>
                {activeOrder
                  ? `💬 "Semangat antarkan pesanan #${activeOrder.id} ya, rek! Jastip amanah 🚀"`
                  : `💬 "Gaspol rek! ${waitingOrders.length} orderan menunggumu di sekitar PENS 🚀"`}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Status Switch & Radar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: 16,
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            boxShadow: '0 1px 4px rgba(15, 30, 61, 0.05)',
          }}>
            <div>
              <div style={{ fontSize: 9.5, fontWeight: 900, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                STATUS KURIR
              </div>
              <div style={{ fontSize: 13, fontWeight: 900, color: currentCourier.isAvailable ? '#16A34A' : '#64748B' }}>
                {currentCourier.isAvailable ? '🟢 SIAP ANTAR' : '⚪ ISTIRAHAT'}
              </div>
            </div>

            <label className="toggle">
              <input
                type="checkbox"
                checked={currentCourier.isAvailable}
                disabled={!currentCourier.isEnabled}
                onChange={(e) => setCourierAvailability(currentCourier.id, e.target.checked)}
                aria-label="Status ketersediaan kurir"
              />
              <span className="toggle-slider" />
            </label>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12.5,
            fontWeight: 800,
            color: '#0265DC',
            background: '#EFF6FF',
            padding: '10px 14px',
            borderRadius: 14,
            boxShadow: '0 2px 6px rgba(2, 101, 220, 0.08)',
          }}>
            <Radio size={14} className="duo-bounce" />
            <span>Radar Aktif</span>
          </div>
        </div>
      </div>

      {/* 4 Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 14,
        marginBottom: 24,
      }}>
        {/* Metric 1 */}
        <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14, background: '#EFF6FF',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0265DC',
          }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 900, color: '#64748B', textTransform: 'uppercase' }}>SELESAI</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#0F1E3D' }}>
              {completedOrders.length} Order 🎉
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14, background: '#ECFDF5',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A',
          }}>
            <DollarSign size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 900, color: '#64748B', textTransform: 'uppercase' }}>PENDAPATAN</div>
            <div
              onClick={() => onNavigate?.('pendapatan')}
              style={{ fontSize: 20, fontWeight: 900, color: '#16A34A', cursor: onNavigate ? 'pointer' : 'default' }}
            >
              {formatIDR(earnings)}
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14, background: '#FEF3C7',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706',
          }}>
            <span style={{ fontSize: 22 }}>⭐</span>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 900, color: '#64748B', textTransform: 'uppercase' }}>RATING</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#0F1E3D' }}>
              4.9 <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>(42)</span>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14, background: '#F1F5F9',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569',
          }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 900, color: '#64748B', textTransform: 'uppercase' }}>WAKTU ANTAR</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#0F1E3D' }}>11 Menit ⚡</div>
          </div>
        </div>
      </div>

      {/* Two Column Main Section */}
      <div className="responsive-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: 20, alignItems: 'start' }}>
        {/* Left Column: Active Delivery Task + Stepper */}
        <div>
          {activeOrder ? (
            <div className="bento-card" style={{ padding: 24, marginBottom: 20 }}>
              {/* Header Task */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="badge badge-primary" style={{
                    fontSize: 11.5,
                    padding: '4px 12px',
                    borderRadius: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0265DC' }} className="duo-pulse" />
                    TUGAS SEDANG BERJALAN
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#64748B', fontFamily: 'monospace' }}>
                    #{activeOrder.id}
                  </span>
                </div>
                <span style={{
                  background: '#FEF3C7',
                  color: '#B45309',
                  fontSize: 11.5,
                  fontWeight: 800,
                  padding: '4px 12px',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}>
                  <Clock size={12} /> Target: Cepat & Hangat
                </span>
              </div>

              {/* Pickup & Delivery Location Box */}
              <div style={{ position: 'relative', marginBottom: 20 }}>
                {/* Pickup */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 12, background: '#EFF6FF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0265DC', flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(2, 101, 220, 0.1)',
                  }}>
                    <Store size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 900, color: '#64748B', textTransform: 'uppercase' }}>
                      LOKASI PENGAMBILAN
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 15, fontWeight: 900, color: '#0F1E3D' }}>
                        {activeCanteen?.name ?? 'Kantin Kampus PENS'}
                      </div>
                      <span style={{ fontSize: 10.5, background: '#F1F5F9', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                        {activeCanteen?.location ?? 'Lantai 1'}
                      </span>
                    </div>
                    <div style={{ fontSize: 12.5, color: '#64748B', fontWeight: 600 }}>
                      {activeCanteen?.description ?? 'Kantin resmi kampus Sukolilo'}
                    </div>
                  </div>
                </div>

                {/* Vertical Connector */}
                <div style={{
                  width: 2,
                  height: 24,
                  background: '#93C5FD',
                  marginLeft: 18,
                  margin: '4px 0 4px 18px',
                  borderRadius: 2,
                }} />

                {/* Destination */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 12, background: '#0F1E3D',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(15, 30, 61, 0.15)',
                  }}>
                    <Building2 size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 900, color: '#64748B', textTransform: 'uppercase' }}>
                      TUJUAN PENGANTARAN
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 15, fontWeight: 900, color: '#0F1E3D' }}>
                        {activeOrder.deliveryPoint}
                      </div>
                      <button
                        onClick={() => showToast('Menghubungi pemesan via WhatsApp/Telepon...', 'success')}
                        className="btn-pill"
                        style={{
                          padding: '4px 10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11,
                          color: '#0265DC',
                        }}
                        title="Hubungi Pemesan"
                        aria-label="Hubungi Pemesan"
                      >
                        <Phone size={12} /> Hubungi
                      </button>
                    </div>
                    <div style={{ fontSize: 12.5, color: '#0265DC', fontWeight: 700, marginTop: 2 }}>
                      {activeOrder.deliveryDistanceKm ? `🛵 Jarak Antar: ${activeOrder.deliveryDistanceKm} km` : '🛵 Pengantaran Jastip'} • Komisi: {formatIDR(activeOrder.serviceFee)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Food Item Breakdown Box */}
              <div style={{
                background: '#F8FAFC',
                borderRadius: 16,
                padding: 14,
                marginBottom: 16,
                boxShadow: '0 1px 4px rgba(15, 30, 61, 0.04)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 900, color: '#64748B', textTransform: 'uppercase' }}>
                    ITEM YANG HARUS DIBELI
                  </span>
                  <span className="badge badge-success" style={{ fontSize: 11, fontWeight: 900 }}>
                    KOMISI JASTIP: +{formatIDR(activeOrder.serviceFee)} 🪙
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  {firstActiveFood?.imageUrl ? (
                    <SafeImage
                      src={firstActiveFood.imageUrl}
                      alt={firstActiveFood.name}
                      style={{ width: 52, height: 52, borderRadius: 12, objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{
                      width: 52, height: 52, borderRadius: 12, background: '#EFF6FF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                    }}>
                      🍲
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    {activeOrder.items.map((item, idx) => {
                      const food = state.foodItems.find(f => f.id === item.foodItemId);
                      return (
                        <div key={idx} style={{ fontSize: 13.5, fontWeight: 800, color: '#0F1E3D' }}>
                          {item.quantity}x {food?.name ?? item.foodItemId}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#0F1E3D' }}>
                      {formatIDR(activeOrder.subtotal)}
                    </div>
                    <span className="badge badge-primary" style={{ fontSize: 10, padding: '2px 8px' }}>
                      QRIS / COD
                    </span>
                  </div>
                </div>
              </div>

              {/* Note Bubble */}
              {activeOrder.deliveryNotes && (
                <div className="duo-speech-bubble" style={{
                  width: '100%',
                  marginBottom: 20,
                  fontSize: 12.5,
                  color: '#1E40AF',
                  display: 'flex',
                  gap: 8,
                  alignItems: 'flex-start',
                  boxSizing: 'border-box',
                }}>
                  <span style={{ fontSize: 16 }}>📝</span>
                  <span>
                    <strong>Catatan Pemesan:</strong> "{activeOrder.deliveryNotes}"
                  </span>
                </div>
              )}

              {/* 5-Step Stepper */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 900, color: '#0F1E3D', textTransform: 'uppercase' }}>
                    TAHAPAN ANTAR MAKANAN 🛵
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 900, color: '#0265DC' }}>
                    Tahap {activeStep} dari 5
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="duo-progress-bar" style={{ height: 10, marginBottom: 14 }}>
                  <div
                    className="duo-progress-fill-blue"
                    style={{ width: `${(activeStep / 5) * 100}%` }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, textAlign: 'center' }}>
                  {STEP_LABELS.map((step) => {
                    const isDone = activeStep > step.num;
                    const isCurrent = activeStep === step.num;
                    return (
                      <div key={step.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: isDone ? '#16A34A' : isCurrent ? '#0265DC' : '#F1F5F9',
                          color: isDone || isCurrent ? '#FFFFFF' : '#64748B',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          fontWeight: 900,
                          transition: 'all 0.2s',
                          transform: isCurrent ? 'scale(1.08)' : 'none',
                          boxShadow: isCurrent ? '0 2px 8px rgba(2, 101, 220, 0.3)' : 'none',
                        }}>
                          {isDone ? <Check size={16} /> : step.num}
                        </div>
                        <span style={{
                          fontSize: 10,
                          fontWeight: isCurrent ? 900 : 700,
                          color: isCurrent ? '#0265DC' : isDone ? '#16A34A' : '#64748B',
                        }}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Main Action Progression Button */}
              <button
                onClick={handleAdvanceStep}
                className="btn btn-accent"
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  fontSize: 15,
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <span>
                  {activeStep === 1 && '📍 Tiba di Kantin & Beli'}
                  {activeStep === 2 && '🛒 Makanan Selesai Dikemas'}
                  {activeStep === 3 && '🛵 Mulai Antar ke Pemesan'}
                  {activeStep === 4 && '🏢 Serahkan Pesanan (Selesai)'}
                  {activeStep >= 5 && '🎉 Pesanan Selesai'}
                </span>
              </button>
            </div>
          ) : (
            <div className="bento-card" style={{ padding: '36px 20px', textAlign: 'center', marginBottom: 20 }}>
              <SiTitutMascot size={64} mood="happy" interactive />
              <div style={{ fontSize: 18, fontWeight: 900, color: '#0F1E3D', marginTop: 14 }}>
                Belum Ada Pengantaran Aktif 🛵
              </div>
              <div className="duo-speech-bubble" style={{ marginTop: 12, display: 'inline-block', fontSize: 13, color: '#475569' }}>
                Kamu sedang santai! Ambil salah satu orderan di daftar radar samping atau cari di katalog kampus.
              </div>
              <div style={{ marginTop: 20 }}>
                <button
                  onClick={() => onNavigate?.('cari')}
                  className="btn btn-primary"
                  style={{ padding: '12px 24px', fontSize: 14, fontWeight: 900 }}
                >
                  Buka Radar Cari Orderan 🛵
                </button>
              </div>
            </div>
          )}

          {/* Motivation Box with Duolingo Mascot Bubble */}
          <div className="bento-card" style={{
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFBEB 100%)',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 18, background: '#FEF3C7',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              boxShadow: '0 2px 8px rgba(217, 119, 6, 0.15)',
            }}>
              <SiTitutMascot size={46} mood="happy" interactive />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#0F1E3D' }}>
                Semangat, {currentCourier.name.split(' ')[0]}! 🔥
              </div>
              <div style={{ fontSize: 12.5, color: '#475569', marginTop: 2, fontWeight: 600 }}>
                {completedOrders.length} pesanan selesai tercatat. Sambil jalan ke kelas berikutnya di PENS, sekalian dapet cuan jastip!
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Feed Pesanan Sekitarmu + Riwayat Saldo */}
        <div>
          {/* Feed Pesanan Sekitarmu */}
          <div className="bento-card" style={{ padding: 20, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 900, color: '#0F1E3D', margin: 0 }}>
                  Pesanan Baru Sekitarmu 🛵
                </h3>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2, fontWeight: 600 }}>
                  {waitingOrders.length} pesanan menunggu kurir
                </div>
              </div>

              <span className="badge badge-accent" style={{
                fontSize: 11,
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <Radio size={12} className="duo-pulse" /> Live Radar
              </span>
            </div>

            {waitingOrders.length > 0 ? (
              waitingOrders.map((order) => {
                const canteen = state.canteens.find(c => c.id === order.canteenId);
                const orderUser = state.users.find(u => u.id === order.userId);
                return (
                  <div key={order.id} style={{
                    background: '#FFFFFF',
                    borderRadius: 16,
                    padding: 14,
                    marginBottom: 12,
                    boxShadow: '0 2px 10px rgba(15, 30, 61, 0.05)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ fontSize: 11.5, color: '#64748B' }}>
                        <span style={{ fontWeight: 800, fontFamily: 'monospace' }}>#{order.id}</span>
                        {order.deliveryDistanceKm && (
                          <span style={{ marginLeft: 6, color: '#16A34A', fontWeight: 800 }}>
                            • 🛵 {order.deliveryDistanceKm} km
                          </span>
                        )}
                      </div>
                      <span className="badge badge-success" style={{ fontSize: 11, fontWeight: 900 }}>
                        +{formatIDR(order.serviceFee)} 🪙
                      </span>
                    </div>

                    <div style={{ fontSize: 14.5, fontWeight: 900, color: '#0F1E3D', marginBottom: 2 }}>
                      {canteen?.name ?? 'Kantin'} ➔ {order.deliveryPoint}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B', marginBottom: 6, fontWeight: 600 }}>
                      {order.items.map(it => {
                        const food = state.foodItems.find(f => f.id === it.foodItemId);
                        return `${it.quantity}x ${food?.name ?? it.foodItemId}`;
                      }).join(', ')}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748B', marginBottom: 10 }}>
                      👤 Pemesan: {orderUser?.name ?? 'Pelanggan'} {orderUser?.phone ? `(${orderUser.phone})` : ''}
                    </div>

                    <button
                      onClick={() => handleAcceptOrder(order.id, order.deliveryPoint, order.serviceFee)}
                      className="btn btn-primary"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        fontSize: 13,
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      <span>Ambil Order Ini 🛵</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '24px 16px', textAlign: 'center', background: '#F8FAFC', borderRadius: 16 }}>
                <p style={{ margin: 0, fontSize: 13, color: '#64748B', fontWeight: 700 }}>
                  Semua pesanan saat ini sudah diambil oleh kurir aktif kampus! Pantau radar ya.
                </p>
              </div>
            )}
          </div>

          {/* Riwayat & Saldo Dompet Card */}
          <div className="bento-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: '#0F1E3D', margin: 0 }}>
                  Riwayat & Saldo Dompet 💰
                </h3>
                <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 1, fontWeight: 600 }}>
                  Hasil titipan selesai hari ini
                </div>
              </div>
              <span className="badge badge-primary" style={{ fontSize: 11, fontWeight: 800 }}>
                {completedOrders.length} Transaksi
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {completedOrders.length > 0 ? (
                completedOrders.slice(0, 4).map((order) => {
                  const canteen = state.canteens.find(c => c.id === order.canteenId);
                  return (
                    <div key={order.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
                          <Check size={13} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: '#0F1E3D' }}>{order.deliveryPoint}</div>
                          <div style={{ fontSize: 10.5, color: '#94A3B8' }}>
                            {canteen?.name ?? 'Kantin'} • {order.items.length} menu
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 900, color: '#16A34A' }}>+{formatIDR(order.serviceFee)}</span>
                        <div style={{ fontSize: 9.5, color: '#64748B', fontWeight: 700 }}>Terkredit</div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
                      <Check size={13} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: '#0F1E3D' }}>Gedung D4 Baru Lt 1 (Lab PLC)</div>
                      <div style={{ fontSize: 10.5, color: '#94A3B8' }}>Dari Kantin D3 • 1x Ayam Geprek</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 900, color: '#16A34A' }}>+Rp 2.000</span>
                    <div style={{ fontSize: 9.5, color: '#64748B', fontWeight: 700 }}>Terkredit</div>
                  </div>
                </div>
              )}
            </div>

            {/* Tip Box */}
            <div className="duo-speech-bubble" style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '10px 14px',
              fontSize: 11.5,
              color: '#1E40AF',
              textAlign: 'center',
              fontWeight: 700,
            }}>
              💡 Komisi otomatis dicairkan ke QRIS/E-Wallet setiap pukul 17:00 WIB!
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
