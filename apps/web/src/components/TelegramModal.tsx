import React, { useState } from 'react';
import { X, Send, Bot, Shield, ExternalLink, Copy, Check, Bell, Cpu, MessageSquare } from 'lucide-react';
import { PortfolioState, RiskMetrics, PolicyLimits } from '../../../../packages/types/src/index.js';

interface TelegramModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolio: PortfolioState;
  risk: RiskMetrics;
  policy: PolicyLimits;
}

export const TelegramModal: React.FC<TelegramModalProps> = ({
  isOpen,
  onClose,
  portfolio,
  risk,
  policy
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const linkCommand = `/link 0x71C836F7DA3f8874330040D3f51086A7751E8E29`;

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(linkCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed-overlay animate-fade">
      <div className="telegram-dialog">
        
        {/* Modal Header */}
        <div className="dialog-header">
          <div className="dialog-brand">
            <div className="dialog-avatar">
              <Send size={18} className="text-cyan" />
            </div>
            <div>
              <h3 className="dialog-title">Connect Luma Telegram Bot</h3>
              <p className="dialog-subtitle font-mono">Real-time alerts • Portfolio queries • Approval triggers</p>
            </div>
          </div>

          <button onClick={onClose} className="btn-close">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="dialog-body">
          
          <div className="telegram-hero-banner">
            <div className="banner-icon-area">
              <Bot size={28} className="text-cyan" />
            </div>
            <div>
              <div className="banner-heading">Official Bot: @LumaFinanceBot</div>
              <p className="banner-sub">
                Connect your Telegram client directly to the Luma notification daemon on X Layer.
              </p>
            </div>
          </div>

          {/* Setup Steps */}
          <div className="steps-list">
            <div className="step-item">
              <div className="step-num font-mono">1</div>
              <div className="step-content">
                <div className="step-title">Open the Bot on Telegram</div>
                <p className="step-desc">
                  Open your Telegram app and start a conversation with the official Luma agent.
                </p>
                <a
                  href="https://t.me/LumaFinanceBot"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-tg-open"
                >
                  <Send size={13} />
                  <span>Open @LumaFinanceBot in Telegram</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            <div className="step-item">
              <div className="step-num font-mono">2</div>
              <div className="step-content">
                <div className="step-title">Send the Link Command</div>
                <p className="step-desc">
                  Send this command in the Telegram chat to link your EVM wallet:
                </p>
                <div className="link-code-box">
                  <code className="font-mono">{linkCommand}</code>
                  <button onClick={handleCopy} className="btn-copy-code font-mono">
                    {copied ? <Check size={13} className="text-emerald" /> : <Copy size={13} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="step-item">
              <div className="step-num font-mono">3</div>
              <div className="step-content">
                <div className="step-title">Interact & Receive Real-Time Alerts</div>
                <p className="step-desc">
                  You can now send commands directly in Telegram:
                </p>
                <div className="commands-pills font-mono">
                  <span className="pill">/portfolio</span>
                  <span className="pill">/risk</span>
                  <span className="pill">/yield</span>
                  <span className="pill">/why</span>
                  <span className="pill">/history</span>
                  <span className="pill">/pause</span>
                </div>
              </div>
            </div>
          </div>

          {/* Security Note */}
          <div className="security-notice">
            <Shield size={16} className="text-emerald" />
            <div>
              <span className="sec-notice-bold">Non-Custodial Guarantee:</span> Telegram will NEVER ask for your private key, seed phrase, or fund transfers. In Approval Mode, the bot sends one-click links to sign securely with your EVM wallet.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
