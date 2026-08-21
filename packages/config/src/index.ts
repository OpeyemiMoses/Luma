import { PolicyLimits } from '../../types/src/index.js';

export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  blockExplorerUrl: string;
  currencySymbol: string;
  contracts: {
    usdg: string;
    usdt?: string;
    ptUsdg: string;
    pendleMarket: string;
    pendleRouter: string;
    lumaVault?: string;
    policyManager?: string;
    executionRouter?: string;
    decisionRegistry?: string;
  };
}

export const NETWORKS: Record<'xlayerMainnet' | 'xlayerTestnet' | 'localhost', NetworkConfig> = {
  xlayerMainnet: {
    name: 'X Layer Mainnet',
    chainId: 196,
    rpcUrl: 'https://rpc.xlayer.tech',
    blockExplorerUrl: 'https://www.oklink.com/xlayer',
    currencySymbol: 'OKB',
    contracts: {
      usdg: '0x4ae46a509f6b1d9056937ba4500cb143933d2dc8',
      usdt: '0x779ded0c9e1022225f8e0630b35a9b54be713736',
      ptUsdg: '0x9a09a9e491db3dd8ada5b1b889991ac9ad5fd362',
      pendleMarket: '0x9a09a9e491db3dd8ada5b1b889991ac9ad5fd362',
      pendleRouter: '0x888888888889758F76e7103c6CbF23ABbF58F946',
      policyManager: '0xc743883f03De9722050B7da6cd77F91128eD0562',
      decisionRegistry: '0xca196D22406951c5D14704E61271dF90b3666DbC',
      executionRouter: '0x9C2Ced10f2775369C9a17ebB1746199cd92399B6',
      lumaVault: '0xaa1ca8CF1E50f47815f6720863D8F83ecFAB2f2E'
    }
  },
  xlayerTestnet: {
    name: 'X Layer Testnet',
    chainId: 1952,
    rpcUrl: 'https://testrpc.xlayer.tech',
    blockExplorerUrl: 'https://www.oklink.com/xlayer-test',
    currencySymbol: 'OKB',
    contracts: {
      usdg: '0xa78e2baabaf5c4f36b7fc394725deb68d332eec1',
      usdt: '0x9e29b3aada05bf2d2c827af80bd28dc0b9b4fb0c',
      ptUsdg: '0x9e29b3aada05bf2d2c827af80bd28dc0b9b4fb0c',
      pendleMarket: '0x9e29b3aada05bf2d2c827af80bd28dc0b9b4fb0c',
      pendleRouter: '0x888888888889758F76e7103c6CbF23ABbF58F946',
      policyManager: '0x295848152B69f42b6186dcfE7FB86c7F2A97A653',
      decisionRegistry: '0x6daBB7eF8863D3D8528CBcC5365d69D93e359658',
      executionRouter: '0x876Ccc1F4efdfFa786bB5cf1E36d77cE07690dcf',
      lumaVault: '0x792902644680070E5e6FA24aC7edD2f5240B1FB1'
    }
  },
  localhost: {
    name: 'Hardhat Localhost',
    chainId: 31337,
    rpcUrl: 'http://127.0.0.1:8545',
    blockExplorerUrl: 'http://localhost:8545',
    currencySymbol: 'ETH',
    contracts: {
      usdg: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      ptUsdg: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
      pendleMarket: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
      pendleRouter: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'
    }
  }
};

export const RISK_PROFILES: Record<'Conservative' | 'Balanced' | 'Aggressive', PolicyLimits> = {
  Conservative: {
    profileName: 'Conservative',
    maxPtAllocationBps: 2000,     // 20%
    maxSingleRebalanceBps: 500,   // 5%
    maxSlippageBps: 50,           // 0.5%
    autonomousEnabled: true,
    maxDataAgeSeconds: 300,
    allowedAssets: ['0x4ae46a509f6b1d9056937ba4500cb143933d2dc8', '0x9a09a9e491db3dd8ada5b1b889991ac9ad5fd362'],
    allowedProtocols: ['0x888888888889758F76e7103c6CbF23ABbF58F946']
  },
  Balanced: {
    profileName: 'Balanced',
    maxPtAllocationBps: 4000,     // 40%
    maxSingleRebalanceBps: 1000,  // 10%
    maxSlippageBps: 100,          // 1.0%
    autonomousEnabled: true,
    maxDataAgeSeconds: 300,
    allowedAssets: ['0x4ae46a509f6b1d9056937ba4500cb143933d2dc8', '0x9a09a9e491db3dd8ada5b1b889991ac9ad5fd362'],
    allowedProtocols: ['0x888888888889758F76e7103c6CbF23ABbF58F946']
  },
  Aggressive: {
    profileName: 'Aggressive',
    maxPtAllocationBps: 6000,     // 60%
    maxSingleRebalanceBps: 1500,  // 15%
    maxSlippageBps: 150,          // 1.5%
    autonomousEnabled: true,
    maxDataAgeSeconds: 300,
    allowedAssets: ['0x4ae46a509f6b1d9056937ba4500cb143933d2dc8', '0x9a09a9e491db3dd8ada5b1b889991ac9ad5fd362'],
    allowedProtocols: ['0x888888888889758F76e7103c6CbF23ABbF58F946']
  }
};
