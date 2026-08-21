import { ethers } from 'ethers';

async function checkUserBalances() {
  const mainnetRpc = 'https://rpc.xlayer.tech';
  const testnetRpc = 'https://testrpc.xlayer.tech';

  const mainnetProvider = new ethers.JsonRpcProvider(mainnetRpc);
  const testnetProvider = new ethers.JsonRpcProvider(testnetRpc);

  const usdtMainnetAddr = '0x1E4a5963aBFD975d8c9021ce480b42188849D41d';
  const usdgMainnetAddr = '0x4ae46a509f6b1d9056937ba4500cb143933d2dc8';

  const erc20Abi = [
    'function balanceOf(address) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)'
  ];

  console.log('--- Testing Mainnet Contract Calls ---');
  try {
    const usdt = new ethers.Contract(usdtMainnetAddr, erc20Abi, mainnetProvider);
    const sym = await usdt.symbol();
    const dec = await usdt.decimals();
    console.log(`Mainnet USDT (${sym}) decimals: ${dec}`);
  } catch (e) {
    console.log('Mainnet USDT call error:', e.message);
  }

  console.log('--- Testing Testnet Contract Calls with USDG ---');
  try {
    const usdg = new ethers.Contract(usdgMainnetAddr, erc20Abi, testnetProvider);
    const sym = await usdg.symbol();
    const dec = await usdg.decimals();
    console.log(`Testnet USDG (${sym}) decimals: ${dec}`);
  } catch (e) {
    console.log('Testnet USDG call error:', e.message);
  }
}

checkUserBalances().catch(console.error);
