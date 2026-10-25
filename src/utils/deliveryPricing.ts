// ─── Delivery Pricing & Road Distance Engine for TitutGo ─────────────────────
// Mengatur perhitungan rute jalan riil dari kampus PENS ke alamat tujuan pelanggan,
// formula ongkir dinamis yang dapat dikonfigurasi, dan snapshot harga pesanan.

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface PickupHub {
  name: string;
  address: string;
  coordinates: GeoPoint;
}

export type DistanceRoundingMode = 'exact_0_1km' | 'round_half_km' | 'ceil_1km';
export type FareRoundingMode = 'none' | 'round_100' | 'ceil_1000';

export interface DeliveryPricingConfig {
  pickupHub: PickupHub;
  baseFee: number; // Biaya dasar ongkir (bisa diatur ke 0)
  ratePerKm: number; // Tarif ongkir per kilometer
  distanceRounding: DistanceRoundingMode; // Aturan pembulatan jarak
  fareRounding: FareRoundingMode; // Aturan pembulatan nominal ongkir
  maxDistanceKm: number; // Batas radius jangkauan layanan (km)
  appFee: number; // Biaya layanan aplikasi (opsional)
}

export interface DeliveryPricingResult {
  distanceKm: number;
  billableDistanceKm: number;
  baseFee: number;
  ratePerKm: number;
  deliveryFee: number;
  appFee: number;
  totalDelivery: number;
  isWithinRange: boolean;
  maxDistanceKm: number;
  durationMinutes: number;
  routeType: 'osrm_road' | 'haversine_road_network_fallback';
  calculatedAt: string;
}

export interface DeliveryPricingSnapshot {
  pickupHubName: string;
  pickupHubAddress: string;
  pickupCoordinates: GeoPoint;
  destinationAddress: string;
  destinationCoordinates: GeoPoint;
  distanceKm: number;
  billableDistanceKm: number;
  baseFee: number;
  ratePerKm: number;
  deliveryFee: number;
  appFee: number;
  totalDelivery: number;
  durationMinutes: number;
  calculatedAt: string;
}

// ─── Titik Pickup Kampus PENS Sukolilo (Default Hub) ──────────────────────────
export const DEFAULT_PICKUP_HUB: PickupHub = {
  name: 'FoodLAB & Kantin Kampus PENS Sukolilo',
  address: 'Jl. Raya ITS, Keputih, Kec. Sukolilo, Surabaya, Jawa Timur 60111',
  coordinates: {
    lat: -7.2758471,
    lng: 112.7937557,
  },
};

// ─── Default Business Configuration (Dapat diubah via Admin Settings) ─────────
export const DEFAULT_PRICING_CONFIG: DeliveryPricingConfig = {
  pickupHub: DEFAULT_PICKUP_HUB,
  baseFee: 2000, // Ongkir jastip flat Rp 2.000 (antar semua gedung kampus PENS)
  ratePerKm: 0, // Tarif flat tanpa biaya per kilometer
  distanceRounding: 'exact_0_1km',
  fareRounding: 'none',
  maxDistanceKm: 2, // Jangkauan dibatasi strictly 2 km (lingkungan kampus PENS Sukolilo)
  appFee: 0, // Biaya layanan aplikasi Rp 0
};

// ─── Haversine Formula (Jarak Garis Lurus) ────────────────────────────────────
export function calculateHaversineDistanceKm(p1: GeoPoint, p2: GeoPoint): number {
  const R = 6371; // Radius bumi dalam km
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ─── Road Route Distance via OSRM with Campus Network Fallback ───────────────
// Menggunakan OSRM Routing Engine publik untuk rute berkendara / jalan kampus PENS.
// Jika jaringan gagal/timeout, fallback ke estimasi rute koridor kampus PENS (faktor kelokan 1.25x).
export async function fetchRoadRoute(
  origin: GeoPoint,
  destination: GeoPoint
): Promise<{ distanceMeters: number; durationSeconds: number; routeType: 'osrm_road' | 'haversine_road_network_fallback' }> {
  const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=false`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5 detik timeout

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        return {
          distanceMeters: Math.max(100, Math.round(data.routes[0].distance)),
          durationSeconds: Math.max(180, Math.round(data.routes[0].duration)),
          routeType: 'osrm_road',
        };
      }
    }
  } catch {
    // Fallback gracefully jika offline, timeout, atau limit
  }

  // Fallback: Formula Haversine dengan faktor kelokan koridor kampus PENS (1.25x)
  const straightKm = calculateHaversineDistanceKm(origin, destination);
  const roadNetworkKm = straightKm * 1.25; // Campus corridor factor
  const distanceMeters = Math.max(100, Math.round(roadNetworkKm * 1000));
  // Asumsi kecepatan pengantaran kurir mahasiswa jalan kaki / sepeda santai: 6 km/jam (100 m/menit)
  const durationSeconds = Math.max(180, Math.round((roadNetworkKm / 6) * 3600));

  return {
    distanceMeters,
    durationSeconds,
    routeType: 'haversine_road_network_fallback',
  };
}

// ─── Formula Pembulatan Jarak & Ongkir ────────────────────────────────────────
export function applyDistanceRounding(km: number, mode: DistanceRoundingMode): number {
  if (km <= 0) return 0.5;
  switch (mode) {
    case 'ceil_1km':
      return Math.max(1, Math.ceil(km));
    case 'round_half_km':
      return Math.max(0.5, Math.ceil(km * 2) / 2);
    case 'exact_0_1km':
    default:
      return Math.max(0.1, Math.round(km * 10) / 10);
  }
}

export function applyFareRounding(nominal: number, mode: FareRoundingMode): number {
  switch (mode) {
    case 'ceil_1000':
      return Math.ceil(nominal / 1000) * 1000;
    case 'round_100':
      return Math.round(nominal / 100) * 100;
    case 'none':
    default:
      return Math.round(nominal);
  }
}

// ─── Kalkulasi Final Ongkir Berdasarkan Jarak Rute ────────────────────────────
// Formula: Ongkir = Biaya Dasar + (Jarak Tagih dalam Kilometer × Tarif per Kilometer)
export function computeDeliveryPricing(
  distanceKm: number,
  durationMinutes: number,
  config: DeliveryPricingConfig = DEFAULT_PRICING_CONFIG,
  routeType: 'osrm_road' | 'haversine_road_network_fallback' = 'osrm_road'
): DeliveryPricingResult {
  const isWithinRange = distanceKm <= config.maxDistanceKm;
  const billableDistanceKm = applyDistanceRounding(distanceKm, config.distanceRounding);
  
  const rawFee = config.baseFee + (billableDistanceKm * config.ratePerKm);
  const deliveryFee = applyFareRounding(rawFee, config.fareRounding);
  const totalDelivery = deliveryFee + config.appFee;

  return {
    distanceKm: Number(distanceKm.toFixed(2)),
    billableDistanceKm,
    baseFee: config.baseFee,
    ratePerKm: config.ratePerKm,
    deliveryFee,
    appFee: config.appFee,
    totalDelivery,
    isWithinRange,
    maxDistanceKm: config.maxDistanceKm,
    durationMinutes: Math.max(5, Math.round(durationMinutes)),
    routeType,
    calculatedAt: new Date().toISOString(),
  };
}

// ─── Snapshot Creator untuk Pesanan ──────────────────────────────────────────
export function createDeliveryPricingSnapshot(
  destinationAddress: string,
  destinationCoordinates: GeoPoint,
  result: DeliveryPricingResult,
  config: DeliveryPricingConfig = DEFAULT_PRICING_CONFIG
): DeliveryPricingSnapshot {
  return {
    pickupHubName: config.pickupHub.name,
    pickupHubAddress: config.pickupHub.address,
    pickupCoordinates: config.pickupHub.coordinates,
    destinationAddress,
    destinationCoordinates,
    distanceKm: result.distanceKm,
    billableDistanceKm: result.billableDistanceKm,
    baseFee: result.baseFee,
    ratePerKm: result.ratePerKm,
    deliveryFee: result.deliveryFee,
    appFee: result.appFee,
    totalDelivery: result.totalDelivery,
    durationMinutes: result.durationMinutes,
    calculatedAt: result.calculatedAt,
  };
}
