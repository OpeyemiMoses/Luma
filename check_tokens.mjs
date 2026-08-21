import { ethers } from 'ethers';

async function check() {
  const rpcUrl = 'https://testrpc.xlayer.tech';
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  
  const wallet = new ethers.Wallet('0x4900d8ea6bdc1c48ddd13e1c0f58e1a824032fbb02e6256f3c4f13fc422c7604', provider);
  console.log('Deployer address:', wallet.address);
  const okbBal = await provider.getBalance(wallet.address);
  console.log('OKB balance:', ethers.formatEther(okbBal));

  // Check possible USDT addresses on testnet
  const candidateAddresses = [
    '0x1E4a5963aBFD975d8c9021ce480b42188849D41d', // Mainnet USDT0
    '0x779774620f3261aE0f443b7F38aFfF7a3bA84c3C',
    '0x3813e82e6f7098b9583FC0F33a96210d81466Ab9',
    '0x5aEa972c4C56c9a495E4F9732B0f28b4c3F66C06',
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
  ];

  for (const addr of candidateAddresses) {
    try {
      const code = await provider.getCode(addr);
      if (code !== '0x') {
        const c = new ethers.Contract(addr, [
          'function name() view returns (string)',
          'function symbol() view returns (string)',
          'function decimals() view returns (uint8)',
          'function balanceOf(address) view returns (uint256)'
        ], provider);
        const name = await c.name().catch(() => 'unknown');
        const symbol = await c.symbol().catch(() => 'unknown');
        const decimals = await c.decimals().catch(() => 18);
        const bal = await c.balanceOf(wallet.address).catch(() => 0n);
        console.log(`Address: ${addr} | Symbol: ${symbol} | Decimals: ${decimals} | Balance: ${ethers.formatUnits(bal, decimals)}`);
      } else {
        console.log(`Address: ${addr} has NO CODE on testnet`);
      }
    } catch (e) {
      console.log(`Address ${addr} error:`, e.message);
    }
  }
}

check().catch(console.error);
