import {
  PortfolioState,
  RiskMetrics,
  PolicyLimits
} from '../../../packages/types/src/index.js';
import { AuditService } from '../../../services/audit/src/index.js';
import { TelegramNotifier } from '../../../services/notifications/src/index.js';

export class TelegramBotService {
  /**
   * Dispatches incoming Telegram command strings and returns formatted markdown / HTML response.
   */
  public static handleCommand(
    command: string,
    portfolio: PortfolioState,
    risk: RiskMetrics,
    policy: PolicyLimits,
    vaultAddress: string = '0xLumaVaultXLayer00000000000000000000001'
  ): { text: string; buttons?: { text: string; url?: string }[][] } {
    const trimmed = command.trim().toLowerCase();
    const cmd = trimmed.split(' ')[0];
    const arg = trimmed.split(' ').slice(1).join(' ');

    switch (cmd) {
      case '/start':
      case '/help':
        return {
          text:
            `🤖 <b>Welcome to Luma Finance on X Layer</b>\n\n` +
            `AI-managed RWA Strategy Vault with onchain-enforced safety boundaries.\n\n` +
            `<b>Available Commands:</b>\n` +
            `• <code>/portfolio</code> - Current holdings & allocation\n` +
            `• <code>/risk</code> - Real-time deterministic risk engine scores\n` +
            `• <code>/yield</code> - USDG + PT-USDG blended APY\n` +
            `• <code>/history</code> - Chronological AI decisions & onchain transactions\n` +
            `• <code>/why [decision_id]</code> - Transparent reasoning behind AI decisions\n` +
            `• <code>/vault</code> - Vault contract addresses and active policy\n` +
            `• <code>/pause</code> - Emergency strategy pause status\n`,
          buttons: [
            [{ text: '🌐 Launch Web App', url: 'https://luma.finance' }]
          ]
        };

      case '/portfolio':
        return {
          text:
            `💼 <b>Luma Strategy Portfolio</b>\n\n` +
            `• <b>Total Value:</b> $${portfolio.portfolioValueUsd.toLocaleString()}\n` +
            `• <b>USDG Allocation:</b> ${(portfolio.usdgAllocationBps / 100).toFixed(0)}% ($${portfolio.usdgBalance.toFixed(2)})\n` +
            `• <b>PT-USDG Allocation:</b> ${(portfolio.ptUsdgAllocationBps / 100).toFixed(0)}% (${portfolio.ptUsdgBalance.toFixed(2)} PT)\n` +
            `• <b>Days to Maturity:</b> ${portfolio.daysToMaturity} days\n` +
            `• <b>Risk Status:</b> <b>${risk.riskLevel}</b> (${risk.overallRisk}/100)\n` +
            `• <b>Vault Status:</b> ${portfolio.isPaused ? '🔴 PAUSED' : '🟢 ACTIVE'}\n`,
          buttons: [
            [{ text: '⚙️ Configure Strategy', url: 'https://luma.finance/strategy' }]
          ]
        };

      case '/risk':
        return {
          text: TelegramNotifier.formatRiskSummary(risk)
        };

      case '/yield':
        const blendedApy = (
          (portfolio.usdgAllocationBps * 450 + portfolio.ptUsdgAllocationBps * portfolio.ptUsdgYieldBps) / 1000000
        ).toFixed(2);
        return {
          text:
            `📈 <b>Luma Yield Metrics</b>\n\n` +
            `• <b>Blended Vault APY:</b> <b>${blendedApy}%</b>\n` +
            `• <b>PT-USDG Implied Fixed APY:</b> ${(portfolio.ptUsdgYieldBps / 100).toFixed(2)}%\n` +
            `• <b>USDG Base RWA Yield:</b> 4.50%\n` +
            `• <b>Maturity Date:</b> Oct 29, 2026\n` +
            `• <b>Execution Route:</b> Pendle Market on X Layer\n`
        };

      case '/history':
        const decisions = AuditService.getAllDecisions();
        if (decisions.length === 0) {
          return { text: '📜 No AI actions recorded yet.' };
        }
        let historyMsg = `📜 <b>Luma AI Decision History</b>\n\n`;
        decisions.slice(0, 5).forEach((d) => {
          const date = new Date(d.timestamp * 1000).toLocaleDateString();
          historyMsg += `• <b>${d.decisionId}</b> | <b>${d.action}</b> ${d.targetAsset} to ${(d.targetAllocationBps / 100).toFixed(0)}%\n` +
            `  <i>${d.explanation}</i>\n` +
            (d.txHash ? `  Tx: <code>${d.txHash.slice(0, 10)}...</code>\n` : `  Status: ${d.status}\n`) +
            `  Date: ${date}\n\n`;
        });
        return { text: historyMsg };

      case '/why':
        return {
          text: AuditService.explainDecision(arg.length > 0 ? arg : undefined)
        };

      case '/vault':
        return {
          text:
            `🏛️ <b>Luma Vault & Policy Details</b>\n\n` +
            `• <b>Vault Contract:</b> <code>${vaultAddress}</code>\n` +
            `• <b>Network:</b> X Layer (Chain ID: 196)\n` +
            `• <b>Active Profile:</b> ${policy.profileName}\n` +
            `• <b>Max PT Allocation:</b> ${(policy.maxPtAllocationBps / 100).toFixed(0)}%\n` +
            `• <b>Max Single Rebalance:</b> ${(policy.maxSingleRebalanceBps / 100).toFixed(0)}%\n` +
            `• <b>Max Slippage:</b> ${(policy.maxSlippageBps / 100).toFixed(1)}%\n` +
            `• <b>Autonomous Rebalance:</b> ${policy.autonomousEnabled ? '✅ ON' : '⏸️ OFF (Approval Mode)'}\n`
        };

      case '/pause':
        return {
          text:
            `🛑 <b>Emergency Strategy Controls</b>\n\n` +
            `Vault Status: ${portfolio.isPaused ? '🔴 PAUSED' : '🟢 ACTIVE'}\n\n` +
            `<i>Emergency pause stops all autonomous AI rebalancing immediately while preserving non-custodial user withdrawal rights.</i>`,
          buttons: [
            [{ text: '🛡️ Emergency Controls on Web', url: 'https://luma.finance/security' }]
          ]
        };

      default:
        return {
          text: `Unknown command: <code>${cmd}</code>. Type <code>/help</code> for available commands.`
        };
    }
  }
}
