import React, { useState } from 'react';
import { Cpu, Sparkles, CheckCircle2, XCircle, ArrowRight, ExternalLink, RefreshCw, History, ShieldAlert } from 'lucide-react';
import { AIDecision, DecisionAuditRecord } from '../../../../packages/types/src/index.js';

interface AIDecisionStreamProps {
  currentDecision: AIDecision | null;
  auditHistory: DecisionAuditRecord[];
  onTriggerCycle: () => Promise<void>;
  isProcessing: boolean;
}

export const AIDecisionStream: React.FC<AIDecisionStreamProps> = ({
  currentDecision,
  auditHistory,
  onTriggerCycle,
  isProcessing
}) => {
  return (
    <div className="glass-panel rounded-3xl p-6 border border-slate-800 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-4 mb-6 gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <span>AI Manager & Onchain Audit Trail</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Bounded strategy proposals validated through PolicyManager before execution.
          </p>
        </div>

        <button
          onClick={onTriggerCycle}
          disabled={isProcessing}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold transition-all duration-200 flex items-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Evaluating Real Data...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Trigger AI Strategy Cycle</span>
            </>
          )}
        </button>
      </div>

      {/* Latest AI Decision Card */}
      {currentDecision ? (
        <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-cyan-500/30 mb-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-3">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-cyan-400">
                Decision ID: {currentDecision.decision_id}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-[11px] font-mono text-slate-400">
                Expires in {Math.max(0, currentDecision.expires_at - Math.floor(Date.now() / 1000))}s
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-700/50">
                Schema: Zod Validated
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                currentDecision.action === 'INCREASE' ? 'bg-indigo-950 text-indigo-400 border border-indigo-700/50' :
                currentDecision.action === 'REDUCE' || currentDecision.action === 'EXIT' ? 'bg-amber-950 text-amber-400 border border-amber-700/50' :
                'bg-slate-800 text-slate-300'
              }`}>
                ACTION: {currentDecision.action}
              </span>
            </div>
          </div>

          <div className="text-sm font-medium text-slate-200 leading-relaxed">
            "{currentDecision.explanation}"
          </div>

          {/* Decision Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-800/80">
            <div>
              <span className="text-[10px] text-slate-400 block font-mono">TARGET ASSET</span>
              <span className="text-xs font-bold text-white font-mono">{currentDecision.asset}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-mono">TARGET ALLOCATION</span>
              <span className="text-xs font-bold text-cyan-400 font-mono">{(currentDecision.target_allocation_bps / 100).toFixed(0)}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-mono">CONFIDENCE</span>
              <span className="text-xs font-bold text-emerald-400 font-mono">{(currentDecision.confidence_bps / 100).toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-mono">REASON CODES</span>
              <span className="text-xs font-semibold text-slate-300 font-mono">{currentDecision.reason_codes.join(', ')}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl mb-6 text-slate-400 text-xs">
          No strategy cycle active. Click "Trigger AI Strategy Cycle" to evaluate live market data.
        </div>
      )}

      {/* Chronological Audit Table */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <History className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
            Chronological Decision Audit Log
          </h3>
        </div>

        {auditHistory.length === 0 ? (
          <div className="text-xs text-slate-500 font-mono py-2">
            No previous actions recorded in this session.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800/80 text-slate-400 font-mono">
                  <th className="pb-2">ID</th>
                  <th className="pb-2">ACTION</th>
                  <th className="pb-2">BEFORE → AFTER</th>
                  <th className="pb-2">POLICY</th>
                  <th className="pb-2 text-right">X LAYER TX</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 font-mono">
                {auditHistory.map((item) => (
                  <tr key={item.decisionId} className="hover:bg-slate-900/40">
                    <td className="py-3 font-bold text-cyan-400">{item.decisionId}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.action === 'INCREASE' ? 'bg-indigo-950 text-indigo-400' :
                        item.action === 'REDUCE' || item.action === 'EXIT' ? 'bg-amber-950 text-amber-400' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {item.action}
                      </span>
                    </td>
                    <td className="py-3 text-slate-300">
                      {(item.portfolioBefore.ptBps / 100).toFixed(0)}% → {(item.targetAllocationBps / 100).toFixed(0)}%
                    </td>
                    <td className="py-3">
                      {item.policyApproved ? (
                        <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                        </span>
                      ) : (
                        <span className="text-red-400 flex items-center gap-1 text-[11px]">
                          <XCircle className="w-3.5 h-3.5" /> Rejected
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      {item.txHash ? (
                        <a
                          href={`https://www.oklink.com/xlayer/tx/${item.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:underline flex items-center justify-end gap-1 text-[11px]"
                        >
                          <span>{item.txHash.slice(0, 6)}...{item.txHash.slice(-4)}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Held for Review</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
