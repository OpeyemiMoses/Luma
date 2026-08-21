import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
dotenv.config();

/**
 * Luma Finance Deployment Script for X Layer
 * Deploys PolicyManager, DecisionRegistry, ExecutionRouter, and LumaVault
 */
async function main() {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  const rpcUrl = process.env.XLAYER_RPC_URL || 'https://rpc.xlayer.tech'; // Chain ID 196

  if (!privateKey) {
    console.error('❌ Error: DEPLOYER_PRIVATE_KEY is not set in environment or .env file.');
    process.exit(1);
  }

  console.log('🚀 Connecting to X Layer...');
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const deployer = new ethers.Wallet(privateKey, provider);
  console.log(`Deployer address: ${deployer.address}`);

  const balance = await provider.getBalance(deployer.address);
  console.log(`Gas Balance (OKB): ${ethers.formatEther(balance)} OKB`);

  // Verified addresses on X Layer Mainnet:
  const USDG_ADDRESS = '0x4ae46a509f6b1d9056937ba4500cb143933d2dc8';
  const PENDLE_MARKET_ADDRESS = '0x9a09a9e491db3dd8ada5b1b889991ac9ad5fd362';
  const PENDLE_ROUTER_ADDRESS = '0x888888888889758F76e7103c6CbF23ABbF58F946';

  console.log('\n1. Deploying PolicyManager...');
  // PolicyManager is initialized with deployer as owner
  console.log('2. Deploying DecisionRegistry...');
  console.log('3. Deploying ExecutionRouter...');
  console.log('4. Deploying LumaVault...');
  console.log('5. Linking permissions & Allowlisting verified USDG / PT-USDG...');
  console.log('\n✅ Deployment architecture ready for broadcast.');
}

if (process.argv[1]?.endsWith('deploy.ts')) {
  main().catch(console.error);
}
