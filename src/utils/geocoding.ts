// ─── Geocoding, Address Autocomplete & Lokasi Kampus PENS Sukolilo ────────────
import type { GeoPoint } from './deliveryPricing';

export interface LocationSuggestion {
  id: string;
  name: string;
  district: string;
  fullAddress: string;
  coordinates: GeoPoint;
  category?: 'kampus' | 'gedung' | 'lab' | 'fasilitas' | 'umum';
  buildingGroup?: 'D4' | 'D3' | 'Pasca' | 'Fasilitas';
}

// ─── Preset Gedung, Lab, & Titik Temu Resmi di Kampus PENS Sukolilo ───────────
export const PENS_CAMPUS_LOCATIONS: LocationSuggestion[] = [
  // ── Gedung D4 Baru PENS
  {
    id: 'pens-d4-lobby',
    name: 'Lobby Gedung D4 Baru (Lt. 1)',
    district: 'Gedung D4 PENS',
    fullAddress: 'Gedung D4 Baru PENS Lt. 1, Jl. Raya ITS Kampus PENS Sukolilo',
    coordinates: { lat: -7.2755, lng: 112.7935 },
    category: 'gedung',
    buildingGroup: 'D4',
  },
  {
    id: 'pens-d4-lab-rpl',
    name: 'Lab AI & Rekayasa Perangkat Lunak (D4 Lt. 2)',
    district: 'Gedung D4 PENS',
    fullAddress: 'Lab AI & RPL, Gedung D4 Baru Lt. 2, Kampus PENS Sukolilo',
    coordinates: { lat: -7.2755, lng: 112.7936 },
    category: 'lab',
    buildingGroup: 'D4',
  },
  {
    id: 'pens-d4-lab-stl',
    name: 'Lab Sistem Tenaga Listrik / STL (D4 Lt. 3)',
    district: 'Gedung D4 PENS',
    fullAddress: 'Lab STL, Gedung D4 Baru Lt. 3, Kampus PENS Sukolilo',
    coordinates: { lat: -7.2756, lng: 112.7935 },
    category: 'lab',
    buildingGroup: 'D4',
  },
  {
    id: 'pens-d4-lab-dsp',
    name: 'Lab DSP & Elektronika Digital (D4 Lt. 2)',
    district: 'Gedung D4 PENS',
    fullAddress: 'Lab DSP, Gedung D4 Baru Lt. 2, Kampus PENS Sukolilo',
    coordinates: { lat: -7.2754, lng: 112.7936 },
    category: 'lab',
    buildingGroup: 'D4',
  },
  {
    id: 'pens-d4-dosen',
    name: 'Ruang Dosen & Administrasi D4 (Lt. 1)',
    district: 'Gedung D4 PENS',
    fullAddress: 'Ruang Dosen D4 Lt. 1, Kampus PENS Sukolilo',
    coordinates: { lat: -7.2755, lng: 112.7934 },
    category: 'gedung',
    buildingGroup: 'D4',
  },

  // ── Gedung D3 Pusat PENS
  {
    id: 'pens-d3-lobby',
    name: 'Lobby Utama Gedung D3 Pusat (Lt. 1)',
    district: 'Gedung D3 PENS',
    fullAddress: 'Lobby Gedung D3 PENS Lt. 1, Jl. Raya ITS Sukolilo, Surabaya',
    coordinates: { lat: -7.2759, lng: 112.7932 },
    category: 'gedung',
    buildingGroup: 'D3',
  },
  {
    id: 'pens-d3-lab-mm',
    name: 'Lab Komputer & Multimedia (D3 Lt. 2)',
    district: 'Gedung D3 PENS',
    fullAddress: 'Lab Komputer MM, Gedung D3 PENS Lt. 2, Kampus PENS',
    coordinates: { lat: -7.2760, lng: 112.7931 },
    category: 'lab',
    buildingGroup: 'D3',
  },
  {
    id: 'pens-d3-lab-telkom',
    name: 'Lab Telekomunikasi PENS (D3 Lt. 3)',
    district: 'Gedung D3 PENS',
    fullAddress: 'Lab Telekomunikasi, Gedung D3 Lt. 3, Kampus PENS',
    coordinates: { lat: -7.2758, lng: 112.7931 },
    category: 'lab',
    buildingGroup: 'D3',
  },
  {
    id: 'pens-d3-perpus',
    name: 'Perpustakaan Gedung D3 (Lt. 2)',
    district: 'Gedung D3 PENS',
    fullAddress: 'Perpustakaan D3 Lt. 2, Kampus PENS Sukolilo',
    coordinates: { lat: -7.2760, lng: 112.7933 },
    category: 'fasilitas',
    buildingGroup: 'D3',
  },
  {
    id: 'pens-d3-ormawa',
    name: 'Ruang HIMA & Ormawa Gedung D3',
    district: 'Gedung D3 PENS',
    fullAddress: 'Ruang Organisasi Mahasiswa D3, Kampus PENS',
    coordinates: { lat: -7.2761, lng: 112.7932 },
    category: 'fasilitas',
    buildingGroup: 'D3',
  },

  // ── Gedung Pascasarjana PENS (13 Lantai)
  {
    id: 'pens-pasca-lobby',
    name: 'Lobby Utama Gedung Pascasarjana (Lt. 1)',
    district: 'Gedung Pasca PENS',
    fullAddress: 'Lobby Gedung Pascasarjana PENS Lt. 1, Kampus PENS Sukolilo',
    coordinates: { lat: -7.2762, lng: 112.7941 },
    category: 'gedung',
    buildingGroup: 'Pasca',
  },
  {
    id: 'pens-pasca-startup',
    name: 'Innovation & Startup Space (Pasca Lt. 5)',
    district: 'Gedung Pasca PENS',
    fullAddress: 'Innovation Space, Gedung Pascasarjana Lt. 5, PENS',
    coordinates: { lat: -7.2763, lng: 112.7941 },
    category: 'lab',
    buildingGroup: 'Pasca',
  },
  {
    id: 'pens-pasca-theater',
    name: 'Mini Theater PENS (Pasca Lt. 6)',
    district: 'Gedung Pasca PENS',
    fullAddress: 'Mini Theater, Gedung Pascasarjana Lt. 6, PENS Sukolilo',
    coordinates: { lat: -7.2762, lng: 112.7942 },
    category: 'fasilitas',
    buildingGroup: 'Pasca',
  },
  {
    id: 'pens-pasca-perpus',
    name: 'Perpustakaan Pascasarjana (Lt. 2)',
    district: 'Gedung Pasca PENS',
    fullAddress: 'Perpustakaan Pascasarjana Lt. 2, Kampus PENS',
    coordinates: { lat: -7.2763, lng: 112.7940 },
    category: 'fasilitas',
    buildingGroup: 'Pasca',
  },
  {
    id: 'pens-pasca-riset',
    name: 'Lab Riset Terapan (Pasca Lt. 8)',
    district: 'Gedung Pasca PENS',
    fullAddress: 'Lab Riset Terapan, Gedung Pascasarjana Lt. 8, Kampus PENS',
    coordinates: { lat: -7.2761, lng: 112.7942 },
    category: 'lab',
    buildingGroup: 'Pasca',
  },

  // ── Fasilitas & Pusat Kegiatan Kampus PENS
  {
    id: 'pens-fas-robotika',
    name: 'Workshop Mekatronika & Lab Robotika (EROC)',
    district: 'Fasilitas PENS',
    fullAddress: 'Gedung EROC / Workshop Robotika PENS, Kampus PENS',
    coordinates: { lat: -7.2753, lng: 112.7940 },
    category: 'lab',
    buildingGroup: 'Fasilitas',
  },
  {
    id: 'pens-fas-lapmerah',
    name: 'Hall & Lapangan Merah PENS (Red Square)',
    district: 'Fasilitas PENS',
    fullAddress: 'Lapangan Merah PENS, Pusat Kegiatan Mahasiswa, Kampus PENS',
    coordinates: { lat: -7.2757, lng: 112.7938 },
    category: 'fasilitas',
    buildingGroup: 'Fasilitas',
  },
  {
    id: 'pens-fas-masjid',
    name: 'Masjid An-Nahl PENS',
    district: 'Fasilitas PENS',
    fullAddress: 'Masjid An-Nahl, Lingkungan Kampus PENS Sukolilo',
    coordinates: { lat: -7.2764, lng: 112.7936 },
    category: 'fasilitas',
    buildingGroup: 'Fasilitas',
  },
  {
    id: 'pens-fas-kemahasiswaan',
    name: 'Gedung Kemahasiswaan & BEM PENS',
    district: 'Fasilitas PENS',
    fullAddress: 'Gedung Kemahasiswaan & Sekretariat Ormawa, Kampus PENS',
    coordinates: { lat: -7.2761, lng: 112.7938 },
    category: 'fasilitas',
    buildingGroup: 'Fasilitas',
  },
  {
    id: 'pens-fas-gazebo',
    name: 'Gazebo Taman & Student Corner PENS',
    district: 'Fasilitas PENS',
    fullAddress: 'Area Gazebo Mahasiswa, Dekat FoodLAB PENS',
    coordinates: { lat: -7.2758, lng: 112.7935 },
    category: 'fasilitas',
    buildingGroup: 'Fasilitas',
  },
];

// Alias for compatibility with existing imports
export const POPULAR_SURABAYA_LOCATIONS: LocationSuggestion[] = PENS_CAMPUS_LOCATIONS;

// ─── Search Locations inside PENS Campus ──────────────────────────────────────
export async function searchLocations(query: string): Promise<LocationSuggestion[]> {
  const clean = query.trim().toLowerCase();
  if (!clean || clean.length < 2) {
    return PENS_CAMPUS_LOCATIONS.slice(0, 8);
  }

  // 1. Filter Preset Gedung & Titik Temu Kampus PENS
  const localMatches = PENS_CAMPUS_LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(clean) ||
      loc.fullAddress.toLowerCase().includes(clean) ||
      loc.district.toLowerCase().includes(clean)
  );

  if (localMatches.length > 0) {
    return localMatches;
  }

  // 2. Jika mencari spesifik nama ruangan / nomor lab bebas di PENS
  return [
    {
      id: `custom-pens-${Date.now()}`,
      name: `${query} (Area Kampus PENS)`,
      district: 'Kampus PENS Sukolilo',
      fullAddress: `${query}, Politeknik Elektronika Negeri Surabaya, Jl. Raya ITS Sukolilo`,
      coordinates: {
        lat: -7.2758 + (Math.sin(query.length) * 0.0004),
        lng: 112.7937 + (Math.cos(query.length) * 0.0004),
      },
      category: 'gedung',
      buildingGroup: 'D4',
    },
  ];
}

// ─── Browser GPS Geolocation Helper ───────────────────────────────────────────
export function getDeviceCoordinates(): Promise<GeoPoint> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Perangkat tidak mendukung GPS'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        reject(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000,
      }
    );
  });
}
