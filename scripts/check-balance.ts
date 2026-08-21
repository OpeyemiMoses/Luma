import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  const pk = process.env.DEPLOYER_PRIVATE_KEY;
  if (!pk) {
    console.log('No DEPLOYER_PRIVATE_KEY found in .env');
    return;
  }
  const wallet = new ethers.Wallet(pk);
  console.log(`👤 Deployer Address: ${wallet.address}`);

  const mainnetRpc = process.env.XLAYER_RPC_URL || 'https://rpc.xlayer.tech';
  const testnetRpc = process.env.XLAYER_TESTNET_RPC_URL || 'https://testrpc.xlayer.tech';

  try {
    const mainnetProvider = new ethers.JsonRpcProvider(mainnetRpc);
    const mainnetBal = await mainnetProvider.getBalance(wallet.address);
    console.log(`🌐 X Layer Mainnet (Chain ID 196) Balance: ${ethers.formatEther(mainnetBal)} OKB`);
  } catch (e: any) {
    console.log('Mainnet RPC status:', e.message);
  }

  try {
    const testnetProvider = new ethers.JsonRpcProvider(testnetRpc);
    const testnetBal = await testnetProvider.getBalance(wallet.address);
    console.log(`🧪 X Layer Testnet (Chain ID 1952) Balance: ${ethers.formatEther(testnetBal)} OKB`);
  } catch (e: any) {
    console.log('Testnet RPC status:', e.message);
  }
}

main().catch(console.error);
