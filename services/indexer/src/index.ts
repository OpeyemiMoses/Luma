export * from './IndexerService.js';

import { IndexerService } from './IndexerService.js';
import { NETWORKS } from '../../../packages/config/src/index.js';

async function main() {
  console.log('⚡ Starting Luma Finance Indexer on X Layer Mainnet...');
  const indexer = new IndexerService(NETWORKS.xlayerMainnet);
  const snapshot = await indexer.getMarketDataSnapshot();
  console.log('📊 Market Snapshot:', JSON.stringify(snapshot, null, 2));
}

main().catch(console.error);
