import { describe, it, expect } from 'vitest';
import { AIManager } from '../../apps/agent/src/AIManager.js';
import { AIDecisionSchema, StrategyAction, ReasonCode } from '../../packages/types/src/index.js';
import { RISK_PROFILES } from '../../packages/config/src/index.js';

describe('AI Agent - Decision Safety & Schema Validation', () => {
  const balancedPolicy = RISK_PROFILES.Balanced;

  it('generates schema-valid INCREASE decision when risk is low, maturity is far, and room remains', () => {
    const context = {
      portfolio: {
        portfolioValueUsd: 1000,
        usdgAllocationBps: 8000,
        ptUsdgAllocationBps: 2000,
        usdgBalance: 800,
        ptUsdgBalance: 203,
        ptUsdgYieldBps: 710,
        daysToMaturity: 70,
        totalVaultShares: 1000,
        isPaused: false
      },
      risk: {
        liquidityScore: 88,
        priceStabilityScore: 95,
        yieldScore: 80,
        maturityRisk: 25,
        executionRisk: 10,
        concentrationRisk: 20,
        overallRisk: 26,
        riskLevel: 'LOW' as const,
        calculatedAt: Math.floor(Date.now() / 1000)
      },
      policy: balancedPolicy
    };

    const decision = AIManager.evaluateStrategy(context);
    expect(AIDecisionSchema.safeParse(decision).success).toBe(true);
    expect(decision.action).toBe(StrategyAction.INCREASE);
    expect(decision.target_allocation_bps).toBe(3000); // 20% + 10% max single rebalance
    expect(decision.reason_codes).toContain(ReasonCode.YIELD);
    expect(decision.confidence_bps).toBeGreaterThanOrEqual(8000);
  });

  it('generates schema-valid EXIT decision when maturity < 7 days', () => {
    const context = {
      portfolio: {
        portfolioValueUsd: 1000,
        usdgAllocationBps: 6000,
        ptUsdgAllocationBps: 4000,
        usdgBalance: 600,
        ptUsdgBalance: 405,
        ptUsdgYieldBps: 710,
        daysToMaturity: 4, // 4 days remaining
        totalVaultShares: 1000,
        isPaused: false
      },
      risk: {
        liquidityScore: 80,
        priceStabilityScore: 92,
        yieldScore: 75,
        maturityRisk: 90,
        executionRisk: 15,
        concentrationRisk: 35,
        overallRisk: 55,
        riskLevel: 'MODERATE' as const,
        calculatedAt: Math.floor(Date.now() / 1000)
      },
      policy: balancedPolicy
    };

    const decision = AIManager.evaluateStrategy(context);
    expect(AIDecisionSchema.safeParse(decision).success).toBe(true);
    expect(decision.action).toBe(StrategyAction.EXIT);
    expect(decision.target_allocation_bps).toBe(0);
    expect(decision.reason_codes).toContain(ReasonCode.MATURITY);
  });

  it('generates REDUCE decision when liquidity deteriorates', () => {
    const context = {
      portfolio: {
        portfolioValueUsd: 1000,
        usdgAllocationBps: 6000,
        ptUsdgAllocationBps: 4000,
        usdgBalance: 600,
        ptUsdgBalance: 405,
        ptUsdgYieldBps: 710,
        daysToMaturity: 50,
        totalVaultShares: 1000,
        isPaused: false
      },
      risk: {
        liquidityScore: 45, // Poor liquidity
        priceStabilityScore: 90,
        yieldScore: 70,
        maturityRisk: 30,
        executionRisk: 40,
        concentrationRisk: 40,
        overallRisk: 65, // Elevated overall risk
        riskLevel: 'ELEVATED' as const,
        calculatedAt: Math.floor(Date.now() / 1000)
      },
      policy: balancedPolicy
    };

    const decision = AIManager.evaluateStrategy(context);
    expect(decision.action).toBe(StrategyAction.REDUCE);
    expect(decision.target_allocation_bps).toBe(3000); // 40% - 10%
    expect(decision.reason_codes).toContain(ReasonCode.LIQUIDITY);
  });
});
