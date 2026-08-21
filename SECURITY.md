# Security Policy

## 🔒 Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| < 2.0   | :x:                |

---

## 🚨 Reporting a Vulnerability

The safety and security of user funds in the Luma Strategy Vault is our highest priority.

If you discover a security issue or vulnerability in our smart contracts, AI engine, or infrastructure, please report it via private disclosure:

- **Email**: [security@lumafinance.xyz](mailto:security@lumafinance.xyz)
- **Telegram (Urgent Security Channel)**: [@LumaSecurity](https://t.me/LumaFinanceBot)

Please provide:
1. Description of the vulnerability and its potential impact.
2. Step-by-step proof of concept (PoC) or reproduction script.
3. Affected smart contracts, functions, or lines of code.

### Response Commitment:
- We acknowledge all critical reports within **24 hours**.
- We provide transparent triage, patch verification, and timeline updates.
- We will coordinate public disclosure after patches have been deployed onchain.

---

## 🛡️ Smart Contract Invariants

Our protocol enforces the following non-negotiable onchain guarantees:

1. **Non-Custodial Rule**: Funds in `LumaVault.sol` can only ever be redeemed by the rightful LP token holders.
2. **Hard PT Ceiling**: Allocations to `Pendle PT-USDG` are bounded by `PolicyManager.sol` (default 40.00% cap).
3. **Atomic Swaps**: All trades executed by `ExecutionRouter.sol` are verified onchain against maximum slippage limits (1.50%).
4. **Fail-Closed Oracles**: If market data is stale (`> 300s`), automated execution halts immediately without guessing.
