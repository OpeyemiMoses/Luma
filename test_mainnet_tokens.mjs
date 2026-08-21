import { ethers } from 'ethers';

async function testMainnetTokens() {
  const provider = new ethers.JsonRpcProvider('https://rpc.xlayer.tech');
  
  const mainnetUsdt = '0x779ded0c9e1022225f8e0630b35a9b54be713736';
  const mainnetUsdg = '0x4ae46a509f6b1d9056937ba4500cb143933d2dc8';

  const erc20Abi = [
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)'
  ];

  console.log('Testing Mainnet USDT:', mainnetUsdt);
  try {
    const c1 = new ethers.Contract(mainnetUsdt, erc20Abi, provider);
    const sym1 = await c1.symbol();
    const dec1 = await c1.decimals();
    console.log(`✅ Mainnet USDT: Symbol = ${sym1}, Decimals = ${dec1}`);
  } catch (e) {
    console.log('❌ Mainnet USDT error:', e.message);
  }

  console.log('Testing Mainnet USDG:', mainnetUsdg);
  try {
    const c2 = new ethers.Contract(mainnetUsdg, erc20Abi, provider);
    const sym2 = await c2.symbol();
    const dec2 = await c2.decimals();
    console.log(`✅ Mainnet USDG: Symbol = ${sym2}, Decimals = ${dec2}`);
  } catch (e) {
    console.log('❌ Mainnet USDG error:', e.message);
  }
}

testMainnetTokens().catch(console.error);
