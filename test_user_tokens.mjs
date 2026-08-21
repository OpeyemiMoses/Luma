import { ethers } from 'ethers';

async function testUserAddresses() {
  const provider = new ethers.JsonRpcProvider('https://testrpc.xlayer.tech');
  
  const testnetUsdt = '0x9e29b3aada05bf2d2c827af80bd28dc0b9b4fb0c';
  const testnetUsdg = '0xa78e2baabaf5c4f36b7fc394725deb68d332eec1';

  const erc20Abi = [
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)'
  ];

  console.log('Testing Testnet USDT:', testnetUsdt);
  try {
    const c1 = new ethers.Contract(testnetUsdt, erc20Abi, provider);
    const sym1 = await c1.symbol();
    const dec1 = await c1.decimals();
    console.log(`✅ Testnet USDT: Symbol = ${sym1}, Decimals = ${dec1}`);
  } catch (e) {
    console.log('❌ Testnet USDT error:', e.message);
  }

  console.log('Testing Testnet USDG:', testnetUsdg);
  try {
    const c2 = new ethers.Contract(testnetUsdg, erc20Abi, provider);
    const sym2 = await c2.symbol();
    const dec2 = await c2.decimals();
    console.log(`✅ Testnet USDG: Symbol = ${sym2}, Decimals = ${dec2}`);
  } catch (e) {
    console.log('❌ Testnet USDG error:', e.message);
  }
}

testUserAddresses().catch(console.error);
