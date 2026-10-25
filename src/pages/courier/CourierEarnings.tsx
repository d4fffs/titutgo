import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatIDR } from '../../utils/currency';
import { ArrowUpRight, CheckCircle2, Wallet, Landmark, CreditCard, X } from 'lucide-react';
import { ToastContainer, useToast } from '../../components/shared/Toast';

export function CourierEarnings() {
  const { state, currentCourier } = useApp();
  const { toasts, showToast, removeToast } = useToast();
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'gopay' | 'dana' | 'mandiri' | 'qris'>('gopay');
  const [withdrawnAmount, setWithdrawnAmount] = useState<number | null>(null);

  if (!currentCourier) return null;

  const myOrders = state.orders.filter((o) => o.courierId === currentCourier.id);
  const completedOrders = myOrders
    .filter((o) => o.status === 'completed')
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const totalEarnings = completedOrders.reduce((s, o) => s + o.serviceFee, 0) - (withdrawnAmount ?? 0);
  const displayEarnings = Math.max(0, totalEarnings);

  const handleWithdraw = () => {
    if (displayEarnings <= 0) {
      showToast('Saldo dompet masih kosong. Selesaikan pengantaran dahulu!', 'error');
      return;
    }
    setShowWithdrawModal(true);
  };

  const confirmWithdraw = () => {
    showToast(`Pencairan dana ${formatIDR(displayEarnings)} berhasil diproses ke ${selectedMethod.toUpperCase()}! 💸`, 'success');
    setWithdrawnAmount((prev) => (prev ?? 0) + displayEarnings);
    setShowWithdrawModal(false);
  };

  return (
    <div style={{ padding: '16px' }}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0F1E3D', margin: 0 }}>
            Pendapatan & Dompet Kurir 💰
          </h2>
          <p style={{ fontSize: 12.5, color: '#64748B', fontWeight: 600, marginTop: 4 }}>
            Akumulasi reward jasa titip kurir mahasiswa PENS
          </p>
        </div>

        <button
          onClick={handleWithdraw}
          className="btn btn-accent"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 18px',
            fontSize: 13.5,
            fontWeight: 900,
          }}
        >
          <ArrowUpRight size={16} />
          <span>Tarik Saldo 💸</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 20 }}>
        <div className="stat-card" style={{
          background: '#FFFFFF',
          padding: '18px 20px',
        }}>
          <div className="stat-card-label" style={{ fontSize: 11, fontWeight: 900, color: '#64748B' }}>TOTAL SELESAI</div>
          <div className="stat-card-value" style={{ fontSize: 28, fontWeight: 900, color: '#16A34A', marginTop: 2 }}>{completedOrders.length} Order</div>
          <div className="stat-card-sub" style={{ fontSize: 11.5, color: '#16A34A', fontWeight: 700, marginTop: 4 }}>✓ Pengantaran Sukses 🎉</div>
        </div>

        <div className="stat-card" style={{
          background: '#FFFFFF',
          padding: '18px 20px',
        }}>
          <div className="stat-card-label" style={{ fontSize: 11, fontWeight: 900, color: '#64748B' }}>SALDO AKTIF</div>
          <div className="stat-card-value" style={{ fontSize: 26, fontWeight: 900, color: '#0265DC', marginTop: 2 }}>{formatIDR(displayEarnings)}</div>
          <div className="stat-card-sub" style={{ fontSize: 11.5, color: '#0265DC', fontWeight: 700, marginTop: 4 }}>🪙 Tersedia Ditarik</div>
        </div>
      </div>

      {/* Earning detail */}
      {completedOrders.length === 0 ? (
        <div className="empty-state bento-card" style={{ padding: '36px 20px', textAlign: 'center' }}>
          <div className="empty-state-icon" style={{ fontSize: 48, marginBottom: 8 }}>💰</div>
          <div className="empty-state-title" style={{ fontSize: 18, fontWeight: 900, color: '#0F1E3D' }}>Belum Ada Pendapatan</div>
          <div className="duo-speech-bubble" style={{ marginTop: 12, display: 'inline-block', fontSize: 13, color: '#475569' }}>
            "Yuk mulai ambil dan antar pesanan mahasiswa buat kumpulin pundi-pundi cuan!" 🛵
          </div>
        </div>
      ) : (
        <div className="bento-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', fontWeight: 900, fontSize: 14, color: '#0F1E3D', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
            <span>Riwayat Komisi Pengantaran 🛵</span>
            <span className="badge badge-primary" style={{ fontSize: 11, fontWeight: 800 }}>{completedOrders.length} Transaksi</span>
          </div>
          {completedOrders.map((order) => {
            const canteen = state.canteens.find((c) => c.id === order.canteenId);
            const completedAt = order.statusHistory.find((h) => h.status === 'completed');
            return (
              <div
                key={order.id}
                style={{
                  padding: '14px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: '#0F1E3D' }}>{order.id}</div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 2, fontWeight: 600 }}>
                    {canteen?.name} ➔ {order.deliveryPoint}
                  </div>
                  {completedAt && (
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                      {new Date(completedAt.timestamp).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#16A34A' }}>
                  +{formatIDR(order.serviceFee)} 🪙
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Withdrawal Modal (Interactive) */}
      {showWithdrawModal && (
        <div
          onClick={() => setShowWithdrawModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
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
            className="bento-card"
            style={{
              padding: '26px 28px',
              maxWidth: 440,
              width: '100%',
              background: '#FFFFFF',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Wallet size={20} color="#0265DC" />
                <h3 style={{ fontSize: 17, fontWeight: 900, color: '#0F1E3D', margin: 0 }}>Pencairan Saldo Kurir</h3>
              </div>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="btn-pill"
                style={{ width: 30, height: 30, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={15} />
              </button>
            </div>

            <div style={{
              background: '#EFF6FF',
              borderRadius: 16,
              padding: '16px 18px',
              marginBottom: 18,
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(2, 101, 220, 0.08)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: '#64748B' }}>JUMLAH DICAIRKAN</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#0265DC', marginTop: 2 }}>{formatIDR(displayEarnings)}</div>
              <div style={{ fontSize: 11.5, color: '#16A34A', fontWeight: 800, marginTop: 4 }}>✓ Bebas Biaya Admin Kampus PENS!</div>
            </div>

            <div style={{ fontSize: 12.5, fontWeight: 800, color: '#0F1E3D', marginBottom: 10 }}>Pilih E-Wallet / Rekening Tujuan:</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {[
                { id: 'gopay', name: 'GoPay', icon: CreditCard, no: '0812-3456-7890' },
                { id: 'dana', name: 'DANA', icon: Wallet, no: '0812-3456-7890' },
                { id: 'mandiri', name: 'Bank Mandiri', icon: Landmark, no: '142-00-1928374-1' },
                { id: 'qris', name: 'QRIS Instan', icon: CheckCircle2, no: 'NIM Mahasiswa PENS' },
              ].map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSelectedMethod(m.id as typeof selectedMethod)}
                  style={{
                    boxShadow: selectedMethod === m.id ? '0 0 0 2px #0265DC' : '0 1px 3px rgba(15, 30, 61, 0.05)',
                    background: selectedMethod === m.id ? '#EFF6FF' : '#F8FAFC',
                    borderRadius: 14,
                    padding: '12px 14px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 900, color: '#0F1E3D' }}>{m.name}</div>
                  <div style={{ fontSize: 10.5, color: '#64748B', marginTop: 3, fontWeight: 600 }}>{m.no}</div>
                </div>
              ))}
            </div>

            <button
              onClick={confirmWithdraw}
              className="btn btn-accent btn-full"
              style={{
                padding: '13px 18px',
                fontSize: 14.5,
                fontWeight: 900,
              }}
            >
              Konfirmasi Tarik {formatIDR(displayEarnings)} 💸
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
