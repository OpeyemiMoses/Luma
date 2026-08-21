import React from 'react';
import { TrendingUp, ShieldCheck, DollarSign, Clock, Layers } from 'lucide-react';
import { PortfolioState, RiskMetrics } from '../../../../packages/types/src/index.js';

interface MetricsBarProps {
  portfolio: PortfolioState;
  risk: RiskMetrics;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ portfolio, risk }) => {
  const blendedApy = (
    (portfolio.usdgAllocationBps * 450 + portfolio.ptUsdgAllocationBps * portfolio.ptUsdgYieldBps) / 1000000
  ).toFixed(2);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      
      {/* Metric 1: Total Portfolio Value */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Total Portfolio Value</span>
          <div className="p-2 rounded-xl bg-cyan-950/60 text-cyan-400">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold font-mono tracking-tight text-white">
            ${portfolio.portfolioValueUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <span>Non-custodial LP Shares:</span>
            <span className="font-mono text-slate-300">{portfolio.totalVaultShares.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Metric 2: Net Blended APY */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Blended Net APY</span>
          <div className="p-2 rounded-xl bg-emerald-950/60 text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold font-mono tracking-tight text-emerald-400">
            {blendedApy}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>PT Fixed Implied:</span>
            <span className="font-mono text-cyan-400">{(portfolio.ptUsdgYieldBps / 100).toFixed(2)}%</span>
          </div>
        </div>
      </div>

      {/* Metric 3: Current PT-USDG Exposure */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">PT-USDG Allocation</span>
          <div className="p-2 rounded-xl bg-indigo-950/60 text-indigo-400">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold font-mono tracking-tight text-indigo-300">
            {(portfolio.ptUsdgAllocationBps / 100).toFixed(0)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Liquid USDG:</span>
            <span className="font-mono text-slate-300">{(portfolio.usdgAllocationBps / 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Metric 4: Deterministic Risk Score */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Overall Risk Index</span>
          <div className="p-2 rounded-xl bg-purple-950/60 text-purple-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-white">
              {risk.overallRisk}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 100</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
              risk.riskLevel === 'LOW' ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/50' :
              risk.riskLevel === 'MODERATE' ? 'bg-cyan-950 text-cyan-400 border border-cyan-700/50' :
              risk.riskLevel === 'ELEVATED' ? 'bg-amber-950 text-amber-400 border border-amber-700/50' :
              'bg-red-950 text-red-400 border border-red-700/50'
            }`}>
              {risk.riskLevel}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Deterministic Math Model
          </div>
        </div>
      </div>

      {/* Metric 5: Days to Maturity */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Time to Maturity</span>
          <div className="p-2 rounded-xl bg-amber-950/60 text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold font-mono tracking-tight text-amber-400">
            {portfolio.daysToMaturity} <span className="text-sm font-normal text-slate-400">Days</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Market Expiry: <span className="text-slate-300 font-medium">Oct 29, 2026</span>
          </div>
        </div>
      </div>

    </div>
  );
};
