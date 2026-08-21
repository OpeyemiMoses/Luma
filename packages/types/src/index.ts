import { z } from 'zod';

export enum StrategyAction {
  HOLD = 'HOLD',
  INCREASE = 'INCREASE',
  REDUCE = 'REDUCE',
  EXIT = 'EXIT'
}

export enum ReasonCode {
  LIQUIDITY = 'LIQUIDITY',
  MATURITY = 'MATURITY',
  YIELD = 'YIELD',
  VOLATILITY = 'VOLATILITY',
  REBALANCE_LIMIT = 'REBALANCE_LIMIT',
  POLICY_BOUNDARY = 'POLICY_BOUNDARY',
  SAFE_HOLD = 'SAFE_HOLD'
}

export const AIDecisionSchema = z.object({
  decision_id: z.string().min(1),
  action: z.nativeEnum(StrategyAction),
  asset: z.string().min(1),
  target_allocation_bps: z.number().int().min(0).max(10000),
  reason_codes: z.array(z.nativeEnum(ReasonCode)).min(1),
  explanation: z.string().min(10),
  confidence_bps: z.number().int().min(0).max(10000),
  data_timestamp: z.number().int().positive(),
  expires_at: z.number().int().positive()
});

export type AIDecision = z.infer<typeof AIDecisionSchema>;

export interface RiskMetrics {
  liquidityScore: number;     // 0-100 (higher = deeper liquidity / safer)
  priceStabilityScore: number;// 0-100 (higher = tighter peg / lower deviation)
  yieldScore: number;         // 0-100 (higher = attractive risk-adjusted yield)
  maturityRisk: number;       // 0-100 (higher = closer to maturity / higher urgency)
  executionRisk: number;      // 0-100 (higher = slippage/price impact risk)
  concentrationRisk: number;  // 0-100 (higher = heavy single-asset bias)
  overallRisk: number;        // 0-100 (weighted aggregate risk score)
  riskLevel: 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH';
  calculatedAt: number;
}

export interface PortfolioState {
  portfolioValueUsd: number;
  usdgAllocationBps: number;
  ptUsdgAllocationBps: number;
  usdgBalance: number;
  ptUsdgBalance: number;
  ptUsdgYieldBps: number;
  daysToMaturity: number;
  totalVaultShares: number;
  userVaultShares?: number;
  isPaused: boolean;
}

export interface PolicyLimits {
  profileName: 'Conservative' | 'Balanced' | 'Aggressive' | 'Custom';
  maxPtAllocationBps: number;    // e.g. 4000 = 40%
  maxSingleRebalanceBps: number; // e.g. 1000 = 10%
  maxSlippageBps: number;        // e.g. 100 = 1%
  autonomousEnabled: boolean;
  maxDataAgeSeconds: number;     // e.g. 300s
  allowedAssets: string[];
  allowedProtocols: string[];
}

export interface DecisionAuditRecord {
  decisionId: string;
  decisionHash: string;
  timestamp: number;
  action: StrategyAction;
  targetAsset: string;
  targetAllocationBps: number;
  confidenceBps: number;
  reasonCodes: ReasonCode[];
  explanation: string;
  portfolioBefore: {
    usdgBps: number;
    ptBps: number;
    totalUsd: number;
  };
  portfolioAfter?: {
    usdgBps: number;
    ptBps: number;
    totalUsd: number;
  };
  policyApproved: boolean;
  policyRejectionReason?: string;
  txHash?: string;
  xLayerBlockNumber?: number;
  status: 'PROPOSED' | 'APPROVED' | 'EXECUTED' | 'REJECTED' | 'EXPIRED';
}

export interface MarketDataSnapshot {
  usdgPrice: number;
  ptUsdgPrice: number;
  ptUsdgImpliedApyBps: number;
  poolLiquidityUsd: number;
  maturityTimestamp: number;
  daysToMaturity: number;
  oracleTimestamp: number;
  isStale: boolean;
  source: string;
}
