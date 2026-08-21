import React from 'react';
import { ShieldCheck, Lock, ExternalLink, AlertOctagon } from 'lucide-react';
import { NETWORKS } from '../../../../packages/config/src/index.js';

interface SecurityInspectorProps {
  isPaused: boolean;
  onTogglePause: () => void;
}

export const SecurityInspector: React.FC<SecurityInspectorProps> = ({
  isPaused,
  onTogglePause
}) => {
  const mainnet = NETWORKS.xlayerMainnet;

  return (
    <div className="glass-panel rounded-3xl p-6 border border-slate-800 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-4 mb-6 gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>X Layer Verified Contracts & Security</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographic integrity, strict allowlists, and emergency safety guarantees.
          </p>
        </div>

        <button
          onClick={onTogglePause}
          className={`px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all flex items-center gap-2 ${
            isPaused
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400 hover:bg-emerald-900'
              : 'bg-red-950/80 border-red-500/50 text-red-400 hover:bg-red-900'
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>{isPaused ? 'Resume Strategy' : 'Emergency Pause'}</span>
        </button>
      </div>

      {/* Contract Verification List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 font-mono text-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-slate-300 font-bold">USDG (Global Dollar RWA)</span>
            <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">Verified</span>
          </div>
          <a
            href={`https://www.oklink.com/xlayer/token/${mainnet.contracts.usdg}`}
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400 hover:underline text-[11px] flex items-center gap-1 mt-1 break-all"
          >
            <span>{mainnet.contracts.usdg}</span>
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 font-mono text-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-slate-300 font-bold">Pendle PT-USDG Market</span>
            <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded">29 OCT 2026</span>
          </div>
          <a
            href={`https://www.oklink.com/xlayer/address/${mainnet.contracts.ptUsdg}`}
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400 hover:underline text-[11px] flex items-center gap-1 mt-1 break-all"
          >
            <span>{mainnet.contracts.ptUsdg}</span>
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 font-mono text-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-slate-300 font-bold">Pendle Router V4 on X Layer</span>
            <span className="text-[10px] text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded">Allowlisted</span>
          </div>
          <a
            href={`https://www.oklink.com/xlayer/address/${mainnet.contracts.pendleRouter}`}
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400 hover:underline text-[11px] flex items-center gap-1 mt-1 break-all"
          >
            <span>{mainnet.contracts.pendleRouter}</span>
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 font-mono text-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-slate-300 font-bold">Luma Non-Custodial Vault & Policies</span>
            <span className="text-[10px] text-purple-400 bg-purple-950 px-2 py-0.5 rounded">OpenZeppelin</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            No arbitrary execution • Strict minAmountOut • Deterministic fail-closed
          </div>
        </div>

      </div>
    </div>
  );
};
