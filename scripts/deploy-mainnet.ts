import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  const networkName = 'OKX X Layer Mainnet (Chain ID: 196)';
  const chainId = 196;
  const rpcUrl = process.env.XLAYER_RPC_URL || 'https://rpc.xlayer.tech';

  console.log(`\n========================================================`);
  console.log(`🚀 LUMA FINANCE - MAINNET SMART CONTRACT DEPLOYMENT`);
  console.log(`Target: ${networkName}`);
  console.log(`RPC:    ${rpcUrl}`);
  console.log(`========================================================\n`);

  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey || privateKey.trim() === '' || privateKey.includes('...')) {
    console.error('❌ ERROR: DEPLOYER_PRIVATE_KEY is not set in .env!');
    process.exit(1);
  }

  // Load compiled contract artifacts
  const compiledPath = path.resolve(process.cwd(), 'dist/compiled-contracts.json');
  if (!fs.existsSync(compiledPath)) {
    console.log('Compiling contracts first...');
    const { compileContracts } = await import('./compile.js');
    compileContracts();
  }

  const contracts = JSON.parse(fs.readFileSync(compiledPath, 'utf8'));

  const provider = new ethers.JsonRpcProvider(rpcUrl, chainId, { staticNetwork: true });
  const deployer = new ethers.Wallet(privateKey, provider);
  const deployerAddr = await deployer.getAddress();
  console.log(`👤 Deployer Address: ${deployerAddr}`);

  const balance = await provider.getBalance(deployerAddr);
  console.log(`💰 OKB Gas Balance:   ${ethers.formatEther(balance)} OKB\n`);

  if (balance === 0n) {
    console.error('❌ ERROR: Insufficient OKB balance for gas on X Layer Mainnet.');
    process.exit(1);
  }

  // Verified X Layer Mainnet Assets & Protocols
  const USDG_ADDRESS = process.env.USDG_CONTRACT_ADDRESS || '0x4ae46a509f6b1d9056937ba4500cb143933d2dc8';
  const PT_USDG_MARKET = process.env.PT_USDG_MARKET_ADDRESS || '0x9a09a9e491db3dd8ada5b1b889991ac9ad5fd362';
  const PENDLE_ROUTER = process.env.PENDLE_ROUTER_ADDRESS || '0x888888888889758F76e7103c6CbF23ABbF58F946';

  console.log(`📌 Base RWA Asset (USDG):     ${USDG_ADDRESS}`);
  console.log(`📌 Yield Market (PT-USDG):    ${PT_USDG_MARKET}`);
  console.log(`📌 Liquidity Router (Pendle): ${PENDLE_ROUTER}\n`);

  // [1/4] Deploy PolicyManager
  console.log('⏳ [1/4] Deploying PolicyManager.sol to X Layer Mainnet...');
  const PolicyManagerFactory = new ethers.ContractFactory(
    contracts.PolicyManager.abi,
    contracts.PolicyManager.bytecode,
    deployer
  );
  const policyManager = await PolicyManagerFactory.deploy(deployerAddr);
  await policyManager.waitForDeployment();
  const policyManagerAddr = await policyManager.getAddress();
  console.log(`   ✅ PolicyManager: ${policyManagerAddr}`);
  console.log(`   🔗 Explorer: https://www.oklink.com/xlayer/address/${policyManagerAddr}`);

  console.log('   ⚙️ Configuring PolicyManager allowlists onchain...');
  const pmContract = new ethers.Contract(policyManagerAddr, contracts.PolicyManager.abi, deployer);
  const tx1 = await pmContract.setAssetAllowed(USDG_ADDRESS, true);
  await tx1.wait();
  const tx2 = await pmContract.setAssetAllowed(PT_USDG_MARKET, true);
  await tx2.wait();
  const tx3 = await pmContract.setProtocolAllowed(PENDLE_ROUTER, true);
  await tx3.wait();
  console.log('   ✅ PolicyManager allowlists configured.');

  // [2/4] Deploy DecisionRegistry
  console.log('\n⏳ [2/4] Deploying DecisionRegistry.sol to X Layer Mainnet...');
  const DecisionRegistryFactory = new ethers.ContractFactory(
    contracts.DecisionRegistry.abi,
    contracts.DecisionRegistry.bytecode,
    deployer
  );
  const decisionRegistry = await DecisionRegistryFactory.deploy(deployerAddr);
  await decisionRegistry.waitForDeployment();
  const decisionRegistryAddr = await decisionRegistry.getAddress();
  console.log(`   ✅ DecisionRegistry: ${decisionRegistryAddr}`);
  console.log(`   🔗 Explorer: https://www.oklink.com/xlayer/address/${decisionRegistryAddr}`);

  // [3/4] Deploy ExecutionRouter
  console.log('\n⏳ [3/4] Deploying ExecutionRouter.sol to X Layer Mainnet...');
  const ExecutionRouterFactory = new ethers.ContractFactory(
    contracts.ExecutionRouter.abi,
    contracts.ExecutionRouter.bytecode,
    deployer
  );
  const executionRouter = await ExecutionRouterFactory.deploy(deployerAddr, policyManagerAddr, PENDLE_ROUTER);
  await executionRouter.waitForDeployment();
  const executionRouterAddr = await executionRouter.getAddress();
  console.log(`   ✅ ExecutionRouter: ${executionRouterAddr}`);
  console.log(`   🔗 Explorer: https://www.oklink.com/xlayer/address/${executionRouterAddr}`);

  console.log('   ⚙️ Approving Pendle Market in ExecutionRouter...');
  const routerContract = new ethers.Contract(executionRouterAddr, contracts.ExecutionRouter.abi, deployer);
  const tx4 = await routerContract.setMarketApproved(PT_USDG_MARKET, true);
  await tx4.wait();
  console.log('   ✅ Market approved.');

  // [4/4] Deploy LumaVault (ERC-4626)
  console.log('\n⏳ [4/4] Deploying LumaVault.sol (ERC-4626) to X Layer Mainnet...');
  const LumaVaultFactory = new ethers.ContractFactory(
    contracts.LumaVault.abi,
    contracts.LumaVault.bytecode,
    deployer
  );
  const lumaVault = await LumaVaultFactory.deploy(
    deployerAddr,
    USDG_ADDRESS,
    PT_USDG_MARKET,
    PT_USDG_MARKET,
    policyManagerAddr,
    executionRouterAddr,
    decisionRegistryAddr
  );
  await lumaVault.waitForDeployment();
  const lumaVaultAddr = await lumaVault.getAddress();
  console.log(`   ✅ LumaVault: ${lumaVaultAddr}`);
  console.log(`   🔗 Explorer: https://www.oklink.com/xlayer/address/${lumaVaultAddr}`);

  // Linking Vault Permissions
  console.log('\n🔗 Linking authorizations and permissions onchain...');
  const tx5 = await routerContract.setVault(lumaVaultAddr);
  await tx5.wait();

  const regContract = new ethers.Contract(decisionRegistryAddr, contracts.DecisionRegistry.abi, deployer);
  const tx6 = await regContract.setAuthorizedCaller(lumaVaultAddr, true);
  await tx6.wait();
  console.log('   ✅ Vault linked to ExecutionRouter & DecisionRegistry.');

  // Save deployment artifact
  const deploymentsDir = path.resolve(process.cwd(), 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentSummary = {
    network: networkName,
    chainId: 196,
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

  fs.writeFileSync(
    path.resolve(deploymentsDir, 'xlayer-mainnet.json'),
    JSON.stringify(deploymentSummary, null, 2)
  );

  console.log(`\n========================================================`);
  console.log(`🎉 ALL SMART CONTRACTS SUCCESSFULLY DEPLOYED TO X LAYER MAINNET!`);
  console.log(`========================================================`);
  console.log(JSON.stringify(deploymentSummary.contracts, null, 2));
}

main().catch((err) => {
  console.error('\n❌ Mainnet Deployment failed:', err);
  process.exit(1);
});
