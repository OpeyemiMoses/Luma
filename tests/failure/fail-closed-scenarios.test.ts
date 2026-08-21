import { describe, it, expect } from 'vitest';
import { ExecutorWorker } from '../../services/executor/src/ExecutorWorker.js';
import { IndexerService } from '../../services/indexer/src/IndexerService.js';
import { RISK_PROFILES } from '../../packages/config/src/index.js';
import { AIDecisionSchema } from '../../packages/types/src/index.js';

describe('Fail-Closed Scenarios & Malicious Input Defense', () => {
  it('halts execution when the oracle feed timestamp is stale (Fail-Closed)', async () => {
    const staleIndexer = new IndexerService();
    // Simulate stale indexer returning isStale: true
    staleIndexer.getMarketDataSnapshot = async () => ({
      usdgPrice: 1.00,
      ptUsdgPrice: 0.985,
      ptUsdgImpliedApyBps: 710,
      poolLiquidityUsd: 12500000,
      maturityTimestamp: 1793232000,
      daysToMaturity: 70,
      oracleTimestamp: Math.floor(Date.now() / 1000) - 3600, // 1 hour old
      isStale: true,
      source: 'STALE_FEED'
    });

    const worker = new ExecutorWorker(staleIndexer);
    await expect(worker.runCycle(RISK_PROFILES.Balanced)).rejects.toThrow(/Stale oracle \/ market data feed/);
  });

  it('rejects malformed AI JSON output that violates strict schema constraints', () => {
    const malformedDecision = {
      decision_id: 'bad_001',
      action: 'ARBITRARY_ACTION', // Invalid action enum
      asset: 'PT_USDG',
      target_allocation_bps: 12000, // Exceeds 10000 bps
      reason_codes: ['UNKNOWN_CODE'],
      explanation: 'Short', // Too short (< 10 chars)
      confidence_bps: -500, // Negative confidence
      data_timestamp: -1,
      expires_at: 0
    };

    const parseResult = AIDecisionSchema.safeParse(malformedDecision);
    expect(parseResult.success).toBe(false);
  });
});
