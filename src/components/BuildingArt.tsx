import React from 'react';
import type { CardType, TerrainType } from '../game/types';

interface BuildingArtProps {
  type: CardType;
  level?: 1 | 2 | 3 | 4;
  isNight?: boolean;
  className?: string;
}

export const BuildingArt: React.FC<BuildingArtProps> = ({
  type,
  level = 1,
  isNight = false,
  className = 'w-full h-full',
}) => {
  const winFill = isNight ? '#fde047' : '#bae6fd';
  const winGlow = isNight ? 'drop-shadow(0 0 3px #facc15)' : undefined;

  switch (type) {
    case 'house':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <ellipse cx="32" cy="54" rx="22" ry="6" fill="rgba(15,23,42,0.18)" />
          {level === 1 && (
            <g>
              <rect x="40" y="16" width="6" height="12" rx="1.5" fill="#cbd5e1" />
              <rect x="16" y="30" width="32" height="22" rx="3" fill="#fff7ed" stroke="#fdba74" strokeWidth="1.5" />
              <polygon points="11,32 32,14 53,32" fill="#f43f5e" stroke="#be123c" strokeWidth="1.5" strokeLinejoin="round" />
              <rect x="28" y="39" width="8" height="13" rx="2" fill="#9a3412" />
              <rect x="20" y="36" width="6" height="6" rx="1.2" fill={winFill} style={{ filter: winGlow }} />
              <rect x="38" y="36" width="6" height="6" rx="1.2" fill={winFill} style={{ filter: winGlow }} />
            </g>
          )}
          {level === 2 && (
            <g>
              <rect x="14" y="22" width="36" height="30" rx="3" fill="#ffedd5" stroke="#fb923c" strokeWidth="1.5" />
              <polygon points="10,24 32,10 54,24" fill="#e11d48" stroke="#9f1239" strokeWidth="1.5" strokeLinejoin="round" />
              <rect x="18" y="28" width="7" height="6" rx="1" fill={winFill} style={{ filter: winGlow }} />
              <rect x="28.5" y="28" width="7" height="6" rx="1" fill={winFill} style={{ filter: winGlow }} />
              <rect x="39" y="28" width="7" height="6" rx="1" fill={winFill} style={{ filter: winGlow }} />
              <rect x="18" y="39" width="7" height="7" rx="1" fill={winFill} style={{ filter: winGlow }} />
              <rect x="39" y="39" width="7" height="7" rx="1" fill={winFill} style={{ filter: winGlow }} />
              <rect x="28.5" y="40" width="7" height="12" rx="1.5" fill="#9a3412" />
            </g>
          )}
          {level === 3 && (
            <g>
              <rect x="15" y="13" width="34" height="39" rx="3.5" fill="#fef2f2" stroke="#f43f5e" strokeWidth="1.6" />
              <rect x="13" y="11" width="38" height="5" rx="2" fill="#be123c" />
              {[19, 28, 37].map((y) => (
                <g key={y}>
                  <rect x="19" y={y} width="6" height="5.5" rx="1" fill={winFill} style={{ filter: winGlow }} />
                  <rect x="29" y={y} width="6" height="5.5" rx="1" fill={winFill} style={{ filter: winGlow }} />
                  <rect x="39" y={y} width="6" height="5.5" rx="1" fill={winFill} style={{ filter: winGlow }} />
                </g>
              ))}
              <rect x="27" y="44" width="10" height="8" rx="1.5" fill="#881337" />
            </g>
          )}
          {level === 4 && (
            <g>
              <line x1="32" y1="3" x2="32" y2="11" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="32" cy="4" r="2.5" fill="#fde047" />
              <rect x="17" y="10" width="30" height="42" rx="4" fill="#fff1f2" stroke="#fb7185" strokeWidth="1.6" />
              <rect x="22" y="6" width="20" height="6" rx="2" fill="#f43f5e" />
              {[15, 22, 29, 36].map((y) => (
                <g key={y}>
                  <rect x="21" y={y} width="5" height="4.5" rx="0.8" fill={isNight ? '#fde047' : '#38bdf8'} style={{ filter: winGlow }} />
                  <rect x="29.5" y={y} width="5" height="4.5" rx="0.8" fill={isNight ? '#f472b6' : '#38bdf8'} style={{ filter: winGlow }} />
                  <rect x="38" y={y} width="5" height="4.5" rx="0.8" fill={isNight ? '#fde047' : '#38bdf8'} style={{ filter: winGlow }} />
                </g>
              ))}
              <rect x="27" y="43" width="10" height="9" rx="2" fill="#fbbf24" />
            </g>
          )}
        </svg>
      );

    case 'park':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <ellipse cx="32" cy="53" rx="23" ry="6.5" fill="#86efac" opacity="0.65" />
          {level === 1 && (
            <g>
              <rect x="29" y="34" width="6" height="16" rx="2" fill="#92400e" />
              <circle cx="32" cy="26" r="13" fill="#22c55e" />
              <circle cx="24" cy="28" r="8" fill="#4ade80" />
              <circle cx="40" cy="29" r="7" fill="#16a34a" />
              <circle cx="29" cy="22" r="2.2" fill="#fda4af" />
              <circle cx="37" cy="25" r="2" fill="#fbcfe8" />
              <rect x="38" y="45" width="12" height="3.5" rx="1.2" fill="#b45309" />
            </g>
          )}
          {level === 2 && (
            <g>
              <rect x="19" y="34" width="5" height="15" rx="2" fill="#92400e" />
              <circle cx="21" cy="26" r="10" fill="#10b981" />
              <rect x="40" y="34" width="5" height="15" rx="2" fill="#92400e" />
              <circle cx="42" cy="26" r="10" fill="#22c55e" />
              <ellipse cx="32" cy="48" rx="10" ry="4.5" fill="#38bdf8" stroke="#e0f2fe" strokeWidth="1.5" />
              <path d="M32 45 C32 38, 28 38, 27 42 M32 45 C32 38, 36 38, 37 42" stroke="#bae6fd" strokeWidth="2" fill="none" strokeLinecap="round" />
              <circle cx="20" cy="22" r="2.3" fill="#f9a8d4" />
              <circle cx="43" cy="23" r="2.3" fill="#fda4af" />
            </g>
          )}
          {level === 3 && (
            <g>
              <path d="M14 48 A18 18 0 0 1 50 48 Z" fill="#ccfbf1" stroke="#14b8a6" strokeWidth="2" />
              <path d="M23 48 A18 18 0 0 1 32 30 M41 48 A18 18 0 0 0 32 30" stroke="#2dd4bf" strokeWidth="1.5" fill="none" />
              <circle cx="32" cy="41" r="7" fill="#22c55e" />
              <circle cx="25" cy="44" r="5" fill="#4ade80" />
              <circle cx="39" cy="44" r="5" fill="#10b981" />
              <circle cx="32" cy="36" r="2.2" fill="#f472b6" />
              {isNight && <circle cx="32" cy="34" r="12" fill="#5eead4" opacity="0.22" />}
            </g>
          )}
          {level === 4 && (
            <g>
              <circle cx="32" cy="34" r="20" fill="#dcfce7" stroke="#34d399" strokeWidth="2" />
              <rect x="29" y="28" width="6" height="22" rx="2" fill="#78350f" />
              <circle cx="32" cy="21" r="13" fill="#f472b6" />
              <circle cx="22" cy="25" r="8" fill="#f9a8d4" />
              <circle cx="42" cy="25" r="8" fill="#ec4899" />
              <circle cx="32" cy="17" r="4" fill="#fde047" />
              <ellipse cx="32" cy="49" rx="14" ry="4.5" fill="#38bdf8" />
            </g>
          )}
        </svg>
      );

    case 'market':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <ellipse cx="32" cy="54" rx="22" ry="6" fill="rgba(15,23,42,0.18)" />
          {level === 1 && (
            <g>
              <rect x="15" y="29" width="34" height="23" rx="2.5" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5" />
              <path d="M12 29 L16 19 H48 L52 29 Z" fill="#f59e0b" />
              <path d="M18 29 L20 19 H26 L25 29 Z M32 29 L32 19 H38 L39 29 Z M45 29 L44 19 H48 L52 29 Z" fill="#fffbeb" />
              <rect x="20" y="36" width="12" height="9" rx="1.5" fill={winFill} style={{ filter: winGlow }} />
              <rect x="36" y="38" width="8" height="14" rx="1.5" fill="#b45309" />
            </g>
          )}
          {level === 2 && (
            <g>
              <rect x="13" y="22" width="38" height="30" rx="3" fill="#fef9c3" stroke="#eab308" strokeWidth="1.5" />
              <rect x="11" y="18" width="42" height="7" rx="2" fill="#d97706" />
              <rect x="17" y="28" width="9" height="7" rx="1" fill={winFill} style={{ filter: winGlow }} />
              <rect x="28" y="28" width="9" height="7" rx="1" fill={winFill} style={{ filter: winGlow }} />
              <rect x="39" y="28" width="8" height="7" rx="1" fill={winFill} style={{ filter: winGlow }} />
              <rect x="22" y="40" width="20" height="12" rx="2" fill="#f59e0b" />
              <circle cx="32" cy="14" r="4" fill="#fbbf24" stroke="#b45309" strokeWidth="1.2" />
            </g>
          )}
          {level === 3 && (
            <g>
              <rect x="12" y="14" width="40" height="38" rx="4" fill="#fffbeb" stroke="#f59e0b" strokeWidth="1.8" />
              <rect x="16" y="9" width="32" height="7" rx="2" fill="#ea580c" />
              <rect x="17" y="21" width="30" height="7" rx="1.5" fill={winFill} style={{ filter: winGlow }} />
              <rect x="17" y="31" width="30" height="7" rx="1.5" fill={winFill} style={{ filter: winGlow }} />
              <rect x="25" y="42" width="14" height="10" rx="2" fill="#d97706" />
              <circle cx="32" cy="12.5" r="2.2" fill="#fde047" />
            </g>
          )}
          {level === 4 && (
            <g>
              <path d="M14 22 Q32 4 50 22 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1.6" />
              <rect x="11" y="22" width="42" height="30" rx="4" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.8" />
              <rect x="16" y="26" width="32" height="7" rx="2" fill={isNight ? '#fde047' : '#7dd3fc'} style={{ filter: winGlow }} />
              <rect x="16" y="36" width="32" height="6" rx="2" fill={isNight ? '#fb923c' : '#bae6fd'} style={{ filter: winGlow }} />
              <rect x="25" y="44" width="14" height="8" rx="2" fill="#b45309" />
              <circle cx="32" cy="12" r="3" fill="#fffbeb" />
            </g>
          )}
        </svg>
      );

    case 'factory':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <ellipse cx="32" cy="54" rx="22" ry="6" fill="rgba(15,23,42,0.22)" />
          {level === 1 && (
            <g>
              <rect x="40" y="13" width="8" height="20" rx="1.5" fill="#475569" />
              <circle cx="46" cy="9" r="3.5" fill="#cbd5e1" opacity="0.85" />
              <circle cx="51" cy="6" r="2.5" fill="#e2e8f0" opacity="0.7" />
              <polygon points="14,32 24,23 24,32 34,23 34,32 50,32 50,52 14,52" fill="#64748b" stroke="#334155" strokeWidth="1.5" strokeLinejoin="round" />
              <rect x="19" y="38" width="8" height="7" rx="1" fill={winFill} style={{ filter: winGlow }} />
              <rect x="31" y="38" width="8" height="7" rx="1" fill={winFill} style={{ filter: winGlow }} />
            </g>
          )}
          {level === 2 && (
            <g>
              <rect x="37" y="10" width="7" height="22" rx="1.5" fill="#334155" />
              <rect x="46" y="14" width="6" height="18" rx="1.5" fill="#475569" />
              <circle cx="43" cy="7" r="3" fill="#cbd5e1" opacity="0.85" />
              <rect x="12" y="25" width="40" height="27" rx="3" fill="#475569" stroke="#1e293b" strokeWidth="1.5" />
              <rect x="16" y="31" width="10" height="7" rx="1.2" fill={winFill} style={{ filter: winGlow }} />
              <rect x="29" y="31" width="10" height="7" rx="1.2" fill={winFill} style={{ filter: winGlow }} />
              <rect x="24" y="42" width="14" height="10" rx="1.5" fill="#f59e0b" />
            </g>
          )}
          {level === 3 && (
            <g>
              <rect x="13" y="16" width="38" height="36" rx="4" fill="#312e81" stroke="#6366f1" strokeWidth="1.8" />
              <path d="M18 16 L24 9 H40 L46 16 Z" fill="#4f46e5" />
              <rect x="18" y="24" width="28" height="6" rx="2" fill="#38bdf8" style={{ filter: winGlow }} />
              <rect x="18" y="34" width="28" height="6" rx="2" fill="#818cf8" style={{ filter: winGlow }} />
              <circle cx="32" cy="46" r="4" fill="#34d399" />
            </g>
          )}
          {level === 4 && (
            <g>
              <circle cx="32" cy="24" r="14" fill="#1e1b4b" stroke="#38bdf8" strokeWidth="2" />
              <circle cx="32" cy="24" r="7" fill="#22d3ee" style={{ filter: 'drop-shadow(0 0 6px #22d3ee)' }} />
              <rect x="14" y="34" width="36" height="18" rx="4" fill="#312e81" stroke="#818cf8" strokeWidth="1.8" />
              <rect x="20" y="39" width="24" height="5" rx="2" fill="#fde047" />
            </g>
          )}
        </svg>
      );

    case 'harbor':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <ellipse cx="32" cy="52" rx="24" ry="7" fill="#38bdf8" opacity="0.55" />
          {level === 1 && (
            <g>
              <rect x="12" y="40" width="40" height="7" rx="2" fill="#b45309" />
              <rect x="16" y="47" width="4" height="7" fill="#78350f" />
              <rect x="44" y="47" width="4" height="7" fill="#78350f" />
              <path d="M22 39 L44 39 L40 46 L26 46 Z" fill="#f8fafc" stroke="#0284c7" strokeWidth="1.5" />
              <polygon points="32,16 32,37 45,37" fill="#0ea5e9" />
              <polygon points="30,20 30,37 21,37" fill="#f43f5e" />
            </g>
          )}
          {level === 2 && (
            <g>
              <rect x="12" y="37" width="40" height="9" rx="2" fill="#0369a1" />
              <rect x="15" y="23" width="16" height="15" rx="2" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
              <polygon points="13,24 23,16 33,24" fill="#0284c7" />
              <path d="M35 37 L52 37 L49 44 L38 44 Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.4" />
              <polygon points="43,19 43,35 52,35" fill="#ffffff" />
            </g>
          )}
          {level === 3 && (
            <g>
              <rect x="12" y="38" width="40" height="10" rx="2.5" fill="#0284c7" />
              <rect x="16" y="16" width="10" height="24" rx="2" fill="#f8fafc" stroke="#0369a1" strokeWidth="1.5" />
              <rect x="16" y="21" width="10" height="4" fill="#ef4444" />
              <rect x="16" y="29" width="10" height="4" fill="#ef4444" />
              <circle cx="21" cy="14" r="4" fill="#fde047" style={{ filter: 'drop-shadow(0 0 5px #facc15)' }} />
              <rect x="30" y="26" width="10" height="12" rx="1.5" fill="#f97316" />
              <rect x="41" y="30" width="9" height="8" rx="1.5" fill="#10b981" />
            </g>
          )}
          {level === 4 && (
            <g>
              <ellipse cx="32" cy="50" rx="23" ry="7" fill="#0ea5e9" />
              <path d="M16 42 Q32 24 48 42 Z" fill="#f8fafc" stroke="#0284c7" strokeWidth="1.8" />
              <rect x="27" y="10" width="10" height="32" rx="3" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.6" />
              <circle cx="32" cy="12" r="4.5" fill="#fde047" style={{ filter: 'drop-shadow(0 0 8px #fde047)' }} />
              <rect x="29" y="20" width="6" height="4" rx="1" fill="#38bdf8" />
              <rect x="29" y="28" width="6" height="4" rx="1" fill="#38bdf8" />
            </g>
          )}
        </svg>
      );

    case 'landmark':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <ellipse cx="32" cy="54" rx="22" ry="6" fill="rgba(168,85,247,0.28)" />
          <polygon points="32,4 22,19 42,19" fill="#f59e0b" stroke="#b45309" strokeWidth="1.4" strokeLinejoin="round" />
          <rect x="21" y="19" width="22" height="33" rx="3" fill="#fdf4ff" stroke="#d946ef" strokeWidth="1.8" />
          <circle cx="32" cy="29" r="7" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" style={{ filter: winGlow }} />
          <line x1="32" y1="29" x2="32" y2="25" stroke="#7c2d12" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="32" y1="29" x2="35.5" y2="30.5" stroke="#7c2d12" strokeWidth="1.5" strokeLinecap="round" />
          <rect x="27" y="41" width="10" height="11" rx="2" fill="#a21caf" />
          <circle cx="13" cy="14" r="2.2" fill="#fde047" />
          <circle cx="51" cy="16" r="2" fill="#f472b6" />
          <circle cx="49" cy="30" r="1.6" fill="#38bdf8" />
        </svg>
      );

    case 'bulldozer':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <ellipse cx="32" cy="52" rx="21" ry="5.5" fill="rgba(15,23,42,0.18)" />
          <rect x="18" y="22" width="18" height="15" rx="3" fill="#f59e0b" stroke="#b45309" strokeWidth="1.6" />
          <rect x="22" y="25" width="10" height="7" rx="1.5" fill="#bae6fd" />
          <rect x="14" y="34" width="28" height="12" rx="3" fill="#f97316" stroke="#9a3412" strokeWidth="1.6" />
          <path d="M44 33 L53 31 L51 48 L43 46 Z" fill="#64748b" stroke="#334155" strokeWidth="1.5" strokeLinejoin="round" />
          <rect x="13" y="45" width="29" height="7" rx="3.5" fill="#1e293b" />
          <circle cx="19" cy="48.5" r="2" fill="#94a3b8" />
          <circle cx="27.5" cy="48.5" r="2" fill="#94a3b8" />
          <circle cx="36" cy="48.5" r="2" fill="#94a3b8" />
        </svg>
      );

    case 'crystal':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="crystalGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="50%" stopColor="#e879f9" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="54" rx="19" ry="5.5" fill="rgba(232,121,249,0.28)" />
          <polygon
            points="32,6 50,24 44,50 20,50 14,24"
            fill="url(#crystalGrad)"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinejoin="round"
            style={{ filter: 'drop-shadow(0 0 6px rgba(56,189,248,0.65))' }}
          />
          <polygon points="32,6 42,24 32,50 22,24" fill="rgba(255,255,255,0.34)" />
          <polygon points="32,6 50,24 42,24" fill="rgba(255,255,255,0.22)" />
          <circle cx="13" cy="14" r="2.2" fill="#fde047" />
          <circle cx="52" cy="16" r="2.4" fill="#67e8f9" />
          <circle cx="50" cy="40" r="1.8" fill="#f9a8d4" />
        </svg>
      );
  }
};

export const TerrainArt: React.FC<{
  terrain: TerrainType;
  className?: string;
}> = ({ terrain, className = 'w-full h-full' }) => {
  if (terrain === 'forest') {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <ellipse cx="32" cy="52" rx="21" ry="5.5" fill="rgba(22,101,52,0.22)" />
        <rect x="20" y="38" width="4" height="12" rx="1" fill="#78350f" />
        <polygon points="10,40 22,18 34,40" fill="#15803d" />
        <rect x="39" y="39" width="4" height="11" rx="1" fill="#78350f" />
        <polygon points="30,41 41,21 52,41" fill="#16a34a" />
        <rect x="30" y="41" width="4" height="11" rx="1" fill="#78350f" />
        <polygon points="20,44 32,20 44,44" fill="#22c55e" />
      </svg>
    );
  }
  if (terrain === 'pond') {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <ellipse cx="32" cy="36" rx="22" ry="14" fill="#0ea5e9" stroke="#bae6fd" strokeWidth="2" />
        <ellipse cx="30" cy="34" rx="14" ry="8" fill="#38bdf8" opacity="0.7" />
        <path d="M22 36 Q27 33 32 36" stroke="#e0f2fe" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <circle cx="42" cy="39" r="4" fill="#22c55e" />
        <circle cx="42" cy="38" r="1.8" fill="#f472b6" />
      </svg>
    );
  }
  if (terrain === 'hill') {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <ellipse cx="32" cy="52" rx="22" ry="5.5" fill="rgba(71,85,105,0.2)" />
        <polygon points="10,50 28,17 46,50" fill="#94a3b8" stroke="#64748b" strokeWidth="1.5" strokeLinejoin="round" />
        <polygon points="28,17 22,28 34,28" fill="#f8fafc" />
        <polygon points="28,50 42,26 55,50" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="38" cy="40" r="2.2" fill="#fbbf24" />
        <circle cx="24" cy="42" r="2" fill="#f59e0b" />
      </svg>
    );
  }
  return null;
};
