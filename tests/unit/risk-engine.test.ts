import { describe, it, expect } from 'vitest';
import { RiskCalculator } from '../../services/risk-engine/src/RiskCalculator.js';
import { MarketDataSnapshot, PortfolioState } from '../../packages/types/src/index.js';

describe('Risk Engine - Deterministic Mathematical Validation', () => {
  const baseMarket: MarketDataSnapshot = {
    usdgPrice: 1.0002,
    ptUsdgPrice: 0.985,
    ptUsdgImpliedApyBps: 710,
    poolLiquidityUsd: 12500000,
    maturityTimestamp: 1793232000,
    daysToMaturity: 70,
    oracleTimestamp: Math.floor(Date.now() / 1000),
    isStale: false,
    source: 'X Layer Pendle Market'
  };

  const basePortfolio: PortfolioState = {
    portfolioValueUsd: 1000,
    usdgAllocationBps: 7000,
    ptUsdgAllocationBps: 3000,
    usdgBalance: 700,
    ptUsdgBalance: 304.5,
    ptUsdgYieldBps: 710,
    daysToMaturity: 70,
    totalVaultShares: 1000,
    isPaused: false
  };

  it('calculates deterministic low-risk scores under normal deep liquidity conditions', () => {
    const risk = RiskCalculator.calculate(baseMarket, basePortfolio);
    expect(risk.liquidityScore).toBeGreaterThanOrEqual(80);
    expect(risk.priceStabilityScore).toBeGreaterThanOrEqual(90);
    expect(risk.maturityRisk).toBeLessThanOrEqual(30);
    expect(risk.overallRisk).toBeLessThanOrEqual(35);
    expect(risk.riskLevel).toBe('LOW');
  });

  it('correctly ramps maturity risk non-linearly as expiry approaches', () => {
    const farMarket = { ...baseMarket, daysToMaturity: 65 };
    const nearMarket = { ...baseMarket, daysToMaturity: 10 };
    const urgentMarket = { ...baseMarket, daysToMaturity: 3 };

    const farRisk = RiskCalculator.calculate(farMarket, basePortfolio);
    const nearRisk = RiskCalculator.calculate(nearMarket, basePortfolio);
    const urgentRisk = RiskCalculator.calculate(urgentMarket, basePortfolio);

    expect(farRisk.maturityRisk).toBe(15);
    expect(nearRisk.maturityRisk).toBe(75);
    expect(urgentRisk.maturityRisk).toBe(90);
    expect(urgentRisk.overallRisk).toBeGreaterThan(farRisk.overallRisk);
  });

  it('penalizes price peg deviation deterministically', () => {
    const tightPeg = { ...baseMarket, usdgPrice: 1.0001 };
    const deviatedPeg = { ...baseMarket, usdgPrice: 0.975 };

    const tightRisk = RiskCalculator.calculate(tightPeg, basePortfolio);
    const deviatedRisk = RiskCalculator.calculate(deviatedPeg, basePortfolio);

    expect(tightRisk.priceStabilityScore).toBe(98);
    expect(deviatedRisk.priceStabilityScore).toBe(30);
    expect(deviatedRisk.overallRisk).toBeGreaterThan(tightRisk.overallRisk);
  });

  it('fails closed when market data is stale', () => {
    const staleMarket = { ...baseMarket, isStale: true };
    expect(() => RiskCalculator.calculate(staleMarket, basePortfolio)).toThrow(/Stale market data/);
  });
});
