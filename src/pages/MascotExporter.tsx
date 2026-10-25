import { useState, useEffect, useRef } from 'react';
import { SiTitutMascot, type MascotMood } from '../components/shared/SiTitutMascot';
import { Download, CheckCircle, Package, ArrowLeft, RefreshCw } from 'lucide-react';

interface MoodMeta {
  id: MascotMood;
  name: string;
  filename: string;
  desc: string;
}

const MOODS: MoodMeta[] = [
  { id: 'happy', name: 'SiTitut Ceria (Default)', filename: 'sititut-happy.png', desc: 'Standby & menyapa hangat' },
  { id: 'wave', name: 'SiTitut Melambai', filename: 'sititut-wave.png', desc: 'Melambaikan sayap ramah' },
  { id: 'thinking', name: 'SiTitut Berpikir', filename: 'sititut-thinking.png', desc: 'Mencari kurir mahasiswa terdekat' },
  { id: 'sad', name: 'SiTitut Sedih', filename: 'sititut-sad.png', desc: 'Pesanan batal atau kantin tutup' },
  { id: 'excited', name: 'SiTitut Semangat & Hore', filename: 'sititut-excited.png', desc: 'Pesanan beres / siap dinikmati' },
  { id: 'delivering', name: 'SiTitut Gaspol Antar', filename: 'sititut-delivering.png', desc: 'Membawa tas pesanan melesat' },
  { id: 'wink', name: 'SiTitut Kedip Keren', filename: 'sititut-wink.png', desc: 'Jempol & kedip mantap' },
  { id: 'sleeping', name: 'SiTitut Istirahat / Tidur', filename: 'sititut-sleeping.png', desc: 'Di luar jam operasional kantin' },
];

export function MascotExporter() {
  const [status, setStatus] = useState<string>('Standby');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [completedList, setCompletedList] = useState<string[]>([]);
  const [pngDataUrls, setPngDataUrls] = useState<Record<string, string>>({});
  const [zipReady, setZipReady] = useState<boolean>(false);
  const hasAutoStarted = useRef(false);

  const rasterizeSvgToPng = async (svgEl: SVGSVGElement, width = 1000, height = 1050): Promise<string> => {
    const clone = svgEl.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('width', String(width));
    clone.setAttribute('height', String(height));
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    clone.style.transform = 'none';

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clone);

    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = () => resolve(true);
      img.onerror = reject;
      img.src = url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Gagal inisialisasi Canvas 2D context');

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    URL.revokeObjectURL(url);

    return canvas.toDataURL('image/png');
  };

  const handleExportAll = async () => {
    setIsProcessing(true);
    setStatus('Memulai proses rasterisasi 8 maskot ke PNG transparan (1000x1050px)...');
    setCompletedList([]);
    const urls: Record<string, string> = {};

    try {
      for (let i = 0; i < MOODS.length; i++) {
        const item = MOODS[i];
        setStatus(`[${i + 1}/8] Merasterisasi ${item.filename} (latar transparan)...`);

        const wrapper = document.getElementById(`mascot-wrapper-${item.id}`);
        const svgEl = wrapper?.querySelector('svg');
        if (!svgEl) {
          console.warn(`SVG element tidak ditemukan untuk mood: ${item.id}`);
          continue;
        }

        const pngUrl = await rasterizeSvgToPng(svgEl, 1000, 1050);
        urls[item.id] = pngUrl;
        setPngDataUrls((prev) => ({ ...prev, [item.id]: pngUrl }));

        // Send to backend server on port 3888 if active
        try {
          await fetch('http://localhost:3888/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: item.filename, base64: pngUrl }),
          });
        } catch {
          // If server is not running, we still have the client data url
        }

        setCompletedList((prev) => [...prev, item.id]);
        await new Promise((r) => setTimeout(r, 100));
      }

      // Finalize ZIP on server
      setStatus('Mengemas semua 8 file PNG transparan ke dalam arsip ZIP...');
      try {
        const finishRes = await fetch('http://localhost:3888/finish', { method: 'POST' });
        const finishData = await finishRes.json();
        if (finishData.success) {
          setZipReady(true);
          setStatus('Selesai! Semua 8 maskot PNG transparan berhasil dibuat dan dikemas ke ZIP.');
        } else {
          setZipReady(true);
          setStatus('PNG berhasil dibuat.');
        }
      } catch {
        setZipReady(true);
        setStatus('Semua 8 file PNG transparan siap diunduh.');
      }
    } catch (err: unknown) {
      console.error('Export error:', err);
      setStatus(`Terjadi kesalahan: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadSinglePng = (mood: MascotMood, filename: string) => {
    const url = pngDataUrls[mood];
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  useEffect(() => {
    if (!hasAutoStarted.current) {
      hasAutoStarted.current = true;
      const timer = setTimeout(() => {
        handleExportAll();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '32px 20px', fontFamily: "'Poppins', sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => { window.location.href = '/'; }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: 12,
                padding: '8px 14px',
                fontSize: 13,
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={16} /> Kembali
            </button>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', margin: 0 }}>
                🎨 Export Maskot SiTitut — PNG Transparan (Ultra HD)
              </h1>
              <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0' }}>
                Download seluruh ekspresi maskot TitutGo dalam resolusi tinggi (1000×1050 px) dengan latar transparan (.PNG &amp; .ZIP)
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              id="btn-export-all"
              onClick={handleExportAll}
              disabled={isProcessing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#0284C7',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 12,
                padding: '10px 18px',
                fontSize: 13,
                fontWeight: 800,
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                opacity: isProcessing ? 0.7 : 1,
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
              }}
            >
              {isProcessing ? <RefreshCw size={16} className="animate-spin" /> : <Package size={16} />}
              Generate Semua PNG &amp; Buat ZIP
            </button>

            {zipReady && (
              <a
                id="btn-download-zip"
                href="/sititut-mascots.zip"
                download="sititut-mascots-transparent-png.zip"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#059669',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  borderRadius: 12,
                  padding: '10px 18px',
                  fontSize: 13,
                  fontWeight: 800,
                  boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
                }}
              >
                <Download size={16} /> Download ZIP (8 Maskot)
              </a>
            )}
          </div>
        </div>

        {/* Status Bar */}
        <div
          id="export-status-box"
          style={{
            background: zipReady ? '#F0FDF4' : '#EFF6FF',
            border: `1.5px solid ${zipReady ? '#86EFAC' : '#BAE6FD'}`,
            borderRadius: 14,
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {zipReady ? <CheckCircle size={20} color="#16A34A" /> : <RefreshCw size={18} color="#0284C7" />}
            <div>
              <span style={{ fontSize: 13, fontWeight: 700, color: zipReady ? '#166534' : '#0369A1' }}>
                Status: {status}
              </span>
              <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                Format: PNG 32-bit RGBA (Alpha channel transparan) | Resolusi: 1000 × 1050 px
              </div>
            </div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#334155' }}>
            {completedList.length} / {MOODS.length} Selesai
          </span>
        </div>

        {/* Maskot Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 18,
          }}
        >
          {MOODS.map((m) => {
            const isDone = completedList.includes(m.id);
            const hasPng = Boolean(pngDataUrls[m.id]);

            return (
              <div
                key={m.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 18,
                  border: isDone ? '2px solid #38BDF8' : '1px solid #E2E8F0',
                  padding: 18,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Checkerboard preview background to prove transparency */}
                <div
                  id={`mascot-wrapper-${m.id}`}
                  style={{
                    width: '100%',
                    height: 200,
                    borderRadius: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background:
                      'linear-gradient(45deg, #F1F5F9 25%, transparent 25%), linear-gradient(-45deg, #F1F5F9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #F1F5F9 75%), linear-gradient(-45deg, transparent 75%, #F1F5F9 75%)',
                    backgroundSize: '16px 16px',
                    backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                    backgroundColor: '#FFFFFF',
                    border: '1px dashed #CBD5E1',
                    position: 'relative',
                  }}
                >
                  <SiTitutMascot size={160} mood={m.id} animated={false} />
                  {isDone && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        background: '#10B981',
                        color: '#FFFFFF',
                        borderRadius: 9999,
                        padding: '2px 8px',
                        fontSize: 10,
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <CheckCircle size={12} /> PNG Ready
                    </div>
                  )}
                </div>

                {/* Details */}
                <div style={{ marginTop: 14, width: '100%', textAlign: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{m.desc}</div>
                  <code
                    style={{
                      display: 'inline-block',
                      marginTop: 6,
                      fontSize: 10.5,
                      background: '#F1F5F9',
                      padding: '3px 8px',
                      borderRadius: 6,
                      color: '#0369A1',
                      fontWeight: 700,
                    }}
                  >
                    {m.filename}
                  </code>
                </div>

                {/* Download Single Button */}
                <button
                  onClick={() => downloadSinglePng(m.id, m.filename)}
                  disabled={!hasPng}
                  style={{
                    marginTop: 14,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '8px 12px',
                    background: hasPng ? '#F0F9FF' : '#F1F5F9',
                    color: hasPng ? '#0284C7' : '#94A3B8',
                    border: hasPng ? '1.5px solid #BAE6FD' : '1px solid #E2E8F0',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: hasPng ? 'pointer' : 'default',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Download size={14} /> Unduh PNG
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
