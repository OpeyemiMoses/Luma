import { ethers } from 'ethers';

async function findUsdtTestnet() {
  const provider = new ethers.JsonRpcProvider('https://testrpc.xlayer.tech');
  
  // List of known testnet USDT / mock tokens on X Layer Testnet
  const tokens = [
    '0x67F2C5F3d523e43034969b387A954B82960a5505',
    '0x410C5D809F3A1A807aF3A4A3258525b6a7B6d944',
    '0x779774620f3261aE0f443b7F38aFfF7a3bA84c3C',
    '0xa45b736563604fB34eDb175e11B93A042A27a202',
    '0x3813e82e6f7098b9583fc0f33a96210d81466ab9',
    '0x5aEa972c4C56c9a495E4F9732B0f28b4c3F66C06',
    '0x9a09a9e491db3dd8ada5b1b889991ac9ad5fd362',
    '0x4ae46a509f6b1d9056937ba4500cb143933d2dc8'
  ];

  for (const t of tokens) {
    try {
      const code = await provider.getCode(t);
      if (code && code !== '0x') {
        const c = new ethers.Contract(t, [
          'function name() view returns (string)',
          'function symbol() view returns (string)',
          'function decimals() view returns (uint8)'
        ], provider);
        const name = await c.name().catch(() => 'N/A');
        const symbol = await c.symbol().catch(() => 'N/A');
        const decimals = await c.decimals().catch(() => 18);
        console.log(`[FOUND CONTRACT] Address: ${t} -> ${name} (${symbol}), decimals: ${decimals}`);
      }
    } catch (e) {
      // ignore
    }
  }
}

findUsdtTestnet().catch(console.error);
