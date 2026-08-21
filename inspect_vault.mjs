import { ethers } from 'ethers';

async function checkVault() {
  const provider = new ethers.JsonRpcProvider('https://testrpc.xlayer.tech');
  const vaultAddr = '0x8f4F141E216d48F6493F98F6c8CD19f2D2a40521';

  console.log('Inspecting deployed LumaVault on Testnet:', vaultAddr);
  try {
    const code = await provider.getCode(vaultAddr);
    console.log('Vault code length:', code.length);

    const vault = new ethers.Contract(vaultAddr, [
      'function baseAsset() view returns (address)',
      'function ptAsset() view returns (address)',
      'function totalAssets() view returns (uint256)',
      'function totalShares() view returns (uint256)',
      'function paused() view returns (bool)'
    ], provider);

    const base = await vault.baseAsset();
    const pt = await vault.ptAsset();
    const assets = await vault.totalAssets();
    const shares = await vault.totalShares();
    const paused = await vault.paused();

    console.log(`baseAsset: ${base}`);
    console.log(`ptAsset: ${pt}`);
    console.log(`totalAssets: ${assets}`);
    console.log(`totalShares: ${shares}`);
    console.log(`paused: ${paused}`);
  } catch (e) {
    console.log('Vault inspection error:', e.message);
  }
}

checkVault().catch(console.error);
