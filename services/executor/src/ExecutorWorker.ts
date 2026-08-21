import { ethers } from 'ethers';
import {
  AIDecision,
  DecisionAuditRecord,
  PolicyLimits,
  PortfolioState,
  RiskMetrics,
  StrategyAction
} from '../../../packages/types/src/index.js';
import { IndexerService } from '../../indexer/src/index.js';
import { RiskCalculator } from '../../risk-engine/src/index.js';
import { AIManager } from '../../../apps/agent/src/index.js';
import { AuditService } from '../../audit/src/index.js';
import { TelegramNotifier } from '../../notifications/src/index.js';

export interface CycleResult {
  decision: AIDecision;
  risk: RiskMetrics;
  policyApproved: boolean;
  policyRejectionReason?: string;
  auditRecord: DecisionAuditRecord;
  executed: boolean;
  txHash?: string;
  portfolioBefore: PortfolioState;
  portfolioAfter: PortfolioState;
}

export class ExecutorWorker {
  private indexer: IndexerService;
  private currentPortfolio: PortfolioState;

  constructor(indexer?: IndexerService, initialPortfolio?: PortfolioState) {
    this.indexer = indexer || new IndexerService();
    this.currentPortfolio = initialPortfolio || {
      portfolioValueUsd: 0,
      usdgAllocationBps: 0,
      ptUsdgAllocationBps: 0,
      usdgBalance: 0,
      ptUsdgBalance: 0,
      ptUsdgYieldBps: 710,
      daysToMaturity: 69,
      totalVaultShares: 0,
      isPaused: false
    };
  }

  public getPortfolio(): PortfolioState {
    return { ...this.currentPortfolio };
  }

  public setPortfolio(p: PortfolioState) {
    this.currentPortfolio = p;
  }

  /**
   * Runs an end-to-end strategy evaluation and bounded execution cycle.
   */
  public async runCycle(
    policy: PolicyLimits,
    userAddress: string = '0x1234567890123456789012345678901234567890'
  ): Promise<CycleResult> {
    const market = await this.indexer.getMarketDataSnapshot();

    // 1. Fail closed on stale or missing market data
    if (market.isStale) {
      throw new Error('EXECUTION_HALTED: Stale oracle / market data feed. Fail-closed triggered.');
    }

    const portfolioBefore = { ...this.currentPortfolio };

    // 2. Deterministic Risk Engine calculation
    const risk = RiskCalculator.calculate(market, portfolioBefore);

    // 3. AI Strategy Decision
    const decision = AIManager.evaluateStrategy({
      portfolio: portfolioBefore,
      risk,
      policy
    });

    // 4. Onchain / Offchain Policy Simulation Checks
    let policyApproved = true;
    let policyRejectionReason: string | undefined;

    if (portfolioBefore.isPaused) {
      policyApproved = false;
      policyRejectionReason = 'Vault is currently in emergency pause state';
    } else if (decision.target_allocation_bps > policy.maxPtAllocationBps) {
      policyApproved = false;
      policyRejectionReason = `Target PT allocation (${decision.target_allocation_bps / 100}%) exceeds user maximum limit (${policy.maxPtAllocationBps / 100}%)`;
    } else {
      const rebalanceDeltaBps = Math.abs(decision.target_allocation_bps - portfolioBefore.ptUsdgAllocationBps);
      if (rebalanceDeltaBps > policy.maxSingleRebalanceBps) {
        policyApproved = false;
        policyRejectionReason = `Rebalance size (${rebalanceDeltaBps / 100}%) exceeds user maximum single rebalance (${policy.maxSingleRebalanceBps / 100}%)`;
      }
    }

    let txHash: string | undefined;
    let executed = false;
    let portfolioAfter: PortfolioState = { ...portfolioBefore };

    // 5. Execution or Proposal dispatch
    if (policyApproved) {
      if (policy.autonomousEnabled && decision.action !== StrategyAction.HOLD) {
        // Deterministic transaction execution simulation on X Layer
        const fakeNonce = Math.floor(Math.random() * 1000000);
        txHash = ethers.keccak256(ethers.toUtf8Bytes(`xlayer_tx_${decision.decision_id}_${fakeNonce}`));
        executed = true;

        // Update portfolio state
        const targetPtBps = decision.target_allocation_bps;
        const targetUsdgBps = 10000 - targetPtBps;
        const totalVal = portfolioBefore.portfolioValueUsd;

        portfolioAfter = {
          ...portfolioBefore,
          usdgAllocationBps: targetUsdgBps,
          ptUsdgAllocationBps: targetPtBps,
          usdgBalance: (totalVal * targetUsdgBps) / 10000,
          ptUsdgBalance: ((totalVal * targetPtBps) / 10000) / market.ptUsdgPrice
        };

        this.currentPortfolio = portfolioAfter;

        // Trigger Telegram Alert
        const audit = AuditService.recordDecision(
          decision,
          portfolioBefore,
          risk,
          true,
          undefined,
          txHash,
          portfolioAfter
        );

        const newRisk = RiskCalculator.calculate(market, portfolioAfter);
        TelegramNotifier.formatExecutionAlert(audit, risk.overallRisk, newRisk.overallRisk);

        return {
          decision,
          risk,
          policyApproved: true,
          auditRecord: audit,
          executed: true,
          txHash,
          portfolioBefore,
          portfolioAfter
        };
      } else if (!policy.autonomousEnabled && decision.action !== StrategyAction.HOLD) {
        // Approval Mode: Register proposal and notify Telegram
        const audit = AuditService.recordDecision(
          decision,
          portfolioBefore,
          risk,
          true
        );
        TelegramNotifier.formatApprovalRequest(audit);

        return {
          decision,
          risk,
          policyApproved: true,
          auditRecord: audit,
          executed: false,
          portfolioBefore,
          portfolioAfter: portfolioBefore
        };
      }
    }

    // Default or Rejected
    const audit = AuditService.recordDecision(
      decision,
      portfolioBefore,
      risk,
      policyApproved,
      policyRejectionReason
    );

    return {
      decision,
      risk,
      policyApproved,
      policyRejectionReason,
      auditRecord: audit,
      executed: false,
      portfolioBefore,
      portfolioAfter: portfolioBefore
    };
  }
}
