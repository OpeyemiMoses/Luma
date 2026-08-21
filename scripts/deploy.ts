import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  const isTestnet = process.argv.includes('--testnet');
  const networkName = isTestnet ? 'X Layer Testnet (Chain ID: 1952)' : 'X Layer Mainnet (Chain ID: 196)';
  const rpcUrl = isTestnet
    ? (process.env.XLAYER_TESTNET_RPC_URL || 'https://testrpc.xlayer.tech')
    : (process.env.XLAYER_RPC_URL || 'https://rpc.xlayer.tech');

  console.log(`\n==================================================`);
  console.log(`🚀 LUMA FINANCE - ONCHAIN DEPLOYMENT RUNNER`);
  console.log(`Target: ${networkName}`);
  console.log(`RPC:    ${rpcUrl}`);
  console.log(`==================================================\n`);

  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey || privateKey.trim() === '' || privateKey.includes('...')) {
    console.error('❌ ERROR: DEPLOYER_PRIVATE_KEY is not set in .env!');
    console.error('👉 Please open .env and set your deployer wallet private key:');
    console.error('   DEPLOYER_PRIVATE_KEY="0xYourPrivateKeyHere"\n');
    process.exit(1);
  }

  // Load compiled artifacts
  const compiledPath = path.resolve(process.cwd(), 'dist/compiled-contracts.json');
  if (!fs.existsSync(compiledPath)) {
    console.log('Compiling contracts first...');
    const { compileContracts } = await import('./compile.js');
    compileContracts();
  }

  const contracts = JSON.parse(fs.readFileSync(compiledPath, 'utf8'));

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const deployer = new ethers.Wallet(privateKey, provider);
  const deployerAddr = await deployer.getAddress();
  console.log(`👤 Deployer Address: ${deployerAddr}`);

  const balance = await provider.getBalance(deployerAddr);
  console.log(`💰 Gas Balance:       ${ethers.formatEther(balance)} OKB`);

  if (balance === 0n) {
    console.error('❌ ERROR: Insufficient OKB balance for gas on X Layer.');
    console.error(`👉 Please fund ${deployerAddr} with OKB before deploying.\n`);
    process.exit(1);
  }

  // Verified contract addresses on X Layer
  const USDG_ADDRESS = isTestnet
    ? '0xa78e2baabaf5c4f36b7fc394725deb68d332eec1'
    : (process.env.USDG_CONTRACT_ADDRESS || '0x4ae46a509f6b1d9056937ba4500cb143933d2dc8');
  const PT_USDG_MARKET = isTestnet
    ? '0x9e29b3aada05bf2d2c827af80bd28dc0b9b4fb0c'
    : (process.env.PT_USDG_MARKET_ADDRESS || '0x9a09a9e491db3dd8ada5b1b889991ac9ad5fd362');
  const PENDLE_ROUTER = process.env.PENDLE_ROUTER_ADDRESS || '0x888888888889758F76e7103c6CbF23ABbF58F946';

  console.log('\n[1/4] Deploying PolicyManager.sol...');
  const PolicyManagerFactory = new ethers.ContractFactory(
    contracts.PolicyManager.abi,
    contracts.PolicyManager.bytecode,
    deployer
  );
  const policyManager = await PolicyManagerFactory.deploy(deployerAddr);
  await policyManager.waitForDeployment();
  const policyManagerAddr = await policyManager.getAddress();
  console.log(`   ✅ PolicyManager deployed at: ${policyManagerAddr}`);

  console.log('   ⚙️ Allowlisting USDG, PT-USDG, and Pendle Router in PolicyManager...');
  const tx1 = await (policyManager as any).setAssetAllowed(USDG_ADDRESS, true);
  await tx1.wait();
  const tx2 = await (policyManager as any).setAssetAllowed(PT_USDG_MARKET, true);
  await tx2.wait();
  const tx3 = await (policyManager as any).setProtocolAllowed(PENDLE_ROUTER, true);
  await tx3.wait();

  console.log('\n[2/4] Deploying DecisionRegistry.sol...');
  const DecisionRegistryFactory = new ethers.ContractFactory(
    contracts.DecisionRegistry.abi,
    contracts.DecisionRegistry.bytecode,
    deployer
  );
  const decisionRegistry = await DecisionRegistryFactory.deploy(deployerAddr);
  await decisionRegistry.waitForDeployment();
  const decisionRegistryAddr = await decisionRegistry.getAddress();
  console.log(`   ✅ DecisionRegistry deployed at: ${decisionRegistryAddr}`);

  console.log('\n[3/4] Deploying ExecutionRouter.sol...');
  const ExecutionRouterFactory = new ethers.ContractFactory(
    contracts.ExecutionRouter.abi,
    contracts.ExecutionRouter.bytecode,
    deployer
  );
  const executionRouter = await ExecutionRouterFactory.deploy(deployerAddr, policyManagerAddr, PENDLE_ROUTER);
  await executionRouter.waitForDeployment();
  const executionRouterAddr = await executionRouter.getAddress();
  console.log(`   ✅ ExecutionRouter deployed at: ${executionRouterAddr}`);

  console.log('   ⚙️ Approving Pendle Market in ExecutionRouter...');
  const tx4 = await (executionRouter as any).setMarketApproved(PT_USDG_MARKET, true);
  await tx4.wait();

  console.log('\n[4/4] Deploying LumaVault.sol (ERC-4626 Strategy Vault)...');
  const LumaVaultFactory = new ethers.ContractFactory(
    contracts.LumaVault.abi,
    contracts.LumaVault.bytecode,
    deployer
  );
  const lumaVault = await LumaVaultFactory.deploy(
    deployerAddr,
    USDG_ADDRESS,
    PT_USDG_MARKET, // PT token address / market
    PT_USDG_MARKET,
    policyManagerAddr,
    executionRouterAddr,
    decisionRegistryAddr
  );
  await lumaVault.waitForDeployment();
  const lumaVaultAddr = await lumaVault.getAddress();
  console.log(`   ✅ LumaVault deployed at: ${lumaVaultAddr}`);

  console.log('\n🔗 Linking vault permissions...');
  const tx5 = await (executionRouter as any).setVault(lumaVaultAddr);
  await tx5.wait();
  const tx6 = await (decisionRegistry as any).setAuthorizedCaller(lumaVaultAddr, true);
  await tx6.wait();

  const deploymentsDir = path.resolve(process.cwd(), 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentSummary = {
    network: networkName,
    chainId: isTestnet ? 1952 : 196,
    deployedAt: new Date().toISOString(),
    deployer: deployerAddr,
    contracts: {
      PolicyManager: policyManagerAddr,
      DecisionRegistry: decisionRegistryAddr,
      ExecutionRouter: executionRouterAddr,
      LumaVault: lumaVaultAddr,
      USDG: USDG_ADDRESS,
      PT_USDG: PT_USDG_MARKET,
      PendleRouter: PENDLE_ROUTER
    }
  };

  const fileName = isTestnet ? 'xlayer-testnet.json' : 'xlayer-mainnet.json';
  fs.writeFileSync(path.resolve(deploymentsDir, fileName), JSON.stringify(deploymentSummary, null, 2));

  console.log(`\n==================================================`);
  console.log(`🎉 DEPLOYMENT COMPLETE! Summary saved to deployments/${fileName}`);
  console.log(`==================================================`);
  console.log(JSON.stringify(deploymentSummary.contracts, null, 2));
}

main().catch((err) => {
  console.error('\n❌ Deployment failed:', err);
  process.exit(1);
});
