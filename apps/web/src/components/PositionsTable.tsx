import React from 'react';
import { Layers, Clock, ShieldCheck, ExternalLink, Zap } from 'lucide-react';
import { PortfolioState } from '../../../../packages/types/src/index.js';

interface PositionsTableProps {
  portfolio: PortfolioState;
}

export const PositionsTable: React.FC<PositionsTableProps> = ({ portfolio }) => {
  return (
    <div className="glass-panel rounded-3xl p-6 border border-slate-800 relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>Active Strategy Positions</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real RWA and Principal Token exposure on X Layer.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-mono text-emerald-400 font-semibold">Live Onchain</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800/60 text-slate-400 font-mono">
              <th className="pb-3 font-semibold">ASSET</th>
              <th className="pb-3 font-semibold">ALLOCATION</th>
              <th className="pb-3 font-semibold">VALUE (USD)</th>
              <th className="pb-3 font-semibold">BASE / FIXED APY</th>
              <th className="pb-3 font-semibold">MATURITY</th>
              <th className="pb-3 font-semibold text-right">TYPE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            
            {/* Asset 1: USDG */}
            <tr className="hover:bg-slate-900/40 transition-colors">
              <td className="py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-[11px] text-emerald-400 font-mono">
                    USDG
                  </div>
                  <div>
                    <div className="font-bold text-white">Global Dollar</div>
                    <div className="text-[10px] text-slate-400 font-mono">Paxos RWA Reserve</div>
                  </div>
                </div>
              </td>
              <td className="py-4 font-mono font-bold text-white">
                {(portfolio.usdgAllocationBps / 100).toFixed(0)}%
              </td>
              <td className="py-4 font-mono text-slate-200">
                ${portfolio.usdgBalance.toFixed(2)}
              </td>
              <td className="py-4 font-mono text-emerald-400 font-bold">
                4.50% APY
              </td>
              <td className="py-4 text-slate-400 font-mono">
                Perpetual / Liquid
              </td>
              <td className="py-4 text-right">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-800/50 text-emerald-400 font-mono text-[10px] font-bold">
                  BASE STABLE
                </span>
              </td>
            </tr>

            {/* Asset 2: PT-USDG */}
            <tr className="hover:bg-slate-900/40 transition-colors">
              <td className="py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center font-bold text-[11px] text-cyan-400 font-mono">
                    PT
                  </div>
                  <div>
                    <div className="font-bold text-white">PT-USDG (Pendle)</div>
                    <div className="text-[10px] text-slate-400 font-mono">Principal Token 29OCT2026</div>
                  </div>
                </div>
              </td>
              <td className="py-4 font-mono font-bold text-cyan-400">
                {(portfolio.ptUsdgAllocationBps / 100).toFixed(0)}%
              </td>
              <td className="py-4 font-mono text-slate-200">
                <div className="font-bold">${((portfolio.portfolioValueUsd * portfolio.ptUsdgAllocationBps) / 10000).toFixed(2)}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {portfolio.ptUsdgBalance.toFixed(2)} PT
                </div>
              </td>
              <td className="py-4 font-mono text-cyan-400 font-bold">
                {(portfolio.ptUsdgYieldBps / 100).toFixed(2)}% Fixed
              </td>
              <td className="py-4 text-amber-400 font-mono">
                <div className="flex items-center gap-1 font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{portfolio.daysToMaturity} Days Left</span>
                </div>
                <span className="text-[10px] text-slate-500 block">Oct 29, 2026</span>
              </td>
              <td className="py-4 text-right">
                <span className="px-2.5 py-1 rounded-lg bg-cyan-950/70 border border-cyan-800/50 text-cyan-400 font-mono text-[10px] font-bold">
                  RWA YIELD
                </span>
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>
  );
};
