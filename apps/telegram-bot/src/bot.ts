import { Bot, InlineKeyboard } from 'grammy';
import * as dotenv from 'dotenv';
import { LumaSDK } from '../../../packages/sdk/src/index.js';
import { NETWORKS, RISK_PROFILES } from '../../../packages/config/src/index.js';
import { AuditService } from '../../../services/audit/src/index.js';
import { TelegramNotifier } from '../../../services/notifications/src/index.js';

dotenv.config();

export class LumaTelegramBot {
  private bot: Bot | null = null;
  private sdk: LumaSDK;
  private linkedChats: Map<number, string> = new Map(); // chatId -> walletAddress

  constructor() {
    this.sdk = new LumaSDK(NETWORKS.xlayerMainnet);
  }

  public init(token?: string) {
    const botToken = token || process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken || botToken === 'YOUR_TELEGRAM_BOT_TOKEN') {
      console.log('ℹ️  TELEGRAM_BOT_TOKEN not provided in .env. Bot runner in standby mode.');
      console.log('👉 To run the live Telegram bot on Telegram:');
      console.log('   1. Create a bot via @BotFather on Telegram.');
      console.log('   2. Add TELEGRAM_BOT_TOKEN="your_token_here" to your .env file.');
      console.log('   3. Run "npm run start:bot"');
      return;
    }

    this.bot = new Bot(botToken);
    this.registerCommands();
  }

  private registerCommands() {
    if (!this.bot) return;

    // /start command
    this.bot.command(['start', 'help'], async (ctx) => {
      const keyboard = new InlineKeyboard()
        .url('🌐 Open Luma Dashboard', 'http://localhost:5173/')
        .row()
        .text('💼 /portfolio', 'cmd_portfolio')
        .text('🛡️ /risk', 'cmd_risk')
        .text('❓ /why', 'cmd_why');

      await ctx.reply(
        `🤖 <b>Welcome to Luma Finance on X Layer</b>\n\n` +
        `Non-custodial AI-managed RWA Strategy Vault (USDG + PT-USDG).\n\n` +
        `<b>Available Commands:</b>\n` +
        `• <code>/portfolio</code> - Current portfolio balance & allocation\n` +
        `• <code>/risk</code> - Deterministic Risk Engine scorecards\n` +
        `• <code>/yield</code> - USDG base & PT-USDG fixed implied APY\n` +
        `• <code>/history</code> - Chronological AI decisions & X Layer tx hashes\n` +
        `• <code>/why</code> - Explains why the AI made the last decision\n` +
        `• <code>/vault</code> - Vault contract addresses & active policy limits\n` +
        `• <code>/pause</code> - Emergency strategy controls\n` +
        `• <code>/link [wallet]</code> - Link your wallet for real-time rebalance alerts\n\n` +
        `<i>Note: Telegram is strictly read-only and notification. Your funds remain in your own EVM wallet.</i>`,
        { parse_mode: 'HTML', reply_markup: keyboard }
      );
    });

    // /link command
    this.bot.command('link', async (ctx) => {
      const args = ctx.match?.trim();
      const chatId = ctx.chat.id;

      if (!args) {
        await ctx.reply(
          `🔗 <b>Link Your EVM Wallet</b>\n\n` +
          `To receive real-time alerts when Luma rebalances on X Layer, send:\n` +
          `<code>/link 0xYourWalletAddress</code>\n\n` +
          `Example: <code>/link 0x71C836F7DA3f8874330040D3f51086A7751E8E29</code>`,
          { parse_mode: 'HTML' }
        );
        return;
      }

      this.linkedChats.set(chatId, args);
      await ctx.reply(
        `✅ <b>Wallet Linked Successfully!</b>\n\n` +
        `Linked Address: <code>${args}</code>\n` +
        `You will now receive real-time transaction notifications and rebalance alerts on Telegram.`,
        { parse_mode: 'HTML' }
      );
    });

    // /portfolio command
    this.bot.command('portfolio', async (ctx) => {
      const p = await this.sdk.getPortfolio();
      const r = await this.sdk.getRiskAnalysis(p);
      const keyboard = new InlineKeyboard().url('📊 View on Web App', 'http://localhost:5173/');

      await ctx.reply(
        `💼 <b>Luma Strategy Portfolio</b>\n\n` +
        `• <b>Total Value:</b> $${p.portfolioValueUsd.toLocaleString()}\n` +
        `• <b>USDG Allocation:</b> ${(p.usdgAllocationBps / 100).toFixed(0)}% ($${p.usdgBalance.toFixed(2)})\n` +
        `• <b>PT-USDG Allocation:</b> ${(p.ptUsdgAllocationBps / 100).toFixed(0)}% (${p.ptUsdgBalance.toFixed(2)} PT)\n` +
        `• <b>Days to Maturity:</b> ${p.daysToMaturity} days\n` +
        `• <b>Risk Index:</b> <b>${r.riskLevel}</b> (${r.overallRisk}/100)\n` +
        `• <b>Vault Status:</b> ${p.isPaused ? '🔴 PAUSED' : '🟢 ACTIVE'}\n`,
        { parse_mode: 'HTML', reply_markup: keyboard }
      );
    });

    // /risk command
    this.bot.command('risk', async (ctx) => {
      const p = await this.sdk.getPortfolio();
      const r = await this.sdk.getRiskAnalysis(p);
      await ctx.reply(TelegramNotifier.formatRiskSummary(r), { parse_mode: 'HTML' });
    });

    // /yield command
    this.bot.command('yield', async (ctx) => {
      const p = await this.sdk.getPortfolio();
      const blendedApy = (
        (p.usdgAllocationBps * 450 + p.ptUsdgAllocationBps * p.ptUsdgYieldBps) / 1000000
      ).toFixed(2);

      await ctx.reply(
        `📈 <b>Luma Yield Metrics</b>\n\n` +
        `• <b>Blended Vault APY:</b> <b>${blendedApy}%</b>\n` +
        `• <b>PT-USDG Implied Fixed APY:</b> ${(p.ptUsdgYieldBps / 100).toFixed(2)}%\n` +
        `• <b>USDG Base RWA Yield:</b> 4.50%\n` +
        `• <b>Maturity Date:</b> Oct 29, 2026\n` +
        `• <b>Execution Route:</b> Pendle Market on X Layer\n`,
        { parse_mode: 'HTML' }
      );
    });

    // /why command
    this.bot.command('why', async (ctx) => {
      const query = ctx.match?.trim();
      const explanation = AuditService.explainDecision(query.length > 0 ? query : undefined);
      await ctx.reply(explanation, { parse_mode: 'Markdown' });
    });

    // /history command
    this.bot.command('history', async (ctx) => {
      const decisions = AuditService.getAllDecisions();
      if (decisions.length === 0) {
        await ctx.reply('📜 No AI actions recorded yet.');
        return;
      }
      let historyMsg = `📜 <b>Luma AI Decision History</b>\n\n`;
      decisions.slice(0, 5).forEach((d) => {
        const date = new Date(d.timestamp * 1000).toLocaleTimeString();
        historyMsg += `• <b>${d.decisionId}</b> | <b>${d.action}</b> ${d.targetAsset} to ${(d.targetAllocationBps / 100).toFixed(0)}%\n` +
          `  <i>${d.explanation}</i>\n` +
          (d.txHash ? `  Tx: <code>${d.txHash.slice(0, 10)}...</code>\n` : `  Status: ${d.status}\n`) +
          `  Time: ${date}\n\n`;
      });
      await ctx.reply(historyMsg, { parse_mode: 'HTML' });
    });

    // /vault command
    this.bot.command('vault', async (ctx) => {
      await ctx.reply(
        `🏛️ <b>Luma Vault & Policy Details</b>\n\n` +
        `• <b>Network:</b> X Layer Mainnet (Chain ID: 196)\n` +
        `• <b>USDG Token:</b> <code>0x4ae46a509f6b1d9056937ba4500cb143933d2dc8</code>\n` +
        `• <b>Pendle PT Market:</b> <code>0x9a09a9e491db3dd8ada5b1b889991ac9ad5fd362</code>\n` +
        `• <b>Pendle Router:</b> <code>0x888888888889758F76e7103c6CbF23ABbF58F946</code>\n` +
        `• <b>Policy Limits:</b> Max PT 40% | Single Rebalance 10% | Slippage 1.0%\n` +
        `• <b>Custody:</b> Non-Custodial (OpenZeppelin ERC-4626)\n`,
        { parse_mode: 'HTML' }
      );
    });

    // /pause command
    this.bot.command('pause', async (ctx) => {
      const p = await this.sdk.getPortfolio();
      const keyboard = new InlineKeyboard().url('🛡️ Open Emergency Controls', 'http://localhost:5173/');

      await ctx.reply(
        `🛑 <b>Emergency Strategy Controls</b>\n\n` +
        `Vault Status: ${p.isPaused ? '🔴 PAUSED' : '🟢 ACTIVE'}\n\n` +
        `<i>Emergency pause stops autonomous AI rebalancing immediately while preserving non-custodial user withdrawal rights.</i>`,
        { parse_mode: 'HTML', reply_markup: keyboard }
      );
    });
  }

  /**
   * Broadcasts a live rebalance alert to all linked Telegram chat IDs.
   */
  public async broadcastRebalanceAlert(
    decisionId: string,
    beforePtPct: number,
    afterPtPct: number,
    reason: string,
    txHash: string
  ) {
    if (!this.bot) return;

    const keyboard = new InlineKeyboard()
      .url('🔍 View on X Layer Explorer', `https://www.oklink.com/xlayer/tx/${txHash}`)
      .url('📊 Open Dashboard', 'http://localhost:5173/');

    const message =
      `🤖 <b>Luma Finance Alert</b>\n\n` +
      `<b>Portfolio rebalance executed on X Layer.</b>\n\n` +
      `<b>PT-USDG Allocation:</b>\n` +
      `${beforePtPct}% → ${afterPtPct}%\n\n` +
      `<b>Reason:</b>\n` +
      `${reason}\n\n` +
      `<b>Transaction:</b> <code>${txHash.slice(0, 10)}...${txHash.slice(-8)}</code>`;

    for (const [chatId] of this.linkedChats.entries()) {
      try {
        await this.bot.api.sendMessage(chatId, message, { parse_mode: 'HTML', reply_markup: keyboard });
      } catch (err) {
        console.error(`Failed to send alert to chatId ${chatId}:`, err);
      }
    }
  }

  public start() {
    if (!this.bot) {
      console.log('Telegram bot not started (no token configured).');
      return;
    }
    console.log('🤖 Luma Telegram Bot started polling on Telegram API.');
    this.bot.start();
  }
}
