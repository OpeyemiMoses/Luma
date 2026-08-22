import React, { useState, useEffect } from 'react';
import { LumaLogo } from './LumaLogo';
import { XLayerIcon } from './XLayerIcon';
import {
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Lock,
  Layers,
  Send,
  ExternalLink,
  ChevronRight,
  Sparkles,
  BarChart3,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Globe,
  Radio,
  Cpu,
  ArrowUpRight,
  Shield,
  Activity,
  Check,
  Bot,
  Terminal,
  Clock,
  Landmark,
  FileCheck2,
  PieChart,
  Menu,
  X
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenDocs?: () => void;
  onOpenHelp?: () => void;
  onNavigateTab?: (tab: string) => void;
  vaultTvl?: number;
  blendedApy?: number;
  portfolio?: any;
}

// Paxos USDG Official SVG
const UsdgIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, borderRadius: '50%' }}>
    <circle cx="50" cy="50" r="45" fill="#C3E776" stroke="#1F3819" strokeWidth="10" />
    <g fill="#1F3819">
      <ellipse cx="45" cy="49" rx="27" ry="15" transform="rotate(-53 45 49)" />
      <path d="M42 47 H88 V55 H46 L53 60 H42 Z" />
    </g>
  </svg>
);

// EXACT PENDLE FINANCE LOGO (Grey disc with vertical cord and glowing white sphere)
export const ExactPendleIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, display: 'inline-block' }}>
    <circle cx="58" cy="42" r="38" fill="#8896AB" fillOpacity="0.75" />
    <circle cx="34" cy="70" r="28" fill="#38BDF8" fillOpacity="0.35" filter="blur(4px)" />
    <rect x="31" y="4" width="6" height="52" fill="#FFFFFF" rx="3" />
    <circle cx="34" cy="70" r="22" fill="#FFFFFF" />
  </svg>
);

// Responsive Sunset Mountain Landscape SVG Component with Soft Atmospheric Blur
export const SunsetLandscapeLayer: React.FC<{ opacity?: number; blur?: number; flipBottom?: boolean }> = ({ 
  opacity = 1, 
  blur = 7, 
  flipBottom = false 
}) => (
  <div
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 1,
      opacity,
      filter: blur > 0 ? `blur(${blur}px)` : 'none',
      transform: flipBottom ? 'scaleY(-1) scale(1.04) translateZ(0)' : 'scale(1.04) translateZ(0)',
      willChange: 'opacity, transform',
      WebkitBackfaceVisibility: 'hidden',
      backfaceVisibility: 'hidden'
    }}
  >
    <svg
      viewBox="0 0 1600 800"
      preserveAspectRatio="xMidYMid slice"
      style={{ width: '100%', height: '100%' }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Sky Gradient: Sunset Golden Hour */}
        <linearGradient id="skyGradientMain" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.88" />
          <stop offset="25%" stopColor="#fb923c" stopOpacity="0.8" />
          <stop offset="55%" stopColor="#f472b6" stopOpacity="0.55" />
          <stop offset="85%" stopColor="#c084fc" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
        </linearGradient>

        {/* Sun Glow */}
        <radialGradient id="sunGlowFlare" cx="30%" cy="25%" r="45%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#fde047" stopOpacity="0.6" />
          <stop offset="70%" stopColor="#fb923c" stopOpacity="0.2" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>

        {/* Mountain Ridge 1 (Far Peaks) */}
        <linearGradient id="ridgeFarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#e879f9" stopOpacity="0.2" />
        </linearGradient>

        {/* Mountain Ridge 2 (Mid Hills) */}
        <linearGradient id="ridgeMidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ea580c" stopOpacity="0.5" />
          <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* Mountain Ridge 3 (Foreground Slopes) */}
        <linearGradient id="ridgeFrontGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#c2410c" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#d97706" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Sky Canvas */}
      <rect width="1600" height="800" fill="url(#skyGradientMain)" />

      {/* Sun Glow Orb */}
      <circle cx="480" cy="220" r="350" fill="url(#sunGlowFlare)" filter="blur(25px)" />

      {/* Ridge 1: Distant Majestic Peaks */}
      <path
        d="M0 360 L120 300 L280 340 L480 230 L640 310 L820 220 L1020 310 L1240 240 L1420 320 L1600 270 L1600 800 L0 800 Z"
        fill="url(#ridgeFarGrad)"
      />

      {/* Ridge 2: Rolling Warm Midground Ridges */}
      <path
        d="M0 420 Q240 330 520 390 T1080 360 T1600 410 L1600 800 L0 800 Z"
        fill="url(#ridgeMidGrad)"
      />

      {/* Ridge 3: Soft Foreground Alpine Slopes */}
      <path
        d="M0 490 Q340 430 760 470 T1600 480 L1600 800 L0 800 Z"
        fill="url(#ridgeFrontGrad)"
      />
    </svg>
  </div>
);

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  onOpenDocs,
  onOpenHelp,
  onNavigateTab,
  vaultTvl = 2.0,
  blendedApy = 5.54,
  portfolio
}) => {
  const initialPt = portfolio?.ptUsdgAllocationBps ? Math.round(portfolio.ptUsdgAllocationBps / 100) : 40;
  const [allocationSlider, setAllocationSlider] = useState<number>(initialPt);
  const [activeTab, setActiveTab] = useState<'Home' | 'Strategy' | 'RWA' | 'Guardrails' | 'Sentinel' | 'OKLink'>('Home');

  const ptYield = portfolio?.ptUsdgYieldBps ? portfolio.ptUsdgYieldBps / 100 : 7.10;
  const usdgYield = 4.50;
  const liveApy = ((usdgYield * (100 - allocationSlider) + ptYield * allocationSlider) / 100).toFixed(2);
  const liveVaultValue = portfolio?.portfolioValueUsd && portfolio.portfolioValueUsd > 0
    ? portfolio.portfolioValueUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '2,055.40';

  const scrollToSection = (sectionId: string, tabName: 'Home' | 'Strategy' | 'RWA' | 'Guardrails' | 'Sentinel' | 'OKLink') => {
    setActiveTab(tabName);
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        const navHeight = 90;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navHeight;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  // Silky, deliberate scroll reveal observer with blur and pop-in
  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('luma-aura-revealed');
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.08,
      rootMargin: '0px 0px -30px 0px'
    });

    const revealElements = document.querySelectorAll('.luma-aura-reveal');
    revealElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Scroll-spy to keep active tab highlighted as user scrolls
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 140;
      const sections: { id: string; tab: 'Home' | 'Strategy' | 'RWA' | 'Guardrails' | 'Sentinel' | 'OKLink' }[] = [
        { id: 'home', tab: 'Home' },
        { id: 'rwa-vault', tab: 'Strategy' },
        { id: 'treasury-yields', tab: 'RWA' },
        { id: 'risk-engine', tab: 'Guardrails' },
        { id: 'sentinel', tab: 'Sentinel' },
        { id: 'oklink-contracts', tab: 'OKLink' }
      ];

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el) {
          const rect = el.getBoundingClientRect();
          const top = rect.top + window.scrollY;
          if (top <= scrollPos) {
            setActiveTab(sections[i].tab);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="luma-complete-landing-page">
      
      {/* =========================================================================
          TOP HERO SECTION: Sunset Mountain Landscape with Misty Bottom Fade
          ========================================================================= */}
      <section className="luma-hero-sunset-landscape-stage" id="home">
        {/* Real Live Cinematic Sunset Mountain Canvas */}
        <SunsetLandscapeLayer opacity={0.96} blur={6} />
        
        {/* Soft Organic Mist Feather Gradient Transitioning into White Center */}
        <div className="luma-misty-fade-bottom" />

        {/* Fixed Floating Navigation Bar */}
        <header className="luma-hero-top-nav">
          <div className="luma-nav-brand" onClick={() => { scrollToSection('home', 'Home'); setMobileMenuOpen(false); }}>
            <LumaLogo size={30} variant="light" />
            <span className="luma-nav-brand-title">Luma</span>
            <span className="luma-nav-network-tag font-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <XLayerIcon size={13} variant="white" />
              <span>X Layer</span>
            </span>
          </div>

          <nav className="luma-capsule-navbar desktop-capsule-nav">
            <button
              onClick={() => scrollToSection('home', 'Home')}
              className={`luma-capsule-item ${activeTab === 'Home' ? 'active' : ''}`}
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('rwa-vault', 'Strategy')}
              className={`luma-capsule-item ${activeTab === 'Strategy' ? 'active' : ''}`}
            >
              RWA Vault
            </button>
            <button
              onClick={() => scrollToSection('treasury-yields', 'RWA')}
              className={`luma-capsule-item ${activeTab === 'RWA' ? 'active' : ''}`}
            >
              Treasury Yields
            </button>
            <button
              onClick={() => scrollToSection('risk-engine', 'Guardrails')}
              className={`luma-capsule-item ${activeTab === 'Guardrails' ? 'active' : ''}`}
            >
              Risk Engine
            </button>
            <button
              onClick={() => scrollToSection('sentinel', 'Sentinel')}
              className={`luma-capsule-item ${activeTab === 'Sentinel' ? 'active' : ''}`}
            >
              Sentinel
            </button>
            <button
              onClick={() => scrollToSection('oklink-contracts', 'OKLink')}
              className={`luma-capsule-item ${activeTab === 'OKLink' ? 'active' : ''}`}
            >
              OKLink Explorer
            </button>
          </nav>

          <div className="luma-nav-actions-desktop" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', pointerEvents: 'auto' }}>
            {onOpenDocs && (
              <button onClick={onOpenDocs} className="luma-nav-docs-btn" title="Open Technical Documentation">
                Docs
              </button>
            )}
            {onOpenHelp && (
              <button onClick={onOpenHelp} className="luma-nav-docs-btn" title="Open Help Centre">
                Help
              </button>
            )}
            <button onClick={onEnterApp} className="luma-nav-launch-black-btn">
              <span>Launch Vault</span>
              <ArrowUpRight size={15} />
            </button>
          </div>

          {/* Mobile Hamburger Button Group */}
          <div className="luma-nav-mobile-toggle-group">
            <button onClick={onEnterApp} className="luma-mobile-launch-sm-btn">
              <span>Launch</span>
              <ArrowUpRight size={13} />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="luma-hamburger-btn"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="luma-mobile-menu-drawer">
            <div className="luma-mobile-menu-content">
              <button
                onClick={() => { scrollToSection('home', 'Home'); setMobileMenuOpen(false); }}
                className={`luma-mobile-menu-item ${activeTab === 'Home' ? 'active' : ''}`}
              >
                <span>Home</span>
              </button>
              <button
                onClick={() => { scrollToSection('rwa-vault', 'Strategy'); setMobileMenuOpen(false); }}
                className={`luma-mobile-menu-item ${activeTab === 'Strategy' ? 'active' : ''}`}
              >
                <span>RWA Strategy Vault</span>
              </button>
              <button
                onClick={() => { scrollToSection('treasury-yields', 'RWA'); setMobileMenuOpen(false); }}
                className={`luma-mobile-menu-item ${activeTab === 'RWA' ? 'active' : ''}`}
              >
                <span>Treasury Yields (USDG + Pendle)</span>
              </button>
              <button
                onClick={() => { scrollToSection('risk-engine', 'Guardrails'); setMobileMenuOpen(false); }}
                className={`luma-mobile-menu-item ${activeTab === 'Guardrails' ? 'active' : ''}`}
              >
                <span>Risk Engine & Guardrails</span>
              </button>
              <button
                onClick={() => { scrollToSection('sentinel', 'Sentinel'); setMobileMenuOpen(false); }}
                className={`luma-mobile-menu-item ${activeTab === 'Sentinel' ? 'active' : ''}`}
              >
                <span>Telegram Sentinel Bot</span>
              </button>
              <button
                onClick={() => { scrollToSection('oklink-contracts', 'OKLink'); setMobileMenuOpen(false); }}
                className={`luma-mobile-menu-item ${activeTab === 'OKLink' ? 'active' : ''}`}
              >
                <span>OKLink Explorer (Mainnet)</span>
              </button>

              <div className="luma-mobile-menu-divider" />

              {onOpenDocs && (
                <button
                  onClick={() => { onOpenDocs(); setMobileMenuOpen(false); }}
                  className="luma-mobile-menu-item"
                >
                  <span>Technical Documentation</span>
                </button>
              )}
              {onOpenHelp && (
                <button
                  onClick={() => { onOpenHelp(); setMobileMenuOpen(false); }}
                  className="luma-mobile-menu-item"
                >
                  <span>Help Centre & Guides</span>
                </button>
              )}

              <button
                onClick={() => { onEnterApp(); setMobileMenuOpen(false); }}
                className="luma-mobile-menu-cta-btn"
              >
                <span>Enter Strategy Vault</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Content Container */}
        <div className="luma-hero-main-bounds">

          {/* Hero Row: Left Authentic Headline & Right 6 Frosted Floating Cards */}
          <div className="luma-hero-content-grid">
            
            {/* Left Column: Authentic Luma Copy */}
            <div className="luma-hero-left-col luma-aura-reveal luma-delay-1">
              <div className="luma-pill-headline-tag">
                <div className="luma-pill-gold-dot" />
                <span>Autonomous AI RWA Vault on OKX X Layer</span>
              </div>

              <h1 className="luma-hero-main-title">
                Autonomous Vault for <br />
                <span className="luma-text-rwa-highlight">Real-World Assets</span> & <br />
                Treasury Yields
              </h1>

              <p className="luma-hero-description">
                Earn institutional yields backed 1:1 by short-term US Treasury Bills with Paxos USDG, 
                and lock in guaranteed discount convergence on Pendle PT markets with bytecode-enforced mathematical safety on X Layer.
              </p>

              <div className="luma-hero-actions-group">
                <button onClick={onEnterApp} className="luma-hero-black-cta">
                  <span>Enter Strategy Vault</span>
                  <div className="luma-cta-arrow-circle">
                    <ArrowRight size={13} style={{ transform: 'rotate(-45deg)' }} />
                  </div>
                </button>

                <a href="#rwa-engines" className="luma-hero-glass-btn">
                  <Landmark size={16} style={{ color: '#b45309' }} />
                  <span>Treasury Architecture</span>
                </a>
              </div>
            </div>

            {/* Right Column: 6 Floating Frosted Cards Composition */}
            <div className="luma-hero-right-col" id="rwa-vault">
              <div className="luma-floating-cards-stage">
                
                {/* CARD 1: Interactive Strategy Allocation Slider */}
                <div className="luma-float-card luma-card-slider luma-aura-reveal luma-delay-2">
                  <div className="luma-card-slider-header">
                    <span className="luma-slider-label">RWA Strategy Allocation</span>
                    <span className="luma-slider-badge font-mono">{allocationSlider}% PT-USDG</span>
                  </div>
                  <div className="luma-custom-slider-track">
                    <input
                      type="range"
                      min="0"
                      max="60"
                      value={allocationSlider}
                      onChange={(e) => setAllocationSlider(Number(e.target.value))}
                      className="luma-native-slider-input"
                    />
                    <div
                      className="luma-custom-slider-fill"
                      style={{ width: `${(allocationSlider / 60) * 100}%` }}
                    />
                    <div
                      className="luma-custom-slider-knob"
                      style={{ left: `${(allocationSlider / 60) * 100}%` }}
                    />
                  </div>
                  <div className="luma-slider-footer-labels">
                    <span>Liquid USDG ({100 - allocationSlider}%)</span>
                    <span style={{ color: '#0284c7', fontWeight: 800 }}>Blended: {liveApy}% APY</span>
                  </div>
                </div>

                {/* CARD 2: Dual Route Allocation Activity */}
                <div className="luma-float-card luma-card-routes luma-aura-reveal luma-delay-3">
                  
                  {/* Route A: Pendle PT-USDG with EXACT Official Logo */}
                  <div className="luma-route-entry">
                    <div className="luma-route-icon-box" style={{ background: '#0f172a' }}>
                      <ExactPendleIcon size={24} />
                    </div>
                    <div className="luma-route-info">
                      <div className="luma-route-name">Pendle PT-USDG (Fixed Yield)</div>
                      <div className="luma-route-sub font-mono">0x9a09...d362 • Oct 2026 Maturity</div>
                    </div>
                    <div className="luma-route-rate font-mono">
                      <div style={{ color: '#0284c7', fontWeight: 800 }}>{ptYield.toFixed(2)}% APY</div>
                      <div className="luma-rate-sub">Fixed Rate</div>
                    </div>
                  </div>

                  <div className="luma-card-inner-divider" />

                  {/* Route B: Paxos USDG Treasury Reserve */}
                  <div className="luma-route-entry">
                    <div className="luma-route-icon-box" style={{ background: '#ecfdf5' }}>
                      <UsdgIcon size={22} />
                    </div>
                    <div className="luma-route-info">
                      <div className="luma-route-name">Paxos USDG (Treasury Reserve)</div>
                      <div className="luma-route-sub font-mono">0x4ae4...2dc8 • 1:1 US T-Bills</div>
                    </div>
                    <div className="luma-route-rate font-mono">
                      <div style={{ color: '#16a34a', fontWeight: 800 }}>4.50% APY</div>
                      <div className="luma-rate-sub">Daily Treasury</div>
                    </div>
                  </div>
                </div>

                {/* CARD 3: Connected Network Status */}
                <div className="luma-float-card luma-card-network luma-aura-reveal luma-delay-4">
                  <div className="luma-net-check-circle">
                    <Check size={14} />
                  </div>
                  <div className="luma-net-title">X Layer Connected</div>
                </div>

                {/* CARD 4: Live NAV Bar Chart */}
                <div className="luma-float-card luma-card-chart luma-aura-reveal luma-delay-5">
                  <div className="luma-chart-header-row">
                    <div className="luma-chart-token-circle">
                      <UsdgIcon size={12} />
                    </div>
                    <div>
                      <div className="luma-chart-token-title">Vault NAV</div>
                      <div className="luma-chart-token-sub font-mono">{liveApy}% Blended</div>
                    </div>
                  </div>

                  <div className="luma-chart-bars-row">
                    <div className="luma-chart-bar" style={{ height: '35%' }} />
                    <div className="luma-chart-bar" style={{ height: '55%' }} />
                    <div className="luma-chart-bar" style={{ height: '42%' }} />
                    <div className="luma-chart-bar" style={{ height: '75%' }} />
                    <div className="luma-chart-bar" style={{ height: '60%' }} />
                    <div className="luma-chart-bar" style={{ height: '90%' }} />
                    <div className="luma-chart-bar" style={{ height: '70%' }} />
                    <div className="luma-chart-bar" style={{ height: '85%' }} />
                    <div className="luma-chart-bar" style={{ height: '100%' }} />
                    <div className="luma-chart-bar" style={{ height: '80%' }} />
                  </div>

                  <div className="luma-chart-nav-amount font-mono">${liveVaultValue} USDG</div>
                </div>

                {/* CARD 5: Security Rating */}
                <div className="luma-float-card luma-card-security luma-aura-reveal luma-delay-6">
                  <div className="luma-sec-stars-row">
                    <span style={{ color: '#d97706' }}>★★★★★</span>
                    <span className="luma-sec-rating-val font-mono">100% Non-Custodial</span>
                  </div>
                  <div className="luma-sec-sub">PolicyManager Guardrails Enforced</div>
                </div>

                {/* CARD 6: Strategy Shares */}
                <div className="luma-float-card luma-card-shares luma-aura-reveal luma-delay-7">
                  <div className="luma-shares-icon">
                    <ShieldCheck size={16} style={{ color: '#d97706' }} />
                  </div>
                  <div className="luma-shares-meta">
                    <div className="luma-shares-title">ERC-4626 Strategy Share</div>
                    <div className="luma-shares-sub font-mono">1:1 Par USDG Redemption</div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Ecosystem Ticker Strip */}
          <div className="luma-stage-footer-strip luma-aura-reveal luma-delay-8">
            <div className="luma-ecosystem-row">
              <div className="luma-eco-item"><XLayerIcon size={18} /><span>OKX X Layer</span></div>
              <div className="luma-eco-item"><UsdgIcon size={18} /><span>Paxos USDG</span></div>
              <div className="luma-eco-item"><ExactPendleIcon size={20} /><span>Pendle Finance</span></div>
              <div className="luma-eco-item"><Shield size={16} /><span>OpenZeppelin</span></div>
              <div className="luma-eco-item"><Globe size={16} /><span>OKLink Explorer</span></div>
              <div className="luma-eco-item"><Bot size={16} /><span>Telegram Sentinel</span></div>
            </div>

            <div className="luma-footer-version-tag">
              <div className="luma-v-dot" />
              <span>Luma Protocol v1.0 • RWA Engine</span>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          CENTER SECTION: Pure Clean White Canvas (Dual Engines & 4-Step Pipeline)
          ========================================================================= */}
      <section className="luma-pure-white-center-stage" id="rwa-engines">
        <div className="luma-center-inner-container">
          
          {/* SECTION: DUAL RWA ENGINES */}
          <div className="luma-content-block luma-aura-reveal" id="treasury-yields">
            <div className="luma-block-header">
              <span className="luma-block-badge">Dual-Yield Architecture</span>
              <h2 className="luma-block-title">How Your Funds Earn Real-World Yield</h2>
              <p className="luma-block-sub">
                Luma allocates dollar deposits across two non-correlated, risk-minimized real-world yield generators.
              </p>
            </div>

            <div className="luma-two-column-engine-grid">
              
              {/* Engine A: Paxos USDG */}
              <div className="luma-engine-box luma-aura-reveal">
                <div className="luma-engine-top-badge">
                  <div className="luma-engine-icon" style={{ background: '#ecfdf5' }}>
                    <UsdgIcon size={28} />
                  </div>
                  <span className="luma-engine-status-tag" style={{ background: '#dcfce7', color: '#15803d' }}>
                    Reserve Engine • 100% Liquid
                  </span>
                </div>
                <h3 className="luma-engine-heading">Paxos USDG Treasury Reserves</h3>
                <p className="luma-engine-p">
                  Backed 1:1 by high-quality liquid short-term US Treasury Bills and cash equivalents managed through DBS Bank Singapore.
                </p>
                <div className="luma-engine-stats-table">
                  <div className="luma-stat-row">
                    <span>Base Yield Rate</span>
                    <strong style={{ color: '#16a34a' }}>4.50% APY</strong>
                  </div>
                  <div className="luma-stat-row">
                    <span>Liquidity Availability</span>
                    <strong>Instant 1-Click</strong>
                  </div>
                  <div className="luma-stat-row">
                    <span>Underlying Collateral</span>
                    <strong>100% US Government Debt</strong>
                  </div>
                </div>
              </div>

              {/* Engine B: Pendle PT-USDG with Exact Logo */}
              <div className="luma-engine-box luma-aura-reveal">
                <div className="luma-engine-top-badge">
                  <div className="luma-engine-icon" style={{ background: '#f1f5f9' }}>
                    <ExactPendleIcon size={30} />
                  </div>
                  <span className="luma-engine-status-tag" style={{ background: '#cffafe', color: '#0e7490' }}>
                    Fixed Yield Engine • Guaranteed Discount
                  </span>
                </div>
                <h3 className="luma-engine-heading">Pendle PT-USDG Fixed Yield</h3>
                <p className="luma-engine-p">
                  Principal Tokens bought at an onchain discount that converge deterministically to $1.00 USDG at maturity.
                </p>
                <div className="luma-engine-stats-table">
                  <div className="luma-stat-row">
                    <span>Locked Fixed Rate</span>
                    <strong style={{ color: '#0891b2' }}>7.10% APY</strong>
                  </div>
                  <div className="luma-stat-row">
                    <span>Maturity Window</span>
                    <strong className="font-mono">October 2026</strong>
                  </div>
                  <div className="luma-stat-row">
                    <span>Principal Protection</span>
                    <strong>1:1 Par Guaranteed</strong>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* SECTION: 4-STEP AI PIPELINE */}
          <div className="luma-content-block luma-aura-reveal" id="risk-engine">
            <div className="luma-block-header">
              <span className="luma-block-badge">Autonomous Intelligence</span>
              <h2 className="luma-block-title">The 4-Step Optimization Pipeline</h2>
              <p className="luma-block-sub">
                How Luma maximizes net blended yield while enforcing mathematical risk limits.
              </p>
            </div>

            <div className="luma-four-steps-grid">
              <div className="luma-pipeline-step luma-aura-reveal">
                <div className="luma-step-digit font-mono">01</div>
                <div className="luma-step-icon-sq" style={{ background: '#eff6ff', color: '#2563eb' }}><Activity size={20} /></div>
                <h4>Market Ingestion</h4>
                <p>Scans real-time Pendle liquidity pool discounts and US Treasury interest rates on X Layer.</p>
              </div>

              <div className="luma-pipeline-step luma-aura-reveal">
                <div className="luma-step-digit font-mono">02</div>
                <div className="luma-step-icon-sq" style={{ background: '#f5f3ff', color: '#7c3aed' }}><Bot size={20} /></div>
                <h4>Sharpe Optimization</h4>
                <p>Computes mathematical Sharpe ratio balances between liquid USDG and discounted PT-USDG.</p>
              </div>

              <div className="luma-pipeline-step luma-aura-reveal">
                <div className="luma-step-digit font-mono">03</div>
                <div className="luma-step-icon-sq" style={{ background: '#ecfdf5', color: '#059669' }}><ShieldCheck size={20} /></div>
                <h4>Policy Verification</h4>
                <p><code>Policy Manager</code> checks proposal. Reverts if slippage &gt; 1% or allocation exceeds 40% cap.</p>
              </div>

              <div className="luma-pipeline-step luma-aura-reveal">
                <div className="luma-step-digit font-mono">04</div>
                <div className="luma-step-icon-sq" style={{ background: '#fffbeb', color: '#d97706' }}><RefreshCw size={20} /></div>
                <h4>Yield Compounding</h4>
                <p>Atomic rebalance executes via <code>Execution Router</code>. Yield compounds directly into Vault NAV.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          BOTTOM PART: Sunset Mountain Landscape Backdrop with Sentinel & Contracts
          ========================================================================= */}
      <section className="luma-bottom-sunset-landscape-stage">
        
        {/* Full-width Sunset Landscape Background on the Bottom Part */}
        <SunsetLandscapeLayer />
        
        {/* Soft Organic Mist Feather Gradient Ingress from White */}
        <div className="luma-misty-fade-top" />

        <div className="luma-bottom-main-bounds">
          
          {/* Telegram Sentinel & OKLink Verified Contracts Banner */}
          <div className="luma-sentinel-banner-card luma-aura-reveal" id="sentinel">
            <div className="luma-banner-text-col">
              <span className="luma-banner-pill">Mobile Sentinel</span>
              <h3 className="luma-banner-h3">Live Telegram Telemetry with @LumaFinanceBot</h3>
              <p className="luma-banner-p">
                Bind your X Layer wallet address to receive push alerts whenever the AI optimizer executes a rebalance, risk scores fluctuate, or deposits settle.
              </p>
              <div className="luma-banner-btn-row">
                <button onClick={onEnterApp} className="luma-hero-black-cta" style={{ padding: '0.75rem 1.65rem' }}>
                  <span>Launch Vault dApp</span>
                  <ArrowRight size={15} />
                </button>
                <a
                  href="https://t.me/LumaFinanceBot"
                  target="_blank"
                  rel="noreferrer"
                  className="luma-banner-tg-btn"
                >
                  <Send size={15} />
                  <span>Open @LumaFinanceBot</span>
                </a>
              </div>
            </div>

            <div className="luma-contracts-list-col" id="oklink-contracts">
              <div className="luma-contracts-list-title">Verified Smart Contracts on OKLink (Mainnet):</div>
              
              <a
                href="https://www.oklink.com/xlayer/address/0xaa1ca8CF1E50f47815f6720863D8F83ecFAB2f2E"
                target="_blank"
                rel="noreferrer"
                className="luma-contract-row-item"
              >
                <div>
                  <div className="luma-c-name">Luma Vault</div>
                  <div className="luma-c-role">ERC-4626 Strategy Vault</div>
                </div>
                <span className="font-mono luma-c-addr">0xaa1c...2f2E ↗</span>
              </a>

              <a
                href="https://www.oklink.com/xlayer/address/0xc743883f03De9722050B7da6cd77F91128eD0562"
                target="_blank"
                rel="noreferrer"
                className="luma-contract-row-item"
              >
                <div>
                  <div className="luma-c-name">Policy Manager</div>
                  <div className="luma-c-role">Mathematical Safety Rules</div>
                </div>
                <span className="font-mono luma-c-addr">0xc743...0562 ↗</span>
              </a>

              <a
                href="https://www.oklink.com/xlayer/address/0x9C2Ced10f2775369C9a17ebB1746199cd92399B6"
                target="_blank"
                rel="noreferrer"
                className="luma-contract-row-item"
              >
                <div>
                  <div className="luma-c-name">Execution Router</div>
                  <div className="luma-c-role">Dedicated Swap Execution</div>
                </div>
                <span className="font-mono luma-c-addr">0x9C2C...99B6 ↗</span>
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          FOOTER: SOLID PURE JET BLACK FOOTER (#000000)
          ========================================================================= */}
      <footer className="luma-solid-black-footer">
        <div className="luma-footer-inner-container">
          
          <div className="luma-black-footer-grid">
            
            {/* Brand Column */}
            <div className="luma-footer-brand-col">
              <div className="luma-nav-brand">
                <LumaLogo size={28} variant="light" />
                <span className="luma-nav-brand-title" style={{ color: '#ffffff' }}>Luma</span>
              </div>
              <p className="luma-footer-tagline">
                Autonomous AI-Managed Real-World Asset (RWA) Strategy Vault built on OKX X Layer.
              </p>
              <div className="luma-footer-badge font-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                <XLayerIcon size={14} variant="white" />
                <span>OKX X Layer Connected</span>
              </div>
            </div>

            {/* Links Column 1: Protocol */}
            <div className="luma-footer-nav-col">
              <div className="luma-footer-col-header">Protocol</div>
              <button onClick={onEnterApp} className="luma-footer-link-btn">Strategy Vault</button>
              <button onClick={onEnterApp} className="luma-footer-link-btn">Deposit / Withdraw</button>
              <button onClick={onEnterApp} className="luma-footer-link-btn">AI Decisions Audit</button>
              <button onClick={onEnterApp} className="luma-footer-link-btn">Policy Manager</button>
            </div>

            {/* Links Column 2: Resources & Docs */}
            <div className="luma-footer-nav-col">
              <div className="luma-footer-col-header">Resources & Docs</div>
              {onOpenDocs && <button onClick={onOpenDocs} className="luma-footer-link-btn">Technical Docs</button>}
              {onOpenHelp && <button onClick={onOpenHelp} className="luma-footer-link-btn">Help Centre & Guides</button>}
              <a href="https://www.oklink.com/xlayer" target="_blank" rel="noreferrer" className="luma-footer-external-link">OKLink Explorer ↗</a>
              <a href="https://t.me/LumaFinanceBot" target="_blank" rel="noreferrer" className="luma-footer-external-link">Telegram Sentinel ↗</a>
            </div>

            {/* Links Column 3: Bytecode */}
            <div className="luma-footer-nav-col">
              <div className="luma-footer-col-header">Verified Bytecode (Mainnet)</div>
              <a href="https://www.oklink.com/xlayer/address/0xaa1ca8CF1E50f47815f6720863D8F83ecFAB2f2E" target="_blank" rel="noreferrer" className="luma-footer-contract-chip">
                <span>Luma Vault</span>
                <span className="font-mono">0xaa1c...2f2E</span>
              </a>
              <a href="https://www.oklink.com/xlayer/address/0xc743883f03De9722050B7da6cd77F91128eD0562" target="_blank" rel="noreferrer" className="luma-footer-contract-chip">
                <span>Policy Manager</span>
                <span className="font-mono">0xc743...0562</span>
              </a>
              <a href="https://www.oklink.com/xlayer/address/0x9C2Ced10f2775369C9a17ebB1746199cd92399B6" target="_blank" rel="noreferrer" className="luma-footer-contract-chip">
                <span>Execution Router</span>
                <span className="font-mono">0x9C2C...99B6</span>
              </a>
            </div>

          </div>

          {/* Bottom Copyright Bar */}
          <div className="luma-black-footer-bottom">
            <div>© 2026 Luma. 100% Non-Custodial Autonomous Vault.</div>
            <div className="font-mono">Built for OKX X Layer • Dual RWA Engine</div>
          </div>

        </div>
      </footer>

    </div>
  );
};
