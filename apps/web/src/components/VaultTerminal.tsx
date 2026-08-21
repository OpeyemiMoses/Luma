import React, { useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { PortfolioState } from '../../../../packages/types/src/index.js';

interface VaultTerminalProps {
  portfolio: PortfolioState;
  walletAddress: string | null;
  onDeposit: (amountUsd: number) => Promise<void>;
  onWithdraw: (shares: number) => Promise<void>;
}

export const VaultTerminal: React.FC<VaultTerminalProps> = ({
  portfolio,
  walletAddress,
  onDeposit,
  onWithdraw
}) => {
  const [tab, setTab] = useState<'DEPOSIT' | 'WITHDRAW'>('DEPOSIT');
  const [amount, setAmount] = useState<string>('1000');
  const [loading, setLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress) {
      setErrorMsg('Please connect your wallet first');
      return;
    }

    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setErrorMsg('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (tab === 'DEPOSIT') {
        await onDeposit(val);
        setSuccessMsg(`Successfully deposited $${val.toFixed(2)} USDG into Luma Vault on X Layer.`);
      } else {
        await onWithdraw(val);
        setSuccessMsg(`Successfully redeemed ${val.toFixed(2)} shares back to your connected wallet.`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 border border-slate-800 relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Vault Terminal</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
              ERC-4626
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Non-custodial smart contract deposits & direct withdrawals.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => { setTab('DEPOSIT'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tab === 'DEPOSIT'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Deposit
          </button>
          <button
            onClick={() => { setTab('WITHDRAW'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tab === 'WITHDRAW'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Withdraw
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Asset Selection */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            {tab === 'DEPOSIT' ? 'Deposit Asset' : 'Withdrawal Asset'}
          </label>
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-xs text-slate-950 font-mono">
                USDG
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Global Dollar (USDG)</div>
                <div className="text-[10px] text-slate-400 font-mono">Paxos RWA Asset on X Layer</div>
              </div>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/40">
              Verified
            </span>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-medium text-slate-400">
              {tab === 'DEPOSIT' ? 'Amount (USD)' : 'Shares to Burn'}
            </label>
            <span className="text-xs font-mono text-slate-400">
              {tab === 'DEPOSIT' ? 'Wallet Balance: $5,000.00' : `Vault Shares: ${portfolio.totalVaultShares.toFixed(2)}`}
            </span>
          </div>

          <div className="relative">
            <input
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-3.5 text-lg font-mono font-bold text-white focus:outline-none focus:border-cyan-500/80 transition-all pr-24"
              placeholder="0.00"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setAmount(tab === 'DEPOSIT' ? '1000' : portfolio.totalVaultShares.toString())}
                className="px-2.5 py-1 text-[11px] font-bold font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-all"
              >
                MAX
              </button>
              <span className="text-xs font-bold text-slate-400 font-mono">
                {tab === 'DEPOSIT' ? 'USDG' : 'SHARES'}
              </span>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 rounded-2xl font-bold text-sm tracking-wide text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-lg active:scale-98 ${
            tab === 'DEPOSIT'
              ? 'bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-cyan-500/25'
              : 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 shadow-pink-500/25'
          } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Confirming on X Layer...</span>
            </>
          ) : tab === 'DEPOSIT' ? (
            <>
              <ArrowDownToLine className="w-4 h-4" />
              <span>Deposit to Luma Vault</span>
            </>
          ) : (
            <>
              <ArrowUpFromLine className="w-4 h-4" />
              <span>Redeem Shares & Withdraw</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
