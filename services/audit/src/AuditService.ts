import { ethers } from 'ethers';
import { AIDecision, DecisionAuditRecord, PortfolioState, RiskMetrics } from '../../../packages/types/src/index.js';

export class AuditService {
  private static records: Map<string, DecisionAuditRecord> = new Map();

  /**
   * Hashes and records a complete AI decision and execution audit entry.
   */
  public static recordDecision(
    decision: AIDecision,
    portfolioBefore: PortfolioState,
    risk: RiskMetrics,
    policyApproved: boolean,
    policyRejectionReason?: string,
    txHash?: string,
    portfolioAfter?: PortfolioState
  ): DecisionAuditRecord {
    const reasonCodesStr = decision.reason_codes.join(',');
    const reasonHash = ethers.keccak256(ethers.toUtf8Bytes(reasonCodesStr));
    
    const decisionHash = ethers.keccak256(
      ethers.solidityPacked(
        ['string', 'string', 'string', 'uint256', 'uint256', 'uint256', 'bytes32', 'bool'],
        [
          decision.decision_id,
          decision.action,
          decision.asset,
          decision.target_allocation_bps,
          decision.confidence_bps,
          decision.data_timestamp,
          reasonHash,
          policyApproved
        ]
      )
    );

    const record: DecisionAuditRecord = {
      decisionId: decision.decision_id,
      decisionHash,
      timestamp: decision.data_timestamp,
      action: decision.action,
      targetAsset: decision.asset,
      targetAllocationBps: decision.target_allocation_bps,
      confidenceBps: decision.confidence_bps,
      reasonCodes: decision.reason_codes,
      explanation: decision.explanation,
      portfolioBefore: {
        usdgBps: portfolioBefore.usdgAllocationBps,
        ptBps: portfolioBefore.ptUsdgAllocationBps,
        totalUsd: portfolioBefore.portfolioValueUsd
      },
      portfolioAfter: portfolioAfter ? {
        usdgBps: portfolioAfter.usdgAllocationBps,
        ptBps: portfolioAfter.ptUsdgAllocationBps,
        totalUsd: portfolioAfter.portfolioValueUsd
      } : undefined,
      policyApproved,
      policyRejectionReason,
      txHash,
      status: policyApproved ? (txHash ? 'EXECUTED' : 'APPROVED') : 'REJECTED'
    };

    this.records.set(decision.decision_id, record);
    return record;
  }

  public static getDecision(decisionId: string): DecisionAuditRecord | undefined {
    return this.records.get(decisionId);
  }

  public static getAllDecisions(): DecisionAuditRecord[] {
    return Array.from(this.records.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  public static getLatestDecision(): DecisionAuditRecord | undefined {
    const all = this.getAllDecisions();
    return all.length > 0 ? all[0] : undefined;
  }

  /**
   * Explains why a specific action or the most recent action was taken.
   */
  public static explainDecision(decisionIdOrQuery?: string): string {
    let record: DecisionAuditRecord | undefined;
    if (decisionIdOrQuery && this.records.has(decisionIdOrQuery)) {
      record = this.records.get(decisionIdOrQuery);
    } else {
      record = this.getLatestDecision();
    }

    if (!record) {
      return 'No AI decisions have been recorded yet.';
    }

    const beforePt = (record.portfolioBefore.ptBps / 100).toFixed(0);
    const afterPt = record.portfolioAfter ? (record.portfolioAfter.ptBps / 100).toFixed(0) : (record.targetAllocationBps / 100).toFixed(0);
    const date = new Date(record.timestamp * 1000).toUTCString();

    return `🤖 **Luma AI Audit Explanation [${record.decisionId}]**\n` +
      `• **Action:** ${record.action} ${record.targetAsset} (${beforePt}% → ${afterPt}%)\n` +
      `• **Reason:** ${record.explanation}\n` +
      `• **Reason Codes:** ${record.reasonCodes.join(', ')}\n` +
      `• **Confidence:** ${(record.confidenceBps / 100).toFixed(1)}%\n` +
      `• **Policy Status:** ${record.policyApproved ? '✅ Approved' : `❌ Rejected (${record.policyRejectionReason})`}\n` +
      `• **Decision Hash:** \`${record.decisionHash.slice(0, 16)}...\`\n` +
      `• **Timestamp:** ${date}\n` +
      (record.txHash ? `• **X Layer Tx:** \`${record.txHash}\`\n` : '');
  }
}
