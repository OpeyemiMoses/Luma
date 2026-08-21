import { describe, it, expect } from 'vitest';
import { NETWORKS, RISK_PROFILES } from '../../packages/config/src/index.js';
import { PolicyLimits } from '../../packages/types/src/index.js';

describe('Smart Contract Policy Specifications', () => {
  it('correctly holds verified X Layer Mainnet and Testnet addresses', () => {
    expect(NETWORKS.xlayerMainnet.chainId).toBe(196);
    expect(NETWORKS.xlayerTestnet.chainId).toBe(1952);
    expect(NETWORKS.xlayerMainnet.contracts.usdg).toBe('0x4ae46a509f6b1d9056937ba4500cb143933d2dc8');
    expect(NETWORKS.xlayerMainnet.contracts.ptUsdg).toBe('0x9a09a9e491db3dd8ada5b1b889991ac9ad5fd362');
    expect(NETWORKS.xlayerMainnet.contracts.pendleRouter).toBe('0x888888888889758F76e7103c6CbF23ABbF58F946');
  });

  it('validates default risk profiles (Conservative, Balanced, Aggressive)', () => {
    const conservative = RISK_PROFILES.Conservative;
    const balanced = RISK_PROFILES.Balanced;
    const aggressive = RISK_PROFILES.Aggressive;

    expect(conservative.maxPtAllocationBps).toBe(2000); // 20%
    expect(conservative.maxSingleRebalanceBps).toBe(500); // 5%

    expect(balanced.maxPtAllocationBps).toBe(4000); // 40%
    expect(balanced.maxSingleRebalanceBps).toBe(1000); // 10%

    expect(aggressive.maxPtAllocationBps).toBe(6000); // 60%
    expect(aggressive.maxSingleRebalanceBps).toBe(1500); // 15%
  });
});
