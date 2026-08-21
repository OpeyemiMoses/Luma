# Luma Finance - Threat Model & Fail-Closed Guarantees

## 1. Threat Scenarios & Mitigations

### Threat 1: Compromised AI Agent / Hallucinated Commands
- **Risk**: An attacker or model hallucination produces malicious instructions (e.g. "Move 100% of vault to unknown token" or "Send funds to hacker wallet").
- **Mitigation**: The AI agent **never holds private keys** and has **no direct contract call privileges**. Every decision must pass through `PolicyManager.sol` and `ExecutionRouter.sol`. Any parameter out of bounds is rejected at the smart-contract layer.

### Threat 2: Stale Oracles / Broken Data Feeds
- **Risk**: Stale price or liquidity data causes unfavorable swaps.
- **Mitigation**: Fail-closed architecture. `IndexerService` and `PolicyManager.sol` check timestamps (`maxDataAge = 300s`). If data is stale or oracle unreachable, the rebalance loop **halts immediately** without executing.

### Threat 3: Arbitrary Call Exploits
- **Risk**: An attacker uses a generic execution router to trigger `call(address, bytes)` and drain tokens.
- **Mitigation**: `ExecutionRouter.sol` has **zero arbitrary execution methods**. It implements explicit, typed Pendle swap functions with target address hardcoded to `LumaVault.sol`.

### Threat 4: Custodial Risk in Telegram
- **Risk**: Telegram accounts get compromised, exposing user funds.
- **Mitigation**: Telegram is purely read-only and dispatch. Private keys are never imported, generated, or requested via Telegram.

### Threat 5: Flash Loan / Sandwiched Rebalances
- **Risk**: MEV attackers front-run large strategy rebalances.
- **Mitigation**: `PolicyManager` caps single rebalances (`maxSingleRebalanceBps`, default 5-15%) and strictly enforces maximum slippage (`minPtOut` / `minTokenOut`).

---

## 2. Invariant Matrix

| Invariant | Guaranteed By |
|---|---|
| User funds cannot be withdrawn to any address other than share owner | `LumaVault.sol:withdraw` |
| PT exposure cannot exceed user's configured ceiling | `PolicyManager.sol:validateRebalance` |
| Emergency paused vault cannot execute trades | `Pausable` modifier in `LumaVault` & `PolicyManager` |
| All AI actions have immutable onchain audit trail | `DecisionRegistry.sol` |
