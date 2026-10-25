import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, GraduationCap, Shield, Bike, Utensils, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Role } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
  defaultRole?: Role;
}

export function AuthModal({
  isOpen,
  onClose,
  defaultMode = 'signin',
  defaultRole = 'user',
}: AuthModalProps) {
  const { signIn, signUp } = useApp();
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studyProgram, setStudyProgram] = useState('D4 Teknik Informatika');
  const [selectedRole, setSelectedRole] = useState<Role>(defaultRole);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        if (!email || !password) {
          throw new Error('Email dan kata sandi wajib diisi');
        }
        await signIn(email, password);
        setSuccessMsg('Berhasil masuk! Mengarahkan...');
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        if (!email || !password || !fullName || !phone) {
          throw new Error('Mohon lengkapi seluruh data wajib');
        }
        if (password.length < 6) {
          throw new Error('Kata sandi minimal 6 karakter');
        }
        await signUp({
          email,
          password,
          fullName,
          phone,
          role: selectedRole,
          studentId: studentId || undefined,
          studyProgram: studyProgram || undefined,
        });
        setSuccessMsg('Pendaftaran berhasil! Akun Anda siap digunakan.');
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 24,
          maxWidth: 480,
          width: '100%',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #0F1E3D 0%, #0265DC 100%)',
            color: 'white',
          }}
        >
          <div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>
              {mode === 'signin' ? 'Masuk ke TitutGo' : 'Daftar Akun Baru PENS'}
            </div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>
              {mode === 'signin'
                ? 'Gunakan email PENS atau akun terdaftar'
                : 'Bergabung dengan ekosistem jastip kampus PENS'}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {errorMsg && (
            <div
              style={{
                marginBottom: 16,
                padding: '12px 14px',
                borderRadius: 12,
                background: '#FEF2F2',
                border: '1px solid #FEE2E2',
                color: '#DC2626',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                marginBottom: 16,
                padding: '12px 14px',
                borderRadius: 12,
                background: '#F0FDF4',
                border: '1px solid #DCFCE7',
                color: '#16A34A',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'signup' && (
              <>
                {/* Role Selector Tabs */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6, display: 'block' }}>
                    Daftar Sebagai Peran:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {[
                      { role: 'user' as Role, label: 'Mahasiswa', icon: Utensils },
                      { role: 'kurir' as Role, label: 'Kurir Jastip', icon: Bike },
                      { role: 'admin' as Role, label: 'Pengelola', icon: Shield },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSelected = selectedRole === item.role;
                      return (
                        <button
                          key={item.role}
                          type="button"
                          onClick={() => setSelectedRole(item.role)}
                          style={{
                            padding: '10px 6px',
                            borderRadius: 12,
                            border: isSelected ? '2px solid #0265DC' : '1px solid #E2E8F0',
                            background: isSelected ? '#EFF6FF' : '#FFFFFF',
                            color: isSelected ? '#0265DC' : '#64748B',
                            fontWeight: 700,
                            fontSize: 11.5,
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Icon size={16} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4, display: 'block' }}>
                    Nama Lengkap *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={15} style={{ position: 'absolute', left: 12, top: 12, color: '#94A3B8' }} />
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Daffa Haidar"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 36px',
                        borderRadius: 10,
                        border: '1px solid #CBD5E1',
                        fontSize: 13,
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {/* WhatsApp Phone */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4, display: 'block' }}>
                    Nomor WhatsApp Aktif *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={15} style={{ position: 'absolute', left: 12, top: 12, color: '#94A3B8' }} />
                    <input
                      type="tel"
                      required
                      placeholder="081234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 36px',
                        borderRadius: 10,
                        border: '1px solid #CBD5E1',
                        fontSize: 13,
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {/* NRP / NIM */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4, display: 'block' }}>
                      NRP / NIM (Opsional)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <GraduationCap size={15} style={{ position: 'absolute', left: 12, top: 12, color: '#94A3B8' }} />
                      <input
                        type="text"
                        placeholder="3121500001"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 36px',
                          borderRadius: 10,
                          border: '1px solid #CBD5E1',
                          fontSize: 13,
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4, display: 'block' }}>
                      Program Studi
                    </label>
                    <select
                      value={studyProgram}
                      onChange={(e) => setStudyProgram(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 8px',
                        borderRadius: 10,
                        border: '1px solid #CBD5E1',
                        fontSize: 12,
                        outline: 'none',
                        background: '#FFFFFF',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="D4 Teknik Informatika">D4 T. Informatika</option>
                      <option value="D3 Teknik Informatika">D3 T. Informatika</option>
                      <option value="D4 Teknik Telekomunikasi">D4 T. Telekomunikasi</option>
                      <option value="D4 Teknik Elektro Industri">D4 T. Elektro Industri</option>
                      <option value="D4 Teknik Mekatronika">D4 T. Mekatronika</option>
                      <option value="D4 Teknologi Game">D4 Teknologi Game</option>
                      <option value="Sains Data Terapan">D4 Sains Data Terapan</option>
                      <option value="Sivitas / Dosen / Tendik">Sivitas / Dosen</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4, display: 'block' }}>
                Alamat Email *
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 12, top: 12, color: '#94A3B8' }} />
                <input
                  type="email"
                  required
                  placeholder="nama@itce.pens.ac.id atau email Anda"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: 10,
                    border: '1px solid #CBD5E1',
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4, display: 'block' }}>
                Kata Sandi *
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: 12, color: '#94A3B8' }} />
                <input
                  type="password"
                  required
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: 10,
                    border: '1px solid #CBD5E1',
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 8,
                padding: '12px 20px',
                borderRadius: 12,
                background: loading ? '#94A3B8' : '#0265DC',
                color: 'white',
                border: 'none',
                fontWeight: 800,
                fontSize: 14,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(2, 101, 220, 0.3)',
              }}
            >
              <span>{loading ? 'Memproses...' : mode === 'signin' ? 'Masuk Sekarang' : 'Daftar Akun'}</span>
            </button>
          </form>

          {/* Toggle Mode */}
          <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: '#64748B' }}>
            {mode === 'signin' ? (
              <span>
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0265DC',
                    fontWeight: 800,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Daftar di sini
                </button>
              </span>
            ) : (
              <span>
                Sudah memiliki akun?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0265DC',
                    fontWeight: 800,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Masuk di sini
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
