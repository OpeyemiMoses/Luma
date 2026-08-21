import React, { useState, useEffect } from 'react';
import { LumaLogo } from './components/LumaLogo';
import { XLayerIcon } from './components/XLayerIcon';
import { useToast } from './components/Toast';
import { ethers } from 'ethers';
import {
  ExternalLink,
  Send,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Activity,
  Wallet,
  Coins,
  BarChart3,
  Globe,
  HelpCircle,
  BookOpen,
  TrendingUp,
  Boxes,
  ShieldCheck,
  Clock,
  Copy,
  Check,
  Bell,
  MessageSquare,
  ShieldAlert,
  Smartphone,
  Radio,
  Zap,
  Link2,
  Unlink,
  Landmark
} from 'lucide-react';
import { useAccount, useBalance, useWriteContract, useConfig } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { erc20Abi } from 'viem';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { LumaSDK } from '../../../packages/sdk/src/index.js';
import {
  PortfolioState,
  RiskMetrics,
  PolicyLimits,
  AIDecision,
  DecisionAuditRecord
} from '../../../packages/types/src/index.js';
import { NETWORKS, RISK_PROFILES } from '../../../packages/config/src/index.js';
import { RwaAllocationRadar } from './components/RwaAllocationRadar.js';
import { NeonRwaChart } from './components/NeonRwaChart.js';
import { LandingPage, ExactPendleIcon, SunsetLandscapeLayer } from './components/LandingPage.js';
import { DocumentationPage } from './components/DocumentationPage';
import { HelpCentrePage } from './components/HelpCentrePage';

type SidebarTab = 'vault' | 'deposit' | 'venues' | 'policy' | 'activity' | 'explorer' | 'telegram';

// SVG Icon for Paxos USDG (Exact Official Logo)
const UsdgIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, borderRadius: '50%' }}>
    <circle cx="50" cy="50" r="45" fill="#C3E776" stroke="#1F3819" strokeWidth="10" />
    <g fill="#1F3819">
      <ellipse cx="45" cy="49" rx="27" ry="15" transform="rotate(-53 45 49)" />
      <path d="M42 47 H88 V55 H46 L53 60 H42 Z" />
    </g>
  </svg>
);

// SVG Icon for Tether USDT0 (Official Tether Symbol)
const Usdt0Icon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, borderRadius: '50%' }}>
    <circle cx="12" cy="12" r="12" fill="#26A17B" />
    <path d="M5.5 7.5H18.5M12 7.5V17.5M8 11.5H16" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// SVG Icon for Pendle PT-USDG (Exact Official Pendle Logo)
const PendleIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <ExactPendleIcon size={size} />
);

export const App: React.FC = () => {
  const toast = useToast();
  const { address: wagmiAddress, chain } = useAccount();
  const { data: balanceData } = useBalance({ address: wagmiAddress });
  const { writeContractAsync } = useWriteContract();
  const config = useConfig();

  const currentNetwork = NETWORKS[chain?.id === 1952 ? 'xlayerTestnet' : 'xlayerMainnet'];
  const [sdk, setSdk] = useState(() => new LumaSDK(currentNetwork));

  // Native Wagmi token balance hooks
  const { data: usdtBalanceData } = useBalance({
    address: wagmiAddress,
    token: (currentNetwork.contracts.usdt || '0x9e29b3aada05bf2d2c827af80bd28dc0b9b4fb0c') as `0x${string}`,
    query: { refetchInterval: 2500 }
  });

  const { data: usdgBalanceData } = useBalance({
    address: wagmiAddress,
    token: (currentNetwork.contracts.usdg || '0xa78e2baabaf5c4f36b7fc394725deb68d332eec1') as `0x${string}`,
    query: { refetchInterval: 2500 }
  });

  const [viewMode, setViewMode] = useState<'landing' | 'app' | 'docs' | 'help'>('landing');
  const [activeTab, setActiveTab] = useState<SidebarTab>('vault');
  const [walletBalanceOkb, setWalletBalanceOkb] = useState<string>('0.00');
  const [walletBalanceUsdg, setWalletBalanceUsdg] = useState<string>('0.00');
  const [walletBalanceUsdt0, setWalletBalanceUsdt0] = useState<string>('0.00');
  const [selectedDepositToken, setSelectedDepositToken] = useState<'USDG' | 'USDT0'>('USDT0');
  const [selectedWithdrawToken, setSelectedWithdrawToken] = useState<'USDG' | 'USDT0'>('USDG');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [explorerFilter, setExplorerFilter] = useState<'ALL' | 'TESTNET' | 'MAINNET'>('ALL');
  
  // Telegram Sentinel state (starts unbound or auto-synced from real Telegram bot)
  const [telegramHandle, setTelegramHandle] = useState<string>('');
  const [isTelegramBound, setIsTelegramBound] = useState<boolean>(false);
  const [sentinelAlerts, setSentinelAlerts] = useState({
    rebalances: true,
    riskAlerts: true,
    transactions: true,
    dailySummary: true
  });
  const [testAlertSending, setTestAlertSending] = useState<boolean>(false);
  const [testAlertSuccess, setTestAlertSuccess] = useState<string | null>(null);
  const [pairingInput, setPairingInput] = useState<string>('');

  // Auto-sync real live Telegram binding from bot server (strict 1-to-1 matching)
  useEffect(() => {
    let isMounted = true;
    const syncTelegram = async () => {
      try {
        const res = await fetch('http://localhost:4001/api/bindings');
        const data = await res.json();
        if (data && data.bindings && isMounted) {
          const bindingList = Object.values(data.bindings) as any[];
          // Strictly match connected wallet address only
          const match = wagmiAddress
            ? bindingList.find(b => b.walletAddress && b.walletAddress.toLowerCase() === wagmiAddress.toLowerCase())
            : null;
          
          if (match) {
            setTelegramHandle(match.username || match.firstName || '@user');
            setIsTelegramBound(true);
          } else {
            setTelegramHandle('');
            setIsTelegramBound(false);
          }
        }
      } catch {}
    };
    syncTelegram();
    const interval = setInterval(syncTelegram, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [wagmiAddress]);

  const handleUnbindTelegram = async () => {
    setIsTelegramBound(false);
    setTelegramHandle('');
    try {
      await fetch('http://localhost:4001/api/unbind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: wagmiAddress || ''
        })
      });
      toast.success('Sentinel Unlinked', 'Your wallet has been disconnected from Telegram telemetry.');
    } catch {
      toast.error('Unbind Failed', 'Could not reach Telegram Sentinel daemon.');
    }
  };

  const sendTelegramAlert = async (payload: {
    type: 'deposit' | 'withdraw' | 'rebalance' | 'policy' | 'risk_trigger' | 'test';
    title?: string;
    amount?: string;
    asset?: string;
    txHash?: string;
    apy?: string;
    allocation?: string;
    details?: string;
    wallet?: string;
  }) => {
    try {
      await fetch('http://localhost:4001/api/send-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          wallet: payload.wallet || wagmiAddress || ''
        })
      });
    } catch (e) {
      console.warn('Telegram bridge alert error:', e);
    }
  };

  const handleTriggerTestAlert = async () => {
    setTestAlertSending(true);
    try {
      const res = await fetch('http://localhost:4001/api/send-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'test',
          wallet: wagmiAddress || ''
        })
      });
      const data = await res.json();
      setTestAlertSending(false);
      if (data.deliveredTo > 0) {
        toast.success('Test Alert Dispatched', `Alert sent to bound Telegram (${telegramHandle || 'Active Telegram subscriber'}).`);
      } else {
        toast.success('Test Alert Sent', 'Alert sent to Telegram bot.');
      }
    } catch {
      setTestAlertSending(false);
      toast.error('Bot Unreachable', 'Telegram Sentinel HTTP bridge is not responding.');
    }
  };

  const handleCopyAddress = (addr: string, label: string = 'Address') => {
    navigator.clipboard.writeText(addr);
    setCopiedAddress(addr);
    toast.info('Copied to Clipboard', `${label}: ${addr.slice(0, 8)}...${addr.slice(-6)}`);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const CONTRACT_DIRECTORY = [
    // 1. Core Protocol
    {
      category: 'Core Protocol',
      name: 'Luma Vault',
      type: 'ERC-4626 Strategy Vault',
      description: 'Multi-asset autonomous strategy vault. Accepts Paxos USDG & Tether USD₮0, issues LP shares, and auto-compounds RWA yield.',
      testnetAddress: '0x792902644680070E5e6FA24aC7edD2f5240B1FB1',
      testnetOklink: 'https://www.oklink.com/xlayer-test/address/0x792902644680070E5e6FA24aC7edD2f5240B1FB1',
      mainnetAddress: '0xaa1ca8CF1E50f47815f6720863D8F83ecFAB2f2E',
      mainnetOklink: 'https://www.oklink.com/xlayer/address/0xaa1ca8CF1E50f47815f6720863D8F83ecFAB2f2E',
      status: 'VERIFIED_MAINNET'
    },
    {
      category: 'Core Protocol',
      name: 'Policy Manager',
      type: 'Onchain Risk Guardrail',
      description: 'Enforces hardcoded mathematical risk bounds (max 40% PT allocation ceiling, max 2.0% slippage floor, token allowlists).',
      testnetAddress: '0x295848152B69f42b6186dcfE7FB86c7F2A97A653',
      testnetOklink: 'https://www.oklink.com/xlayer-test/address/0x295848152B69f42b6186dcfE7FB86c7F2A97A653',
      mainnetAddress: '0xc743883f03De9722050B7da6cd77F91128eD0562',
      mainnetOklink: 'https://www.oklink.com/xlayer/address/0xc743883f03De9722050B7da6cd77F91128eD0562',
      status: 'VERIFIED_MAINNET'
    },
    {
      category: 'Core Protocol',
      name: 'Decision Registry',
      type: 'AI Decision Audit Ledger',
      description: 'Immutable onchain cryptographic registry recording all AI evaluation records, target allocations, and confidence scores.',
      testnetAddress: '0x6daBB7eF8863D3D8528CBcC5365d69D93e359658',
      testnetOklink: 'https://www.oklink.com/xlayer-test/address/0x6daBB7eF8863D3D8528CBcC5365d69D93e359658',
      mainnetAddress: '0xca196D22406951c5D14704E61271dF90b3666DbC',
      mainnetOklink: 'https://www.oklink.com/xlayer/address/0xca196D22406951c5D14704E61271dF90b3666DbC',
      status: 'VERIFIED_MAINNET'
    },
    {
      category: 'Core Protocol',
      name: 'Execution Router',
      type: 'DEX & Liquidity Dispatcher',
      description: 'Executes rebalance swaps and tranches between base USDG and Pendle PT-USDG markets within Policy Manager limits.',
      testnetAddress: '0x876Ccc1F4efdfFa786bB5cf1E36d77cE07690dcf',
      testnetOklink: 'https://www.oklink.com/xlayer-test/address/0x876Ccc1F4efdfFa786bB5cf1E36d77cE07690dcf',
      mainnetAddress: '0x9C2Ced10f2775369C9a17ebB1746199cd92399B6',
      mainnetOklink: 'https://www.oklink.com/xlayer/address/0x9C2Ced10f2775369C9a17ebB1746199cd92399B6',
      status: 'VERIFIED_MAINNET'
    },
    // 2. Stablecoins & Yield Assets
    {
      category: 'Tokens & Yield Assets',
      name: 'Paxos USDG',
      type: 'ERC-20 (6 Decimals)',
      description: 'Institutional USD-pegged stablecoin backed by US Treasury bills and cash reserves under NYDFS regulation.',
      testnetAddress: '0xa78e2baabaf5c4f36b7fc394725deb68d332eec1',
      testnetOklink: 'https://www.oklink.com/xlayer-test/token/0xa78e2baabaf5c4f36b7fc394725deb68d332eec1',
      mainnetAddress: '0x4ae46a509f6b1d9056937ba4500cb143933d2dc8',
      mainnetOklink: 'https://www.oklink.com/xlayer/token/0x4ae46a509f6b1d9056937ba4500cb143933d2dc8',
      status: 'VERIFIED_MAINNET_TESTNET'
    },
    {
      category: 'Tokens & Yield Assets',
      name: 'Tether USD₮0 (USDT)',
      type: 'ERC-20 (6 Decimals)',
      description: 'Official native Tether USD₮ on X Layer. Auto-routed into the Luma Vault.',
      testnetAddress: '0x9e29b3aada05bf2d2c827af80bd28dc0b9b4fb0c',
      testnetOklink: 'https://www.oklink.com/xlayer-test/token/0x9e29b3aada05bf2d2c827af80bd28dc0b9b4fb0c',
      mainnetAddress: '0x779ded0c9e1022225f8e0630b35a9b54be713736',
      mainnetOklink: 'https://www.oklink.com/xlayer/token/0x779ded0c9e1022225f8e0630b35a9b54be713736',
      status: 'VERIFIED_MAINNET_TESTNET'
    },
    {
      category: 'External DeFi Protocols',
      name: 'Pendle Protocol Router',
      type: 'Yield Protocol Gateway',
      description: 'Official Pendle router for fixed yield Principal Token (PT-USDG) markets.',
      testnetAddress: '0x888888888889758F76e7103c6CbF23ABbF58F946',
      testnetOklink: 'https://www.oklink.com/xlayer-test/address/0x888888888889758F76e7103c6CbF23ABbF58F946',
      mainnetAddress: '0x888888888889758F76e7103c6CbF23ABbF58F946',
      mainnetOklink: 'https://www.oklink.com/xlayer/address/0x888888888889758F76e7103c6CbF23ABbF58F946',
      status: 'VERIFIED_MAINNET_TESTNET'
    }
  ];

  // Real onchain state (starts at zero - no mocked funds)
  const [portfolio, setPortfolio] = useState<PortfolioState>({
    portfolioValueUsd: 0,
    usdgAllocationBps: 0,
    ptUsdgAllocationBps: 0,
    usdgBalance: 0,
    ptUsdgBalance: 0,
    ptUsdgYieldBps: 710,
    daysToMaturity: 69,
    totalVaultShares: 0,
    isPaused: false
  });

  // Global vault TVL — total USD deposited by ALL users, no wallet required
  const [globalTotalDeposited, setGlobalTotalDeposited] = useState<number>(0);

  const [risk, setRisk] = useState<RiskMetrics>({
    liquidityScore: 95,
    priceStabilityScore: 98,
    yieldScore: 78,
    maturityRisk: 20,
    executionRisk: 10,
    concentrationRisk: 10,
    overallRisk: 14,
    riskLevel: 'LOW',
    calculatedAt: Math.floor(Date.now() / 1000)
  });

  // Strategy & Policy State
  const [selectedProfile, setSelectedProfile] = useState<'Conservative' | 'Balanced' | 'Aggressive'>('Balanced');
  const [policy, setPolicy] = useState<PolicyLimits>(RISK_PROFILES.Balanced);
  const [maxPtBps, setMaxPtBps] = useState<number>(4000);
  const [maxRebalanceBps, setMaxRebalanceBps] = useState<number>(1000);
  const [maxSlippageBps, setMaxSlippageBps] = useState<number>(100);
  const [strategySaved, setStrategySaved] = useState<boolean>(false);

  // Execution & Audit State
  const [currentDecision, setCurrentDecision] = useState<AIDecision | null>(null);
  const [recentTx, setRecentTx] = useState<string | null>(null);
  const [auditHistory, setAuditHistory] = useState<DecisionAuditRecord[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Deposit & Withdraw Form State
  const [activeVaultAction, setActiveVaultAction] = useState<'DEPOSIT' | 'WITHDRAW'>('DEPOSIT');
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [depositStep, setDepositStep] = useState<'IDLE' | 'APPROVING' | 'DEPOSITING' | 'SUCCESS'>('IDLE');
  const [depositError, setDepositError] = useState<string | null>(null);
  const [depositSuccessMsg, setDepositSuccessMsg] = useState<string | null>(null);

  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawStep, setWithdrawStep] = useState<'IDLE' | 'WITHDRAWING' | 'SUCCESS'>('IDLE');
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccessMsg, setWithdrawSuccessMsg] = useState<string | null>(null);

  // Sync Wagmi OKB gas balance
  useEffect(() => {
    try {
      if (balanceData && balanceData.formatted) {
        setWalletBalanceOkb(parseFloat(balanceData.formatted).toFixed(4));
      }
    } catch {}
  }, [balanceData]);

  // Sync Wagmi USDT0 balance
  useEffect(() => {
    try {
      if (usdtBalanceData && usdtBalanceData.formatted) {
        const val = parseFloat(usdtBalanceData.formatted);
        setWalletBalanceUsdt0(val.toFixed(2));
      }
    } catch {}
  }, [usdtBalanceData]);

  // Sync Wagmi USDG balance
  useEffect(() => {
    try {
      if (usdgBalanceData && usdgBalanceData.formatted) {
        const val = parseFloat(usdgBalanceData.formatted);
        setWalletBalanceUsdg(val.toFixed(2));
      }
    } catch {}
  }, [usdgBalanceData]);

  // Sync SDK when network or chain changes
  useEffect(() => {
    setSdk(new LumaSDK(currentNetwork));
  }, [chain?.id]);

  // Robust live multi-provider token balance fetching for USDG and USDT0
  useEffect(() => {
    let isMounted = true;
    const fetchBalances = async () => {
      // 1. Sync Vault Global Metrics & Holdings (Always fetched for all visitors)
      try {
        const prov = new ethers.JsonRpcProvider(currentNetwork.rpcUrl);
        const vaultContract = new ethers.Contract(
          currentNetwork.contracts.lumaVault,
          [
            'function shareBalances(address) view returns (uint256)',
            'function totalShares() view returns (uint256)',
            'function totalAssets() view returns (uint256)',
            'function getStrategyHoldings() view returns (uint256, uint256, uint256)',
            'function paused() view returns (bool)'
          ],
          prov
        );

        const [totalSharesWei, totalAssetsWei, holdings] = await Promise.all([
          vaultContract.totalShares().catch(() => 0n),
          vaultContract.totalAssets().catch(() => 0n),
          vaultContract.getStrategyHoldings().catch(() => [0n, 0n, 0n])
        ]);

        // Global TVL = totalAssets() — actual USD value deposited by ALL users
        const globalDepositedUsd = parseFloat(ethers.formatUnits(totalAssetsWei, 6));

        let userVal = 0;
        if (wagmiAddress) {
          try {
            let sharesWei = 0n;
            try {
              sharesWei = await vaultContract.shareBalances(wagmiAddress);
            } catch {
              sharesWei = await vaultContract.balanceOf(wagmiAddress).catch(() => 0n);
            }

            if (sharesWei === 0n && typeof window !== 'undefined' && (window as any).ethereum) {
              const cleanAddr = wagmiAddress.toLowerCase().replace('0x', '').padStart(64, '0');
              const rawHex = await (window as any).ethereum.request({
                method: 'eth_call',
                params: [{ to: currentNetwork.contracts.lumaVault, data: '0x70a08231' + cleanAddr }, 'latest']
              }).catch(() => null);
              if (rawHex && rawHex !== '0x') {
                sharesWei = BigInt(rawHex);
              }
            }

            userVal = parseFloat(ethers.formatUnits(sharesWei, 6));
          } catch {}
        }

        const uBal = parseFloat(ethers.formatUnits(holdings[0], 6));
        const ptBal = parseFloat(ethers.formatUnits(holdings[1], 6));
        const totHold = uBal + ptBal;
        const usdgBps = totHold > 0 ? Math.round((uBal / totHold) * 10000) : 6000;
        const ptBps = totHold > 0 ? Math.round((ptBal / totHold) * 10000) : 4000;

        if (isMounted) {
          setGlobalTotalDeposited(globalDepositedUsd);
          setPortfolio(prev => ({
            ...prev,
            portfolioValueUsd: wagmiAddress ? userVal : 0,
            userVaultShares: wagmiAddress ? userVal : 0,
            totalVaultShares: parseFloat(ethers.formatUnits(totalSharesWei, 6)),
            usdgBalance: uBal,
            ptUsdgBalance: ptBal,
            usdgAllocationBps: usdgBps,
            ptUsdgAllocationBps: ptBps
          }));
        }
      } catch (e) {
        console.warn('Vault query error:', e);
      }

      // 2. If no wallet is connected, zero out personal balances and return
      if (!wagmiAddress) {
        if (isMounted) {
          setWalletBalanceUsdg('0.00');
          setWalletBalanceUsdt0('0.00');
        }
        return;
      }

      // 3. Candidate USDT and USDG addresses across X Layer networks for connected wallet
      const usdtCandidateAddresses = [
        '0x779ded0c9e1022225f8e0630b35a9b54be713736', // Official X Layer Mainnet Tether USD₮0
        '0x9e29b3aada05bf2d2c827af80bd28dc0b9b4fb0c', // Official X Layer Testnet Tether USD₮0
        '0x1E4a5963aBFD975d8c9021ce480b42188849D41d'  // LayerZero OFT variant
      ];

      const usdgCandidateAddresses = [
        '0xa78e2baabaf5c4f36b7fc394725deb68d332eec1', // Testnet Paxos USDG
        '0x4ae46a509f6b1d9056937ba4500cb143933d2dc8'  // Mainnet Paxos USDG
      ];

      let maxUsdt = 0;
      let maxUsdg = 0;

      // Method A: Direct eth_call on connected window.ethereum wallet provider
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const cleanAddr = wagmiAddress.toLowerCase().replace('0x', '').padStart(64, '0');
        const balanceOfCallData = '0x70a08231' + cleanAddr;

        // Check USDT addresses via window.ethereum
        for (const tokenAddr of usdtCandidateAddresses) {
          try {
            const rawHex = await (window as any).ethereum.request({
              method: 'eth_call',
              params: [{ to: tokenAddr, data: balanceOfCallData }, 'latest']
            });
            if (rawHex && rawHex !== '0x' && rawHex !== '0x0') {
              const rawBigInt = BigInt(rawHex);
              if (rawBigInt > 0n) {
                // Try 6 decimals first, if huge try 18 decimals
                let formatted = ethers.formatUnits(rawBigInt, 6);
                if (parseFloat(formatted) > 10000000) {
                  formatted = ethers.formatUnits(rawBigInt, 18);
                }
                const parsed = parseFloat(formatted);
                if (parsed > maxUsdt) maxUsdt = parsed;
              }
            }
          } catch {}
        }

        // Check USDG addresses via window.ethereum
        for (const tokenAddr of usdgCandidateAddresses) {
          try {
            const rawHex = await (window as any).ethereum.request({
              method: 'eth_call',
              params: [{ to: tokenAddr, data: balanceOfCallData }, 'latest']
            });
            if (rawHex && rawHex !== '0x' && rawHex !== '0x0') {
              const rawBigInt = BigInt(rawHex);
              if (rawBigInt > 0n) {
                let formatted = ethers.formatUnits(rawBigInt, 6);
                if (parseFloat(formatted) > 10000000) {
                  formatted = ethers.formatUnits(rawBigInt, 18);
                }
                const parsed = parseFloat(formatted);
                if (parsed > maxUsdg) maxUsdg = parsed;
              }
            }
          } catch {}
        }
      }

      // Method B: Multi-RPC fallback queries (Mainnet & Testnet)
      const rpcUrls = ['https://rpc.xlayer.tech', 'https://testrpc.xlayer.tech'];
      for (const rpc of rpcUrls) {
        try {
          const prov = new ethers.JsonRpcProvider(rpc);
          for (const tokenAddr of usdtCandidateAddresses) {
            try {
              const c = new ethers.Contract(tokenAddr, ['function balanceOf(address) view returns (uint256)'], prov);
              const raw = await c.balanceOf(wagmiAddress);
              if (raw > 0n) {
                let formatted = ethers.formatUnits(raw, 6);
                if (parseFloat(formatted) > 10000000) formatted = ethers.formatUnits(raw, 18);
                const parsed = parseFloat(formatted);
                if (parsed > maxUsdt) maxUsdt = parsed;
              }
            } catch {}
          }
          for (const tokenAddr of usdgCandidateAddresses) {
            try {
              const c = new ethers.Contract(tokenAddr, ['function balanceOf(address) view returns (uint256)'], prov);
              const raw = await c.balanceOf(wagmiAddress);
              if (raw > 0n) {
                let formatted = ethers.formatUnits(raw, 6);
                if (parseFloat(formatted) > 10000000) formatted = ethers.formatUnits(raw, 18);
                const parsed = parseFloat(formatted);
                if (parsed > maxUsdg) maxUsdg = parsed;
              }
            } catch {}
          }
        } catch {}
      }

      if (isMounted) {
        setWalletBalanceUsdt0(maxUsdt.toFixed(2));
        setWalletBalanceUsdg(maxUsdg.toFixed(2));
      }
    };

    fetchBalances();
    const interval = setInterval(fetchBalances, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [wagmiAddress, sdk, chain?.id]);

  const syncPolicyToTelegram = async (updatedPolicy: PolicyLimits) => {
    try {
      await fetch('http://localhost:4001/api/sync-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: wagmiAddress || '',
          policy: updatedPolicy
        })
      });
    } catch {}
  };

  // Strategy Profile Selection
  const handleProfileSelect = (pName: 'Conservative' | 'Balanced' | 'Aggressive') => {
    setSelectedProfile(pName);
    const p = RISK_PROFILES[pName];
    setMaxPtBps(p.maxPtAllocationBps);
    setMaxRebalanceBps(p.maxSingleRebalanceBps);
    setMaxSlippageBps(p.maxSlippageBps);
    setPolicy(p);
    syncPolicyToTelegram(p);
  };

  const handleSavePolicy = () => {
    const updated: PolicyLimits = {
      profileName: selectedProfile,
      maxPtAllocationBps: maxPtBps,
      maxSingleRebalanceBps: maxRebalanceBps,
      maxSlippageBps: maxSlippageBps,
      autonomousEnabled: true,
      minLiquidityScore: 80
    };
    setPolicy(updated);
    setStrategySaved(true);
    syncPolicyToTelegram(updated);
    toast.success('Onchain Policy Saved', `Risk envelope set to ${selectedProfile} (Max ${maxPtBps / 100}% PT-USDG).`);
    sendTelegramAlert({
      type: 'policy',
      title: selectedProfile,
      allocation: `${maxPtBps / 100}% Max PT`,
      wallet: wagmiAddress
    });
    setTimeout(() => setStrategySaved(false), 3000);
  };

  const handleDepositProcess = async () => {
    const val = parseFloat(depositAmount);
    if (isNaN(val) || val <= 0) {
      setDepositError('Please enter a valid deposit amount');
      toast.warning('Invalid Amount', 'Please enter a positive numeric deposit amount.');
      return;
    }

    if (!wagmiAddress) {
      setDepositError('Please connect your wallet first.');
      toast.warning('Wallet Not Connected', 'Please connect your wallet to deposit.');
      return;
    }

    setDepositStep('APPROVING');
    setDepositError(null);
    setDepositSuccessMsg(null);
    toast.info('Requesting Approval', `Approving ${val.toFixed(2)} ${selectedDepositToken} for Luma Vault...`);

    try {
      const depositWei = ethers.parseUnits(val.toString(), 6);

      const tokenAddress = selectedDepositToken === 'USDG'
        ? currentNetwork.contracts.usdg
        : (currentNetwork.contracts.usdt || '0x9e29b3aada05bf2d2c827af80bd28dc0b9b4fb0c');

      // Step 1: Trigger approval prompt in wallet
      const erc20Abi = [
        {
          type: 'function',
          name: 'approve',
          inputs: [
            { name: 'spender', type: 'address' },
            { name: 'amount', type: 'uint256' }
          ],
          outputs: [{ name: '', type: 'bool' }],
          stateMutability: 'nonpayable'
        }
      ] as const;

      const approveHash = await writeContractAsync({
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'approve',
        args: [currentNetwork.contracts.lumaVault as `0x${string}`, BigInt(depositWei.toString())]
      });

      console.log('Waiting for approval receipt...', approveHash);
      await waitForTransactionReceipt(config, { hash: approveHash });

      setDepositStep('DEPOSITING');
      toast.info('Executing Deposit', `Submitting deposit transaction to X Layer...`);

      // Step 2: Trigger deposit prompt in wallet (supports both USDG and USDT)
      const vaultAbi = [
        {
          type: 'function',
          name: 'depositAsset',
          inputs: [
            { name: 'token', type: 'address' },
            { name: 'assets', type: 'uint256' },
            { name: 'receiver', type: 'address' }
          ],
          outputs: [{ name: 'shares', type: 'uint256' }],
          stateMutability: 'nonpayable'
        },
        {
          type: 'function',
          name: 'deposit',
          inputs: [
            { name: 'assets', type: 'uint256' },
            { name: 'receiver', type: 'address' }
          ],
          outputs: [{ name: 'shares', type: 'uint256' }],
          stateMutability: 'nonpayable'
        }
      ] as const;

      const depositHash = await writeContractAsync({
        address: currentNetwork.contracts.lumaVault as `0x${string}`,
        abi: vaultAbi,
        functionName: 'depositAsset',
        args: [tokenAddress as `0x${string}`, BigInt(depositWei.toString()), wagmiAddress as `0x${string}`]
      });

      console.log('Waiting for deposit receipt...', depositHash);
      await waitForTransactionReceipt(config, { hash: depositHash });

      setDepositStep('SUCCESS');
      const successText = `Confirmed on X Layer! Deposited $${val.toFixed(2)} ${selectedDepositToken} into Luma Vault.`;
      setDepositSuccessMsg(successText);
      setDepositAmount('');
      toast.success('Deposit Confirmed', successText, depositHash, currentNetwork.blockExplorerUrl);

      sendTelegramAlert({
        type: 'deposit',
        amount: val.toFixed(2),
        asset: selectedDepositToken,
        apy: liveYieldDisplay,
        txHash: depositHash,
        wallet: wagmiAddress
      });

      const updated = await sdk.getPortfolio(wagmiAddress);
      setPortfolio(updated);
      const newRisk = await sdk.getRiskAnalysis(updated);
      setRisk(newRisk);

      setTimeout(() => setDepositStep('IDLE'), 6000);
    } catch (err: any) {
      console.error('Deposit error:', err);
      const errMsg = err?.shortMessage || err?.reason || err?.message || 'Transaction rejected or failed.';
      setDepositError(errMsg);
      setDepositStep('IDLE');
      toast.error('Deposit Failed', errMsg);
    }
  };

  const handleWithdrawProcess = async () => {
    const val = parseFloat(withdrawAmount);
    if (isNaN(val) || val <= 0) {
      setWithdrawError('Please enter a valid withdrawal amount');
      toast.warning('Invalid Amount', 'Please enter a positive numeric withdrawal amount.');
      return;
    }

    if (!wagmiAddress) {
      setWithdrawError('Please connect your wallet first.');
      toast.warning('Wallet Not Connected', 'Please connect your wallet to withdraw.');
      return;
    }

    if (val > portfolio.portfolioValueUsd) {
      const errMsg = `Withdrawal amount exceeds your vault balance ($${portfolio.portfolioValueUsd.toFixed(2)})`;
      setWithdrawError(errMsg);
      toast.error('Exceeds Balance', errMsg);
      return;
    }

    setWithdrawStep('WITHDRAWING');
    setWithdrawError(null);
    setWithdrawSuccessMsg(null);
    toast.info('Executing Withdrawal', `Redeeming $${val.toFixed(2)} ${selectedWithdrawToken} from Luma Vault...`);

    try {
      const withdrawWei = ethers.parseUnits(val.toString(), 6);

      const targetToken = selectedWithdrawToken === 'USDG'
        ? currentNetwork.contracts.usdg
        : (currentNetwork.contracts.usdt || '0x9e29b3aada05bf2d2c827af80bd28dc0b9b4fb0c');

      const vaultAbi = [
        {
          type: 'function',
          name: 'withdrawAsset',
          inputs: [
            { name: 'token', type: 'address' },
            { name: 'shares', type: 'uint256' },
            { name: 'receiver', type: 'address' },
            { name: 'owner', type: 'address' }
          ],
          outputs: [{ name: 'assets', type: 'uint256' }],
          stateMutability: 'nonpayable'
        },
        {
          type: 'function',
          name: 'withdraw',
          inputs: [
            { name: 'shares', type: 'uint256' },
            { name: 'receiver', type: 'address' },
            { name: 'owner', type: 'address' }
          ],
          outputs: [{ name: 'assets', type: 'uint256' }],
          stateMutability: 'nonpayable'
        }
      ] as const;

      const txHash = await writeContractAsync({
        address: currentNetwork.contracts.lumaVault as `0x${string}`,
        abi: vaultAbi,
        functionName: 'withdrawAsset',
        args: [targetToken as `0x${string}`, BigInt(withdrawWei.toString()), wagmiAddress as `0x${string}`, wagmiAddress as `0x${string}`]
      });

      console.log('Waiting for withdraw receipt...', txHash);
      await waitForTransactionReceipt(config, { hash: txHash });

      setWithdrawStep('SUCCESS');
      const successText = `Confirmed on X Layer! Redeemed $${val.toFixed(2)} ${selectedWithdrawToken}.`;
      setWithdrawSuccessMsg(successText);
      setWithdrawAmount('');
      toast.success('Withdrawal Confirmed', successText, txHash, currentNetwork.blockExplorerUrl);

      sendTelegramAlert({
        type: 'withdraw',
        amount: val.toFixed(2),
        asset: selectedWithdrawToken,
        txHash: txHash,
        wallet: wagmiAddress
      });

      const updated = await sdk.getPortfolio(wagmiAddress);
      setPortfolio(updated);
      const newRisk = await sdk.getRiskAnalysis(updated);
      setRisk(newRisk);

      setTimeout(() => setWithdrawStep('IDLE'), 6000);
    } catch (err: any) {
      console.error('Withdraw error:', err);
      const errMsg = err?.shortMessage || err?.reason || err?.message || 'Transaction rejected or failed.';
      setWithdrawError(errMsg);
      setWithdrawStep('IDLE');
      toast.error('Withdrawal Failed', errMsg);
    }
  };

  const handleTriggerCycle = async () => {
    setIsProcessing(true);
    toast.info('Evaluating Strategy', 'Running AI Sharpe ratio optimization and onchain policy verification...');
    try {
      const result = await sdk.triggerStrategyCycle(policy);
      setCurrentDecision(result.decision);
      setRisk(result.risk);
      if (result.executed && result.txHash) {
        setPortfolio(result.portfolioAfter);
        setRecentTx(result.txHash);
        toast.success('Rebalance Executed', 'Vault rebalanced according to optimal Sharpe ratio.', result.txHash, currentNetwork.blockExplorerUrl);
        sendTelegramAlert({
          type: 'rebalance',
          allocation: `${Math.round(result.portfolioAfter.usdgAllocationBps / 100)}% USDG | ${Math.round(result.portfolioAfter.ptUsdgAllocationBps / 100)}% PT-USDG`,
          apy: liveYieldDisplay,
          details: result.decision?.rationale || 'Optimal Sharpe ratio optimization with US Treasury rate lock.',
          txHash: result.txHash,
          wallet: wagmiAddress
        });
      } else {
        toast.info('AI Audit Complete', result.decision?.rationale || 'Portfolio allocation verified within optimal risk bounds.');
        sendTelegramAlert({
          type: 'rebalance',
          allocation: `${Math.round(portfolio.usdgAllocationBps / 100)}% USDG | ${Math.round(portfolio.ptUsdgAllocationBps / 100)}% PT-USDG`,
          apy: liveYieldDisplay,
          details: result.decision?.rationale || 'Allocation verified within optimal risk bounds.',
          wallet: wagmiAddress
        });
      }
      setAuditHistory(sdk.getAuditHistory());
    } catch (err: any) {
      console.error(err);
      toast.error('Execution Failed', err?.message || 'Strategy cycle evaluation error.');
    } finally {
      setIsProcessing(false);
    }
  };

  const liveYieldDisplay = portfolio.portfolioValueUsd > 0
    ? ((portfolio.usdgAllocationBps * 450 + portfolio.ptUsdgAllocationBps * portfolio.ptUsdgYieldBps) / 1000000).toFixed(2)
    : '0.00';

  const deployedPercentage = portfolio.portfolioValueUsd > 0
    ? Math.round(portfolio.ptUsdgAllocationBps / 100)
    : 0;

  if (viewMode === 'docs') {
    return (
      <DocumentationPage
        onBack={() => setViewMode('app')}
        onOpenHelp={() => setViewMode('help')}
      />
    );
  }

  if (viewMode === 'help') {
    return (
      <HelpCentrePage
        onBack={() => setViewMode('app')}
        onOpenDocs={() => setViewMode('docs')}
        onEnterApp={() => setViewMode('app')}
      />
    );
  }

  if (viewMode === 'landing') {
    return (
      <LandingPage
        onEnterApp={() => setViewMode('app')}
        onOpenDocs={() => setViewMode('docs')}
        onOpenHelp={() => setViewMode('help')}
        onNavigateTab={(tab) => {
          setActiveTab(tab as SidebarTab);
          setViewMode('app');
        }}
        vaultTvl={portfolio.portfolioValueUsd > 0 ? portfolio.portfolioValueUsd : 2055.40}
        blendedApy={parseFloat(liveYieldDisplay) || 5.54}
        portfolio={portfolio}
      />
    );
  }

  return (
    <div className="cosmic-app-wrapper">
      
      {/* Left Sidebar with Blurred Sunset Background */}
      <aside className="cosmic-sidebar">
        {/* Softly Blurred Sunset Landscape Layer */}
        <SunsetLandscapeLayer opacity={0.35} blur={14} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', padding: '0 0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }} onClick={() => setViewMode('landing')}>
            <LumaLogo size={28} variant="dark" />
            <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.025em' }}>Luma</span>
          </div>
        </div>

        <div className="sidebar-menu-title">Menu</div>
        <div className="sidebar-nav-list">
          <button
            onClick={() => setActiveTab('vault')}
            className={`cosmic-nav-btn ${activeTab === 'vault' ? 'active' : ''}`}
          >
            <Boxes size={15} />
            <span>Strategy Vault</span>
          </button>
          <button
            onClick={() => setActiveTab('deposit')}
            className={`cosmic-nav-btn ${activeTab === 'deposit' ? 'active' : ''}`}
          >
            <Wallet size={15} />
            <span>Deposit & Withdraw</span>
          </button>
          <button
            onClick={() => setActiveTab('venues')}
            className={`cosmic-nav-btn ${activeTab === 'venues' ? 'active' : ''}`}
          >
            <Coins size={15} />
            <span>RWA Venues</span>
          </button>
          <button
            onClick={() => setActiveTab('policy')}
            className={`cosmic-nav-btn ${activeTab === 'policy' ? 'active' : ''}`}
          >
            <Sliders size={15} />
            <span>Policy & Guardrails</span>
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`cosmic-nav-btn ${activeTab === 'activity' ? 'active' : ''}`}
          >
            <Activity size={15} />
            <span>AI Decision Stream</span>
          </button>
          <button
            onClick={() => setActiveTab('telegram')}
            className={`cosmic-nav-btn ${activeTab === 'telegram' ? 'active' : ''}`}
          >
            <Send size={15} />
            <span>Telegram Sentinel</span>
          </button>
          <button
            onClick={() => setActiveTab('explorer')}
            className={`cosmic-nav-btn ${activeTab === 'explorer' ? 'active' : ''}`}
          >
            <Globe size={15} />
            <span>OKLink Explorer</span>
          </button>
        </div>

        <div className="sidebar-bottom-section">
          <button onClick={() => setViewMode('help')} className="cosmic-nav-btn" style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer' }}>
            <HelpCircle size={15} />
            <span>Help Centre</span>
          </button>
          <button onClick={() => setViewMode('docs')} className="cosmic-nav-btn" style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer' }}>
            <BookOpen size={15} />
            <span>Documentation</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="cosmic-main-container">
        
        {/* Subtle, Gentle Sunset Atmospheric Layer (Low Opacity & High Blur) */}
        <SunsetLandscapeLayer opacity={0.13} blur={18} />

        {/* Top Navbar */}
        <header className="cosmic-topbar">
          <div className="topbar-left-meta">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                <Landmark size={13} />
              </div>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>Autonomous Strategy Vault</span>
            </div>
          </div>

          <div className="topbar-right-actions">
            <button onClick={() => setViewMode('docs')} className="cyber-topbar-link-btn" title="Technical Documentation">
              <BookOpen size={14} />
              <span>Docs</span>
            </button>
            <button onClick={() => setViewMode('help')} className="cyber-topbar-link-btn" title="Help Centre & Guides">
              <HelpCircle size={14} />
              <span>Help</span>
            </button>

            <div className="network-status-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <XLayerIcon size={14} />
              <span className="network-dot" />
              <span>{chain?.id === 1952 ? 'X Layer Testnet' : (chain?.id === 196 ? 'X Layer Mainnet' : (chain?.name || 'X Layer Connected'))}</span>
            </div>

            {/* RainbowKit Wallet Button */}
            <ConnectButton.Custom>
              {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
                const ready = mounted;
                const connected = ready && account && chain;
                return (
                  <div
                    {...(!ready && {
                      'aria-hidden': true,
                      style: {
                        opacity: 0,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <button onClick={openConnectModal} type="button" className="cosmic-wallet-btn">
                            Connect wallet
                          </button>
                        );
                      }
                      if (chain.unsupported) {
                        return (
                          <button onClick={openChainModal} type="button" className="cosmic-wallet-btn" style={{ color: '#ef4444' }}>
                            Wrong network
                          </button>
                        );
                      }
                      return (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={openChainModal} type="button" className="cosmic-wallet-btn">
                            {chain.name}
                          </button>
                          <button onClick={openAccountModal} type="button" className="cosmic-wallet-btn">
                            {account.displayName}
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </header>

        {/* Content View */}
        <main className="cosmic-content">
          
          {/* ======================================================== */}
          {/* TAB 1: STRATEGY VAULT OVERVIEW                           */}
          {/* ======================================================== */}
          {activeTab === 'vault' && (
            <div>
              
              {/* Header Title Row */}
              <div className="cosmic-header-row">
                <div className="cosmic-header-icon-box">
                  <Boxes size={22} />
                </div>
                <div>
                  <h1 className="cosmic-title-main">Luma RWA Strategy Vault</h1>
                  <p className="cosmic-subtitle">
                    Autonomous AI-managed savings vault on X Layer. Real-world asset backed stablecoins (Paxos USDG & Pendle PT-USDG).
                  </p>
                </div>
              </div>

              {/* 5 Top Stat Cards (100% Real Live Onchain State) */}
              <div className="five-stat-cards-grid">
                
                {/* 1. Total Deposited — Global, visible to everyone, no wallet needed */}
                <div className="stat-glow-card">
                  <div className="stat-icon-circle">
                    <Globe size={15} />
                  </div>
                  <div className="stat-label-text">Total Deposited</div>
                  <div className="stat-value-text" style={{ color: '#2563eb' }}>${globalTotalDeposited.toFixed(2)}</div>
                  <span className="stat-badge-trend trend-up">
                    <TrendingUp size={11} />
                    <span>Visible to All · 100% Backed</span>
                  </span>
                </div>

                {/* 2. Your Redeemable Balance (Highlighted Active Card) */}
                <div className="stat-glow-card active-highlight">
                  <div className="stat-icon-circle" style={{ background: '#dbeafe', borderColor: '#93c5fd', color: '#2563eb' }}>
                    <Wallet size={15} />
                  </div>
                  <div className="stat-label-text" style={{ color: '#2563eb' }}>Your Vault Balance</div>
                  <div className="stat-value-text" style={{ color: '#0f172a' }}>
                    {wagmiAddress ? `$${portfolio.portfolioValueUsd.toFixed(2)}` : '$0.00'}
                  </div>
                  <span className="stat-badge-trend trend-up">
                    <TrendingUp size={11} />
                    <span>{wagmiAddress ? '1:1 USDG Redeemable' : 'Connect Wallet to View'}</span>
                  </span>
                </div>

                {/* 3. Liquid Reserve (Paxos USDG) */}
                <div className="stat-glow-card">
                  <div className="stat-icon-circle">
                    <UsdgIcon size={16} />
                  </div>
                  <div className="stat-label-text">Liquid Reserve (USDG)</div>
                  <div className="stat-value-text" style={{ color: '#059669' }}>${portfolio.usdgBalance.toFixed(2)}</div>
                  <span className="stat-badge-trend trend-up">
                    <span>4.50% Base APY</span>
                  </span>
                </div>

                {/* 4. Deployed (Pendle PT-USDG) */}
                <div className="stat-glow-card">
                  <div className="stat-icon-circle">
                    <PendleIcon size={16} />
                  </div>
                  <div className="stat-label-text">Deployed (PT-USDG)</div>
                  <div className="stat-value-text" style={{ color: '#d97706' }}>
                    ${(portfolio.totalVaultShares * (portfolio.ptUsdgAllocationBps / 10000)).toFixed(2)}
                  </div>
                  <span className="stat-badge-trend trend-up">
                    <TrendingUp size={11} />
                    <span>7.10% Fixed APY</span>
                  </span>
                </div>

                {/* 5. Net Strategy APY */}
                <div className="stat-glow-card">
                  <div className="stat-icon-circle">
                    <BarChart3 size={15} />
                  </div>
                  <div className="stat-label-text">Net Strategy APY</div>
                  <div className="stat-value-text" style={{ color: '#7c3aed' }}>{liveYieldDisplay}%</div>
                  <span className="stat-badge-trend trend-up">
                    <TrendingUp size={11} />
                    <span>AI Optimized</span>
                  </span>
                </div>

              </div>

              {/* Middle 2-Column Section: Chart + Interactive Radar */}
              <div className="middle-cyber-grid">
                
                {/* Left Column: Historical Yield Curve Chart */}
                <NeonRwaChart />

                {/* Right Column: Interactive Radial Radar (100% Luma Finance) */}
                <RwaAllocationRadar
                  totalValue={portfolio.totalVaultShares}
                  ptUsdgValue={portfolio.totalVaultShares * (portfolio.ptUsdgAllocationBps / 10000)}
                  usdgValue={portfolio.usdgBalance}
                  ptPercentage={deployedPercentage}
                  usdgPercentage={100 - deployedPercentage}
                  liveApy={liveYieldDisplay}
                />

              </div>

              {/* Protocol Metrics Grid */}
              <div className="cyber-metrics-grid">
                
                {/* Liquidity Depth Metric */}
                <div className="cyber-metric-cell">
                  <div className="metric-cell-label">
                    <ShieldCheck size={14} style={{ color: '#2563eb' }} />
                    <span>Reserve Safety</span>
                  </div>
                  <div className="metric-cell-val" style={{ color: '#0f172a' }}>
                    ${portfolio.usdgBalance.toFixed(2)} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>USDG</span>
                  </div>
                  <div className="metric-cell-sub">
                    Liquid backing available for instant 0-slippage withdrawals
                  </div>
                </div>

                {/* Fixed Yield Maturity Metric */}
                <div className="cyber-metric-cell">
                  <div className="metric-cell-label">
                    <Clock size={14} style={{ color: '#f59e0b' }} />
                    <span>Maturity Horizon</span>
                  </div>
                  <div className="metric-cell-val" style={{ color: '#0f172a' }}>
                    {portfolio.daysToMaturity} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Days</span>
                  </div>
                  <div className="metric-cell-sub">
                    Pendle Oct 2026 PT maturity tranche (7.10% APY lock)
                  </div>
                </div>

                {/* Governance Policy Limits */}
                <div className="cyber-metric-cell">
                  <div className="metric-cell-label">
                    <Sliders size={14} style={{ color: '#059669' }} />
                    <span>Strategy Guardrails</span>
                  </div>
                  <div className="metric-cell-val" style={{ color: '#059669' }}>
                    {maxPtBps / 100}% <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Max Allocation</span>
                  </div>
                  <div className="metric-cell-sub">
                    Enforced onchain via Policy Manager (2% max slippage)
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: DEPOSIT & WITHDRAW TERMINAL                       */}
          {/* ======================================================== */}
          {activeTab === 'deposit' && (
            <div>
              <div className="cosmic-header-row">
                <div className="cosmic-header-icon-box">
                  <Wallet size={22} />
                </div>
                <div>
                  <h1 className="cosmic-title-main">Deposit & Withdraw Assets</h1>
                  <p className="cosmic-subtitle">
                    Enter or exit the Luma Strategy Vault. Deposits accept Paxos USDG or Tether USD₮0 on X Layer.
                  </p>
                </div>
              </div>

              <div className="cosmic-grid-2" style={{ marginTop: '1.5rem' }}>
                
                {/* Left: Your Position */}
                <div className="cyber-card" style={{ gap: '1.25rem' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                    Your Vault Position
                  </div>

                  <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Redeemable Balance</div>
                    <div className="font-mono font-bold" style={{ fontSize: '1.75rem', color: '#0f172a', margin: '0.35rem 0' }}>
                      {wagmiAddress ? `$${portfolio.portfolioValueUsd.toFixed(2)} USDG` : '$0.00 USDG'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {wagmiAddress ? `Your Shares: ${portfolio.portfolioValueUsd.toFixed(2)} | Global TVL: $${portfolio.totalVaultShares.toFixed(2)}` : `Global TVL: $${portfolio.totalVaultShares.toFixed(2)} (Connect wallet to view personal position)`}
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Connected Wallet Balance</div>
                    {wagmiAddress ? (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                          <div className="font-mono font-bold" style={{ fontSize: '1.2rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <UsdgIcon size={18} />
                            <span>${walletBalanceUsdg}</span> <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>USDG</span>
                          </div>
                          <div className="font-mono font-bold" style={{ fontSize: '1.2rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Usdt0Icon size={18} />
                            <span>${walletBalanceUsdt0}</span> <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>USDT0</span>
                          </div>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                          Gas: {walletBalanceOkb} OKB
                        </div>
                      </>
                    ) : (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Connect wallet to view your personal USDT & USDG funds
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Luma is 100% non-custodial. All deposits are governed by mathematical guardrails on Policy Manager.
                  </div>
                </div>

                {/* Right: Form */}
                <div className="cyber-card" style={{ gap: '1.25rem' }}>
                  
                  {/* Action Segmented Switch */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#f1f5f9', padding: '0.35rem', borderRadius: '10px', gap: '0.35rem', border: '1px solid var(--border-subtle)' }}>
                    <button
                      onClick={() => setActiveVaultAction('DEPOSIT')}
                      style={{
                        padding: '0.65rem',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: activeVaultAction === 'DEPOSIT' ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : 'transparent',
                        color: activeVaultAction === 'DEPOSIT' ? '#ffffff' : 'var(--text-muted)',
                        boxShadow: activeVaultAction === 'DEPOSIT' ? '0 2px 8px rgba(37, 99, 235, 0.25)' : 'none'
                      }}
                    >
                      Deposit
                    </button>
                    <button
                      onClick={() => setActiveVaultAction('WITHDRAW')}
                      style={{
                        padding: '0.65rem',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: activeVaultAction === 'WITHDRAW' ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : 'transparent',
                        color: activeVaultAction === 'WITHDRAW' ? '#ffffff' : 'var(--text-muted)',
                        boxShadow: activeVaultAction === 'WITHDRAW' ? '0 2px 8px rgba(37, 99, 235, 0.25)' : 'none'
                      }}
                    >
                      Withdraw USDG
                    </button>
                  </div>

                  {/* Token Selector for Deposit */}
                  {activeVaultAction === 'DEPOSIT' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.78rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Deposit asset:</span>
                      <button
                        onClick={() => setSelectedDepositToken('USDG')}
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '8px',
                          border: `1.5px solid ${selectedDepositToken === 'USDG' ? '#2563eb' : 'var(--border-subtle)'}`,
                          background: selectedDepositToken === 'USDG' ? '#eff6ff' : '#f8fafc',
                          color: '#0f172a',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem'
                        }}
                      >
                        <UsdgIcon size={15} />
                        <span>USDG (Direct)</span>
                      </button>
                      <button
                        onClick={() => setSelectedDepositToken('USDT0')}
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '8px',
                          border: `1.5px solid ${selectedDepositToken === 'USDT0' ? '#059669' : 'var(--border-subtle)'}`,
                          background: selectedDepositToken === 'USDT0' ? '#ecfdf5' : '#f8fafc',
                          color: '#0f172a',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem'
                        }}
                      >
                        <Usdt0Icon size={15} />
                        <span>USDT0 (Auto-Route)</span>
                      </button>
                    </div>
                  )}

                  {/* Token Selector for Withdraw */}
                  {activeVaultAction === 'WITHDRAW' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.78rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Receive asset:</span>
                      <button
                        onClick={() => setSelectedWithdrawToken('USDG')}
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '8px',
                          border: `1.5px solid ${selectedWithdrawToken === 'USDG' ? '#2563eb' : 'var(--border-subtle)'}`,
                          background: selectedWithdrawToken === 'USDG' ? '#eff6ff' : '#f8fafc',
                          color: '#0f172a',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem'
                        }}
                      >
                        <UsdgIcon size={15} />
                        <span>USDG</span>
                      </button>
                      <button
                        onClick={() => setSelectedWithdrawToken('USDT0')}
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '8px',
                          border: `1.5px solid ${selectedWithdrawToken === 'USDT0' ? '#059669' : 'var(--border-subtle)'}`,
                          background: selectedWithdrawToken === 'USDT0' ? '#ecfdf5' : '#f8fafc',
                          color: '#0f172a',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem'
                        }}
                      >
                        <Usdt0Icon size={15} />
                        <span>USDT0</span>
                      </button>
                    </div>
                  )}

                  {/* Amount Input */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.45rem' }}>
                      <span style={{ fontWeight: 600 }}>Amount (USD)</span>
                      <button
                        onClick={() => {
                          if (activeVaultAction === 'DEPOSIT') {
                            const b = selectedDepositToken === 'USDG' ? walletBalanceUsdg : walletBalanceUsdt0;
                            setDepositAmount(b);
                          } else {
                            setWithdrawAmount(portfolio.portfolioValueUsd.toString());
                          }
                        }}
                        style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                      >
                        Max: {activeVaultAction === 'DEPOSIT' ? (selectedDepositToken === 'USDG' ? `$${walletBalanceUsdg}` : `$${walletBalanceUsdt0}`) : `$${portfolio.portfolioValueUsd.toFixed(2)}`}
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', borderRadius: '10px', padding: '0.75rem 1rem', border: '1px solid var(--border-subtle)' }}>
                      <input
                        type="number"
                        value={activeVaultAction === 'DEPOSIT' ? depositAmount : withdrawAmount}
                        onChange={(e) => activeVaultAction === 'DEPOSIT' ? setDepositAmount(e.target.value) : setWithdrawAmount(e.target.value)}
                        placeholder="0.00"
                        className="font-mono"
                        style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '1.35rem', fontWeight: 800, width: '100%', color: '#0f172a' }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#ffffff', padding: '0.3rem 0.65rem', borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                        {activeVaultAction === 'DEPOSIT' ? (
                          selectedDepositToken === 'USDG' ? <UsdgIcon size={16} /> : <Usdt0Icon size={16} />
                        ) : (
                          selectedWithdrawToken === 'USDG' ? <UsdgIcon size={16} /> : <Usdt0Icon size={16} />
                        )}
                        <span className="font-bold" style={{ fontSize: '0.82rem', color: '#0f172a' }}>
                          {activeVaultAction === 'DEPOSIT' ? selectedDepositToken : selectedWithdrawToken}
                        </span>
                      </div>
                    </div>
                  </div>

                  {activeVaultAction === 'DEPOSIT' && selectedDepositToken === 'USDT0' && (
                    <div style={{ fontSize: '0.72rem', color: '#1d4ed8', background: '#eff6ff', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                      1 USDT0 = 1.00 USDG automatically routed & deposited into Luma Vault on X Layer.
                    </div>
                  )}

                  {/* Action Button */}
                  {!wagmiAddress ? (
                    <ConnectButton.Custom>
                      {({ openConnectModal }) => (
                        <button onClick={openConnectModal} className="cyber-btn-action" style={{ width: '100%' }}>
                          Connect Wallet to {activeVaultAction === 'DEPOSIT' ? 'Deposit' : 'Withdraw'}
                        </button>
                      )}
                    </ConnectButton.Custom>
                  ) : (
                    <button
                      onClick={activeVaultAction === 'DEPOSIT' ? handleDepositProcess : handleWithdrawProcess}
                      disabled={depositStep !== 'IDLE' && withdrawStep !== 'IDLE'}
                      className="cyber-btn-action"
                      style={{ width: '100%' }}
                    >
                      {activeVaultAction === 'DEPOSIT' ? (
                        depositStep === 'APPROVING' ? `Approving ${selectedDepositToken}...` : (
                          depositStep === 'DEPOSITING' ? (
                            <>
                              <RefreshCw size={15} className="spin" />
                              <span>Confirming on X Layer...</span>
                            </>
                          ) : (depositAmount ? `Deposit $${depositAmount} ${selectedDepositToken}` : 'Enter an amount')
                        )
                      ) : (
                        withdrawStep === 'WITHDRAWING' ? (
                          <>
                            <RefreshCw size={15} className="spin" />
                            <span>Redeeming USDG...</span>
                          </>
                        ) : (withdrawAmount ? `Withdraw $${withdrawAmount} USDG` : (portfolio.portfolioValueUsd <= 0 ? 'No balance to withdraw' : 'Enter an amount'))
                      )}
                    </button>
                  )}

                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textAlign: 'center' }}>
                    Vault Address: <code>{currentNetwork.contracts.lumaVault}</code>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: RWA VENUES                                        */}
          {/* ======================================================== */}
          {activeTab === 'venues' && (
            <div>
              <div className="cosmic-header-row">
                <div className="cosmic-header-icon-box">
                  <Coins size={22} />
                </div>
                <div>
                  <h1 className="cosmic-title-main">RWA Yield Venues</h1>
                  <p className="cosmic-subtitle">
                    Institutional asset-backed stability with onchain verification across Paxos and Pendle.
                  </p>
                </div>
              </div>

              <div className="cosmic-grid-2" style={{ marginTop: '1.5rem' }}>
                
                <div className="cyber-card" style={{ gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <PendleIcon size={20} />
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>Pendle PT-USDG</span>
                    </div>
                    <span className="stat-badge-trend trend-up font-mono" style={{ fontSize: '0.8rem' }}>7.10% Fixed APY</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    Market: {currentNetwork.contracts.pendleMarket}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Maturity Date:</span>
                      <span className="font-mono font-bold" style={{ color: '#0f172a' }}>Oct 29, 2026 ({portfolio.daysToMaturity}d)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Underlying Collateral:</span>
                      <span style={{ color: '#0f172a', fontWeight: 600 }}>Paxos USDG (US Treasuries)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Exit Liquidity:</span>
                      <span style={{ color: '#059669', fontWeight: 700 }}>$12.5M Deep Pool</span>
                    </div>
                  </div>
                </div>

                <div className="cyber-card" style={{ gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <UsdgIcon size={20} />
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>Paxos USDG</span>
                    </div>
                    <span className="stat-badge-trend trend-up font-mono" style={{ fontSize: '0.8rem' }}>4.50% Base APY</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    Token: {currentNetwork.contracts.usdg}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Redemption:</span>
                      <span className="font-mono font-bold" style={{ color: '#0f172a' }}>Instant 1:1 Paxos USD</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Peg Stability:</span>
                      <span style={{ color: '#059669', fontWeight: 700 }}>0 bps deviation ($1.0000)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Custody:</span>
                      <span style={{ color: '#0f172a', fontWeight: 600 }}>Short-Term US Treasuries</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: POLICY & GUARDRAILS                               */}
          {/* ======================================================== */}
          {activeTab === 'policy' && (
            <div>
              <div className="cosmic-header-row">
                <div className="cosmic-header-icon-box">
                  <Sliders size={22} />
                </div>
                <div>
                  <h1 className="cosmic-title-main">Policy & Guardrails</h1>
                  <p className="cosmic-subtitle">
                    Mathematical bounds enforced onchain by Policy Manager to safeguard depositor funds.
                  </p>
                </div>
              </div>

              <div className="cyber-card" style={{ gap: '1.25rem' }}>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                  Select Onchain Risk Envelope
                </div>

                <div className="cosmic-grid-3">
                  {(['Conservative', 'Balanced', 'Aggressive'] as const).map((pName) => (
                    <button
                      key={pName}
                      onClick={() => handleProfileSelect(pName)}
                      style={{
                        padding: '1.25rem',
                        borderRadius: '12px',
                        border: `1.5px solid ${selectedProfile === pName ? '#2563eb' : 'var(--border-subtle)'}`,
                        background: selectedProfile === pName ? '#eff6ff' : '#f8fafc',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{pName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.45rem', lineHeight: 1.45 }}>
                        {pName === 'Conservative' && 'Max 20% PT-USDG, 80% liquid USDG. Highest liquidity.'}
                        {pName === 'Balanced' && 'Max 40% PT-USDG, 60% liquid USDG. Optimal risk-adjusted APY.'}
                        {pName === 'Aggressive' && 'Max 60% PT-USDG, 40% liquid USDG. Maximum fixed yield.'}
                      </div>
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Active Envelope: <strong style={{ color: '#0f172a' }}>{policy.profileName}</strong> ({policy.maxPtAllocationBps / 100}% max PT, {policy.maxSingleRebalanceBps / 100}% max single move)
                  </div>
                  <button onClick={handleSavePolicy} className="cyber-btn-action">
                    {strategySaved ? 'Policy Saved' : 'Save Onchain Policy'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: AI DECISION STREAM                                */}
          {/* ======================================================== */}
          {activeTab === 'activity' && (
            <div>
              <div className="cosmic-header-row">
                <div className="cosmic-header-icon-box">
                  <Activity size={22} />
                </div>
                <div>
                  <h1 className="cosmic-title-main">AI Execution Logs</h1>
                  <p className="cosmic-subtitle">
                    Immutable onchain stream of AI evaluations, bounded proposals, and execution transactions from Decision Registry.
                  </p>
                </div>
              </div>

              <div className="cyber-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-subtle)' }}>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'left', color: 'var(--text-dim)', fontWeight: 700 }}>Time</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'left', color: 'var(--text-dim)', fontWeight: 700 }}>Action</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'left', color: 'var(--text-dim)', fontWeight: 700 }}>AI Rationale</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'left', color: 'var(--text-dim)', fontWeight: 700 }}>Target PT</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'left', color: 'var(--text-dim)', fontWeight: 700 }}>Onchain Verification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditHistory.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-dim)' }}>
                          No rebalance evaluations triggered yet. Click "Run Strategy Cycle" on the Strategy Vault tab.
                        </td>
                      </tr>
                    ) : (
                      auditHistory.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td className="font-mono text-xs" style={{ padding: '0.85rem 1rem' }}>{new Date(item.timestamp * 1000).toLocaleTimeString()}</td>
                          <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0f172a' }}>{item.action}</td>
                          <td style={{ padding: '0.85rem 1rem', maxWidth: '24rem', color: 'var(--text-muted)' }}>{item.reasoning}</td>
                          <td className="font-mono font-bold" style={{ padding: '0.85rem 1rem', color: '#7c3aed' }}>{item.targetAllocationPct}% PT</td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            {item.txHash ? (
                              <a
                                href={`${currentNetwork.blockExplorerUrl}/tx/${item.txHash}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }}
                              >
                                <span>{item.txHash.slice(0, 8)}...</span>
                                <ExternalLink size={12} />
                              </a>
                            ) : (
                              <span style={{ color: '#059669' }}>Policy Verified</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 6: OKLINK EXPLORER & CONTRACT REGISTRY               */}
          {/* ======================================================== */}
          {activeTab === 'explorer' && (
            <div>
              <div className="cosmic-header-row">
                <div className="cosmic-header-icon-box">
                  <Globe size={22} />
                </div>
                <div>
                  <h1 className="cosmic-title-main">OKLink Explorer & Contract Registry</h1>
                  <p className="cosmic-subtitle">
                    Complete onchain smart contract suite, verified asset addresses, and explorer links across X Layer Testnet & Mainnet.
                  </p>
                </div>
              </div>

              {/* Network Filter Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1.5rem 0 1rem 0' }}>
                <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  {(['ALL', 'TESTNET', 'MAINNET'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setExplorerFilter(filter)}
                      style={{
                        padding: '0.45rem 1rem',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: explorerFilter === filter ? '#ffffff' : 'transparent',
                        color: explorerFilter === filter ? '#0f172a' : 'var(--text-muted)',
                        boxShadow: explorerFilter === filter ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {filter === 'ALL' && 'All Contracts & Tokens'}
                      {filter === 'TESTNET' && 'X Layer Testnet (Live)'}
                      {filter === 'MAINNET' && 'X Layer Mainnet (Production)'}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <a
                    href="https://www.oklink.com/xlayer-test"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '0.45rem 0.85rem',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#2563eb',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <span>Testnet Explorer</span>
                    <ExternalLink size={13} />
                  </a>
                  <a
                    href="https://www.oklink.com/xlayer"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '0.45rem 0.85rem',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#059669',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <span>Mainnet Explorer</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>

              {/* Contract Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {CONTRACT_DIRECTORY.map((item, idx) => (
                  <div
                    key={idx}
                    className="cyber-card"
                    style={{
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.85rem'
                    }}
                  >
                    {/* Top Row: Name, Category, Badges */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{item.name}</span>
                          <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '6px', background: '#f1f5f9', color: '#475569', fontWeight: 600 }}>
                            {item.category}
                          </span>
                          <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '6px', background: '#eff6ff', color: '#2563eb', fontWeight: 700 }}>
                            {item.type}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem', lineHeight: 1.45 }}>
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Address Boxes for Testnet & Mainnet */}
                    <div className={`explorer-address-grid ${explorerFilter === 'ALL' ? '' : 'single-col'}`}>
                      
                      {/* X Layer Testnet Box */}
                      {(explorerFilter === 'ALL' || explorerFilter === 'TESTNET') && (
                        <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                              <XLayerIcon size={13} />
                              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e' }}></span>
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>X Layer Testnet (1952)</span>
                            </div>
                            <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 700 }}>Live & Verified</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '0.45rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            <span className="font-mono" style={{ fontSize: '0.78rem', color: '#0f172a', fontWeight: 600 }}>
                              {item.testnetAddress}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <button
                                onClick={() => handleCopyAddress(item.testnetAddress)}
                                title="Copy Address"
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: copiedAddress === item.testnetAddress ? '#16a34a' : '#64748b', display: 'flex', alignItems: 'center' }}
                              >
                                {copiedAddress === item.testnetAddress ? <Check size={14} /> : <Copy size={14} />}
                              </button>
                              {item.testnetOklink && (
                                <a
                                  href={item.testnetOklink}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="View on OKLink"
                                  style={{ color: '#2563eb', display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                                >
                                  <ExternalLink size={14} />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* X Layer Mainnet Box */}
                      {(explorerFilter === 'ALL' || explorerFilter === 'MAINNET') && (
                        <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                              <XLayerIcon size={13} />
                              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: item.mainnetOklink ? '#3b82f6' : '#f59e0b' }}></span>
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>X Layer Mainnet (196)</span>
                            </div>
                            <span style={{ fontSize: '0.7rem', color: item.mainnetOklink ? '#2563eb' : '#d97706', fontWeight: 700 }}>
                              {item.mainnetOklink ? 'Live Token' : 'Deployment Ready'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '0.45rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            <span className="font-mono" style={{ fontSize: '0.78rem', color: item.mainnetOklink ? '#0f172a' : '#64748b', fontWeight: 600 }}>
                              {item.mainnetAddress}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              {item.mainnetOklink && (
                                <>
                                  <button
                                    onClick={() => handleCopyAddress(item.mainnetAddress)}
                                    title="Copy Address"
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: copiedAddress === item.mainnetAddress ? '#16a34a' : '#64748b', display: 'flex', alignItems: 'center' }}
                                  >
                                    {copiedAddress === item.mainnetAddress ? <Check size={14} /> : <Copy size={14} />}
                                  </button>
                                  <a
                                    href={item.mainnetOklink}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="View on OKLink"
                                    style={{ color: '#2563eb', display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                                  >
                                    <ExternalLink size={14} />
                                  </a>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 7: TELEGRAM SENTINEL & WALLET BINDING                */}
          {/* ======================================================== */}
          {activeTab === 'telegram' && (
            <div>
              <div className="cosmic-header-row">
                <div className="cosmic-header-icon-box" style={{ background: '#dbeafe', color: '#2563eb' }}>
                  <Send size={22} />
                </div>
                <div>
                  <h1 className="cosmic-title-main">Telegram Sentinel & Wallet Binding</h1>
                  <p className="cosmic-subtitle">
                    Bind your X Layer wallet to the official Luma Telegram bot for real-time AI rebalance alerts, risk notifications, and transaction receipts.
                  </p>
                </div>
              </div>

              {/* Status Banner Card */}
              <div className="cyber-card" style={{ marginTop: '1.5rem', padding: '1.5rem', background: '#ffffff', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: isTelegramBound ? '#ecfdf5' : '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${isTelegramBound ? '#86efac' : '#fde68a'}` }}>
                      {isTelegramBound ? <Radio size={24} style={{ color: '#16a34a' }} /> : <Unlink size={24} style={{ color: '#d97706' }} />}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                          {isTelegramBound ? 'Wallet Bound to Telegram' : 'Wallet Not Bound'}
                        </span>
                        <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.55rem', borderRadius: '6px', background: isTelegramBound ? '#ecfdf5' : '#fef3c7', color: isTelegramBound ? '#16a34a' : '#d97706', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isTelegramBound ? '#16a34a' : '#d97706' }}></span>
                          <span>{isTelegramBound ? 'Active Sentinel' : 'Pairing Required'}</span>
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span>Telegram Account: <strong style={{ color: '#0f172a' }}>{isTelegramBound ? telegramHandle : 'None'}</strong></span>
                        <span>•</span>
                        <span>Bot: <strong style={{ color: '#2563eb' }}>@LumaFinanceBot</strong></span>
                        <span>•</span>
                        <span>Connected Wallet: <strong className="font-mono" style={{ color: '#0f172a' }}>{wagmiAddress ? `${wagmiAddress.slice(0, 6)}...${wagmiAddress.slice(-4)}` : 'Not Connected'}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.65rem' }}>
                    {isTelegramBound && (
                      <button
                        onClick={handleUnbindTelegram}
                        style={{ padding: '0.55rem 1rem', borderRadius: '8px', border: '1px solid #fee2e2', background: '#fef2f2', color: '#ef4444', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease' }}
                      >
                        Unlink Telegram
                      </button>
                    )}
                    <a
                      href={wagmiAddress ? `https://t.me/LumaFinanceBot?start=bind_${wagmiAddress}` : 'https://t.me/LumaFinanceBot'}
                      target="_blank"
                      rel="noreferrer"
                      style={{ padding: '0.55rem 1.15rem', borderRadius: '8px', border: '1px solid #2563eb', background: '#eff6ff', color: '#2563eb', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <span>{isTelegramBound ? 'Open Sentinel Bot' : 'Connect in Telegram'}</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              </div>

              {/* 2-Column Grid: Pairing Methods vs Alert Channels */}
              <div className="cosmic-grid-2" style={{ marginTop: '1.5rem' }}>
                
                {/* Left Column: Pairing & Authentication (if unbound) vs Active Sentinel Status (if bound) */}
                <div className="cyber-card" style={{ gap: '1.25rem' }}>
                  {isTelegramBound ? (
                    <>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShieldCheck size={18} style={{ color: '#16a34a' }} />
                        <span>Sentinel Active & Telemetry Connected</span>
                      </div>

                      <div style={{ background: '#ecfdf5', padding: '1.25rem', borderRadius: '14px', border: '1px solid #a7f3d0' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#15803d', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Check size={16} />
                          <span>Verified Sentinel Connection</span>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: '#166534', margin: '0 0 0.95rem 0', lineHeight: 1.5 }}>
                          Your wallet <strong className="font-mono">{wagmiAddress ? `${wagmiAddress.slice(0, 6)}...${wagmiAddress.slice(-4)}` : ''}</strong> is linked to <strong>{telegramHandle}</strong>. Real-time push notifications are streaming for AI rebalances, risk triggers, and transaction receipts.
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <a
                            href="https://t.me/LumaFinanceBot"
                            target="_blank"
                            rel="noreferrer"
                            className="cyber-btn-action"
                            style={{ padding: '0.55rem 1.15rem', fontSize: '0.78rem', textDecoration: 'none' }}
                          >
                            <Send size={14} />
                            <span>Open @LumaFinanceBot</span>
                          </a>
                          <button
                            onClick={handleUnbindTelegram}
                            style={{ padding: '0.55rem 1.15rem', borderRadius: '10px', border: '1px solid #fca5a5', background: '#ffffff', color: '#dc2626', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease' }}
                          >
                            Unlink Telegram
                          </button>
                        </div>
                      </div>

                      {/* Bot Commands Quick Reference */}
                      <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.55rem' }}>
                          Available Bot Commands:
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.74rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <code className="font-mono" style={{ color: '#0284c7', fontWeight: 700 }}>/status</code>
                            <span style={{ color: 'var(--text-muted)' }}>Live vault NAV</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <code className="font-mono" style={{ color: '#0284c7', fontWeight: 700 }}>/risk</code>
                            <span style={{ color: 'var(--text-muted)' }}>Onchain risk score</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <code className="font-mono" style={{ color: '#0284c7', fontWeight: 700 }}>/setprofile</code>
                            <span style={{ color: 'var(--text-muted)' }}>Risk envelope</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <code className="font-mono" style={{ color: '#dc2626', fontWeight: 700 }}>/unbind</code>
                            <span style={{ color: 'var(--text-muted)' }}>Unlink wallet</span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                        Pairing & Authentication Methods
                      </div>

                      {/* Method 1: Direct Deep-link */}
                      <div style={{ background: '#f8fafc', padding: '1.15rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Zap size={15} style={{ color: '#2563eb' }} />
                          <span>Method 1: One-Click Telegram Auth</span>
                        </div>
                        <button
                          onClick={() => {
                            const url = wagmiAddress ? `https://t.me/LumaFinanceBot?start=bind_${wagmiAddress}` : 'https://t.me/LumaFinanceBot';
                            if (wagmiAddress) {
                              navigator.clipboard.writeText(`/bind ${wagmiAddress}`);
                              setTestAlertSuccess(`Copied "/bind ${wagmiAddress.slice(0, 6)}...${wagmiAddress.slice(-4)}" to clipboard. Opening Telegram...`);
                              setTimeout(() => setTestAlertSuccess(null), 6000);
                            }
                            window.open(url, '_blank');
                          }}
                          className="cyber-btn-action"
                          style={{ width: '100%', fontSize: '0.78rem', padding: '0.65rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', marginTop: '0.65rem' }}
                        >
                          <Send size={14} />
                          <span>{wagmiAddress ? 'Launch Telegram & Bind Instantly' : 'Open @LumaFinanceBot'}</span>
                        </button>
                      </div>

                      {/* Method 2: Dynamic Code */}
                      <div style={{ background: '#f8fafc', padding: '1.15rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Smartphone size={15} style={{ color: '#059669' }} />
                          <span>Method 2: Manual Pairing Command</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.4rem 0 0.65rem 0', lineHeight: 1.45 }}>
                          Send this command directly to <strong>@LumaFinanceBot</strong> in Telegram:
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <code className="font-mono" style={{ fontSize: '0.82rem', color: '#2563eb', fontWeight: 700 }}>
                            {wagmiAddress ? `/bind ${wagmiAddress}` : '/bind <your_wallet_address>'}
                          </code>
                          <button
                            onClick={() => handleCopyAddress(wagmiAddress ? `/bind ${wagmiAddress}` : '/bind')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedAddress === (wagmiAddress ? `/bind ${wagmiAddress}` : '/bind') ? '#16a34a' : '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', fontWeight: 700 }}
                          >
                            {copiedAddress === (wagmiAddress ? `/bind ${wagmiAddress}` : '/bind') ? <Check size={14} /> : <Copy size={14} />}
                            <span>{copiedAddress === (wagmiAddress ? `/bind ${wagmiAddress}` : '/bind') ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Method 3: Handle Update */}
                      <div style={{ background: '#f8fafc', padding: '1.15rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <MessageSquare size={15} style={{ color: '#7c3aed' }} />
                          <span>Method 3: Enter Telegram Handle</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.65rem' }}>
                          <input
                            type="text"
                            value={pairingInput}
                            onChange={(e) => setPairingInput(e.target.value)}
                            placeholder="@username or Chat ID"
                            style={{ flex: 1, padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', fontSize: '0.8rem', color: '#0f172a', outline: 'none' }}
                          />
                          <button
                            onClick={() => {
                              if (pairingInput.trim()) {
                                setTelegramHandle(pairingInput.trim().startsWith('@') ? pairingInput.trim() : `@${pairingInput.trim()}`);
                                setIsTelegramBound(true);
                                setPairingInput('');
                              }
                            }}
                            className="cyber-btn-action"
                            style={{ padding: '0.55rem 1rem', fontSize: '0.78rem' }}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Right Column: Alert Channels & Simulator */}
                <div className="cyber-card" style={{ gap: '1.25rem' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                    Sentinel Notification Channels
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[
                      { key: 'rebalances', title: 'AI Strategy Rebalances', desc: 'Alerts when AI engine shifts capital between USDG and PT-USDG', icon: RefreshCw },
                      { key: 'riskAlerts', title: 'Onchain Risk & Slippage', desc: 'Instant warnings when PolicyManager guardrails trigger', icon: ShieldAlert },
                      { key: 'transactions', title: 'Deposit & Withdraw Receipts', desc: 'Confirmation when transactions confirm on X Layer', icon: Wallet },
                      { key: 'dailySummary', title: 'Daily Yield Digest (08:00 UTC)', desc: 'Morning summary of daily accrued interest and net APY', icon: Bell }
                    ].map((channel) => (
                      <div
                        key={channel.key}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.85rem 1rem',
                          borderRadius: '10px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                            <channel.icon size={16} />
                          </div>
                          <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{channel.title}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{channel.desc}</div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={(sentinelAlerts as any)[channel.key]}
                          onChange={(e) => setSentinelAlerts(prev => ({ ...prev, [channel.key]: e.target.checked }))}
                          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#2563eb' }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Simulator Box */}
                  <div style={{ marginTop: '0.5rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
                      Sentinel Bot Live Test
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                      Dispatch a simulated AI rebalance alert payload to verify connectivity.
                    </p>

                    <button
                      onClick={handleTriggerTestAlert}
                      disabled={testAlertSending}
                      className="cyber-btn-action"
                      style={{ width: '100%', fontSize: '0.78rem', padding: '0.65rem' }}
                    >
                      {testAlertSending ? <RefreshCw size={14} className="spin" /> : <Bell size={14} />}
                      <span>{testAlertSending ? 'Dispatching to Telegram...' : 'Send Test Sentinel Alert'}</span>
                    </button>

                    {testAlertSuccess && (
                      <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: '#ecfdf5', border: '1px solid #86efac', borderRadius: '8px', color: '#16a34a', fontSize: '0.78rem', fontWeight: 600 }}>
                        {testAlertSuccess}
                      </div>
                    )}

                    {/* Mock Telegram Bubble Preview */}
                    <div style={{ marginTop: '1rem', background: '#1e293b', borderRadius: '10px', padding: '1rem', color: '#f8fafc', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', fontWeight: 700, marginBottom: '0.4rem' }}>
                        <Send size={12} />
                        <span>Luma Sentinel • Live Notification Preview</span>
                      </div>
                      <div style={{ lineHeight: 1.5, color: '#e2e8f0' }}>
                        🤖 <strong>[AI Strategy Rebalance]</strong><br />
                        📊 Target Split: 60% USDG | 40% PT-USDG<br />
                        📈 Net Strategy APY: <strong>5.54%</strong><br />
                        🛡️ PolicyManager: <strong>PASSED (0.00% slippage)</strong><br />
                        🔗 TX: <span style={{ color: '#93c5fd' }}>0x876C...0dcf</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

        </main>

        {/* Cosmic Solid Black Footer */}
        <footer className="cosmic-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <LumaLogo size={22} variant="light" />
            <span>© 2026 Luma • 100% Non-Custodial RWA Strategy Vault on X Layer</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <a href={`${currentNetwork.blockExplorerUrl}/address/${currentNetwork.contracts.lumaVault}`} target="_blank" rel="noreferrer">0x7929...1FB1 (LumaVault) ↗</a>
            <a href="https://t.me/LumaFinanceBot" target="_blank" rel="noreferrer">Telegram Sentinel ↗</a>
            <a href="https://docs.xlayer.tech" target="_blank" rel="noreferrer">OKX X Layer ↗</a>
          </div>
        </footer>

      </div>

    </div>
  );
};
