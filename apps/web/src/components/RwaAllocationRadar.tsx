import React, { useState, useRef } from 'react';

interface RwaAllocationRadarProps {
  ptUsdgValue: number;
  usdgValue: number;
  totalValue: number;
  ptPercentage: number;
  usdgPercentage: number;
  liveApy: string;
}

export const RwaAllocationRadar: React.FC<RwaAllocationRadarProps> = ({
  ptUsdgValue,
  usdgValue,
  totalValue,
  ptPercentage,
  usdgPercentage,
  liveApy
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false
  });
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y, active: true });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0, active: false });
    setHoveredSegment(null);
  };

  const rotateX = mousePos.active ? -mousePos.y * 12 : 0;
  const rotateY = mousePos.active ? mousePos.x * 12 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        width: '100%',
        height: '280px',
        backgroundColor: '#ffffff',
        borderRadius: '18px',
        padding: '1.35rem',
        color: '#0f172a',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.02)',
        border: '1px solid #e2e8f0',
        perspective: '800px',
        cursor: 'crosshair',
        userSelect: 'none'
      }}
    >
      {/* Top Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 10, position: 'relative', maxWidth: '180px' }}>
        <div>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Vault Composition
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginTop: '0.15rem' }}>
            Capital Breakdown
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', top: '1.35rem', right: '1.35rem', zIndex: 10 }}>
        <span style={{ fontSize: '0.68rem', color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.2rem 0.55rem', borderRadius: '9999px', fontWeight: 700 }}>
          ERC-4626
        </span>
      </div>

      {/* Interactive 3D Sector Canvas for Light Background */}
      <div
        style={{
          position: 'absolute',
          top: '30px',
          left: '10px',
          right: '10px',
          bottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: mousePos.active ? 'transform 0.08s ease-out' : 'transform 0.5s ease-out'
        }}
      >
        <svg viewBox="0 0 300 240" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <radialGradient id="gradPurpleLight" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="1" />
              <stop offset="70%" stopColor="#7c3aed" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.75" />
            </radialGradient>

            <radialGradient id="gradBlueLight" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="1" />
              <stop offset="70%" stopColor="#2563eb" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.75" />
            </radialGradient>

            <radialGradient id="gradGreenLight" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="1" />
              <stop offset="70%" stopColor="#059669" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0.75" />
            </radialGradient>

            <pattern id="diagonalHatchLight" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#cbd5e1" strokeWidth="1.5" />
            </pattern>
          </defs>

          <g transform="translate(130, 115)">
            <circle cx="0" cy="0" r="75" fill="none" stroke="#e2e8f0" strokeDasharray="3 3" />
            <circle cx="0" cy="0" r="50" fill="none" stroke="#f1f5f9" />

            {/* 1. Hatched Reserve Wedge */}
            <path
              d="M 0 0 L -75 10 A 75 75 0 0 0 15 75 Z"
              fill="url(#diagonalHatchLight)"
              stroke="#94a3b8"
              strokeWidth="0.75"
              style={{
                opacity: hoveredSegment && hoveredSegment !== 'hatch' ? 0.4 : 0.9,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={() => setHoveredSegment('hatch')}
            />

            {/* 2. Deployed PT-USDG (Purple Petal) */}
            <path
              d="M 0 0 L 10 -75 A 75 75 0 0 1 75 0 Z"
              fill="url(#gradPurpleLight)"
              style={{
                transform: hoveredSegment === 'pt' ? 'scale(1.06)' : 'scale(1)',
                transformOrigin: '0 0',
                opacity: hoveredSegment && hoveredSegment !== 'pt' ? 0.5 : 1,
                cursor: 'pointer',
                transition: 'all 0.25s ease'
              }}
              onMouseEnter={() => setHoveredSegment('pt')}
            />

            {/* 3. Strategy Target Allocation (Blue Petal) */}
            <path
              d="M 0 0 L -75 -15 A 75 75 0 0 1 0 -75 Z"
              fill="url(#gradBlueLight)"
              style={{
                transform: hoveredSegment === 'strat' ? 'scale(1.06)' : 'scale(1)',
                transformOrigin: '0 0',
                opacity: hoveredSegment && hoveredSegment !== 'strat' ? 0.5 : 1,
                cursor: 'pointer',
                transition: 'all 0.25s ease'
              }}
              onMouseEnter={() => setHoveredSegment('strat')}
            />

            {/* 4. Liquid USDG Reserve (Green Petal) */}
            <path
              d="M 0 0 L 75 0 A 75 75 0 0 1 65 45 Z"
              fill="url(#gradGreenLight)"
              style={{
                transform: hoveredSegment === 'usdg' ? 'scale(1.06)' : 'scale(1)',
                transformOrigin: '0 0',
                opacity: hoveredSegment && hoveredSegment !== 'usdg' ? 0.5 : 1,
                cursor: 'pointer',
                transition: 'all 0.25s ease'
              }}
              onMouseEnter={() => setHoveredSegment('usdg')}
            />

            {/* Needles */}
            <line x1="0" y1="0" x2="0" y2="-90" stroke="#94a3b8" strokeWidth="1" />
            <rect x="-3" y="-93" width="6" height="10" rx="3" fill="#64748b" />

            <line x1="0" y1="0" x2="-90" y2="0" stroke="#94a3b8" strokeWidth="1" />
            <rect x="-93" y="-3" width="10" height="6" rx="3" fill="#64748b" />

            <line x1="0" y1="0" x2="80" y2="-35" stroke="#94a3b8" strokeWidth="1" />
            <rect x="77" y="-38" width="8" height="6" rx="3" fill="#64748b" transform="rotate(25 80 -35)" />

            {/* Interactive Dynamic Needle */}
            <line
              x1="0"
              y1="0"
              x2={mousePos.active ? mousePos.x * 65 : 45}
              y2={mousePos.active ? mousePos.y * 65 : -55}
              stroke="#0f172a"
              strokeWidth="1.75"
              strokeDasharray="2 2"
              style={{ transition: 'all 0.05s ease-out' }}
            />
            <circle
              cx={mousePos.active ? mousePos.x * 65 : 45}
              cy={mousePos.active ? mousePos.y * 65 : -55}
              r="4"
              fill="#2563eb"
            />

            <circle cx="0" cy="0" r="5" fill="#0f172a" />
            <circle cx="0" cy="0" r="2" fill="#ffffff" />
          </g>
        </svg>
      </div>

      {/* Bottom Left: Total Value Display */}
      <div style={{ position: 'absolute', bottom: '1.25rem', left: '1.35rem', zIndex: 10 }}>
        <div className="font-mono font-bold" style={{ fontSize: '1.45rem', color: '#0f172a' }}>
          ${totalValue.toFixed(2)}
        </div>
        <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
          Your Vault Value
        </div>
      </div>

      {/* Floating Modern Stat Cards Grid (Bottom Right for Light Mode) */}
      <div
        style={{
          position: 'absolute',
          bottom: '1rem',
          right: '1rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 95px)',
          gap: '0.45rem',
          zIndex: 15
        }}
      >
        {/* 1. Pendle PT-USDG Card */}
        <div
          onMouseEnter={() => setHoveredSegment('pt')}
          onMouseLeave={() => setHoveredSegment(null)}
          style={{
            background: hoveredSegment === 'pt' ? '#f5f3ff' : '#f8fafc',
            border: `1px solid ${hoveredSegment === 'pt' ? '#c084fc' : '#e2e8f0'}`,
            borderRadius: '10px',
            padding: '0.55rem 0.65rem',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#7c3aed' }} />
            <span style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>PT-USDG</span>
          </div>
          <div className="font-mono font-bold" style={{ fontSize: '0.85rem', color: '#0f172a' }}>
            ${ptUsdgValue.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.58rem', color: '#7c3aed', fontWeight: 700 }}>
            7.10% Fixed
          </div>
        </div>

        {/* 2. Paxos USDG Liquid Reserve Card */}
        <div
          onMouseEnter={() => setHoveredSegment('usdg')}
          onMouseLeave={() => setHoveredSegment(null)}
          style={{
            background: hoveredSegment === 'usdg' ? '#ecfdf5' : '#f8fafc',
            border: `1px solid ${hoveredSegment === 'usdg' ? '#6ee7b7' : '#e2e8f0'}`,
            borderRadius: '10px',
            padding: '0.55rem 0.65rem',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#059669' }} />
            <span style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Liquid USDG</span>
          </div>
          <div className="font-mono font-bold" style={{ fontSize: '0.85rem', color: '#0f172a' }}>
            ${usdgValue.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.58rem', color: '#059669', fontWeight: 700 }}>
            4.50% Base
          </div>
        </div>

        {/* 3. Strategy Net APY */}
        <div
          onMouseEnter={() => setHoveredSegment('strat')}
          onMouseLeave={() => setHoveredSegment(null)}
          style={{
            background: hoveredSegment === 'strat' ? '#eff6ff' : '#f8fafc',
            border: `1px solid ${hoveredSegment === 'strat' ? '#93c5fd' : '#e2e8f0'}`,
            borderRadius: '10px',
            padding: '0.55rem 0.65rem',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#2563eb' }} />
            <span style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Net APY</span>
          </div>
          <div className="font-mono font-bold" style={{ fontSize: '0.85rem', color: '#0f172a' }}>
            {liveApy}%
          </div>
          <div style={{ fontSize: '0.58rem', color: '#2563eb', fontWeight: 700 }}>
            AI Blended
          </div>
        </div>

        {/* 4. Solvency Ratio Card */}
        <div
          onMouseEnter={() => setHoveredSegment('hatch')}
          onMouseLeave={() => setHoveredSegment(null)}
          style={{
            background: hoveredSegment === 'hatch' ? '#f1f5f9' : '#f8fafc',
            border: `1px solid ${hoveredSegment === 'hatch' ? '#94a3b8' : '#e2e8f0'}`,
            borderRadius: '10px',
            padding: '0.55rem 0.65rem',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#64748b' }} />
            <span style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Solvency</span>
          </div>
          <div className="font-mono font-bold" style={{ fontSize: '0.85rem', color: '#0f172a' }}>
            100%
          </div>
          <div style={{ fontSize: '0.58rem', color: '#64748b', fontWeight: 700 }}>
            US Treasuries
          </div>
        </div>
      </div>
    </div>
  );
};
