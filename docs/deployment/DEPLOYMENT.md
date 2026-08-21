# Luma Finance - Deployment & Verification Guide

## Network Details

### X Layer Mainnet
- **Network Name:** X Layer Mainnet
- **Chain ID:** `196`
- **RPC URL:** `https://rpc.xlayer.tech` (or `https://xlayerrpc.okx.com`)
- **Currency Symbol:** `OKB`
- **Explorer:** [https://www.oklink.com/xlayer](https://www.oklink.com/xlayer)

### Verified Core Contracts on X Layer
- **USDG (Global Dollar):** `0x4ae46a509f6b1d9056937ba4500cb143933d2dc8`
- **PT-USDG Pendle Market (29 Oct 2026):** `0x9a09a9e491db3dd8ada5b1b889991ac9ad5fd362`
- **Pendle Router V4:** `0x888888888889758F76e7103c6CbF23ABbF58F946`

---

## Deployment Steps

1. **Deploy `PolicyManager.sol`**:
   - Constructor args: `[deployerAddress]`
   - Allowlist USDG and PT-USDG tokens: `setAssetAllowed(...)`
   - Allowlist Pendle Router: `setProtocolAllowed(...)`

2. **Deploy `DecisionRegistry.sol`**:
   - Constructor args: `[deployerAddress]`

3. **Deploy `ExecutionRouter.sol`**:
   - Constructor args: `[deployerAddress, policyManagerAddress, pendleRouterAddress]`
   - Approve Pendle Market: `setMarketApproved(marketAddress, true)`

4. **Deploy `LumaVault.sol`**:
   - Constructor args: `[deployerAddress, usdgAddress, ptUsdgAddress, pendleMarketAddress, policyManagerAddress, executionRouterAddress, decisionRegistryAddress]`
   - Link Vault in `ExecutionRouter`: `executionRouter.setVault(lumaVaultAddress)`
   - Authorize Vault in `DecisionRegistry`: `decisionRegistry.setAuthorizedCaller(lumaVaultAddress, true)`

---

## Verification & Testing
Before migrating from Testnet to Mainnet:
- Run contract unit tests: `npm run test:contracts`
- Run invariant & fuzz tests: `npm run test:fuzz`
- Validate fail-closed scenarios: `npm run test:failure`
- Verify maturity countdown matches onchain market expiry.
