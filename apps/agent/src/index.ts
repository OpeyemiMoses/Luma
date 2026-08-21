export * from './AIManager.js';

import { AIManager } from './AIManager.js';
import { RISK_PROFILES } from '../../../packages/config/src/index.js';

async function main() {
  console.log('🤖 Luma AI Strategy Agent Daemon initializing...');
  const sampleContext = {
    portfolio: {
      portfolioValueUsd: 1000,
      usdgAllocationBps: 8000,
      ptUsdgAllocationBps: 2000,
      usdgBalance: 800,
      ptUsdgBalance: 203,
      ptUsdgYieldBps: 710,
      daysToMaturity: 68,
      totalVaultShares: 1000,
      isPaused: false
    },
    risk: {
      liquidityScore: 85,
      priceStabilityScore: 94,
      yieldScore: 78,
      maturityRisk: 25,
      executionRisk: 12,
      concentrationRisk: 20,
      overallRisk: 28,
      riskLevel: 'LOW' as const,
      calculatedAt: Math.floor(Date.now() / 1000)
    },
    policy: RISK_PROFILES.Balanced
  };

  const decision = AIManager.evaluateStrategy(sampleContext);
  console.log('💡 AI Decision Output (Schema-Validated):');
  console.log(JSON.stringify(decision, null, 2));
}

main().catch(console.error);
