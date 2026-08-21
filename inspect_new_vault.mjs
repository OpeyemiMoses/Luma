import { ethers } from 'ethers';

async function checkNewVault() {
  const provider = new ethers.JsonRpcProvider('https://testrpc.xlayer.tech');
  const vaultAddr = '0xa01d818E298429F816d62F6045013D7a34317468';

  console.log('Inspecting newly deployed LumaVault on Testnet:', vaultAddr);
  try {
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

    console.log(`✅ baseAsset: ${base}`);
    console.log(`✅ ptAsset: ${pt}`);
    console.log(`✅ totalAssets: ${assets}`);
    console.log(`✅ totalShares: ${shares}`);
    console.log(`✅ paused: ${paused}`);
  } catch (e) {
    console.log('❌ Vault inspection error:', e.message);
  }
}

checkNewVault().catch(console.error);
