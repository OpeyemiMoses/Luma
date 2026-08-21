import { DecisionAuditRecord, RiskMetrics } from '../../../packages/types/src/index.js';

export interface TelegramButton {
  text: string;
  url?: string;
  callback_data?: string;
}

export interface FormattedTelegramAlert {
  text: string;
  buttons: TelegramButton[][];
}

export class TelegramNotifier {
  private static mockHistory: FormattedTelegramAlert[] = [];

  /**
   * Formats a production rebalance execution alert for Telegram.
   */
  public static formatExecutionAlert(
    audit: DecisionAuditRecord,
    riskBefore: number,
    riskAfter: number,
    dashboardUrl: string = 'https://luma.finance/dashboard',
    explorerBaseUrl: string = 'https://www.oklink.com/xlayer/tx/'
  ): FormattedTelegramAlert {
    const beforePt = (audit.portfolioBefore.ptBps / 100).toFixed(0);
    const afterPt = audit.portfolioAfter ? (audit.portfolioAfter.ptBps / 100).toFixed(0) : (audit.targetAllocationBps / 100).toFixed(0);
    const txLink = audit.txHash ? `${explorerBaseUrl}${audit.txHash}` : undefined;

    const text =
      `🤖 <b>Luma Finance Alert</b>\n\n` +
      `<b>Portfolio rebalance executed on X Layer.</b>\n\n` +
      `<b>PT-USDG Allocation:</b>\n` +
      `${beforePt}% → ${afterPt}%\n\n` +
      `<b>Reason:</b>\n` +
      `${audit.explanation}\n\n` +
      `<b>Portfolio Risk Index:</b>\n` +
      `${riskBefore} → ${riskAfter}\n\n` +
      `<b>Decision ID:</b> <code>${audit.decisionId}</code>\n` +
      (audit.txHash ? `<b>Transaction:</b> <code>${audit.txHash.slice(0, 10)}...${audit.txHash.slice(-8)}</code>\n` : '');

    const buttons: TelegramButton[][] = [
      [
        ...(txLink ? [{ text: '🔍 View on X Layer Explorer', url: txLink }] : []),
        { text: '📊 Open Dashboard', url: dashboardUrl }
      ]
    ];

    const alert = { text, buttons };
    this.mockHistory.unshift(alert);
    return alert;
  }

  /**
   * Formats an Approval Mode review request for user signature in Web App.
   */
  public static formatApprovalRequest(
    audit: DecisionAuditRecord,
    reviewUrl: string = 'https://luma.finance/review'
  ): FormattedTelegramAlert {
    const text =
      `⚠️ <b>Luma Action Proposed (Approval Mode)</b>\n\n` +
      `AI has proposed a strategy rebalance for your portfolio:\n\n` +
      `• <b>Action:</b> ${audit.action} ${audit.targetAsset}\n` +
      `• <b>Target PT Allocation:</b> ${(audit.targetAllocationBps / 100).toFixed(0)}%\n` +
      `• <b>Reason:</b> ${audit.explanation}\n` +
      `• <b>Confidence:</b> ${(audit.confidenceBps / 100).toFixed(1)}%\n\n` +
      `<i>No funds can move without your wallet signature. Tap below to review and sign on X Layer.</i>`;

    const buttons: TelegramButton[][] = [
      [
        { text: '✍️ Review & Sign in Web App', url: `${reviewUrl}?decision=${audit.decisionId}` }
      ]
    ];

    const alert = { text, buttons };
    this.mockHistory.unshift(alert);
    return alert;
  }

  /**
   * Formats a Risk summary response for Telegram /risk command.
   */
  public static formatRiskSummary(risk: RiskMetrics): string {
    return (
      `🛡️ <b>Luma Risk Engine Status</b>\n\n` +
      `• <b>Overall Risk Score:</b> ${risk.overallRisk}/100 [<b>${risk.riskLevel}</b>]\n` +
      `• <b>Liquidity Depth:</b> ${risk.liquidityScore}/100\n` +
      `• <b>USDG Peg Stability:</b> ${risk.priceStabilityScore}/100\n` +
      `• <b>Yield Attractiveness:</b> ${risk.yieldScore}/100\n` +
      `• <b>Maturity Urgency:</b> ${risk.maturityRisk}/100\n` +
      `• <b>Execution Slippage Risk:</b> ${risk.executionRisk}/100\n\n` +
      `<i>Calculated deterministically on live X Layer data feeds.</i>`
    );
  }

  public static getRecentAlerts(): FormattedTelegramAlert[] {
    return this.mockHistory;
  }
}
