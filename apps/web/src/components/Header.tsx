import React, { useState } from 'react';
import { LumaLogo } from './LumaLogo';
import { Shield, Sparkles, Send, ExternalLink, Wallet, CheckCircle2, ChevronDown, Lock } from 'lucide-react';

interface HeaderProps {
  walletAddress: string | null;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  networkName: string;
  onOpenTelegram: () => void;
  isPaused: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  walletAddress,
  onConnectWallet,
  onDisconnectWallet,
  networkName,
  onOpenTelegram,
  isPaused
}) => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#07090e]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo & Tagline */}
        <div className="flex items-center space-x-4">
          <LumaLogo size={36} variant="light" />

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                LUMA
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-700/50">
                AI RWA VAULT
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
              <span>Target:</span>
              <span className="text-cyan-400 font-semibold">{networkName}</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400">USDG + PT-USDG</span>
            </p>
          </div>
        </div>

        {/* Action Controls & Wallet */}
        <div className="flex items-center space-x-3">
          
          {/* Pause Status indicator if paused */}
          {isPaused && (
            <div className="px-3 py-1.5 rounded-lg bg-red-950/70 border border-red-500/40 text-red-400 text-xs font-semibold flex items-center gap-1.5 animate-pulse">
              <Lock className="w-3.5 h-3.5" />
              <span>VAULT PAUSED</span>
            </div>
          )}

          {/* Telegram Link Button */}
          <button
            onClick={onOpenTelegram}
            className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 border border-slate-700/60 transition-all duration-200 text-xs font-medium flex items-center gap-2"
            title="Link Telegram Bot for real-time alerts and commands"
          >
            <Send className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Telegram Bot</span>
          </button>

          {/* Wallet Button */}
          {walletAddress ? (
            <button
              onClick={onDisconnectWallet}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-950/90 to-indigo-950/90 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 text-xs font-mono font-medium transition-all duration-200 flex items-center gap-2 shadow-lg shadow-cyan-950/50"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span>{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
            </button>
          ) : (
            <button
              onClick={onConnectWallet}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-95"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Connect Wallet</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
