import {
  AIDecision,
  AIDecisionSchema,
  PortfolioState,
  RiskMetrics,
  StrategyAction,
  ReasonCode,
  PolicyLimits
} from '../../../packages/types/src/index.js';

export interface DecisionContext {
  portfolio: PortfolioState;
  risk: RiskMetrics;
  policy: PolicyLimits;
}

export class AIManager {
  private static decisionCounter = 1;

  /**
   * Generates a strict, bounded AI strategy decision based on deterministic market and risk inputs.
   */
  public static evaluateStrategy(context: DecisionContext): AIDecision {
    const { portfolio, risk, policy } = context;
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + 300; // 5 minute validity window

    const decisionId = `lum_${String(this.decisionCounter++).padStart(3, '0')}`;
    let action: StrategyAction = StrategyAction.HOLD;
    let targetAllocationBps = portfolio.ptUsdgAllocationBps;
    const reasonCodes: ReasonCode[] = [];
    let explanation = '';
    let confidenceBps = 8500;

    // Safety Rule 1: If days to maturity < 7 days or maturity risk >= 90, EXIT or aggressively reduce PT exposure
    if (portfolio.daysToMaturity < 7 || risk.maturityRisk >= 90) {
      if (portfolio.ptUsdgAllocationBps > 0) {
        action = StrategyAction.EXIT;
        targetAllocationBps = 0;
        reasonCodes.push(ReasonCode.MATURITY, ReasonCode.LIQUIDITY);
        explanation = `Maturity is imminent (${portfolio.daysToMaturity} days remaining). Unwinding PT-USDG into liquid USDG to eliminate maturity roll risk.`;
        confidenceBps = 9600;
      } else {
        action = StrategyAction.HOLD;
        reasonCodes.push(ReasonCode.MATURITY, ReasonCode.SAFE_HOLD);
        explanation = `PT-USDG is near maturity (${portfolio.daysToMaturity} days). Avoiding opening new positions until the next cycle.`;
        confidenceBps = 9500;
      }
    }
    // Safety Rule 2: If liquidity deteriorated (< 60) or overall risk is elevated (> 60), REDUCE PT exposure
    else if (risk.liquidityScore < 60 || risk.overallRisk > 60) {
      if (portfolio.ptUsdgAllocationBps > 1000) {
        action = StrategyAction.REDUCE;
        // Reduce by allowed single rebalance amount, without breaching lower bound
        const reductionBps = Math.min(portfolio.ptUsdgAllocationBps, policy.maxSingleRebalanceBps);
        targetAllocationBps = Math.max(0, portfolio.ptUsdgAllocationBps - reductionBps);
        reasonCodes.push(ReasonCode.LIQUIDITY, ReasonCode.VOLATILITY);
        explanation = `Market liquidity has tightened (score: ${risk.liquidityScore}/100) or overall risk increased (${risk.overallRisk}/100). Reducing PT-USDG allocation to preserve capital.`;
        confidenceBps = 8900;
      } else {
        action = StrategyAction.HOLD;
        reasonCodes.push(ReasonCode.LIQUIDITY, ReasonCode.SAFE_HOLD);
        explanation = `Market conditions require caution, but PT-USDG exposure is already at a minimal level (${portfolio.ptUsdgAllocationBps / 100}%). Holding position.`;
        confidenceBps = 8700;
      }
    }
    // Optimization Rule 3: Favorable conditions, high yield, deep liquidity, healthy maturity -> INCREASE exposure within user limits
    else if (
      risk.liquidityScore >= 75 &&
      risk.yieldScore >= 70 &&
      risk.overallRisk <= 40 &&
      portfolio.daysToMaturity >= 30 &&
      portfolio.ptUsdgAllocationBps < policy.maxPtAllocationBps
    ) {
      const roomBps = policy.maxPtAllocationBps - portfolio.ptUsdgAllocationBps;
      const increaseBps = Math.min(roomBps, policy.maxSingleRebalanceBps);
      
      if (increaseBps >= 500) {
        action = StrategyAction.INCREASE;
        targetAllocationBps = portfolio.ptUsdgAllocationBps + increaseBps;
        reasonCodes.push(ReasonCode.YIELD, ReasonCode.LIQUIDITY);
        explanation = `Attractive risk-adjusted yield (${(portfolio.ptUsdgYieldBps / 100).toFixed(2)}% APY) with strong liquidity depth (${risk.liquidityScore}/100) and ${portfolio.daysToMaturity} days to maturity. Increasing PT-USDG allocation.`;
        confidenceBps = 9100;
      } else {
        action = StrategyAction.HOLD;
        reasonCodes.push(ReasonCode.POLICY_BOUNDARY, ReasonCode.SAFE_HOLD);
        explanation = `Current PT-USDG allocation is already near user maximum policy limit (${policy.maxPtAllocationBps / 100}%). Maintaining optimal balanced posture.`;
        confidenceBps = 8800;
      }
    }
    // Default Rule 4: Stable conditions -> HOLD
    else {
      action = StrategyAction.HOLD;
      reasonCodes.push(ReasonCode.SAFE_HOLD);
      explanation = `Current PT-USDG exposure (${portfolio.ptUsdgAllocationBps / 100}%) remains within the optimal risk-adjusted envelope (Overall risk: ${risk.overallRisk}/100).`;
      confidenceBps = 8700;
    }

    const rawDecision: AIDecision = {
      decision_id: decisionId,
      action,
      asset: 'PT_USDG',
      target_allocation_bps: targetAllocationBps,
      reason_codes: reasonCodes,
      explanation,
      confidence_bps: confidenceBps,
      data_timestamp: now,
      expires_at: expiresAt
    };

    // Schema Validation (Throws if invalid)
    return AIDecisionSchema.parse(rawDecision);
  }
}
