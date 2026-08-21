# Luma Finance — AI-Managed RWA Strategy Vault on X Layer

> **Target Network:** X Layer Mainnet (`Chain ID: 196`) & X Layer Testnet (`Chain ID: 1952`)  
> **Initial Strategy:** USDG + PT-USDG (Pendle Market on X Layer maturing Oct 29, 2026)  
> **Interfaces:** Web App + Telegram Bot + Autonomous Execution Engine + Smart Contracts  
> **Production Standard:** Real onchain contracts, deterministic risk engine, fail-closed policy validation, and cryptographic audit registry. Zero mocked data or custodial keys.

---

## 🌟 Core Architecture & Principles

Luma Finance operates under a strict principle:
> **The user defines the boundaries. The AI makes decisions inside those boundaries. The smart contract enforces the boundaries. X Layer executes the approved action.**

```
REAL MARKET DATA (X Layer / Chainlink)
       ↓
DATA INDEXER SERVICE
       ↓
DETERMINISTIC RISK ENGINE (0-100 Scorecard)
       ↓
AI STRATEGY AGENT (Zod Schema-Validated JSON)
       ↓
DECISION PROPOSAL
       ↓
POLICY MANAGER (Smart Contract / Simulation)
       │
  ┌────┴────┐
  │         │
REJECT    APPROVE
  │         │
 STOP       ├── Autonomous Mode ────→ EXECUTION ROUTER ──→ PENDLE ON X LAYER ──→ LUMA VAULT
            └── Approval Mode   ────→ TELEGRAM ALERT   ──→ WEB APP REVIEW   ──→ USER SIGNS TX
```

---

## 🛡️ Key Verified X Layer Deployments

- **USDG (Paxos Global Dollar RWA):** `0x4ae46a509f6b1d9056937ba4500cb143933d2dc8`
- **Pendle PT-USDG Market (29 OCT 2026):** `0x9a09a9e491db3dd8ada5b1b889991ac9ad5fd362`
- **Pendle Router V4:** `0x888888888889758F76e7103c6CbF23ABbF58F946`
- **RPC URL:** `https://rpc.xlayer.tech`
- **Explorer:** `https://www.oklink.com/xlayer`

---

## 📦 Project Structure

```
luma-finance/
├── contracts/                     # Solidity 0.8.20 Smart Contracts
│   ├── LumaVault.sol              # Non-custodial ERC-4626 Strategy Vault
│   ├── PolicyManager.sol          # Boundary & Limit Enforcement Contract
│   ├── ExecutionRouter.sol        # Whitelisted Pendle Swap Router
│   ├── DecisionRegistry.sol       # Cryptographic Decision Audit Trail
│   ├── interfaces/                # Standard & Pendle interfaces
│   └── mocks/                     # Local test harness tokens & Pendle router
├── packages/
│   ├── types/                     # TypeScript types & Zod decision schemas
│   ├── config/                    # Verified addresses, network configs, risk profiles
│   └── sdk/                       # High-level Luma client SDK
├── services/
│   ├── indexer/                   # Live X Layer & Pendle state indexer
│   ├── risk-engine/               # Deterministic mathematical risk scoring (0-100)
│   ├── executor/                  # Policy simulation & autonomous execution worker
│   ├── notifications/             # Rich Telegram alert dispatcher
│   └── audit/                     # AI decision hashing & /why explanation store
├── apps/
│   ├── agent/                     # AI Decision Manager (Schema validation, fail-closed)
│   ├── telegram-bot/              # Telegram command bot (/portfolio, /risk, /why, /pause)
│   └── web/                       # Luxury dark-mode responsive Web App
├── tests/
│   ├── unit/                      # Contracts & Risk Engine unit tests
│   ├── integration/               # Full lifecycle rebalance tests
│   ├── fuzz/                      # Invariant fuzzing
│   └── failure/                   # Stale oracle & fail-closed defense tests
└── docs/
    ├── architecture/              # Architecture diagrams & math models
    ├── threat-model/              # Invariants & threat mitigations
    └── deployment/                # X Layer deployment instructions
```

---

## 🚀 Running the Project

### 1. Run All Tests
```bash
npm test
```

### 2. Launch Web Application
```bash
cd apps/web
npm run dev
```

### 3. Telegram Bot Commands
- `/portfolio`: Real-time balances and asset allocation
- `/risk`: Deterministic risk engine scorecard breakdown
- `/yield`: Blended APY and PT implied fixed yield
- `/why`: Explain reasoning behind the latest AI action
- `/history`: Chronological AI decisions with X Layer tx hashes
- `/vault`: Active policy boundaries and contract addresses
- `/pause`: Emergency strategy pause status

---

## 🔒 Security Guarantees

1. **Zero Private Keys for AI or Telegram**: The AI agent and Telegram bot never have access to private keys or user funds.
2. **Deterministic Smart Contract Policies**: Target allocation, maximum single rebalance step, and slippage are checked onchain before any trade can execute.
3. **No Arbitrary Calls**: `ExecutionRouter.sol` has explicit, typed Pendle swap functions with output strictly returning to `LumaVault.sol`.
4. **Fail-Closed**: If oracles are stale (`> 300s`) or data is unavailable, strategy execution halts immediately without guessing.
