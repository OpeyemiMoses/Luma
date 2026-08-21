import { ethers } from 'ethers';

async function scanTransfers() {
  const address = '0xb4825ABd70312e52083DDB55D3a00c0c309a6C09';
  console.log('Scanning for transfers to address:', address);

  // 1. Check Mainnet
  try {
    const mainnetProvider = new ethers.JsonRpcProvider('https://rpc.xlayer.tech');
    const mainnetUsdt = '0x1E4a5963aBFD975d8c9021ce480b42188849D41d';
    const c = new ethers.Contract(mainnetUsdt, [
      'function balanceOf(address) view returns (uint256)',
      'function decimals() view returns (uint8)'
    ], mainnetProvider);
    const bal = await c.balanceOf(address);
    console.log(`[Mainnet] USDT balance of ${address}:`, ethers.formatUnits(bal, 6));
  } catch (e) {
    console.log('[Mainnet] Error:', e.message);
  }

  // 2. Check Testnet recent blocks
  try {
    const testnetProvider = new ethers.JsonRpcProvider('https://testrpc.xlayer.tech');
    const latestBlock = await testnetProvider.getBlockNumber();
    console.log(`[Testnet] Latest block: ${latestBlock}`);

    // Scan last 5000 blocks for Transfer events to this address
    const transferTopic = ethers.id('Transfer(address,address,uint256)');
    const paddedAddr = ethers.zeroPadValue(address, 32);

    const logs = await testnetProvider.getLogs({
      fromBlock: Math.max(0, latestBlock - 5000),
      toBlock: 'latest',
      topics: [transferTopic, null, paddedAddr]
    });

    console.log(`[Testnet] Found ${logs.length} transfer logs to this address in last 5000 blocks:`);
    for (const log of logs) {
      console.log(`Contract: ${log.address} | txHash: ${log.transactionHash}`);
      try {
        const tokenContract = new ethers.Contract(log.address, [
          'function name() view returns (string)',
          'function symbol() view returns (string)',
          'function decimals() view returns (uint8)',
          'function balanceOf(address) view returns (uint256)'
        ], testnetProvider);
        const sym = await tokenContract.symbol();
        const dec = await tokenContract.decimals();
        const b = await tokenContract.balanceOf(address);
        console.log(` -> Token ${sym} (decimals: ${dec}): ${ethers.formatUnits(b, dec)}`);
      } catch (err) {
        console.log(' -> Could not read token details:', err.message);
      }
    }
  } catch (e) {
    console.log('[Testnet] Error:', e.message);
  }
}

scanTransfers().catch(console.error);
