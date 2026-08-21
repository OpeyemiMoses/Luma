import React from 'react';
import { Shield, Info, Activity, AlertTriangle, CheckCircle, Flame } from 'lucide-react';
import { RiskMetrics } from '../../../../packages/types/src/index.js';

interface RiskVisualizerProps {
  risk: RiskMetrics;
}

export const RiskVisualizer: React.FC<RiskVisualizerProps> = ({ risk }) => {
  const factors = [
    {
      name: 'Liquidity Depth Score',
      score: risk.liquidityScore,
      weight: '25%',
      desc: 'Pool depth vs rebalance capacity on Pendle X Layer',
      status: risk.liquidityScore >= 75 ? 'Optimal' : 'Caution',
      color: 'cyan'
    },
    {
      name: 'USDG Peg Stability',
      score: risk.priceStabilityScore,
      weight: '20%',
      desc: 'Deviation bounds from $1.0000 USD benchmark',
      status: risk.priceStabilityScore >= 90 ? 'Tight Peg' : 'Volatile',
      color: 'emerald'
    },
    {
      name: 'Yield Attractiveness',
      score: risk.yieldScore,
      weight: 'Metric',
      desc: 'PT implied fixed rate vs baseline risk-free rate',
      status: 'High Yield',
      color: 'indigo'
    },
    {
      name: 'Maturity Roll Urgency',
      score: risk.maturityRisk,
      weight: '25%',
      desc: 'Non-linear risk scaling as maturity approaches 0 days',
      status: risk.maturityRisk <= 35 ? 'Low Urgency' : 'Approaching Expiry',
      color: risk.maturityRisk > 60 ? 'amber' : 'purple'
    },
    {
      name: 'Execution Slippage Risk',
      score: risk.executionRisk,
      weight: '15%',
      desc: 'Estimated price impact and router fee overhead',
      status: risk.executionRisk <= 25 ? 'Low Impact' : 'High Slippage',
      color: 'pink'
    },
    {
      name: 'Concentration Bias',
      score: risk.concentrationRisk,
      weight: '15%',
      desc: 'Portfolio balance ratio between liquid and locked PT',
      status: 'Monitored',
      color: 'blue'
    }
  ];

  return (
    <div className="glass-panel rounded-3xl p-6 border border-slate-800 relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            <span>Deterministic Risk Engine v1.0</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Mathematical scoring calculated off live X Layer data. The AI does NOT create these scores.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-slate-400">Composite:</span>
          <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
            risk.riskLevel === 'LOW' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-700/50' :
            risk.riskLevel === 'MODERATE' ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-700/50' :
            'bg-amber-950/80 text-amber-400 border border-amber-700/50'
          }`}>
            {risk.overallRisk}/100 [{risk.riskLevel}]
          </span>
        </div>
      </div>

      {/* Grid of Risk Factors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {factors.map((f, i) => (
          <div key={i} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-slate-200">{f.name}</span>
              <span className="text-[10px] font-mono text-slate-400">Weight: {f.weight}</span>
            </div>

            <div className="flex items-baseline justify-between mt-2">
              <span className="text-xl font-bold font-mono text-white">
                {f.score}
                <span className="text-xs font-normal text-slate-500 font-mono">/100</span>
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                {f.status}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${
                  f.color === 'cyan' ? 'from-cyan-600 to-cyan-400' :
                  f.color === 'emerald' ? 'from-emerald-600 to-emerald-400' :
                  f.color === 'indigo' ? 'from-indigo-600 to-indigo-400' :
                  f.color === 'amber' ? 'from-amber-600 to-amber-400' :
                  f.color === 'pink' ? 'from-pink-600 to-pink-400' :
                  'from-purple-600 to-purple-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, f.score))}%` }}
              ></div>
            </div>

            <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
