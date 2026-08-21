import React, { useState } from 'react';

export const NeonRwaChart: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');

  return (
    <div className="cyber-card">
      <div className="cyber-card-header">
        <span className="cyber-card-title">Vault Historical Yield & Benchmark APY</span>
        <div className="timeframe-pill-switch">
          {(['Daily', 'Weekly', 'Monthly'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`timeframe-btn ${timeframe === t ? 'active' : ''}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Multi-Curve Chart for Light Theme */}
      <div className="neon-chart-container">
        <svg viewBox="0 0 540 220" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <filter id="lightGlowPurple" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#9333ea" floodOpacity="0.3" />
            </filter>
            <filter id="lightGlowBlue" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#2563eb" floodOpacity="0.3" />
            </filter>
            <filter id="lightGlowGold" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#d97706" floodOpacity="0.3" />
            </filter>

            {/* Vertical grid lines */}
            <pattern id="chartVerticalGridLight" width="50" height="200" patternUnits="userSpaceOnUse">
              <line x1="50" y1="0" x2="50" y2="180" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="2 2" />
            </pattern>
          </defs>

          {/* Background Grid */}
          <rect x="40" y="10" width="490" height="170" fill="url(#chartVerticalGridLight)" />

          {/* Y Axis Labels */}
          <g fontSize="10" fill="#94a3b8" fontFamily="var(--font-mono)">
            <text x="5" y="25">8.00%</text>
            <text x="5" y="65">7.10%</text>
            <text x="5" y="105">5.50%</text>
            <text x="5" y="145">4.50%</text>
            <text x="5" y="180">0.00%</text>
          </g>

          {/* Horizontal Reference Lines */}
          <line x1="45" y1="20" x2="535" y2="20" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="45" y1="60" x2="535" y2="60" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="45" y1="100" x2="535" y2="100" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="45" y1="140" x2="535" y2="140" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="45" y1="180" x2="535" y2="180" stroke="#cbd5e1" strokeWidth="1" />

          {/* 1. Green Target Ceiling Line (7.10% APY Max Target) */}
          <line x1="45" y1="60" x2="535" y2="60" stroke="#059669" strokeWidth="1.75" />

          {/* 2. Yellow / Amber Wave (PT-USDG Fixed Yield Curve) */}
          <path
            d="M 45 60 Q 90 58 135 60 T 225 60 T 315 59 T 405 60 T 535 60"
            fill="none"
            stroke="#d97706"
            strokeWidth="2.2"
            filter="url(#lightGlowGold)"
          />

          {/* 3. Blue Wave (Paxos USDG Base Yield 4.50%) */}
          <path
            d="M 45 140 Q 95 138 145 140 T 245 139 T 345 140 T 445 141 T 535 140"
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.2"
            filter="url(#lightGlowBlue)"
          />

          {/* 4. Purple Wave (Blended Strategy Net APY) */}
          <path
            d="M 45 110 Q 95 95 145 105 T 245 80 T 345 75 T 445 68 T 535 65"
            fill="none"
            stroke="#7c3aed"
            strokeWidth="2.5"
            filter="url(#lightGlowPurple)"
          />

          {/* 5. Red Baseline Curve (Fed Funds Rate) */}
          <path
            d="M 45 155 Q 95 155 145 155 T 245 155 T 345 155 T 445 155 T 535 155"
            fill="none"
            stroke="#ef4444"
            strokeWidth="1.25"
            strokeDasharray="3 3"
          />

          {/* X Axis Dates */}
          <g fontSize="10" fill="#94a3b8" fontFamily="var(--font-mono)" textAnchor="middle">
            <text x="50" y="202">Cycle 1</text>
            <text x="105" y="202">Cycle 4</text>
            <text x="160" y="202">Cycle 8</text>
            <text x="215" y="202">Cycle 12</text>
            <text x="270" y="202">Cycle 16</text>
            <text x="325" y="202">Cycle 20</text>
            <text x="380" y="202">Cycle 24</text>
            <text x="435" y="202">Cycle 28</text>
            <text x="490" y="202">Cycle 32</text>
            <text x="530" y="202">Live</text>
          </g>
        </svg>
      </div>

      {/* Legend Row */}
      <div className="chart-legend-row">
        <div className="legend-item">
          <span className="legend-color-dot" style={{ background: '#d97706' }} />
          <span>Pendle PT-USDG (7.10% Fixed)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color-dot" style={{ background: '#2563eb' }} />
          <span>Paxos USDG (4.50% Base)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color-dot" style={{ background: '#7c3aed' }} />
          <span>Net Vault APY</span>
        </div>
        <div className="legend-item">
          <span className="legend-color-dot" style={{ background: '#059669' }} />
          <span>Max Target APY</span>
        </div>
        <div className="legend-item">
          <span className="legend-color-dot" style={{ background: '#ef4444' }} />
          <span>Fed Funds Base</span>
        </div>
      </div>
    </div>
  );
};
