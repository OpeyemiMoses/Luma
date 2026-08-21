import { describe, it, expect } from 'vitest';
import { ExecutorWorker } from '../../services/executor/src/ExecutorWorker.js';
import { RISK_PROFILES } from '../../packages/config/src/index.js';
import { TelegramBotService } from '../../apps/telegram-bot/src/TelegramBotService.js';
import { AuditService } from '../../services/audit/src/AuditService.js';

describe('Luma Finance - Full End-to-End Vault Lifecycle', () => {
  it('executes end-to-end deposit, AI decision, policy validation, autonomous rebalance, audit trail, and telegram query', async () => {
    const worker = new ExecutorWorker();
    const policy = RISK_PROFILES.Balanced;

    // Step 1: Initial Deposit $1,000 USDG (Initial: 80% USDG, 20% PT-USDG)
    worker.setPortfolio({
      portfolioValueUsd: 1000,
      usdgAllocationBps: 8000,
      ptUsdgAllocationBps: 2000,
      usdgBalance: 800,
      ptUsdgBalance: 203,
      ptUsdgYieldBps: 710,
      daysToMaturity: 65,
      totalVaultShares: 1000,
      isPaused: false
    });

    // Step 2: Run Autonomous Rebalance Cycle
    const cycle = await worker.runCycle(policy);

    expect(cycle.policyApproved).toBe(true);
    expect(cycle.executed).toBe(true);
    expect(cycle.txHash).toBeDefined();
    expect(cycle.decision.action).toBe('INCREASE');
    expect(cycle.portfolioAfter.ptUsdgAllocationBps).toBe(3000); // Increased exposure by 10%
    expect(cycle.portfolioAfter.usdgAllocationBps).toBe(7000);

    // Step 3: Verify Audit Trail
    const recorded = AuditService.getDecision(cycle.decision.decision_id);
    expect(recorded).toBeDefined();
    expect(recorded?.txHash).toBe(cycle.txHash);
    expect(recorded?.policyApproved).toBe(true);

    // Step 4: Verify Telegram Bot queries reflect real updated state
    const portfolioCmd = TelegramBotService.handleCommand('/portfolio', cycle.portfolioAfter, cycle.risk, policy);
    expect(portfolioCmd.text).toContain('USDG Allocation:</b> 70%');
    expect(portfolioCmd.text).toContain('PT-USDG Allocation:</b> 30%');

    const whyCmd = TelegramBotService.handleCommand('/why', cycle.portfolioAfter, cycle.risk, policy);
    expect(whyCmd.text).toContain(cycle.decision.decision_id);
    expect(whyCmd.text).toContain('INCREASE');
  });

  it('correctly holds in Approval Mode without auto-executing until user reviews', async () => {
    const worker = new ExecutorWorker();
    const approvalPolicy = { ...RISK_PROFILES.Balanced, autonomousEnabled: false };

    worker.setPortfolio({
      portfolioValueUsd: 1000,
      usdgAllocationBps: 8000,
      ptUsdgAllocationBps: 2000,
      usdgBalance: 800,
      ptUsdgBalance: 203,
      ptUsdgYieldBps: 710,
      daysToMaturity: 65,
      totalVaultShares: 1000,
      isPaused: false
    });

    const cycle = await worker.runCycle(approvalPolicy);
    expect(cycle.policyApproved).toBe(true);
    expect(cycle.executed).toBe(false); // Held for user wallet signature
    expect(cycle.auditRecord.status).toBe('APPROVED');
  });
});
