import { describe, it, expect } from 'vitest';
import { ExecutorWorker } from '../../services/executor/src/ExecutorWorker.js';
import { RISK_PROFILES } from '../../packages/config/src/index.js';
import { AIManager } from '../../apps/agent/src/AIManager.js';
import { RiskCalculator } from '../../services/risk-engine/src/RiskCalculator.js';

describe('Invariant & Fuzz Safety Checks', () => {
  it('Invariant: AI target allocation can NEVER exceed user configured max PT allocation', async () => {
    const conservativePolicy = RISK_PROFILES.Conservative; // max 20%
    const balancedPolicy = RISK_PROFILES.Balanced;         // max 40%

    // Fuzz test over random market scenarios
    for (let i = 0; i < 50; i++) {
      const randomDays = Math.floor(Math.random() * 120);
      const randomLiquidity = 1000000 + Math.random() * 50000000;
      const randomPeg = 0.98 + Math.random() * 0.04;
      const randomPtBps = Math.floor(Math.random() * 10000);

      const market = {
        usdgPrice: randomPeg,
        ptUsdgPrice: 0.985,
        ptUsdgImpliedApyBps: 710,
        poolLiquidityUsd: randomLiquidity,
        maturityTimestamp: 1793232000,
        daysToMaturity: randomDays,
        oracleTimestamp: Math.floor(Date.now() / 1000),
        isStale: false,
        source: 'X Layer Pendle Market'
      };

      const portfolio = {
        portfolioValueUsd: 5000,
        usdgAllocationBps: 10000 - randomPtBps,
        ptUsdgAllocationBps: randomPtBps,
        usdgBalance: (5000 * (10000 - randomPtBps)) / 10000,
        ptUsdgBalance: (5000 * randomPtBps) / 10000,
        ptUsdgYieldBps: 710,
        daysToMaturity: randomDays,
        totalVaultShares: 5000,
        isPaused: false
      };

      const risk = RiskCalculator.calculate(market, portfolio);
      const decision = AIManager.evaluateStrategy({
        portfolio,
        risk,
        policy: conservativePolicy
      });

      if (decision.action === 'INCREASE') {
        expect(decision.target_allocation_bps).toBeLessThanOrEqual(conservativePolicy.maxPtAllocationBps);
      }
    }
  });

  it('Invariant: Paused vault rejects strategy execution attempts immediately', async () => {
    const worker = new ExecutorWorker();
    worker.setPortfolio({
      portfolioValueUsd: 1000,
      usdgAllocationBps: 8000,
      ptUsdgAllocationBps: 2000,
      usdgBalance: 800,
      ptUsdgBalance: 203,
      ptUsdgYieldBps: 710,
      daysToMaturity: 65,
      totalVaultShares: 1000,
      isPaused: true // PAUSED
    });

    const cycle = await worker.runCycle(RISK_PROFILES.Balanced);
    expect(cycle.policyApproved).toBe(false);
    expect(cycle.executed).toBe(false);
    expect(cycle.policyRejectionReason).toContain('pause');
  });
});
