import { MarketDataSnapshot, PortfolioState, RiskMetrics } from '../../../packages/types/src/index.js';

export class RiskCalculator {
  public static readonly VERSION = '1.0.0';

  /**
   * Calculates deterministic risk metrics based on market snapshot and portfolio state.
   */
  public static calculate(
    market: MarketDataSnapshot,
    portfolio: PortfolioState,
    targetTradeSizeUsd: number = 0
  ): RiskMetrics {
    if (market.isStale) {
      throw new Error('RiskEngineError: Stale market data provided');
    }

    const calculatedAt = Math.floor(Date.now() / 1000);

    // 1. Liquidity Score (0-100: higher is safer/deeper)
    const liquidityScore = this.calculateLiquidityScore(market.poolLiquidityUsd, portfolio.portfolioValueUsd);

    // 2. Price Stability Score (0-100: higher means tighter peg to 1.00 USD)
    const priceStabilityScore = this.calculatePriceStabilityScore(market.usdgPrice);

    // 3. Yield Score (0-100: higher means attractive risk-adjusted yield)
    const yieldScore = this.calculateYieldScore(market.ptUsdgImpliedApyBps);

    // 4. Maturity Risk (0-100: higher means closer to expiry / higher rollover urgency)
    const maturityRisk = this.calculateMaturityRisk(market.daysToMaturity);

    // 5. Execution Risk (0-100: higher means higher expected slippage/impact)
    const executionRisk = this.calculateExecutionRisk(targetTradeSizeUsd, market.poolLiquidityUsd);

    // 6. Concentration Risk (0-100: higher means overly heavy in PT vs liquid USDG)
    const concentrationRisk = this.calculateConcentrationRisk(portfolio.ptUsdgAllocationBps);

    // 7. Overall Risk Score (0-100 composite risk index)
    const overallRisk = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          (100 - liquidityScore) * 0.25 +
          (100 - priceStabilityScore) * 0.20 +
          maturityRisk * 0.25 +
          executionRisk * 0.15 +
          concentrationRisk * 0.15
        )
      )
    );

    let riskLevel: RiskMetrics['riskLevel'] = 'LOW';
    if (overallRisk > 80) riskLevel = 'HIGH';
    else if (overallRisk > 60) riskLevel = 'ELEVATED';
    else if (overallRisk > 30) riskLevel = 'MODERATE';

    return {
      liquidityScore,
      priceStabilityScore,
      yieldScore,
      maturityRisk,
      executionRisk,
      concentrationRisk,
      overallRisk,
      riskLevel,
      calculatedAt
    };
  }

  public static calculateLiquidityScore(poolLiquidityUsd: number, portfolioValueUsd: number): number {
    if (poolLiquidityUsd <= 0) return 0;
    const ratio = poolLiquidityUsd / Math.max(1, portfolioValueUsd);
    if (ratio >= 50) return 95;
    if (ratio >= 20) return 85;
    if (ratio >= 10) return 75;
    if (ratio >= 5) return 60;
    if (ratio >= 2) return 40;
    return Math.max(5, Math.round(ratio * 20));
  }

  public static calculatePriceStabilityScore(usdgPrice: number): number {
    const deviation = Math.abs(usdgPrice - 1.0);
    if (deviation <= 0.001) return 98;
    if (deviation <= 0.005) return 92;
    if (deviation <= 0.01) return 80;
    if (deviation <= 0.02) return 60;
    if (deviation <= 0.05) return 30;
    return 10;
  }

  public static calculateYieldScore(ptUsdgImpliedApyBps: number): number {
    // Benchmark risk-free stable yield ~4.5% (450 bps)
    const benchmarkBps = 450;
    if (ptUsdgImpliedApyBps <= 0) return 10;
    if (ptUsdgImpliedApyBps < benchmarkBps) return 40;
    const excessBps = ptUsdgImpliedApyBps - benchmarkBps;
    return Math.min(98, Math.round(50 + (excessBps / 300) * 40));
  }

  public static calculateMaturityRisk(daysToMaturity: number): number {
    if (daysToMaturity <= 0) return 100; // Expired / maturing today
    if (daysToMaturity < 7) return 90;   // < 7 days: Strong liquidation/rollover urgency
    if (daysToMaturity < 14) return 75;  // 7-14 days: High maturity weighting
    if (daysToMaturity < 30) return 50;  // 14-30 days: Moderate maturity weighting
    if (daysToMaturity < 60) return 30;  // 30-60 days: Normal risk
    return 15;                           // > 60 days: Low maturity risk
  }

  public static calculateExecutionRisk(targetTradeSizeUsd: number, poolLiquidityUsd: number): number {
    if (targetTradeSizeUsd <= 0 || poolLiquidityUsd <= 0) return 5;
    const impactPct = (targetTradeSizeUsd / poolLiquidityUsd) * 100;
    if (impactPct <= 0.1) return 10;
    if (impactPct <= 0.5) return 25;
    if (impactPct <= 1.0) return 50;
    if (impactPct <= 2.0) return 75;
    return 95;
  }

  public static calculateConcentrationRisk(ptUsdgAllocationBps: number): number {
    if (ptUsdgAllocationBps <= 2000) return 15;
    if (ptUsdgAllocationBps <= 4000) return 35;
    if (ptUsdgAllocationBps <= 6000) return 60;
    if (ptUsdgAllocationBps <= 8000) return 80;
    return 95;
  }
}
