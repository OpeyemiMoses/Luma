<div align="center">

# 🌅 LUMA FINANCE

### **Autonomous AI-Managed Real-World Asset (RWA) Strategy Vault & Telegram Sentinel on OKX X Layer**

[![X Layer Mainnet](https://img.shields.io/badge/Network-OKX%20X%20Layer%20Mainnet%20(196)-0284c7?style=for-the-badge&logo=ethereum)](https://www.oklink.com/xlayer)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/Build-Passing-emerald?style=for-the-badge)](https://github.com/)
[![Telegram Bot](https://img.shields.io/badge/Sentinel-@LumaFinanceBot-229ED9?style=for-the-badge&logo=telegram)](https://t.me/LumaFinanceBot)
[![Smart Contracts](https://img.shields.io/badge/Solidity-0.8.20-363636?style=for-the-badge&logo=solidity)](https://soliditylang.org/)

[**Live Web App**](http://localhost:5173/) • [**Technical Documentation**](http://localhost:5173/) • [**Telegram Bot**](https://t.me/LumaFinanceBot) • [**Smart Contracts**](https://www.oklink.com/xlayer/address/0xaa1ca8CF1E50f47815f6720863D8F83ecFAB2f2E)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture & Mechanics](#-architecture--mechanics)
- [Dual RWA Yield Engine](#-dual-rwa-yield-engine)
- [Verified Smart Contracts](#-verified-smart-contracts)
- [Telegram Sentinel Telemetry](#-telegram-sentinel-telemetry)
- [Security & Mathematical Invariants](#-security--mathematical-invariants)
- [Repository Structure](#-repository-structure)
- [Quickstart & Local Development](#-quickstart--local-development)
- [Deployment Guide](#-deployment-guide)
- [Contributing & Community](#-contributing--community)
- [License](#-license)

---

## 🌟 Overview

**Luma Finance** is an institutional-grade, non-custodial decentralized finance protocol built on **OKX X Layer** (Mainnet Chain ID: `196`, Testnet Chain ID: `1952`).

Luma solves the volatility problem of DeFi yields by dynamically blending:
1. **Paxos USDG (4.50% APY)**: Backed 1:1 by short-term US Treasury Bills and cash equivalents, generating daily risk-free government rate yield.
2. **Pendle PT-USDG (7.10% APY)**: Fixed-rate zero-coupon yield token locking in predictable discount convergence to maturity.

An autonomous **AI Strategy Engine** continuously models market risk and Sharpe ratios to propose optimal rebalances, all strictly constrained by **onchain bytecode policy guardrails** (`PolicyManager.sol`).

---

## ✨ Key Features

- 🏛️ **Dual Real-World Asset (RWA) Engine**: Combines US Treasury yield via Paxos USDG and fixed discount yield via Pendle PT-USDG.
- 🤖 **Autonomous AI Rebalancing**: Algorithmic decision proposals with onchain validation and full Zod schema validation.
- 🛡️ **Mathematical Onchain Policy Guardrails**: Hard limits (Max 40% PT ceiling, 1.5% max slippage floor, non-custodial constraints).
- 📡 **Luma Sentinel Telegram Bot (`@LumaFinanceBot`)**: Real-time push telemetry for deposits, withdrawals, rebalances, and APY shifts.
- 📜 **Cryptographic Audit Trail (`DecisionRegistry.sol`)**: Every evaluation, rationale, Sharpe ratio, and tx hash is recorded immutably onchain.
- 📱 **100% Mobile Responsive**: Built with responsive layouts, touch-friendly UI, and smooth performance on mobile and desktop.

---

## 🏛️ Architecture & Mechanics

Luma Finance operates under a strict principle:
> **The user defines the boundaries. The AI makes decisions inside those boundaries. The smart contract enforces the boundaries. X Layer executes the action.**

```
                     REAL MARKET DATA (OKX X Layer)
                                    ↓
                          DATA INDEXER SERVICE
                                    ↓
                   DETERMINISTIC RISK ENGINE (0-100)
                                    ↓
                   AI STRATEGY AGENT (Zod Validated)
                                    ↓
                           DECISION PROPOSAL
                                    ↓
                    POLICY MANAGER (Onchain Invariants)
                                    │
                       ┌────────────┴────────────┐
                       │                         │
                  [REJECT]                  [APPROVE]
                       │                         │
                     HALT           ┌────────────┴────────────┐
                                    │                         │
                            EXECUTION ROUTER          LUMA SENTINEL
                                    ↓                         ↓
                           PENDLE ON X LAYER          TELEGRAM ALERTS
                                    ↓
                            ERC-4626 LUMA VAULT
```

---

## 💰 Dual RWA Yield Engine

| Asset | Underlying Collateral | Mechanism | Target Yield | Risk Level |
| :--- | :--- | :--- | :--- | :--- |
| **Paxos USDG** | US Treasury Bills & Cash (Paxos) | Daily base rate distribution | **4.50% APY** | Ultra Low (Government Backed) |
| **Pendle PT-USDG** | Fixed-yield Principal Token | Discount price convergence to $1.00 at maturity | **7.10% APY** | Low (Smart Contract / Fixed) |
| **Luma Blended Vault** | 60% USDG + 40% PT-USDG | Auto-compounding ERC-4626 Strategy | **5.54% APY** | Optimized Sharpe Ratio |

---

## 🔗 Verified Smart Contracts

All contracts are deployed and verified on **OKX X Layer Mainnet** (`Chain ID: 196`):

| Contract | Role | Verified Address | OKLink Explorer |
| :--- | :--- | :--- | :--- |
| **`LumaVault`** | Non-custodial ERC-4626 Strategy Vault | `0xaa1ca8CF1E50f47815f6720863D8F83ecFAB2f2E` | [View on OKLink](https://www.oklink.com/xlayer/address/0xaa1ca8CF1E50f47815f6720863D8F83ecFAB2f2E) |
| **`PolicyManager`** | Mathematical Invariant & Risk Enforcer | `0xc743883f03De9722050B7da6cd77F91128eD0562` | [View on OKLink](https://www.oklink.com/xlayer/address/0xc743883f03De9722050B7da6cd77F91128eD0562) |
| **`DecisionRegistry`** | Immutable AI Decision & Audit Ledger | `0xca196D22406951c5D14704E61271dF90b3666DbC` | [View on OKLink](https://www.oklink.com/xlayer/address/0xca196D22406951c5D14704E61271dF90b3666DbC) |
| **`ExecutionRouter`** | Atomic Pendle Swap & Liquidity Router | `0x9C2Ced10f2775369C9a17ebB1746199cd92399B6` | [View on OKLink](https://www.oklink.com/xlayer/address/0x9C2Ced10f2775369C9a17ebB1746199cd92399B6) |
| **Paxos USDG** | Official US Treasury Stablecoin | `0x4ae46a509f6b1d9056937ba4500cb143933d2dc8` | [View on OKLink](https://www.oklink.com/xlayer/address/0x4ae46a509f6b1d9056937ba4500cb143933d2dc8) |
| **Pendle Market** | PT-USDG Market (29 OCT 2026) | `0x9a09a9e491db3dd8ada5b1b889991ac9ad5fd362` | [View on OKLink](https://www.oklink.com/xlayer/address/0x9a09a9e491db3dd8ada5b1b889991ac9ad5fd362) |

---

## 🤖 Telegram Sentinel Telemetry

Interact with **`@LumaFinanceBot`** in real time:

- `/status` — Live wallet holdings, detected network, LP shares, and 60/40 strategy breakdown.
- `/risk` — Inspect active mathematical policy guardrails and risk profiles.
- `/setprofile <conservative|balanced|aggressive>` — Switch risk limits directly in chat.
- `/bind <wallet>` — Link your Ethereum/X Layer wallet for instant push notifications.
- `/unbind` — Disconnect push notifications.

---

## 🛡️ Security & Mathematical Invariants

1. **Non-Custodial Guarantee**: User funds can never be withdrawn to any external address other than the depositors themselves.
2. **Hardcoded PT Ceiling**: The vault contract rejects any rebalance that allocates more than the configured PT ceiling (default 40.00%).
3. **Slippage Protection**: Trades exceeding 1.50% slippage are reverted automatically at the smart contract level.
4. **Fail-Closed Oracles**: If onchain price feeds or indexer data are stale (`> 300s`), all rebalance proposals are rejected automatically.

---

## 📁 Repository Structure

```
luma-finance/
├── contracts/                     # Solidity 0.8.20 Smart Contracts
│   ├── LumaVault.sol              # ERC-4626 Strategy Vault
│   ├── PolicyManager.sol          # Boundary & Invariant Enforcer
│   ├── ExecutionRouter.sol        # Whitelisted Pendle Swap Router
│   ├── DecisionRegistry.sol       # Audit Trail Ledger
│   └── interfaces/                # ILumaVault, IPolicyManager, IPendleRouter
├── apps/
│   ├── web/                       # React 18 + Vite + TailwindCSS Web Application
│   │   ├── src/
│   │   │   ├── components/        # LandingPage, Docs, HelpCentre, Visualizers
│   │   │   ├── App.tsx            # Main Dashboard Application
│   │   │   └── wagmi.ts           # RainbowKit & X Layer Configuration
│   │   └── index.html             # Entry HTML with Luma Favicon
│   └── agent/                     # AI Decision Manager (Zod Schema Validation)
├── services/
│   ├── risk-engine/               # Deterministic 0-100 Risk Scoring
│   ├── indexer/                   # Live X Layer & Pendle Indexer
│   ├── executor/                  # Autonomous Execution Worker
│   └── notifications/             # Telegram Sentinel Telemetry Dispatcher
├── scripts/
│   ├── telegram-bot.ts            # Telegram Bot Daemon & HTTP Bridge
│   ├── deploy-mainnet.ts          # Mainnet Contract Deployment
│   └── deploy.ts                  # Testnet Contract Deployment
└── tests/                         # Unit, Integration & Invariant Fuzz Tests
```

---

## 🚀 Quickstart & Local Development

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/<YOUR_GITHUB_USERNAME>/luma-finance.git
cd luma-finance
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

### 3. Launch Web Application

```bash
npm run dev:web
# Web app running at http://localhost:5173
```

### 4. Start Telegram Sentinel Daemon

```bash
npx tsx scripts/telegram-bot.ts
```

### 5. Run Unit & Invariant Tests

```bash
npm test
```

---

## 🌐 Deployment Guide

### Deploying Frontend to Vercel

1. Push your repository to GitHub.
2. Import the repository into **[Vercel](https://vercel.com)**.
3. Configure the build settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**.

---

## 🤝 Contributing & Community

Contributions are welcome! Please read:
- [Contributing Guide](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security Policy](SECURITY.md)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
