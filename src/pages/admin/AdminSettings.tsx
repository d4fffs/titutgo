import { useState } from 'react';
import { LogOut, RotateCcw, Info, Sliders, MapPin, Calculator, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { ToastContainer, useToast } from '../../components/shared/Toast';
import { SiTitutMascot } from '../../components/shared/SiTitutMascot';
import { formatIDR } from '../../utils/currency';
import {
  computeDeliveryPricing,
  type DistanceRoundingMode,
  type FareRoundingMode,
} from '../../utils/deliveryPricing';

export function AdminSettings() {
  const { resetDemo, setRole, pricingConfig, updatePricingConfig } = useApp();
  const { toasts, showToast, removeToast } = useToast();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Editable pricing settings state
  const [baseFee, setBaseFee] = useState(pricingConfig.baseFee);
  const [ratePerKm, setRatePerKm] = useState(pricingConfig.ratePerKm);
  const [maxDistanceKm, setMaxDistanceKm] = useState(pricingConfig.maxDistanceKm);
  const [distanceRounding, setDistanceRounding] = useState<DistanceRoundingMode>(pricingConfig.distanceRounding);
  const [fareRounding, setFareRounding] = useState<FareRoundingMode>(pricingConfig.fareRounding);
  const [appFee, setAppFee] = useState(pricingConfig.appFee);

  // Live calculator test
  const [testDistanceKm, setTestDistanceKm] = useState(3.5);

  const handleSavePricing = (e: React.FormEvent) => {
    e.preventDefault();
    updatePricingConfig({
      baseFee: Number(baseFee),
      ratePerKm: Number(ratePerKm),
      maxDistanceKm: Number(maxDistanceKm),
      distanceRounding,
      fareRounding,
      appFee: Number(appFee),
    });
    showToast('Konfigurasi tarif & batas jangkauan ongkir berhasil disimpan!', 'success');
  };

  const simulatedPricing = computeDeliveryPricing(
    Number(testDistanceKm) || 1,
    15,
    {
      ...pricingConfig,
      baseFee: Number(baseFee),
      ratePerKm: Number(ratePerKm),
      maxDistanceKm: Number(maxDistanceKm),
      distanceRounding,
      fareRounding,
      appFee: Number(appFee),
    }
  );

  const handleReset = () => {
    resetDemo();
    showToast('Data demo direset ke awal', 'success');
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0F1E3D', margin: 0 }}>
          Pengaturan Sistem & Konfigurasi Tarif ⚙️
        </h1>
        <p style={{ fontSize: 13, color: '#64748B', fontWeight: 600, marginTop: 4 }}>
          Konfigurasi tarif ongkir dinamis per kilometer, radius jangkauan layanan, titik pickup, dan data simulasi.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 860 }}>
        {/* Brand Info with Mascot Speech Bubble */}
        <div
          className="bento-card"
          style={{
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            background: 'linear-gradient(135deg, #FFFFFF 0%, #EFF6FF 100%)',
          }}
        >
          <SiTitutMascot size={64} mood="happy" interactive />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#0F1E3D' }}>TitutGo 🦉</div>
            <div style={{ fontSize: 12.5, color: '#64748B', fontWeight: 600 }}>
              Jastip Makanan Kampus PENS untuk Umum & Kampus
            </div>
            <div
              className="duo-speech-bubble"
              style={{ marginTop: 8, fontSize: 12, fontWeight: 800, color: '#0265DC', padding: '6px 12px' }}
            >
              💬 "Halo Admin! Kamu bisa mengatur tarif per kilometer dan batas jangkauan pengiriman di bawah ini!"
            </div>
          </div>
        </div>

        {/* Dynamic Ongkir Configuration Bento Form */}
        <div className="bento-card" style={{ padding: '22px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0265DC',
              }}
            >
              <Sliders size={18} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#0F1E3D' }}>
                Pengaturan Formula Ongkir Dinamis
              </div>
              <div style={{ fontSize: 12, color: '#64748B' }}>
                Formula: Ongkir = Biaya Dasar + (Jarak Tagih dalam KM × Tarif per KM)
              </div>
            </div>
          </div>

          <form onSubmit={handleSavePricing}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 16, marginBottom: 18 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: 12 }}>
                  Biaya Dasar Pengiriman (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  className="form-input"
                  style={{ borderRadius: 12, padding: '10px 14px' }}
                  value={baseFee}
                  onChange={(e) => setBaseFee(Number(e.target.value))}
                  required
                />
                <span style={{ fontSize: 11, color: '#64748B', marginTop: 3 }}>
                  Biaya awal penjemputan (dapat bernilai 0 jika tarif murni per km)
                </span>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: 12 }}>
                  Tarif per Kilometer (Rp/km)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  className="form-input"
                  style={{ borderRadius: 12, padding: '10px 14px' }}
                  value={ratePerKm}
                  onChange={(e) => setRatePerKm(Number(e.target.value))}
                  required
                />
                <span style={{ fontSize: 11, color: '#64748B', marginTop: 3 }}>
                  Tarif tambahan per km (set 0 untuk tarif ongkir flat)
                </span>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: 12 }}>
                  Batas Jangkauan Maksimal (km)
                </label>
                <input
                  type="number"
                  min="3"
                  max="50"
                  step="1"
                  className="form-input"
                  style={{ borderRadius: 12, padding: '10px 14px' }}
                  value={maxDistanceKm}
                  onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
                  required
                />
                <span style={{ fontSize: 11, color: '#64748B', marginTop: 3 }}>
                  Radius terjauh pengantaran dari kampus PENS (default: 20 km)
                </span>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: 12 }}>
                  Metode Pembulatan Jarak
                </label>
                <select
                  className="form-input form-select"
                  style={{ borderRadius: 12, padding: '10px 14px' }}
                  value={distanceRounding}
                  onChange={(e) => setDistanceRounding(e.target.value as DistanceRoundingMode)}
                >
                  <option value="round_half_km">Bulatkan ke 0.5 km terdekat (Rekomendasi)</option>
                  <option value="ceil_1km">Bulatkan ke atas per 1 km utuh</option>
                  <option value="exact_0_1km">Presisi 0.1 km (Tanpa pembulatan satuan)</option>
                </select>
                <span style={{ fontSize: 11, color: '#64748B', marginTop: 3 }}>
                  Aturan konversi jarak rute ke jarak penagihan
                </span>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: 12 }}>
                  Metode Pembulatan Tarif Nominal
                </label>
                <select
                  className="form-input form-select"
                  style={{ borderRadius: 12, padding: '10px 14px' }}
                  value={fareRounding}
                  onChange={(e) => setFareRounding(e.target.value as FareRoundingMode)}
                >
                  <option value="round_100">Bulatkan ke Rp 100 terdekat</option>
                  <option value="ceil_1000">Bulatkan ke atas ke Rp 1.000 terdekat</option>
                  <option value="none">Sesuai kalkulasi persis</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: 12 }}>
                  Biaya Layanan Aplikasi (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  className="form-input"
                  style={{ borderRadius: 12, padding: '10px 14px' }}
                  value={appFee}
                  onChange={(e) => setAppFee(Number(e.target.value))}
                />
                <span style={{ fontSize: 11, color: '#64748B', marginTop: 3 }}>
                  Biaya pemeliharaan platform (default: Rp 0)
                </span>
              </div>
            </div>

            {/* Pickup Hub Details Card */}
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 14,
                padding: '12px 16px',
                marginBottom: 18,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <MapPin size={20} color="#0265DC" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: 12.5 }}>
                <div style={{ fontWeight: 800, color: '#0F1E3D' }}>
                  Titik Asal Pickup Resmi: {pricingConfig.pickupHub.name}
                </div>
                <div style={{ color: '#64748B' }}>
                  {pricingConfig.pickupHub.address} • Koordinat ({pricingConfig.pickupHub.coordinates.lat},{' '}
                  {pricingConfig.pickupHub.coordinates.lng})
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ borderRadius: 9999, padding: '10px 22px', display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 800 }}
            >
              <Save size={16} />
              <span>Simpan Konfigurasi Tarif</span>
            </button>
          </form>
        </div>

        {/* Live Simulator Calculator Bento */}
        <div className="bento-card" style={{ padding: '22px 26px', background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <Calculator size={18} color="#16A34A" />
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#0F1E3D' }}>
                Simulator Kalkulasi Tarif Ongkir
              </div>
              <div style={{ fontSize: 12, color: '#64748B' }}>
                Uji coba perhitungan ongkir untuk memastikan transparansi dan akurasi formula.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
              Masukkan Jarak Rute Uji Coba:
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="number"
                min="0.5"
                max="30"
                step="0.5"
                className="form-input"
                style={{ width: 100, borderRadius: 10, padding: '6px 12px', fontWeight: 800 }}
                value={testDistanceKm}
                onChange={(e) => setTestDistanceKm(Number(e.target.value))}
              />
              <span style={{ fontSize: 13, fontWeight: 700 }}>Kilometer (km)</span>
            </div>
          </div>

          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 14,
              border: '1px solid #E2E8F0',
              padding: '14px 18px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 800 }}>JARAK TAGIH</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#0F1E3D' }}>
                {simulatedPricing.billableDistanceKm} km
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 800 }}>BIAYA DASAR</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#0F1E3D' }}>
                {formatIDR(simulatedPricing.baseFee)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 800 }}>TARIF JARAK</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#16A34A' }}>
                {formatIDR(simulatedPricing.billableDistanceKm * simulatedPricing.ratePerKm)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 800 }}>TOTAL ONGKIR</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#0265DC' }}>
                {formatIDR(simulatedPricing.deliveryFee)}
              </div>
            </div>
          </div>
        </div>

        {/* System Capabilities Overview */}
        <div className="bento-card" style={{ padding: '18px 22px' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0265DC',
                flexShrink: 0,
              }}
            >
              <Info size={18} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#0F1E3D', marginBottom: 4 }}>
                Arsitektur Fitur Baru TitutGo
              </div>
              <ul style={{ fontSize: 13, color: '#475569', lineHeight: 1.8, paddingLeft: 16, margin: 0, fontWeight: 600 }}>
                <li>Target Pengguna: Masyarakat umum & sivitas memesan makanan dari tenant FoodLAB PENS ke alamat pilihan.</li>
                <li>Profil Tanpa Kewajiban NIM: Pendaftaran & checkout menggunakan nomor WhatsApp/HP aktif dan alamat tersimpan.</li>
                <li>Ongkir Rute Riil: Dihitung dengan OSRM driving engine & formula transparan per kilometer.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Reset Data */}
        <div className="bento-card" style={{ padding: '18px 22px' }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: '#0F1E3D', marginBottom: 4 }}>
              Segarkan Data Simulasi
            </div>
            <p style={{ fontSize: 13, color: '#64748B', margin: 0, fontWeight: 600 }}>
              Kembalikan seluruh transaksi pesanan, saldo dompet, dan katalog menu ke data awal prototype PENS.
            </p>
          </div>
          <button
            className="btn btn-danger"
            style={{ padding: '9px 16px', fontSize: 13, fontWeight: 900, display: 'inline-flex', alignItems: 'center', gap: 6 }}
            onClick={() => setShowResetConfirm(true)}
          >
            <RotateCcw size={14} /> Segarkan Data Awal
          </button>
        </div>

        {/* Role Switcher */}
        <div className="bento-card" style={{ padding: '18px 22px' }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: '#0F1E3D', marginBottom: 4 }}>
              Ganti Peran Pengguna
            </div>
            <p style={{ fontSize: 13, color: '#64748B', margin: 0, fontWeight: 600 }}>
              Kembali ke halaman utama pemilihan peran akun.
            </p>
          </div>
          <button
            className="btn btn-primary"
            style={{ padding: '9px 16px', fontSize: 13, fontWeight: 900, display: 'inline-flex', alignItems: 'center', gap: 6 }}
            onClick={() => setRole(null)}
          >
            <LogOut size={14} /> Ganti Peran Akun
          </button>
        </div>
      </div>

      {showResetConfirm && (
        <ConfirmDialog
          title="Muat Ulang Data Awal?"
          message="Seluruh pesanan dan perubahan tarif akan dikembalikan ke data awal prototype. Tindakan ini tidak dapat dibatalkan."
          confirmLabel="Ya, Muat Ulang Semua"
          onConfirm={() => {
            handleReset();
            setShowResetConfirm(false);
          }}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
