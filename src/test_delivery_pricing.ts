// ─── Automated Acceptance Test Suite: TitutGo PENS Intra-Campus Delivery Pricing ────────
import {
  DEFAULT_PRICING_CONFIG,
  computeDeliveryPricing,
  createDeliveryPricingSnapshot,
  calculateHaversineDistanceKm,
  applyDistanceRounding,
  applyFareRounding,
  type DeliveryPricingConfig,
} from './utils/deliveryPricing';
import { PENS_CAMPUS_LOCATIONS } from './utils/geocoding';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

console.log('====================================================');
console.log('TITUTGO TEST SUITE: ONGKIR LINGKUP KAMPUS PENS');
console.log('====================================================\n');

// ─── Test 0: Ongkir Flat Rp 2.000 (Tanpa Tarif per KM) ──────────────────────
console.log('TEST 0: DEFAULT_PRICING_CONFIG ongkir flat Rp 2.000 tanpa tarif per km');
assert(DEFAULT_PRICING_CONFIG.baseFee === 2000, 'DEFAULT_PRICING_CONFIG baseFee adalah 2000');
assert(DEFAULT_PRICING_CONFIG.ratePerKm === 0, 'DEFAULT_PRICING_CONFIG ratePerKm adalah 0');
const flatA = computeDeliveryPricing(0.2, 5, DEFAULT_PRICING_CONFIG);
const flatB = computeDeliveryPricing(0.7, 8, DEFAULT_PRICING_CONFIG);
assert(flatA.deliveryFee === 2000, 'Titik 0.2 km ongkir flat Rp 2.000');
assert(flatB.deliveryFee === 2000, 'Titik 0.7 km ongkir tetap flat Rp 2.000 tanpa tambahan per km');

// ─── Test 1: Formula Ongkir Dasar & Jarak Antar Gedung PENS ───────────────────
console.log('\nTEST 1: Jarak koridor gedung PENS menghasilkan ongkir transparan (jika konfigurasi dinamis diaktifkan)');
const config: DeliveryPricingConfig = {
  ...DEFAULT_PRICING_CONFIG,
  baseFee: 2000,
  ratePerKm: 1000,
  distanceRounding: 'exact_0_1km',
  fareRounding: 'round_100',
  maxDistanceKm: 2,
  appFee: 0,
};

// Titik A: Gedung D4 (~0.2 km)
// Ongkir = 2.000 + (0.2 * 1.000) = 2.000 + 200 = 2.200
const resA = computeDeliveryPricing(0.2, 5, config);
console.log(`  Titik Dekat (0.2 km - Gedung D4): Billable=${resA.billableDistanceKm} km, Ongkir=Rp ${resA.deliveryFee}`);
assert(resA.billableDistanceKm === 0.2, 'Jarak 0.2 km presisi 0.2 km (exact_0_1km)');
assert(resA.deliveryFee === 2200, 'Ongkir 0.2 km adalah Rp 2.200');

// Titik B: Gedung Pascasarjana (~0.4 km)
// Ongkir = 2.000 + (0.4 * 1.000) = 2.000 + 400 = 2.400
const resB = computeDeliveryPricing(0.4, 7, config);
console.log(`  Titik Lebih Jauh (0.4 km - Pasca): Billable=${resB.billableDistanceKm} km, Ongkir=Rp ${resB.deliveryFee}`);
assert(resB.billableDistanceKm === 0.4, 'Jarak 0.4 km presisi 0.4 km');
assert(resB.deliveryFee === 2400, 'Ongkir 0.4 km adalah Rp 2.400');
assert(resB.deliveryFee > resA.deliveryFee, 'Ongkir berbanding lurus dengan jarak rute pengiriman antar gedung');

// ─── Test 2: Batas Jangkauan Layanan Satu PENS (Maksimal 2 km) ────────────────
console.log('\nTEST 2: Batas jangkauan layanan (Strictly Kampus PENS)');
const resWithin = computeDeliveryPricing(0.8, 10, config);
assert(resWithin.isWithinRange === true, 'Jarak 0.8 km masih dalam jangkauan kampus (maksimal 2 km)');

const resBeyond = computeDeliveryPricing(3.5, 20, config);
assert(resBeyond.isWithinRange === false, 'Jarak 3.5 km ditolak karena di luar batas jangkauan kampus PENS (2 km)');
console.log(`  Jarak 3.5 km isWithinRange: ${resBeyond.isWithinRange} (Ditolak otomatis)`);

// ─── Test 3: Kebijakan Biaya Dasar Bernilai Nol ───────────────────────────────
console.log('\nTEST 3: Konfigurasi Biaya Dasar Nol');
const configZeroBase: DeliveryPricingConfig = {
  ...config,
  baseFee: 0,
};
const resZeroBase = computeDeliveryPricing(1.0, 10, configZeroBase);
assert(resZeroBase.deliveryFee === 1000, 'Dengan baseFee=0, ongkir murni jarak (1.0 km * 1.000 = 1.000)');

// ─── Test 4: Metode Pembulatan Jarak Berbeda ──────────────────────────────────
console.log('\nTEST 4: Metode Pembulatan Jarak');
assert(applyDistanceRounding(0.35, 'exact_0_1km') === 0.4, 'Pembulatan exact_0_1km (0.35 km -> 0.4 km)');
assert(applyDistanceRounding(0.3, 'round_half_km') === 0.5, 'Pembulatan round_half_km (0.3 km -> 0.5 km)');
assert(applyFareRounding(2230, 'round_100') === 2200, 'Pembulatan fare round_100 (2230 -> 2200)');
assert(applyFareRounding(2250, 'round_100') === 2300, 'Pembulatan fare round_100 (2250 -> 2300)');

// ─── Test 5: Snapshot Pesanan Tetap Konsisten (Immutabilitas) ──────────────────
console.log('\nTEST 5: Immutabilitas Snapshot Pesanan');
const originalSnapshot = createDeliveryPricingSnapshot(
  'Lab AI & RPL Gedung D4 Baru Lt. 2',
  { lat: -7.2755, lng: 112.7936 },
  resA,
  config
);
assert(originalSnapshot.deliveryFee === 2200, 'Snapshot menyimpan ongkir Rp 2.200');

// Ubah tarif simulasi
const updatedConfig = { ...config, ratePerKm: 2000 };
const newCalculation = computeDeliveryPricing(0.2, 5, updatedConfig);
assert(newCalculation.deliveryFee === 2400, 'Kalkulasi baru menghasilkan Rp 2.400');
assert(originalSnapshot.deliveryFee === 2200, 'Snapshot pesanan lama tetap Rp 2.200 tanpa berubah!');

// ─── Test 6: Validasi Preset Gedung & Titik Temu Kampus PENS ──────────────────
console.log('\nTEST 6: Validasi Titik Temu & Lab Kampus PENS');
assert(PENS_CAMPUS_LOCATIONS.length >= 15, 'Preset titik kampus PENS lengkap (>= 15 lokasi)');
PENS_CAMPUS_LOCATIONS.forEach((loc) => {
  assert(loc.coordinates.lat < 0 && loc.coordinates.lng > 100, `Koordinat ${loc.name} valid (${loc.coordinates.lat}, ${loc.coordinates.lng})`);
  const dist = calculateHaversineDistanceKm(config.pickupHub.coordinates, loc.coordinates);
  assert(dist >= 0 && dist <= 2, `Jarak garis lurus dari FoodLAB ke ${loc.name} adalah ${(dist * 1000).toFixed(0)} meter (dalam lingkup satu PENS)`);
});

console.log('\n====================================================');
console.log('SEMUA TEST CASE LINGKUP SATU PENS BERHASIL 100%!');
console.log('====================================================');
