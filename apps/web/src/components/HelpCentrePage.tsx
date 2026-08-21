import React, { useState } from 'react';
import { LumaLogo } from './LumaLogo';
import { XLayerIcon } from './XLayerIcon';
import { useToast } from './Toast';
import { SunsetLandscapeLayer } from './LandingPage';
import {
  HelpCircle,
  ArrowLeft,
  Search,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Wallet,
  Coins,
  ShieldCheck,
  Send,
  RefreshCw,
  Zap,
  Radio,
  Sliders,
  AlertTriangle,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Shield,
  Clock,
  Lock,
  Landmark
} from 'lucide-react';

interface HelpCentrePageProps {
  onBack: () => void;
  onOpenDocs: () => void;
  onEnterApp: () => void;
}

export const HelpCentrePage: React.FC<HelpCentrePageProps> = ({
  onBack,
  onOpenDocs,
  onEnterApp
}) => {
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [activeStep, setActiveStep] = useState<number>(1);

  const STEPS = [
    {
      step: 1,
      title: 'Connect Wallet to OKX X Layer',
      icon: <Wallet size={20} className="text-blue-500" />,
      tagline: 'Connect with OKX Wallet, MetaMask, or Rainbow',
      content: 'Click the "Connect Wallet" button on the top right. Luma supports all standard Web3 wallets. Ensure your wallet is set to OKX X Layer Testnet (Chain ID: 1952) or OKX X Layer Mainnet (Chain ID: 196). RainbowKit will automatically prompt you to add or switch networks if needed.'
    },
    {
      step: 2,
      title: 'Acquire USDG or USDT & Gas',
      icon: <Coins size={20} className="text-emerald-500" />,
      tagline: 'Paxos USDG & Tether USD₮0 supported',
      content: 'You will need a small amount of OKB on X Layer for gas (less than $0.001 per transaction). For deposits, Luma accepts both US Treasury-backed Paxos USDG (0xa78e...) and Tether USD₮0. Testnet tokens are distributed automatically upon connecting or via official OKX faucets.'
    },
    {
      step: 3,
      title: 'Deposit into Luma Strategy Vault',
      icon: <Zap size={20} className="text-amber-500" />,
      tagline: 'Instant ERC-4626 share issuance',
      content: 'Navigate to the "Deposit / Withdraw" tab, enter your desired deposit amount, and click "Deposit USDG". Your wallet will ask for an approval transaction followed by the deposit transaction. You immediately receive vault shares representing your redeemable share of the vault NAV.'
    },
    {
      step: 4,
      title: 'Select your Risk Envelope',
      icon: <Sliders size={20} className="text-purple-500" />,
      tagline: 'Conservative, Balanced, or Aggressive',
      content: 'Under "Policy & Guardrails", choose your preferred risk profile. This writes hard mathematical limits to Policy Manager contract. For example, "Balanced" caps maximum PT-USDG allocation at 40% and limits single rebalance moves to 20%, ensuring safety.'
    },
    {
      step: 5,
      title: 'Link Telegram Sentinel Bot',
      icon: <Radio size={20} className="text-sky-500" />,
      tagline: 'Real-time push telemetry alerts',
      content: 'Open Telegram and start @LumaFinanceBot. Send /bind followed by your wallet address (e.g. /bind 0x123...). The bot will instantly link your wallet and notify you whenever the AI rebalances, APY increases, or security checks trigger.'
    },
    {
      step: 6,
      title: 'Monitor & Withdraw Anytime',
      icon: <RefreshCw size={20} className="text-teal-500" />,
      tagline: '100% non-custodial with zero lockup periods',
      content: 'Your vault position compounds automatically every block. Whenever you wish to exit, head to the "Deposit / Withdraw" tab, select "Withdraw", enter the amount, and confirm. Your funds are returned directly to your wallet.'
    }
  ];

  const FAQS = [
    {
      q: 'How does Luma generate real yield without inflationary token rewards?',
      a: 'Luma generates organic yield through two real-world mechanisms: (1) Paxos USDG holds US Treasury bills and overnight repos that pay regular interest into the vault, and (2) Pendle PT-USDG tokens are purchased at a discount on DEX markets and mature at par ($1.00), locking in predictable fixed APY.'
    },
    {
      q: 'Can the AI agent steal or misallocate my funds?',
      a: 'No. Luma is 100% non-custodial. The AI agent only has permission to suggest rebalances to the Execution Router. The Policy Manager contract mathematically blocks any transaction exceeding 40% PT allocation or 2% slippage. The AI has zero withdrawal permissions.'
    },
    {
      q: 'What is the Telegram Sentinel and is it mandatory?',
      a: 'The Telegram Sentinel is an optional, free notification companion (@LumaFinanceBot). It listens to OKX X Layer onchain events and sends instant Telegram alerts for your wallet’s deposits, withdrawals, strategy rebalances, and APY shifts.'
    },
    {
      q: 'Are there any deposit lockup periods or exit fees?',
      a: 'Luma has zero lockup periods and zero exit penalties. Because the vault maintains a guaranteed minimum 40% liquid reserve of Paxos USDG at all times, users can withdraw their principal and compounded yield anytime.'
    },
    {
      q: 'How do I add OKX X Layer to MetaMask or OKX Wallet?',
      a: 'Luma uses RainbowKit which configures the network automatically when you click "Connect Wallet". Alternatively, add Network Name: OKX X Layer Testnet, RPC URL: https://testrpc.xlayer.tech, Chain ID: 1952, Currency: OKB.'
    },
    {
      q: 'What should I do if a deposit or withdrawal fails?',
      a: 'Ensure you have approved the token allowance and have at least 0.005 OKB for gas. If the transaction was rejected onchain, verify that your slippage or allocation does not violate the active Policy Manager envelope.'
    }
  ];

  const filteredFaqs = FAQS.filter(
    (f) => f.q.toLowerCase().includes(searchQuery.toLowerCase()) || f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="luma-help-root">
      
      {/* Sunset Mountain Landscape Atmospheric Layer */}
      <SunsetLandscapeLayer opacity={0.35} blur={12} />
      <div className="luma-misty-fade-bottom" style={{ pointerEvents: 'none' }} />

      {/* Help Centre Header */}
      <header className="luma-help-header">
        <div className="luma-help-header-inner">
          <div className="luma-help-top-nav">
            <button onClick={onBack} className="luma-docs-back-btn" title="Back to Application">
              <ArrowLeft size={16} />
              <span>App</span>
            </button>

            <div className="luma-help-nav-links">
              <button onClick={onOpenDocs} className="luma-help-link-btn">
                <BookOpen size={14} />
                <span>Technical Docs</span>
              </button>
              <button onClick={onEnterApp} className="luma-help-link-primary">
                <span>Launch App</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div className="luma-help-hero">
            <div className="luma-help-badge font-mono">
              <Sparkles size={13} className="text-amber-500" />
              <span>Luma Support & Knowledge Base</span>
            </div>
            <h1>How can we help you today?</h1>
            <p>Everything you need to know about depositing, yield mechanics, onchain safety, and Telegram Sentinel.</p>

            <div className="luma-help-search-bar">
              <Search size={18} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search FAQs, guides, troubleshooting..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="luma-help-body-container">
        
        {/* Step-by-Step Interactive Guide */}
        <section className="luma-help-section">
          <div className="luma-help-section-header">
            <div className="luma-help-section-title">
              <h2>Complete Step-by-Step User Flow</h2>
              <p>Follow these 6 simple steps to start earning institutional RWA yield on OKX X Layer.</p>
            </div>
          </div>

          <div className="luma-help-steps-grid">
            {STEPS.map((s) => (
              <div
                key={s.step}
                onClick={() => setActiveStep(s.step)}
                className={`luma-help-step-card ${activeStep === s.step ? 'active' : ''}`}
              >
                <div className="luma-help-step-header">
                  <div className="luma-help-step-num font-mono">0{s.step}</div>
                  <div className="luma-help-step-icon">{s.icon}</div>
                </div>
                <h3>{s.title}</h3>
                <div className="luma-help-step-tagline">{s.tagline}</div>
                <p>{s.content}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section className="luma-help-section" style={{ marginTop: '3.5rem' }}>
          <div className="luma-help-section-header">
            <div className="luma-help-section-title">
              <h2>Frequently Asked Questions</h2>
              <p>Quick answers to common questions regarding Luma and OKX X Layer.</p>
            </div>
          </div>

          <div className="luma-help-faq-stack">
            {filteredFaqs.map((faq, idx) => (
              <div
                key={idx}
                className={`luma-help-faq-item ${activeFaq === idx ? 'open' : ''}`}
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
              >
                <div className="luma-help-faq-question">
                  <span>{faq.q}</span>
                  {activeFaq === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                {activeFaq === idx && (
                  <div className="luma-help-faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Troubleshooting Matrix */}
        <section className="luma-help-section" style={{ marginTop: '3.5rem' }}>
          <div className="luma-help-section-header">
            <div className="luma-help-section-title">
              <h2>Troubleshooting & Quick Fixes</h2>
              <p>Diagnose and resolve common wallet or network issues in seconds.</p>
            </div>
          </div>

          <div className="luma-help-troubleshoot-grid">
            <div className="luma-troubleshoot-card">
              <div className="luma-troubleshoot-icon"><AlertTriangle size={18} className="text-amber-500" /></div>
              <h4>"Insufficient Allowance" on Deposit</h4>
              <p>Make sure you approve the token spending transaction before confirming the deposit. Both transactions are required by ERC-20 standard.</p>
            </div>

            <div className="luma-troubleshoot-card">
              <div className="luma-troubleshoot-icon"><Radio size={18} className="text-sky-500" /></div>
              <h4>Telegram Bot Not Delivering Alerts</h4>
              <p>Make sure to send <code>/bind &lt;your_wallet_address&gt;</code> in a direct chat to <strong>@LumaFinanceBot</strong> on Telegram.</p>
            </div>

            <div className="luma-troubleshoot-card">
              <div className="luma-troubleshoot-icon"><Wallet size={18} className="text-emerald-500" /></div>
              <h4>Transaction Stuck in Pending State</h4>
              <p>OKX X Layer has &lt;2 second finality. If stuck in MetaMask, ensure your RPC URL is set to <code>https://testrpc.xlayer.tech</code>.</p>
            </div>
          </div>
        </section>

        {/* Footer Banner */}
        <div className="luma-help-footer-cta">
          <div className="luma-help-cta-content">
            <h3>Ready to put your idle stablecoins to work?</h3>
            <p>Join the autonomous RWA revolution on OKX X Layer with institutional safety bounds.</p>
          </div>
          <button onClick={onEnterApp} className="luma-help-cta-btn">
            <span>Launch Strategy Vault</span>
            <ArrowRight size={16} />
          </button>
        </div>

      </div>

    </div>
  );
};
