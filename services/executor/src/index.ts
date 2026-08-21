export * from './ExecutorWorker.js';

import { ExecutorWorker } from './ExecutorWorker.js';
import { RISK_PROFILES } from '../../../packages/config/src/index.js';

async function main() {
  console.log('⚡ Starting Luma Autonomous Execution Worker on X Layer...');
  const worker = new ExecutorWorker();
  const result = await worker.runCycle(RISK_PROFILES.Balanced);
  console.log('✅ Cycle Result:');
  console.log(`Action: ${result.decision.action} | Approved: ${result.policyApproved} | Executed: ${result.executed}`);
  if (result.txHash) {
    console.log(`🔗 X Layer Tx: ${result.txHash}`);
  }
}

main().catch(console.error);
