import { ethers } from 'ethers';

async function checkUserShares() {
  const provider = new ethers.JsonRpcProvider('https://testrpc.xlayer.tech');
  const vaultAddr = '0x3813d46BBC4043552FdF47E58740b33B2f89d01C';

  const vault = new ethers.Contract(vaultAddr, [
    'function totalShares() view returns (uint256)',
    'function totalAssets() view returns (uint256)',
    'function shareBalances(address) view returns (uint256)',
    'function getStrategyHoldings() view returns (uint256, uint256, uint256)',
    'function baseAsset() view returns (address)',
    'function ptAsset() view returns (address)'
  ], provider);

  const totalShares = await vault.totalShares();
  const totalAssets = await vault.totalAssets();
  const holdings = await vault.getStrategyHoldings();
  const baseAsset = await vault.baseAsset();
  const ptAsset = await vault.ptAsset();

  console.log('--- VAULT ONCHAIN METRICS ---');
  console.log(`totalShares: ${ethers.formatUnits(totalShares, 6)}`);
  console.log(`totalAssets: ${ethers.formatUnits(totalAssets, 6)}`);
  console.log(`USDG Holding in Vault: ${ethers.formatUnits(holdings[0], 6)}`);
  console.log(`PT/USDT Holding in Vault: ${ethers.formatUnits(holdings[1], 6)}`);

  // Let's check recent deposit events
  const filter = {
    address: vaultAddr,
    fromBlock: 0,
    toBlock: 'latest'
  };
  const logs = await provider.getLogs(filter);
  console.log(`Total events emitted on Vault: ${logs.length}`);
  for (const log of logs) {
    console.log('Log topics:', log.topics);
    if (log.topics[0]) {
      // Deposit event topic: keccak256("Deposit(address,address,uint256,uint256)")
      console.log('Transaction:', log.transactionHash);
    }
  }
}

checkUserShares().catch(console.error);
