import React, { useState } from 'react';

export type MascotMood =
  | 'happy'
  | 'wave'
  | 'thinking'
  | 'sad'
  | 'excited'
  | 'delivering'
  | 'wink'
  | 'sleeping';

export interface SiTitutMascotProps {
  size?: number;
  mood?: MascotMood;
  className?: string;
  style?: React.CSSProperties;
  animated?: boolean;
  interactive?: boolean;
  speechText?: string;
  speechPlacement?: 'top' | 'top-left' | 'top-right';
  speechOffset?: number;
  onClick?: () => void;
}

export function SiTitutMascot({
  size = 80,
  mood = 'happy',
  className = '',
  style,
  animated = true,
  interactive = false,
  speechText,
  speechPlacement = 'top',
  speechOffset = 18,
  onClick,
}: SiTitutMascotProps) {
  const [internalMood, setInternalMood] = useState<MascotMood | null>(null);
  const [isBouncing, setIsBouncing] = useState(false);
  const [showSpeech, setShowSpeech] = useState(false);

  const activeMood = internalMood || mood;

  const moodDialogs: Record<MascotMood, string> = {
    happy: 'Halo Cak & Ning! TitutGo siap nemenin harimu di PENS! 🛵',
    wave: 'Halo Rek! Mau titip jastip apa nih di kantin hari ini? 👋',
    thinking: 'Hmm... Titut lagi carikan kurir mahasiswa tercepat ya! 🔍',
    sad: 'Yah, pesanan batal atau kantin lagi tutup. Jangan sedih ya! 🥺',
    excited: 'Yeeey! Pesanan beres dan makanan siap meluncur! 🎉',
    delivering: 'Gaspol! SiTitut dan kawan kurir ngebut antar ke gedungmu! ⚡',
    wink: 'Tenang, serahin ke SiTitut. Beres tanpa ribet! 😉✨',
    sleeping: 'Zzz... Titut istirahat bentar ya, standby besok pagi! 😴',
  };

  const handleMascotClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
    if (interactive) {
      setIsBouncing(true);
      setShowSpeech(true);
      setTimeout(() => setIsBouncing(false), 600);
      setTimeout(() => setShowSpeech(false), 3600);

      // Cycle mood interactively if in demo mode
      const moods: MascotMood[] = [
        'happy',
        'wave',
        'thinking',
        'excited',
        'delivering',
        'wink',
        'sad',
        'sleeping',
      ];
      const nextIndex = (moods.indexOf(activeMood) + 1) % moods.length;
      setInternalMood(moods[nextIndex]);
    }
  };

  const currentSpeech = speechText || moodDialogs[activeMood];

  return (
    <div
      className={`sititut-mascot-wrapper ${className} ${interactive ? 'interactive' : ''}`}
      onClick={handleMascotClick}
      title={interactive ? 'Klik SiTitut untuk melihat ekspresi lainnya!' : 'SiTitut Maskot PENS'}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: size,
        height: size,
        flexShrink: 0,
        cursor: interactive || onClick ? 'pointer' : 'default',
        userSelect: 'none',
        ...style,
      }}
    >
      {/* Interactive Speech Bubble (Duolingo Tactile Bubbly Style) */}
      {interactive && showSpeech && (
        <div
          style={{
            position: 'absolute',
            bottom: `calc(100% + ${speechOffset}px)`,
            ...(speechPlacement === 'top-left'
              ? {
                  right: '-12px',
                  animation: 'titutBubblePopRight 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                }
              : speechPlacement === 'top-right'
              ? {
                  left: '-12px',
                  animation: 'titutBubblePopLeft 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                }
              : {
                  left: '50%',
                  transform: 'translateX(-50%)',
                  animation: 'titutBubblePopCenter 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                }),
            background: '#FFFFFF',
            color: '#0F1E3D',
            fontSize: 12,
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            lineHeight: 1.38,
            padding: '9px 14px',
            borderRadius: 18,
            boxShadow: '0 8px 24px rgba(15, 30, 61, 0.12)',
            width: 'max-content',
            maxWidth: 220,
            minWidth: 120,
            whiteSpace: 'normal',
            textAlign: 'center',
            zIndex: 60,
            pointerEvents: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <span>{currentSpeech}</span>
          </div>

          {/* Tail Pointer Arrow */}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              ...(speechPlacement === 'top-left'
                ? { right: 32 }
                : speechPlacement === 'top-right'
                ? { left: 32 }
                : { left: '50%', transform: 'translateX(-50%)' }),
              width: 0,
              height: 0,
              borderLeft: '7px solid transparent',
              borderRight: '7px solid transparent',
              borderTop: '7px solid #FFFFFF',
              filter: 'drop-shadow(0 2px 2px rgba(15, 30, 61, 0.06))',
            }}
          />
        </div>
      )}

      <svg
        viewBox="0 0 200 210"
        width="100%"
        height="100%"
        style={{
          overflow: 'visible',
          transition: 'transform 0.3s ease',
          transform: isBouncing ? 'scale(1.12) translateY(-6px)' : undefined,
        }}
      >
        <defs>
          {/* Main Feather Body Gradients */}
          <linearGradient id="titut-body-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B527E" />
            <stop offset="60%" stopColor="#293C62" />
            <stop offset="100%" stopColor="#1E2C48" />
          </linearGradient>

          <linearGradient id="titut-body-highlight" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4F6D9F" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#293C62" stopOpacity="0" />
          </linearGradient>

          {/* Hoodie Gradients */}
          <linearGradient id="titut-hoodie-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1E2E52" />
            <stop offset="60%" stopColor="#16233F" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          <linearGradient id="titut-hoodie-collar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#283D6A" />
            <stop offset="100%" stopColor="#192849" />
          </linearGradient>

          {/* Backpack Gradients */}
          <linearGradient id="titut-backpack-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0EA5E9" />
            <stop offset="50%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>

          <linearGradient id="titut-strap-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>

          {/* Beak & Feet Gradients */}
          <linearGradient id="titut-beak-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FDBA74" />
            <stop offset="40%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>

          <linearGradient id="titut-feet-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#C2410C" />
          </linearGradient>

          {/* Cheek Blush Radial */}
          <radialGradient id="titut-blush-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FB7185" stopOpacity="0.45" />
            <stop offset="70%" stopColor="#FB7185" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#FB7185" stopOpacity="0" />
          </radialGradient>

          {/* Eye Star Gradient */}
          <linearGradient id="titut-star-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="50%" stopColor="#FACC15" />
            <stop offset="100%" stopColor="#EAB308" />
          </linearGradient>

          {/* Drop Shadows */}
          <filter id="titut-shadow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#0F172A" floodOpacity="0.22" />
          </filter>

          <filter id="titut-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* CSS Animation Keyframes for Mascot */}
          <style>{`
            @keyframes titutFloat {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-3.5px); }
            }
            @keyframes titutBounceJoy {
              0%, 100% { transform: translateY(0px) scale(1); }
              35% { transform: translateY(-9px) scale(0.96, 1.05); }
              55% { transform: translateY(0px) scale(1.05, 0.96); }
            }
            @keyframes titutWaveArm {
              0%, 100% { transform: rotate(0deg); }
              25% { transform: rotate(-18deg); }
              50% { transform: rotate(8deg); }
              75% { transform: rotate(-14deg); }
            }
            @keyframes titutBlink {
              0%, 94%, 100% { transform: scaleY(1); }
              97% { transform: scaleY(0.12); }
            }
            @keyframes titutThinkDots {
              0% { opacity: 0; transform: translateY(3px) scale(0.7); }
              50% { opacity: 1; transform: translateY(-2px) scale(1); }
              100% { opacity: 0; transform: translateY(-7px) scale(1.15); }
            }
            @keyframes titutTeardrop {
              0% { opacity: 0; transform: translateY(-2px); }
              30% { opacity: 0.95; }
              80% { opacity: 0.9; transform: translateY(14px); }
              100% { opacity: 0; transform: translateY(18px); }
            }
            @keyframes titutSparkleSpin {
              0% { transform: rotate(0deg) scale(0.85); opacity: 0.8; }
              50% { transform: rotate(180deg) scale(1.15); opacity: 1; }
              100% { transform: rotate(360deg) scale(0.85); opacity: 0.8; }
            }
            @keyframes titutZzz {
              0% { opacity: 0; transform: translate(0, 0) scale(0.6); }
              50% { opacity: 0.9; }
              100% { opacity: 0; transform: translate(12px, -20px) scale(1.2); }
            }
            @keyframes titutWindStreak {
              0% { stroke-dashoffset: 40; opacity: 0.2; }
              50% { opacity: 0.85; }
              100% { stroke-dashoffset: -40; opacity: 0.2; }
            }
            @keyframes titutBubblePopCenter {
              0% { opacity: 0; transform: translate(-50%, 6px) scale(0.85); }
              100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
            }
            @keyframes titutBubblePopRight {
              0% { opacity: 0; transform: translateY(6px) scale(0.85); transform-origin: bottom right; }
              100% { opacity: 1; transform: translateY(0) scale(1); transform-origin: bottom right; }
            }
            @keyframes titutBubblePopLeft {
              0% { opacity: 0; transform: translateY(6px) scale(0.85); transform-origin: bottom left; }
              100% { opacity: 1; transform: translateY(0) scale(1); transform-origin: bottom left; }
            }
          `}</style>
        </defs>

        {/* Global Animation Wrapper */}
        <g
          filter="url(#titut-shadow)"
          style={{
            animation:
              animated && activeMood === 'excited'
                ? 'titutBounceJoy 1.2s ease-in-out infinite'
                : animated && activeMood !== 'sleeping'
                ? 'titutFloat 3.2s ease-in-out infinite'
                : undefined,
            transformOrigin: '100px 180px',
          }}
        >
          {/* ─── 0. SPEED LINES (DELIVERING MOOD) ─── */}
          {activeMood === 'delivering' && (
            <g opacity="0.85">
              <line
                x1="12"
                y1="75"
                x2="45"
                y2="75"
                stroke="#38BDF8"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray="12 8"
                style={{ animation: 'titutWindStreak 0.8s linear infinite' }}
              />
              <line
                x1="8"
                y1="110"
                x2="38"
                y2="110"
                stroke="#60A5FA"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="10 6"
                style={{ animation: 'titutWindStreak 0.65s linear infinite 0.2s' }}
              />
              <line
                x1="16"
                y1="145"
                x2="42"
                y2="145"
                stroke="#93C5FD"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray="14 8"
                style={{ animation: 'titutWindStreak 0.75s linear infinite 0.4s' }}
              />
            </g>
          )}

          {/* ─── 1. GROUND SHADOW ─── */}
          <ellipse cx="102" cy="194" rx="48" ry="7" fill="#0F172A" opacity="0.18" />

          {/* ─── 2. TAIL FEATHERS (LOWER RIGHT) ─── */}
          <g>
            <path
              d="M 136 150 C 158 150 174 158 168 165 C 154 167 142 161 132 158 Z"
              fill="#1C2B4B"
              stroke="#131D33"
              strokeWidth="2"
            />
            <path
              d="M 134 156 C 152 158 164 168 158 173 C 146 172 138 166 130 162 Z"
              fill="#162238"
              stroke="#131D33"
              strokeWidth="2"
            />
          </g>

          {/* ─── 3. BACKPACK (RIGHT SIDE) ─── */}
          <g>
            {/* Top Backpack Handle */}
            <path
              d="M 144 92 C 144 80 164 80 164 92"
              fill="none"
              stroke="#0284C7"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Main Backpack Body */}
            <rect
              x="136"
              y="90"
              width="38"
              height="58"
              rx="12"
              fill="url(#titut-backpack-grad)"
              stroke="#075985"
              strokeWidth="2.5"
            />
            {/* Backpack Flap */}
            <path
              d="M 136 112 Q 155 119 174 112 L 174 98 Q 155 102 136 98 Z"
              fill="#38BDF8"
              stroke="#0284C7"
              strokeWidth="1.5"
            />
            {/* Front Pocket */}
            <rect
              x="142"
              y="118"
              width="26"
              height="22"
              rx="6"
              fill="#0284C7"
              stroke="#075985"
              strokeWidth="2"
            />
            {/* Buckle / Snap Button */}
            <circle cx="155" cy="122" r="3" fill="#E2E8F0" stroke="#64748B" strokeWidth="1" />
            {/* Zipper detail */}
            <line x1="140" y1="96" x2="170" y2="96" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="3 2" />
          </g>

          {/* ─── 4. FEET & LEGS ─── */}
          <g>
            {/* Left Leg */}
            <rect x="84" y="172" width="6" height="15" rx="3" fill="url(#titut-feet-grad)" stroke="#C2410C" strokeWidth="1.5" />
            {/* Left Foot (3 Rounded Toes) */}
            <path
              d="M 72 191 C 72 186 78 184 83 186 L 85 182 C 89 182 91 185 91 186 L 97 186 C 101 188 99 193 94 193 L 76 193 C 72 193 72 191 72 191 Z"
              fill="url(#titut-feet-grad)"
              stroke="#C2410C"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Right Leg */}
            <rect x="114" y="172" width="6" height="15" rx="3" fill="url(#titut-feet-grad)" stroke="#C2410C" strokeWidth="1.5" />
            {/* Right Foot (3 Rounded Toes) */}
            <path
              d="M 102 191 C 102 186 108 184 113 186 L 115 182 C 119 182 121 185 121 186 L 127 186 C 131 188 129 193 124 193 L 106 193 C 102 193 102 191 102 191 Z"
              fill="url(#titut-feet-grad)"
              stroke="#C2410C"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </g>

          {/* ─── 5. HEAD FEATHER TUFTS (TOP OF HEAD) ─── */}
          <g>
            <path
              d="M 94 34 C 88 18 80 18 83 28 C 81 14 96 12 101 28 C 105 18 116 21 110 34 Z"
              fill="url(#titut-body-grad)"
              stroke="#131D33"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          </g>

          {/* ─── 6. MAIN BODY (CHUBBY BIRD SILHOUETTE) ─── */}
          <path
            d="M 98 32 C 60 32 46 64 48 98 C 48 118 50 144 56 164 C 64 182 86 186 106 186 C 128 186 148 178 152 158 C 156 136 154 108 150 88 C 144 54 130 32 98 32 Z"
            fill="url(#titut-body-grad)"
            stroke="#131D33"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Body Highlight Soft Shading */}
          <path
            d="M 98 34 C 64 34 50 64 52 98 C 52 118 54 140 58 158 C 54 132 58 68 98 34 Z"
            fill="url(#titut-body-highlight)"
          />

          {/* ─── 7. WHITE BELLY (PEEKING BELOW HOODIE) ─── */}
          <path
            d="M 68 162 C 68 184 82 186 104 186 C 124 186 136 182 136 162 C 118 167 86 167 68 162 Z"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="1.5"
          />

          {/* ─── 8. HOODIE (TORSO & SLEEVES) ─── */}
          <g>
            {/* Hoodie Body Base */}
            <path
              d="M 52 106 C 50 132 54 154 58 164 C 74 168 126 168 146 160 C 148 148 150 126 146 102 C 138 90 118 86 96 86 C 72 86 56 92 52 106 Z"
              fill="url(#titut-hoodie-grad)"
              stroke="#0B1120"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Kangaroo Front Pouch */}
            <path
              d="M 68 138 C 82 142 114 142 128 138 L 124 158 C 110 162 84 162 72 158 Z"
              fill="#141E34"
              stroke="#0B1120"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Pouch hand openings */}
            <line x1="70" y1="140" x2="73" y2="156" stroke="#253556" strokeWidth="2" strokeLinecap="round" />
            <line x1="126" y1="140" x2="123" y2="156" stroke="#253556" strokeWidth="2" strokeLinecap="round" />

            {/* Bottom Waistband Ribbing */}
            <path
              d="M 58 161 C 74 166 124 166 144 158 L 142 165 C 124 171 74 171 58 165 Z"
              fill="#0F172A"
              stroke="#0B1120"
              strokeWidth="1.5"
            />

            {/* Rolled Hood Collar (Rings around the neck) */}
            <path
              d="M 54 94 C 64 84 82 82 98 82 C 116 82 134 84 142 94 C 146 104 136 114 98 116 C 58 114 48 104 54 94 Z"
              fill="url(#titut-hoodie-collar)"
              stroke="#0B1120"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* V-Neck Chest Cutout showing White Feathers */}
            <path
              d="M 82 86 L 98 108 L 114 86 Z"
              fill="#FFFFFF"
              stroke="#0B1120"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Drawstring Cords */}
            <g>
              {/* Left Cord */}
              <path d="M 89 108 Q 87 122 88 132" stroke="#0F172A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <rect x="86.5" y="131" width="3" height="6" rx="1.5" fill="#CBD5E1" stroke="#64748B" strokeWidth="0.8" />

              {/* Right Cord */}
              <path d="M 107 108 Q 109 122 108 132" stroke="#0F172A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <rect x="106.5" y="131" width="3" height="6" rx="1.5" fill="#CBD5E1" stroke="#64748B" strokeWidth="0.8" />
            </g>
          </g>

          {/* ─── 9. BACKPACK STRAP (CROSSING FRONT SHOULDER) ─── */}
          <g>
            <path
              d="M 118 90 C 132 94 142 110 144 128 C 139 130 134 130 130 127 C 128 112 120 100 112 94 Z"
              fill="url(#titut-strap-grad)"
              stroke="#0369A1"
              strokeWidth="1.8"
            />
            {/* Strap Highlight Line */}
            <path
              d="M 118 93 C 128 97 137 110 138 124"
              fill="none"
              stroke="#E0F2FE"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </g>

          {/* ─── 10. RIGHT WING / ARM (HOLDING STRAP OR CELEBRATING) ─── */}
          {activeMood === 'excited' ? (
            /* Excited: Right wing raised high in celebration */
            <g style={{ transformOrigin: '136px 110px' }}>
              <path
                d="M 134 104 C 146 92 164 72 174 76 C 180 82 174 94 166 98 C 172 102 166 112 154 116 C 146 118 138 116 134 104 Z"
                fill="url(#titut-body-grad)"
                stroke="#131D33"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
            </g>
          ) : (
            /* Normal/Resting Right wing holding backpack strap */
            <g>
              <path
                d="M 124 112 C 138 112 148 122 144 136 C 140 144 128 146 122 140 C 118 134 116 124 122 114 Z"
                fill="url(#titut-body-grad)"
                stroke="#131D33"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {/* Little wing feather grip details */}
              <path d="M 125 125 Q 130 126 132 130 M 125 132 Q 130 133 131 137" stroke="#131D33" strokeWidth="2" strokeLinecap="round" />
            </g>
          )}

          {/* ─── 11. LEFT WING / ARM (EXPRESSIVE!) ─── */}
          {activeMood === 'wave' ? (
            /* Wave Mood: Waving animated arm */
            <g
              style={{
                transformOrigin: '52px 105px',
                animation: animated ? 'titutWaveArm 1.5s ease-in-out infinite' : undefined,
              }}
            >
              <path
                d="M 52 104 C 44 94 28 80 18 84 C 12 88 16 98 22 98 C 14 98 16 108 24 107 C 18 112 22 122 30 118 C 40 114 46 110 52 104 Z"
                fill="url(#titut-body-grad)"
                stroke="#131D33"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {/* Wave Motion Sparkles */}
              <path d="M 12 76 Q 8 82 10 90" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />
              <path d="M 6 80 Q 2 86 4 94" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
            </g>
          ) : activeMood === 'thinking' ? (
            /* Thinking Mood: Wing touching chin / scratching head */
            <g>
              <path
                d="M 54 114 C 46 116 40 122 44 130 C 50 136 66 128 76 116 C 82 108 84 96 76 96 C 70 96 66 104 60 108 Z"
                fill="url(#titut-body-grad)"
                stroke="#131D33"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {/* Scratching fingers on chin */}
              <circle cx="76" cy="98" r="3.5" fill="#293C62" stroke="#131D33" strokeWidth="1.5" />
            </g>
          ) : activeMood === 'sad' ? (
            /* Sad Mood: Droopy low arm */
            <g>
              <path
                d="M 54 106 C 46 112 36 132 36 144 C 36 150 42 152 46 148 C 50 144 50 130 54 118 Z"
                fill="url(#titut-body-grad)"
                stroke="#131D33"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
            </g>
          ) : activeMood === 'excited' ? (
            /* Excited Mood: Left wing raised high in celebration */
            <g style={{ transformOrigin: '54px 108px' }}>
              <path
                d="M 54 104 C 42 92 24 72 14 76 C 8 82 14 94 22 98 C 16 102 22 112 34 116 C 42 118 50 116 54 104 Z"
                fill="url(#titut-body-grad)"
                stroke="#131D33"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
            </g>
          ) : activeMood === 'delivering' ? (
            /* Delivering Mood: Holding courier food bag! */
            <g>
              {/* Arm reaching forward */}
              <path
                d="M 54 108 C 42 106 28 116 26 128 C 26 136 34 138 42 134 C 48 130 52 122 54 114 Z"
                fill="url(#titut-body-grad)"
                stroke="#131D33"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {/* Food Bag in Hand */}
              <path
                d="M 18 126 L 36 126 L 33 154 C 33 157 19 157 19 154 Z"
                fill="#FBBF24"
                stroke="#D97706"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path d="M 23 126 C 23 118 31 118 31 126" fill="none" stroke="#B45309" strokeWidth="1.8" />
              {/* Small smiley / fork on bag */}
              <circle cx="26" cy="140" r="3.5" fill="#D97706" />
              <path d="M 24.5 140 Q 26 142 27.5 140" stroke="#FFFFFF" strokeWidth="1" fill="none" />
            </g>
          ) : activeMood === 'wink' ? (
            /* Wink Mood: Thumbs Up Wing! */
            <g>
              <path
                d="M 54 108 C 44 106 32 114 30 126 C 30 134 38 136 46 132 C 50 128 52 120 54 114 Z"
                fill="url(#titut-body-grad)"
                stroke="#131D33"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {/* Thumbs Up wing tip */}
              <path
                d="M 32 116 C 32 108 38 108 38 116 L 38 124 C 38 126 32 126 32 124 Z"
                fill="#293C62"
                stroke="#131D33"
                strokeWidth="2"
              />
            </g>
          ) : (
            /* Default / Happy: Friendly relaxed wing with rounded feathers */
            <g>
              <path
                d="M 55 104 C 42 102 26 108 22 118 C 18 126 25 132 30 128 C 24 134 30 140 37 134 C 34 140 42 142 46 134 C 52 126 55 116 55 104 Z"
                fill="url(#titut-body-grad)"
                stroke="#131D33"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
            </g>
          )}

          {/* ─── 12. WHITE CHEST & FACE MASK ─── */}
          <path
            d="M 62 86 C 60 62 76 50 98 50 C 120 50 136 62 134 86 C 132 112 116 124 98 124 C 78 124 64 112 62 86 Z"
            fill="#FFFFFF"
            stroke="#131D33"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Rosy Cheeks (Blush) */}
          <ellipse cx="66" cy="88" rx="10" ry="6" fill="url(#titut-blush-grad)" />
          <ellipse cx="128" cy="88" rx="10" ry="6" fill="url(#titut-blush-grad)" />

          {/* ─── 13. EYEBROWS (EXPRESSIVE) ─── */}
          <g>
            {activeMood === 'thinking' ? (
              <>
                {/* Left eyebrow raised high */}
                <path d="M 58 44 Q 74 36 90 46" stroke="#131D33" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                {/* Right eyebrow furrowed down */}
                <path d="M 106 56 Q 120 60 134 54" stroke="#131D33" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              </>
            ) : activeMood === 'sad' ? (
              <>
                {/* Sad arched eyebrows sloping downward */}
                <path d="M 60 58 Q 74 48 88 52" stroke="#131D33" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                <path d="M 106 52 Q 120 48 134 58" stroke="#131D33" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              </>
            ) : activeMood === 'excited' ? (
              <>
                {/* Excited high happy brows */}
                <path d="M 58 44 Q 74 36 90 44" stroke="#131D33" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                <path d="M 104 44 Q 120 36 136 44" stroke="#131D33" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              </>
            ) : activeMood === 'wink' ? (
              <>
                {/* Wink brows */}
                <path d="M 58 52 Q 74 44 90 52" stroke="#131D33" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                <path d="M 104 46 Q 120 38 136 46" stroke="#131D33" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              </>
            ) : activeMood === 'sleeping' ? (
              <>
                {/* Peaceful sleeping brows */}
                <path d="M 60 54 Q 74 52 86 54" stroke="#131D33" strokeWidth="3" strokeLinecap="round" fill="none" />
                <path d="M 108 54 Q 120 52 134 54" stroke="#131D33" strokeWidth="3" strokeLinecap="round" fill="none" />
              </>
            ) : (
              <>
                {/* Cheerful normal arched eyebrows */}
                <path d="M 60 50 Q 74 44 88 50" stroke="#131D33" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                <path d="M 106 50 Q 120 44 134 50" stroke="#131D33" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              </>
            )}
          </g>

          {/* ─── 14. EYES & PUPILS (EXPRESSIVE CORE) ─── */}
          <g
            style={{
              animation: animated && activeMood !== 'sleeping' && activeMood !== 'wink' ? 'titutBlink 4.5s ease-in-out infinite' : undefined,
              transformOrigin: '98px 74px',
            }}
          >
            {activeMood === 'sleeping' ? (
              /* Sleeping Eyes: Cute closed curved arcs */
              <g>
                <path d="M 62 76 Q 74 86 86 76" stroke="#131D33" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                <path d="M 108 76 Q 120 86 132 76" stroke="#131D33" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              </g>
            ) : activeMood === 'wink' ? (
              /* Wink: Left eye closed in a playful wink, Right eye wide with sparkle */
              <g>
                {/* Left Eye: Winking closed lash curve */}
                <path d="M 60 76 Q 74 88 88 76" stroke="#131D33" strokeWidth="4" strokeLinecap="round" fill="none" />
                <path d="M 58 74 L 54 70" stroke="#131D33" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 90 74 L 94 70" stroke="#131D33" strokeWidth="2.5" strokeLinecap="round" />

                {/* Right Eye: Wide open with star glint */}
                <ellipse cx="118" cy="74" rx="19" ry="21" fill="#FFFFFF" stroke="#131D33" strokeWidth="2.5" />
                <circle cx="116" cy="74" r="10.5" fill="#0B1120" />
                {/* Primary & secondary glints */}
                <circle cx="113" cy="71" r="4.2" fill="#FFFFFF" />
                <circle cx="120" cy="77" r="2.2" fill="#FFFFFF" />
              </g>
            ) : activeMood === 'excited' ? (
              /* Excited Eyes: 4-Point Golden Star Pupils */
              <g>
                {/* Scleras */}
                <ellipse cx="76" cy="74" rx="19" ry="21" fill="#FFFFFF" stroke="#131D33" strokeWidth="2.5" />
                <ellipse cx="118" cy="74" rx="19" ry="21" fill="#FFFFFF" stroke="#131D33" strokeWidth="2.5" />

                {/* Left Star Pupil */}
                <g style={{ transformOrigin: '76px 74px', animation: animated ? 'titutSparkleSpin 4s linear infinite' : undefined }}>
                  <path
                    d="M 76 60 L 79 70 L 89 74 L 79 78 L 76 88 L 73 78 L 63 74 L 73 70 Z"
                    fill="url(#titut-star-grad)"
                    stroke="#D97706"
                    strokeWidth="1.2"
                  />
                  <circle cx="76" cy="74" r="3" fill="#FFFFFF" />
                </g>

                {/* Right Star Pupil */}
                <g style={{ transformOrigin: '118px 74px', animation: animated ? 'titutSparkleSpin 4s linear infinite reverse' : undefined }}>
                  <path
                    d="M 118 60 L 121 70 L 131 74 L 121 78 L 118 88 L 115 78 L 105 74 L 115 70 Z"
                    fill="url(#titut-star-grad)"
                    stroke="#D97706"
                    strokeWidth="1.2"
                  />
                  <circle cx="118" cy="74" r="3" fill="#FFFFFF" />
                </g>
              </g>
            ) : activeMood === 'thinking' ? (
              /* Thinking Eyes: Pupils looking up and to the right */
              <g>
                <ellipse cx="76" cy="74" rx="19" ry="21" fill="#FFFFFF" stroke="#131D33" strokeWidth="2.5" />
                <ellipse cx="118" cy="74" rx="19" ry="21" fill="#FFFFFF" stroke="#131D33" strokeWidth="2.5" />

                {/* Left Pupil shifted up-right */}
                <circle cx="81" cy="67" r="10" fill="#0B1120" />
                <circle cx="79" cy="64" r="3.8" fill="#FFFFFF" />
                <circle cx="85" cy="70" r="1.8" fill="#FFFFFF" />

                {/* Right Pupil shifted up-right */}
                <circle cx="123" cy="67" r="10" fill="#0B1120" />
                <circle cx="121" cy="64" r="3.8" fill="#FFFFFF" />
                <circle cx="127" cy="70" r="1.8" fill="#FFFFFF" />
              </g>
            ) : activeMood === 'sad' ? (
              /* Sad Eyes: Watery sheen, slightly lowered pupils, teardrop */
              <g>
                <ellipse cx="76" cy="74" rx="19" ry="21" fill="#FFFFFF" stroke="#131D33" strokeWidth="2.5" />
                <ellipse cx="118" cy="74" rx="19" ry="21" fill="#FFFFFF" stroke="#131D33" strokeWidth="2.5" />

                {/* Lowered Pupils */}
                <circle cx="76" cy="77" r="9.5" fill="#0B1120" />
                <circle cx="74" cy="74" r="3.5" fill="#FFFFFF" />
                <circle cx="79" cy="80" r="2.2" fill="#93C5FD" opacity="0.8" />

                <circle cx="118" cy="77" r="9.5" fill="#0B1120" />
                <circle cx="116" cy="74" r="3.5" fill="#FFFFFF" />
                <circle cx="121" cy="80" r="2.2" fill="#93C5FD" opacity="0.8" />

                {/* Tear sheen at bottom of eyes */}
                <path d="M 64 82 Q 76 88 88 82" stroke="#60A5FA" strokeWidth="2.5" fill="none" opacity="0.6" />
                <path d="M 106 82 Q 118 88 130 82" stroke="#60A5FA" strokeWidth="2.5" fill="none" opacity="0.6" />

                {/* Teardrop rolling down right cheek */}
                <path
                  d="M 126 86 C 123 90 123 95 126 98 C 129 98 130 93 127 86 Z"
                  fill="#38BDF8"
                  stroke="#0284C7"
                  strokeWidth="0.8"
                  style={{
                    animation: animated ? 'titutTeardrop 2.5s ease-in infinite' : undefined,
                  }}
                />
              </g>
            ) : (
              /* Normal / Happy / Delivering: Large round sparkly pupils */
              <g>
                {/* Left Eye */}
                <ellipse cx="76" cy="74" rx="19" ry="21" fill="#FFFFFF" stroke="#131D33" strokeWidth="2.5" />
                <circle cx="77" cy="74" r="10.5" fill="#0B1120" />
                <circle cx="74" cy="71" r="4.2" fill="#FFFFFF" />
                <circle cx="81" cy="77" r="2.2" fill="#FFFFFF" />

                {/* Right Eye */}
                <ellipse cx="118" cy="74" rx="19" ry="21" fill="#FFFFFF" stroke="#131D33" strokeWidth="2.5" />
                <circle cx="116" cy="74" r="10.5" fill="#0B1120" />
                <circle cx="113" cy="71" r="4.2" fill="#FFFFFF" />
                <circle cx="120" cy="77" r="2.2" fill="#FFFFFF" />
              </g>
            )}
          </g>

          {/* ─── 15. BEAK (MOOD-DEPENDENT) ─── */}
          <g>
            {activeMood === 'excited' ? (
              /* Excited: Wide open laughing beak with pink tongue */
              <g>
                <path
                  d="M 90 84 Q 106 80 122 84 Q 116 104 106 105 Q 96 104 90 84 Z"
                  fill="#881337"
                  stroke="#131D33"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                {/* Tongue inside */}
                <path d="M 98 97 Q 106 91 114 97 Q 106 104 98 97 Z" fill="#FB7185" />
                {/* Upper Beak Lip */}
                <path
                  d="M 88 84 Q 106 79 124 84 Q 106 92 88 84 Z"
                  fill="url(#titut-beak-grad)"
                  stroke="#131D33"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </g>
            ) : activeMood === 'sad' ? (
              /* Sad: Downturned pouty beak */
              <g>
                <path
                  d="M 94 91 Q 106 84 118 91 Q 106 98 94 91 Z"
                  fill="url(#titut-beak-grad)"
                  stroke="#131D33"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                />
                {/* Pout crease */}
                <path d="M 98 96 Q 106 99 114 96" stroke="#9A3412" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              </g>
            ) : activeMood === 'thinking' ? (
              /* Thinking: Beak tilted sideways slightly */
              <g>
                <path
                  d="M 97 86 Q 108 83 119 87 Q 108 97 97 86 Z"
                  fill="url(#titut-beak-grad)"
                  stroke="#131D33"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                />
              </g>
            ) : (
              /* Cheerful Cute Orange Beak with Upper & Lower Lip */
              <g>
                <path
                  d="M 92 85 Q 106 82 120 85 Q 106 98 92 85 Z"
                  fill="url(#titut-beak-grad)"
                  stroke="#131D33"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                />
                {/* Beak top shine highlight */}
                <path
                  d="M 98 85 Q 106 83 114 85"
                  stroke="#FED7AA"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
            )}
          </g>

          {/* ─── 16. HEADWEAR & OVERLAYS ─── */}
          {/* Delivering Headband */}
          {activeMood === 'delivering' && (
            <g>
              <path
                d="M 54 48 C 70 38 126 38 142 48 L 140 56 C 124 46 72 46 56 56 Z"
                fill="#0284C7"
                stroke="#0B1120"
                strokeWidth="2"
              />
              <path
                d="M 55 50 C 70 41 125 41 141 50"
                stroke="#FACC15"
                strokeWidth="2"
                fill="none"
              />
              {/* Center Wing Emblem */}
              <circle cx="98" cy="46" r="6" fill="#F59E0B" stroke="#0B1120" strokeWidth="1.5" />
              <path d="M 95 46 L 101 46 M 98 43 L 98 49" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          )}

          {/* Thinking Floating FX: Question Mark or Thoughts */}
          {activeMood === 'thinking' && (
            <g style={{ animation: animated ? 'titutThinkDots 2.2s ease-in-out infinite' : undefined }}>
              <circle cx="146" cy="46" r="3.5" fill="#3B82F6" />
              <circle cx="154" cy="36" r="5" fill="#38BDF8" />
              <circle cx="166" cy="24" r="8" fill="#0284C7" />
              <text x="166" y="29" fill="#FFFFFF" fontSize="11" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
                ?
              </text>
            </g>
          )}

          {/* Sleeping Floating FX: Zzz */}
          {activeMood === 'sleeping' && (
            <g>
              <text
                x="142"
                y="52"
                fill="#60A5FA"
                fontSize="12"
                fontWeight="800"
                fontFamily="sans-serif"
                style={{ animation: animated ? 'titutZzz 2.6s ease-out infinite' : undefined }}
              >
                z
              </text>
              <text
                x="154"
                y="38"
                fill="#3B82F6"
                fontSize="15"
                fontWeight="900"
                fontFamily="sans-serif"
                style={{ animation: animated ? 'titutZzz 2.6s ease-out infinite 0.7s' : undefined }}
              >
                Z
              </text>
              <text
                x="166"
                y="22"
                fill="#1D4ED8"
                fontSize="19"
                fontWeight="900"
                fontFamily="sans-serif"
                style={{ animation: animated ? 'titutZzz 2.6s ease-out infinite 1.4s' : undefined }}
              >
                Z
              </text>
            </g>
          )}

          {/* Excited Floating Stars */}
          {activeMood === 'excited' && (
            <g>
              <path
                d="M 40 36 L 42 41 L 47 43 L 42 45 L 40 50 L 38 45 L 33 43 L 38 41 Z"
                fill="#FACC15"
                stroke="#D97706"
                strokeWidth="1"
                style={{ animation: animated ? 'titutSparkleSpin 3s linear infinite' : undefined, transformOrigin: '40px 43px' }}
              />
              <path
                d="M 160 38 L 162 42 L 167 44 L 162 46 L 160 50 L 158 46 L 153 44 L 158 42 Z"
                fill="#FACC15"
                stroke="#D97706"
                strokeWidth="1"
                style={{ animation: animated ? 'titutSparkleSpin 2.5s linear infinite reverse' : undefined, transformOrigin: '160px 44px' }}
              />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}

/**
 * Interactive Showcase Component for previewing all expressions of SiTitut
 */
export function SiTitutMascotShowcase() {
  const [selectedMood, setSelectedMood] = useState<MascotMood>('happy');

  const moodsList: { id: MascotMood; label: string; desc: string; badge: string }[] = [
    { id: 'happy', label: 'Ceria', desc: 'Standby & menyapa ramah', badge: 'Default' },
    { id: 'wave', label: 'Melambai', desc: 'Menyapa pengguna atau siap antar', badge: 'Aktif' },
    { id: 'thinking', label: 'Berpikir', desc: 'Sedang mencari kurir mahasiswa terdekat', badge: 'Proses' },
    { id: 'delivering', label: 'Antar Pesanan', desc: 'Kurir gaspol mengantar makanan ke lokasi', badge: 'Gaspol!' },
    { id: 'excited', label: 'Semangat', desc: 'Pesanan tiba / berhasil dibeli!', badge: 'Hooray' },
    { id: 'wink', label: 'Kedip Keren', desc: 'Pesanan siap, santai aja rek!', badge: 'Keren' },
    { id: 'sad', label: 'Sedih', desc: 'Pesanan dibatalkan atau kantin tutup', badge: 'Batal' },
    { id: 'sleeping', label: 'Istirahat', desc: 'Di luar jam operasional kantin', badge: 'Tidur' },
  ];

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 20,
        padding: '20px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 8px 30px rgba(16, 29, 58, 0.06)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🎨</span> Ragam Ekspresi Maskot SiTitut
          </h3>
          <p style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
            Maskot vektor interaktif TitutGo dengan beragam ekspresi dinamis dan animasi halus
          </p>
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            background: '#EFF6FF',
            color: '#0284C7',
            padding: '4px 10px',
            borderRadius: 9999,
          }}
        >
          Pure Vector SVG
        </span>
      </div>

      {/* Main Focus View */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle, #F0F7FF 0%, #E0F0FE 100%)',
          borderRadius: 18,
          padding: '24px 20px',
          border: '1.5px solid #BAE6FD',
          marginBottom: 16,
          position: 'relative',
        }}
      >
        <SiTitutMascot size={130} mood={selectedMood} interactive animated />
        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>
            Ekspresi: {moodsList.find((m) => m.id === selectedMood)?.label}
          </div>
          <div style={{ fontSize: 12, color: '#0284C7', fontWeight: 600, marginTop: 2 }}>
            {moodsList.find((m) => m.id === selectedMood)?.desc}
          </div>
        </div>
      </div>

      {/* Mood Selector Buttons Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
          gap: 10,
        }}
      >
        {moodsList.map((m) => {
          const isSelected = selectedMood === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setSelectedMood(m.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '10px 8px',
                borderRadius: 14,
                border: isSelected ? '2px solid #0284C7' : '1px solid #E2E8F0',
                background: isSelected ? '#EFF6FF' : '#F8FAFC',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? '0 4px 12px rgba(2, 132, 199, 0.15)' : 'none',
              }}
            >
              <SiTitutMascot size={46} mood={m.id} animated={isSelected} />
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: isSelected ? 800 : 700,
                  color: isSelected ? '#0369A1' : '#334155',
                  marginTop: 6,
                }}
              >
                {m.label}
              </span>
              <span
                style={{
                  fontSize: 9.5,
                  color: isSelected ? '#0284C7' : '#94A3B8',
                  fontWeight: 600,
                  marginTop: 2,
                }}
              >
                {m.badge}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
