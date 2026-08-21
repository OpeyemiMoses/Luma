import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    console.error("No DEPLOYER_PRIVATE_KEY found in .env");
    return;
  }

  const wallet = new ethers.Wallet(privateKey);
  console.log("Deployer Address:", wallet.address);

  const mainnetRpcs = [
    "https://xlayerrpc.okx.com",
    "https://rpc.xlayer.tech",
    "https://196.rpc.thirdweb.com"
  ];

  for (const rpc of mainnetRpcs) {
    try {
      const provider = new ethers.JsonRpcProvider(rpc, 196, { staticNetwork: true });
      const bal = await provider.getBalance(wallet.address);
      console.log(`[Mainnet OK] RPC: ${rpc} -> Balance: ${ethers.formatEther(bal)} OKB`);
      return;
    } catch (e: any) {
      console.log(`[Mainnet Failed] RPC: ${rpc} -> ${e.message}`);
    }
  }
}

main().catch(console.error);
