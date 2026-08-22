import React, { useState } from 'react';
import { LumaLogo } from './LumaLogo';
import { XLayerIcon } from './XLayerIcon';
import { useToast } from './Toast';
import { SunsetLandscapeLayer } from './LandingPage';
import {
  BookOpen,
  Layers,
  ShieldCheck,
  Cpu,
  Terminal,
  ExternalLink,
  ChevronRight,
  Copy,
  Check,
  Search,
  ArrowLeft,
  Key,
  Database,
  Coins,
  RefreshCw,
  Code2,
  FileCode,
  Lock,
  Zap,
  Globe,
  Radio,
  FileText,
  Activity,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Sliders,
  PieChart,
  FileCheck2,
  Landmark,
  Shield
} from 'lucide-react';

interface DocumentationPageProps {
  onBack: () => void;
  onOpenHelp: () => void;
}

export const DocumentationPage: React.FC<DocumentationPageProps> = ({
  onBack,
  onOpenHelp
}) => {
  const toast = useToast();
  const [activeSection, setActiveSection] = useState<'overview' | 'architecture' | 'rwa-engine' | 'ai-engine' | 'policy' | 'contracts' | 'sdk'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.info('Copied to Clipboard', `${label} copied.`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const [contractNetwork, setContractNetwork] = useState<'mainnet' | 'testnet'>('mainnet');

  const MAINNET_CONTRACTS = [
    {
      name: 'Luma Vault',
      role: 'ERC-4626 Strategy Vault',
      address: '0xaa1ca8CF1E50f47815f6720863D8F83ecFAB2f2E',
      description: 'Accepts Paxos USDG & Tether USD₮0, issues LP shares, holds reserves, and distributes auto-compounded yield.',
      explorer: 'https://www.oklink.com/xlayer/address/0xaa1ca8CF1E50f47815f6720863D8F83ecFAB2f2E'
    },
    {
      name: 'Policy Manager',
      role: 'Mathematical Risk Enforcer',
      address: '0xc743883f03De9722050B7da6cd77F91128eD0562',
      description: 'Hardcoded onchain rules enforcing max 40% PT allocation, 2% slippage cap, and token allowlists.',
      explorer: 'https://www.oklink.com/xlayer/address/0xc743883f03De9722050B7da6cd77F91128eD0562'
    },
    {
      name: 'Decision Registry',
      role: 'AI Evaluation & Audit Ledger',
      address: '0xca196D22406951c5D14704E61271dF90b3666DbC',
      description: 'Immutable ledger recording all offchain AI evaluations, Sharpe ratio metrics, confidence scores, and proposals.',
      explorer: 'https://www.oklink.com/xlayer/address/0xca196D22406951c5D14704E61271dF90b3666DbC'
    },
    {
      name: 'Execution Router',
      role: 'Liquidity & DEX Dispatcher',
      address: '0x9C2Ced10f2775369C9a17ebB1746199cd92399B6',
      description: 'Performs atomic token swaps and tranches between USDG and Pendle PT-USDG markets within Policy limits.',
      explorer: 'https://www.oklink.com/xlayer/address/0x9C2Ced10f2775369C9a17ebB1746199cd92399B6'
    },
    {
      name: 'Paxos USDG',
      role: 'Underlying RWA Asset (6 Decimals)',
      address: '0x4ae46a509f6b1d9056937ba4500cb143933d2dc8',
      description: 'US Treasury-backed yielding stablecoin powering the base vault yield on OKX X Layer Mainnet.',
      explorer: 'https://www.oklink.com/xlayer/address/0x4ae46a509f6b1d9056937ba4500cb143933d2dc8'
    },
    {
      name: 'Pendle PT-USDG Market',
      role: 'Fixed Income Yield Venue',
      address: '0x9a09a9e491db3dd8ada5b1b889991ac9ad5fd362',
      description: 'Discounted PT-USDG maturity pool on X Layer Mainnet.',
      explorer: 'https://www.oklink.com/xlayer/address/0x9a09a9e491db3dd8ada5b1b889991ac9ad5fd362'
    }
  ];

  const TESTNET_CONTRACTS = [
    {
      name: 'Luma Vault',
      role: 'ERC-4626 Strategy Vault',
      address: '0x792902644680070E5e6FA24aC7edD2f5240B1FB1',
      description: 'Accepts Paxos USDG & Tether USD₮0, issues LP shares, holds reserves, and distributes auto-compounded yield.',
      explorer: 'https://www.oklink.com/xlayer-test/address/0x792902644680070E5e6FA24aC7edD2f5240B1FB1'
    },
    {
      name: 'Policy Manager',
      role: 'Mathematical Risk Enforcer',
      address: '0x295848152B69f42b6186dcfE7FB86c7F2A97A653',
      description: 'Hardcoded onchain rules enforcing max 40% PT allocation, 2% slippage cap, and token allowlists.',
      explorer: 'https://www.oklink.com/xlayer-test/address/0x295848152B69f42b6186dcfE7FB86c7F2A97A653'
    },
    {
      name: 'Decision Registry',
      role: 'AI Evaluation & Audit Ledger',
      address: '0x6daBB7eF8863D3D8528CBcC5365d69D93e359658',
      description: 'Immutable ledger recording all offchain AI evaluations, Sharpe ratio metrics, confidence scores, and proposals.',
      explorer: 'https://www.oklink.com/xlayer-test/address/0x6daBB7eF8863D3D8528CBcC5365d69D93e359658'
    },
    {
      name: 'Execution Router',
      role: 'Liquidity & DEX Dispatcher',
      address: '0x876Ccc1F4efdfFa786bB5cf1E36d77cE07690dcf',
      description: 'Performs atomic token swaps and tranches between USDG and Pendle PT-USDG markets within Policy limits.',
      explorer: 'https://www.oklink.com/xlayer-test/address/0x876Ccc1F4efdfFa786bB5cf1E36d77cE07690dcf'
    },
    {
      name: 'Paxos USDG',
      role: 'Underlying RWA Asset (6 Decimals)',
      address: '0xa78e2baabaf5c4f36b7fc394725deb68d332eec1',
      description: 'US Treasury-backed yielding stablecoin powering the base vault yield on OKX X Layer Testnet.',
      explorer: 'https://www.oklink.com/xlayer-test/address/0xa78e2baabaf5c4f36b7fc394725deb68d332eec1'
    }
  ];

  const activeContracts = contractNetwork === 'mainnet' ? MAINNET_CONTRACTS : TESTNET_CONTRACTS;

  return (
    <div className="luma-docs-root">
      
      {/* Sunset Mountain Landscape Atmospheric Layer */}
      <SunsetLandscapeLayer opacity={0.35} blur={12} />
      <div className="luma-misty-fade-bottom" style={{ pointerEvents: 'none' }} />

      {/* Docs Header Bar */}
      <header className="luma-docs-header">
        <div className="luma-docs-header-left">
          <button onClick={onBack} className="luma-docs-back-btn" title="Back to Application">
            <ArrowLeft size={16} />
            <span>App</span>
          </button>

          <div className="luma-docs-brand-divider" />

          <div className="luma-docs-brand" onClick={onBack} style={{ cursor: 'pointer' }}>
            <LumaLogo size={26} variant="dark" />
            <span className="luma-docs-brand-title">Luma</span>
            <span className="luma-docs-badge font-mono">Docs v2.0</span>
          </div>
        </div>

        <div className="luma-docs-header-right">
          <div className="luma-docs-search-box">
            <Search size={14} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button onClick={onOpenHelp} className="luma-docs-help-nav-btn">
            <span>Help Centre</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </header>

      {/* Docs Main Layout */}
      <div className="luma-docs-container">
        
        {/* Left Sticky Sidebar Navigation */}
        <aside className="luma-docs-sidebar">
          <div className="luma-docs-sidebar-section">
            <div className="luma-docs-sidebar-title">Getting Started</div>
            <button
              onClick={() => setActiveSection('overview')}
              className={`luma-docs-nav-link ${activeSection === 'overview' ? 'active' : ''}`}
            >
              <FileText size={15} />
              <span>Protocol Overview</span>
            </button>
            <button
              onClick={() => setActiveSection('architecture')}
              className={`luma-docs-nav-link ${activeSection === 'architecture' ? 'active' : ''}`}
            >
              <Layers size={15} />
              <span>System Architecture</span>
            </button>
          </div>

          <div className="luma-docs-sidebar-section">
            <div className="luma-docs-sidebar-title">Core Mechanics</div>
            <button
              onClick={() => setActiveSection('rwa-engine')}
              className={`luma-docs-nav-link ${activeSection === 'rwa-engine' ? 'active' : ''}`}
            >
              <Coins size={15} />
              <span>Dual RWA Engine</span>
            </button>
            <button
              onClick={() => setActiveSection('ai-engine')}
              className={`luma-docs-nav-link ${activeSection === 'ai-engine' ? 'active' : ''}`}
            >
              <Cpu size={15} />
              <span>Autonomous AI Engine</span>
            </button>
            <button
              onClick={() => setActiveSection('policy')}
              className={`luma-docs-nav-link ${activeSection === 'policy' ? 'active' : ''}`}
            >
              <ShieldCheck size={15} />
              <span>Onchain Policy & Safety</span>
            </button>
          </div>

          <div className="luma-docs-sidebar-section">
            <div className="luma-docs-sidebar-title">Technical Reference</div>
            <button
              onClick={() => setActiveSection('contracts')}
              className={`luma-docs-nav-link ${activeSection === 'contracts' ? 'active' : ''}`}
            >
              <FileCode size={15} />
              <span>Smart Contracts</span>
            </button>
            <button
              onClick={() => setActiveSection('sdk')}
              className={`luma-docs-nav-link ${activeSection === 'sdk' ? 'active' : ''}`}
            >
              <Code2 size={15} />
              <span>TypeScript SDK</span>
            </button>
          </div>

          <div className="luma-docs-sidebar-footer">
            <div className="luma-docs-network-chip font-mono">
              <XLayerIcon size={13} />
              <span>OKX X Layer Connected</span>
            </div>
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="luma-docs-content">
          
          {/* SECTION 1: PROTOCOL OVERVIEW */}
          {activeSection === 'overview' && (
            <article className="luma-docs-article">
              <div className="luma-docs-badge-tag">Introduction</div>
              <h1>Protocol Overview</h1>
              <p className="luma-docs-lead">
                <strong>Luma</strong> is the first autonomous, AI-driven Real-World Asset (RWA) Strategy Vault built natively on <strong>OKX X Layer</strong>. It combines the yield of US Treasury-backed stablecoins (Paxos USDG) with fixed-income discounts from Pendle Finance Principal Tokens (PT-USDG).
              </p>

              <div className="luma-docs-callout luma-docs-callout-info">
                <Zap size={18} className="text-sky-500" />
                <div>
                  <strong>Key Value Proposition:</strong> Users deposit liquid stablecoins (USDG or USD₮0) and receive ERC-4626 vault shares. An autonomous AI Sharpe engine dynamically balances liquid yield vs. fixed maturity yield, while hardcoded onchain smart contracts guarantee complete non-custodial safety.
                </div>
              </div>

              <h2>Why OKX X Layer?</h2>
              <p>
                X Layer is OKX’s Zero-Knowledge (ZK) Layer-2 network powered by the Polygon CDK. With sub-second block finality and near-zero transaction gas fees, X Layer enables high-frequency AI portfolio rebalancing and real-time Sharpe ratio optimizations that would be cost-prohibitive on Ethereum L1.
              </p>

              <div className="luma-docs-grid-cards">
                <div className="luma-docs-card">
                  <div className="luma-docs-card-icon"><ShieldCheck size={20} className="text-emerald-500" /></div>
                  <h3>100% Non-Custodial</h3>
                  <p>Deposits are locked in verified ERC-4626 contracts. The AI agent only proposes allocations; it can never extract or transfer user funds.</p>
                </div>
                <div className="luma-docs-card">
                  <div className="luma-docs-card-icon"><TrendingUp size={20} className="text-blue-500" /></div>
                  <h3>Dual-Engine Yield</h3>
                  <p>Combines ~4.85% APY from Paxos USDG real-world reserves with ~8.50% APY from Pendle discounted maturity tokens.</p>
                </div>
                <div className="luma-docs-card">
                  <div className="luma-docs-card-icon"><Radio size={20} className="text-purple-500" /></div>
                  <h3>Telegram Sentinel</h3>
                  <p>Real-time push telemetry directly to your Telegram for rebalances, APY rate changes, and onchain safety events.</p>
                </div>
              </div>
            </article>
          )}

          {/* SECTION 2: SYSTEM ARCHITECTURE */}
          {activeSection === 'architecture' && (
            <article className="luma-docs-article">
              <div className="luma-docs-badge-tag">Architecture</div>
              <h1>System Architecture</h1>
              <p className="luma-docs-lead">
                Luma uses a modular onchain architecture with clear separation of concerns between user accounting, mathematical policy enforcement, AI evaluation logging, and swap routing.
              </p>

              <div className="luma-docs-diagram-box">
                <div className="luma-diagram-flow">
                  <div className="luma-diagram-node user">
                    <strong>User / LP</strong>
                    <span>Deposits USDG / USD₮0</span>
                  </div>
                  <div className="luma-diagram-arrow">➔</div>
                  <div className="luma-diagram-node vault">
                    <strong>Luma Vault</strong>
                    <span>ERC-4626 Shares & Accounting</span>
                  </div>
                  <div className="luma-diagram-arrow">➔</div>
                  <div className="luma-diagram-node policy">
                    <strong>Policy Manager</strong>
                    <span>Hard Risk Guardrails (&le;40% PT)</span>
                  </div>
                  <div className="luma-diagram-arrow">➔</div>
                  <div className="luma-diagram-node router">
                    <strong>Execution Router</strong>
                    <span>DEX Swap to PT-USDG</span>
                  </div>
                </div>
              </div>

              <h2>Core Architectural Components</h2>
              <div className="luma-docs-component-list">
                <div className="luma-docs-comp-item">
                  <h3>1. Luma Vault (ERC-4626)</h3>
                  <p>
                    Standardized multi-asset vault compliant with EIP-4626. Handles deposits, redemptions, share accounting, and Net Asset Value (NAV) price calculations.
                  </p>
                </div>
                <div className="luma-docs-comp-item">
                  <h3>2. Policy Manager</h3>
                  <p>
                    The onchain guardian contract. Evaluates proposed AI actions before execution. If any proposal violates hard limits (e.g. slippage &gt; 2%, allocation &gt; 40%, unwhitelisted tokens), the transaction automatically reverts.
                  </p>
                </div>
                <div className="luma-docs-comp-item">
                  <h3>3. Decision Registry</h3>
                  <p>
                    An append-only cryptographic ledger where AI decisions, market telemetry, Sharpe ratios, and timestamps are recorded for public verification and auditability.
                  </p>
                </div>
                <div className="luma-docs-comp-item">
                  <h3>4. Execution Router</h3>
                  <p>
                    A dedicated contract authorized by the Vault to execute swaps between liquid USDG and discounted PT-USDG through approved liquidity pools.
                  </p>
                </div>
              </div>
            </article>
          )}

          {/* SECTION 3: DUAL RWA ENGINE */}
          {activeSection === 'rwa-engine' && (
            <article className="luma-docs-article">
              <div className="luma-docs-badge-tag">Yield Dynamics</div>
              <h1>Dual RWA Yield Engine</h1>
              <p className="luma-docs-lead">
                Traditional DeFi vaults rely on inflationary token emissions. Luma generates true institutional-grade yield backed 100% by US Real-World Assets (RWAs).
              </p>

              <h2>1. Paxos USDG (Liquid Yield Anchor)</h2>
              <p>
                Paxos USDG is a compliant, enterprise-grade stablecoin backed by US Treasury Bills and cash equivalents. It pays daily interest into the vault reserve without locking capital, providing the foundational liquidity layer for instant withdrawals.
              </p>

              <h2>2. Pendle PT-USDG (Fixed Maturity Boost)</h2>
              <p>
                Principal Tokens (PT) represent the fixed yield component of USDG deposited in Pendle. PT trades at a market discount to USDG and matures 1:1 on expiry, locking in a predictable fixed APY.
              </p>

              <div className="luma-docs-callout luma-docs-callout-success">
                <Coins size={18} className="text-emerald-500" />
                <div>
                  <strong>Auto-Compounding Mechanism:</strong> As PT tokens approach maturity, the price discount diminishes toward par value ($1.00). The Vault's Net Asset Value (NAV) per share increases organically every second.
                </div>
              </div>
            </article>
          )}

          {/* SECTION 4: AI ENGINE */}
          {activeSection === 'ai-engine' && (
            <article className="luma-docs-article">
              <div className="luma-docs-badge-tag">Autonomous Strategy</div>
              <h1>Autonomous AI Sharpe Engine</h1>
              <p className="luma-docs-lead">
                Luma’s offchain agent continuously monitors live market yields, orderbook depth, time-to-maturity, and gas metrics to optimize risk-adjusted returns.
              </p>

              <h2>Sharpe Ratio Optimization Model</h2>
              <p>
                The AI calculates the optimal balance between liquid USDG (risk-free benchmark) and PT-USDG (fixed yield with term commitment):
              </p>
              
              <div className="luma-docs-code-block font-mono">
                {`Sharpe Ratio = (Expected Return - Risk-Free Rate) / Volatility
Target PT Allocation = f(Maturity Discount, Pool Liquidity, Time to Expiry)`}
              </div>

              <h2>Evaluation Lifecycle</h2>
              <ol className="luma-docs-numbered-list">
                <li><strong>Telemetry Ingestion:</strong> Ingests onchain reserves, OKLink DEX prices, and Pendle yield curves.</li>
                <li><strong>Mathematical Optimization:</strong> Solves allocation weights subject to user profile constraints.</li>
                <li><strong>Onchain Policy Check:</strong> Submits proposal to <code>Policy Manager</code> for onchain validation.</li>
                <li><strong>Execution & Logging:</strong> Executes transaction via <code>Execution Router</code> and registers entry in <code>Decision Registry</code>.</li>
              </ol>
            </article>
          )}

          {/* SECTION 5: POLICY & SAFETY */}
          {activeSection === 'policy' && (
            <article className="luma-docs-article">
              <div className="luma-docs-badge-tag">Security & Guardrails</div>
              <h1>Onchain Policy & Safety Bounds</h1>
              <p className="luma-docs-lead">
                Safety in Luma is not a promise—it is mathematically enforced directly by smart contract bytecode on OKX X Layer.
              </p>

              <h2>Risk Envelope Profiles</h2>
              <div className="luma-docs-table-wrapper">
                <table className="luma-docs-table">
                  <thead>
                    <tr>
                      <th>Profile</th>
                      <th>Max PT Allocation</th>
                      <th>Max Single Move</th>
                      <th>Max Slippage</th>
                      <th>Target Risk Profile</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Conservative</strong></td>
                      <td>20%</td>
                      <td>10%</td>
                      <td>1.0%</td>
                      <td>Highest liquidity, minimal duration risk</td>
                    </tr>
                    <tr>
                      <td><strong>Balanced</strong></td>
                      <td>40%</td>
                      <td>20%</td>
                      <td>1.5%</td>
                      <td>Optimal risk-adjusted Sharpe returns</td>
                    </tr>
                    <tr>
                      <td><strong>Aggressive</strong></td>
                      <td>60%</td>
                      <td>30%</td>
                      <td>2.0%</td>
                      <td>Maximized fixed maturity yield capture</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2>Formal Invariants</h2>
              <ul>
                <li><strong>Zero Extraction Invariant:</strong> The AI address has zero withdrawal authorization.</li>
                <li><strong>Atomic Reversion:</strong> Any transaction with price impact &gt; 2% automatically reverts.</li>
                <li><strong>Liquidity Floor:</strong> Minimum 40% liquid USDG must remain available for instant user redemptions.</li>
              </ul>
            </article>
          )}

          {/* SECTION 6: SMART CONTRACTS */}
          {activeSection === 'contracts' && (
            <article className="luma-docs-article">
              <div className="luma-docs-badge-tag">Verified Contracts</div>
              <h1>Verified Smart Contracts</h1>
              <p className="luma-docs-lead">
                All Luma smart contracts are deployed and verified on OKLink for OKX X Layer Mainnet (Chain ID: 196) and Testnet (Chain ID: 1952).
              </p>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setContractNetwork('mainnet')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: contractNetwork === 'mainnet' ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                    background: contractNetwork === 'mainnet' ? '#eff6ff' : '#ffffff',
                    color: contractNetwork === 'mainnet' ? '#2563eb' : '#64748b'
                  }}
                >
                  <XLayerIcon size={14} />
                  <span>OKX X Layer Mainnet (196)</span>
                </button>

                <button
                  onClick={() => setContractNetwork('testnet')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: contractNetwork === 'testnet' ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                    background: contractNetwork === 'testnet' ? '#eff6ff' : '#ffffff',
                    color: contractNetwork === 'testnet' ? '#2563eb' : '#64748b'
                  }}
                >
                  <XLayerIcon size={14} />
                  <span>OKX X Layer Testnet (1952)</span>
                </button>
              </div>

              <div className="luma-docs-contracts-stack">
                {activeContracts.map((c) => (
                  <div key={c.name} className="luma-docs-contract-card">
                    <div className="luma-docs-contract-top">
                      <div>
                        <h3>{c.name}</h3>
                        <span className="luma-docs-contract-role">{c.role}</span>
                      </div>
                      <a href={c.explorer} target="_blank" rel="noreferrer" className="luma-docs-ext-btn">
                        <span>OKLink Explorer</span>
                        <ExternalLink size={13} />
                      </a>
                    </div>
                    <p className="luma-docs-contract-desc">{c.description}</p>
                    <div className="luma-docs-contract-addr-row">
                      <span className="font-mono" style={{ wordBreak: 'break-all', fontSize: '0.76rem' }}>{c.address}</span>
                      <button
                        onClick={() => copyToClipboard(c.address, c.name)}
                        className="luma-docs-copy-btn"
                        title="Copy Address"
                      >
                        {copiedText === c.address ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          )}

          {/* SECTION 7: TYPESCRIPT SDK */}
          {activeSection === 'sdk' && (
            <article className="luma-docs-article">
              <div className="luma-docs-badge-tag">Developer SDK</div>
              <h1>TypeScript SDK & Integration</h1>
              <p className="luma-docs-lead">
                Integrate Luma vault deposits, portfolio queries, and AI audit stream into your own dApps or automated scripts.
              </p>

              <h2>Installation</h2>
              <div className="luma-docs-code-block font-mono">
                {`npm install @luma/sdk ethers`}
              </div>

              <h2>Querying Vault Portfolio & APY</h2>
              <div className="luma-docs-code-block font-mono">
                {`import { LumaSDK } from '@luma/sdk';
import { NETWORKS } from '@luma/config';

const sdk = new LumaSDK(NETWORKS.xlayerTestnet);

// Fetch user vault position
const portfolio = await sdk.getPortfolio('0xYourWalletAddress');
console.log('Shares:', portfolio.totalVaultShares);
console.log('Value USD:', portfolio.portfolioValueUsd);
console.log('Effective APY:', portfolio.effectiveApyPercent);`}
              </div>

              <h2>Depositing Assets Programmatically</h2>
              <div className="luma-docs-code-block font-mono">
                {`import { ethers } from 'ethers';

const vaultAbi = ['function depositAsset(address token, uint256 assets, address receiver) returns (uint256)'];
const vault = new ethers.Contract('0x792902644680070E5e6FA24aC7edD2f5240B1FB1', vaultAbi, signer);

const tx = await vault.depositAsset(
  '0xa78e2baabaf5c4f36b7fc394725deb68d332eec1', // Paxos USDG
  ethers.parseUnits('500', 6),                   // 500 USDG
  await signer.getAddress()
);
await tx.wait();
console.log('Deposit confirmed:', tx.hash);`}
              </div>
            </article>
          )}

        </main>
      </div>

    </div>
  );
};
