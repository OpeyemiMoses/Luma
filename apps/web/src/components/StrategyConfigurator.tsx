import React, { useState } from 'react';
import { Sliders, Shield, Zap, CheckCircle2, Lock, Cpu } from 'lucide-react';
import { PolicyLimits } from '../../../../packages/types/src/index.js';
import { RISK_PROFILES } from '../../../../packages/config/src/index.js';

interface StrategyConfiguratorProps {
  currentPolicy: PolicyLimits;
  onUpdatePolicy: (newPolicy: PolicyLimits) => Promise<void>;
}

export const StrategyConfigurator: React.FC<StrategyConfiguratorProps> = ({
  currentPolicy,
  onUpdatePolicy
}) => {
  const [profile, setProfile] = useState<'Conservative' | 'Balanced' | 'Aggressive' | 'Custom'>(currentPolicy.profileName);
  const [maxPtBps, setMaxPtBps] = useState<number>(currentPolicy.maxPtAllocationBps);
  const [maxRebalanceBps, setMaxRebalanceBps] = useState<number>(currentPolicy.maxSingleRebalanceBps);
  const [maxSlippageBps, setMaxSlippageBps] = useState<number>(currentPolicy.maxSlippageBps);
  const [autonomous, setAutonomous] = useState<boolean>(currentPolicy.autonomousEnabled);
  const [saved, setSaved] = useState<boolean>(false);

  const handleSelectPreset = (preset: 'Conservative' | 'Balanced' | 'Aggressive') => {
    setProfile(preset);
    const p = RISK_PROFILES[preset];
    setMaxPtBps(p.maxPtAllocationBps);
    setMaxRebalanceBps(p.maxSingleRebalanceBps);
    setMaxSlippageBps(p.maxSlippageBps);
    setAutonomous(p.autonomousEnabled);
  };

  const handleSave = async () => {
    const updated: PolicyLimits = {
      profileName: profile,
      maxPtAllocationBps: maxPtBps,
      maxSingleRebalanceBps: maxRebalanceBps,
      maxSlippageBps: maxSlippageBps,
      autonomousEnabled: autonomous,
      maxDataAgeSeconds: currentPolicy.maxDataAgeSeconds,
      allowedAssets: currentPolicy.allowedAssets,
      allowedProtocols: currentPolicy.allowedProtocols
    };

    await onUpdatePolicy(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="glass-panel rounded-3xl p-6 border border-slate-800 relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <span>Strategy Policy Boundaries</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Onchain limits enforced by Policy Manager. The AI can NEVER breach these.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">
          Profile: {profile}
        </span>
      </div>

      {/* Preset Profiles */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {(['Conservative', 'Balanced', 'Aggressive'] as const).map((pName) => {
          const isActive = profile === pName;
          return (
            <button
              key={pName}
              type="button"
              onClick={() => handleSelectPreset(pName)}
              className={`p-3 rounded-2xl border text-left transition-all ${
                isActive
                  ? 'bg-gradient-to-b from-indigo-950/80 to-slate-900 border-indigo-500/80 shadow-lg shadow-indigo-950/50'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="text-xs font-bold text-white">{pName}</div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">
                Max PT: {pName === 'Conservative' ? '20%' : pName === 'Balanced' ? '40%' : '60%'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Sliders */}
      <div className="space-y-5">
        
        {/* Maximum PT Allocation */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <span>Maximum PT-USDG Allocation</span>
              <span className="text-[10px] text-slate-500">(Hard Cap)</span>
            </label>
            <span className="text-xs font-mono font-bold text-cyan-400">
              {(maxPtBps / 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="1000"
            max="8000"
            step="500"
            value={maxPtBps}
            onChange={(e) => {
              setMaxPtBps(Number(e.target.value));
              setProfile('Custom');
            }}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>10% (Defensive)</span>
            <span>80% (Max Allowed)</span>
          </div>
        </div>

        {/* Max Single Rebalance Size */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <span>Maximum Single Rebalance Step</span>
              <span className="text-[10px] text-slate-500">(Anti-Shock)</span>
            </label>
            <span className="text-xs font-mono font-bold text-indigo-400">
              {(maxRebalanceBps / 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="200"
            max="3000"
            step="100"
            value={maxRebalanceBps}
            onChange={(e) => {
              setMaxRebalanceBps(Number(e.target.value));
              setProfile('Custom');
            }}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>2%</span>
            <span>30%</span>
          </div>
        </div>

        {/* Maximum Slippage */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <span>Maximum Allowable Slippage</span>
              <span className="text-[10px] text-slate-500">(Execution Protection)</span>
            </label>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {(maxSlippageBps / 100).toFixed(1)}%
            </span>
          </div>
          <input
            type="range"
            min="20"
            max="300"
            step="10"
            value={maxSlippageBps}
            onChange={(e) => {
              setMaxSlippageBps(Number(e.target.value));
              setProfile('Custom');
            }}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
        </div>

        {/* Autonomous vs Approval Mode Toggle */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>AI Autonomous Management</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
              {autonomous
                ? 'AI executes bounded rebalances automatically on X Layer.'
                : 'Approval Mode: AI notifies Telegram; you review & sign in wallet.'}
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autonomous}
              onChange={(e) => setAutonomous(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
          </label>
        </div>

      </div>

      {/* Save Button */}
      <div className="mt-6">
        <button
          onClick={handleSave}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 active:scale-98"
        >
          {saved ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Policy Updated Onchain!</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Update Strategy Policy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
