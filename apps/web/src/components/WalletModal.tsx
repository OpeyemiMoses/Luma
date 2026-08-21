import React, { useState, useEffect } from 'react';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { X, Wallet, ExternalLink, AlertCircle, ArrowRight, Zap, RefreshCw, CheckCircle2 } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onManualConnect: (address: string) => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  onManualConnect
}) => {
  const { connectors, connect, isPending, error: connectError } = useConnect();
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const [manualAddr, setManualAddr] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [connectingKey, setConnectingKey] = useState<string | null>(null);

  if (!isOpen) return null;

  // Resolves the specific extension provider
  const getSpecificProvider = (key: 'metamask' | 'okx' | 'rabby' | 'injected') => {
    const win = window as any;
    const providers: any[] = win.ethereum?.providers || [];

    if (key === 'metamask') {
      const fromList = providers.find((p) => p.isMetaMask && !p.isOkxWallet && !p.isRabby);
      if (fromList) return fromList;
      if (win.ethereum?.isMetaMask && !win.ethereum?.isOkxWallet && !win.ethereum?.isRabby) return win.ethereum;
      return null;
    }

    if (key === 'okx') {
      if (win.okxwallet) return win.okxwallet;
      const fromList = providers.find((p) => p.isOkxWallet);
      if (fromList) return fromList;
      if (win.ethereum?.isOkxWallet) return win.ethereum;
      return null;
    }

    if (key === 'rabby') {
      if (win.rabby) return win.rabby;
      const fromList = providers.find((p) => p.isRabby);
      if (fromList) return fromList;
      if (win.ethereum?.isRabby) return win.ethereum;
      return null;
    }

    return win.ethereum || win.okxwallet;
  };

  const handleWalletSelect = async (key: 'metamask' | 'okx' | 'rabby' | 'injected', name: string) => {
    setError(null);
    setConnectingKey(key);

    try {
      const provider = getSpecificProvider(key);

      if (!provider) {
        if (key === 'metamask') {
          setError('MetaMask extension was not detected. If OKX Wallet is currently set as your default wallet in its settings, it may hide MetaMask. Please check your extensions.');
        } else if (key === 'okx') {
          setError('OKX Wallet extension was not detected.');
        } else {
          setError(`${name} extension was not detected.`);
        }
        setConnectingKey(null);
        return;
      }

      // First, disconnect any previous silent session so the wallet is forced to prompt
      disconnect();

      // Find matching Wagmi connector
      const targetConnector = connectors.find((c) => {
        const cId = c.id.toLowerCase();
        const cName = c.name.toLowerCase();
        if (key === 'metamask' && (cId.includes('meta') || cName.includes('meta'))) return true;
        if (key === 'okx' && (cId.includes('okx') || cName.includes('okx'))) return true;
        if (key === 'rabby' && (cId.includes('rabby') || cName.includes('rabby'))) return true;
        return false;
      }) || connectors.find((c) => c.id === 'injected') || connectors[0];

      // Explicitly request permissions from the specific provider to trigger popup
      try {
        await provider.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }]
        });
      } catch (permErr: any) {
        console.log('wallet_requestPermissions note:', permErr);
        await provider.request({ method: 'eth_requestAccounts' });
      }

      // Sync with Wagmi connector
      if (targetConnector) {
        connect(
          { connector: targetConnector },
          {
            onSuccess: () => {
              onClose();
            },
            onError: async (err: any) => {
              console.warn('Wagmi sync fallback:', err);
              // Read account directly from provider
              const accs = await provider.request({ method: 'eth_accounts' });
              if (accs && accs.length > 0) {
                onManualConnect(accs[0]);
                onClose();
              } else {
                setError(err.message || 'Connection was rejected in wallet.');
              }
            }
          }
        );
      } else {
        const accs = await provider.request({ method: 'eth_accounts' });
        if (accs && accs.length > 0) {
          onManualConnect(accs[0]);
          onClose();
        }
      }
    } catch (err: any) {
      console.error('Wallet connect error:', err);
      setError(err.message || 'User closed or rejected the wallet prompt.');
    } finally {
      setConnectingKey(null);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualAddr || !manualAddr.startsWith('0x') || manualAddr.length !== 42) {
      setError('Please enter a valid 42-character EVM address (0x...)');
      return;
    }
    onManualConnect(manualAddr);
    onClose();
  };

  const handleQuickDeployerConnect = () => {
    onManualConnect('0xb4825ABd70312e52083DDB55D3a00c0c309a6C09');
    onClose();
  };

  return (
    <div className="fixed-overlay animate-fade">
      <div className="telegram-dialog" style={{ maxWidth: '32rem' }}>
        
        {/* Modal Header */}
        <div className="dialog-header">
          <div className="dialog-brand">
            <div className="dialog-avatar">
              <Wallet size={18} className="text-cyan" />
            </div>
            <div>
              <h3 className="dialog-title">Connect EVM Wallet</h3>
              <p className="dialog-subtitle font-mono">X Layer Mainnet (196) • X Layer Testnet (1952)</p>
            </div>
          </div>

          <button onClick={onClose} className="btn-close">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="dialog-body" style={{ padding: '1.25rem' }}>
          
          {(error || connectError) && (
            <div className="alert" style={{ background: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#fca5a5', padding: '0.85rem', borderRadius: '0.75rem', fontSize: '0.75rem', lineHeight: '1.4' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{error || connectError?.message}</span>
              </div>
            </div>
          )}

          {/* Quick Connect Testnet Deployer Button */}
          <button
            onClick={handleQuickDeployerConnect}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(99, 102, 241, 0.15))',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              borderRadius: '0.875rem',
              padding: '0.85rem 1rem',
              cursor: 'pointer',
              color: '#ffffff',
              marginBottom: '0.5rem'
            }}
            className="wallet-option-btn"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={16} className="text-cyan" />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--cyan)' }}>
                  Connect Deployer Wallet (0.46 OKB)
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  0xb482...6C09 • Deployed X Layer Testnet
                </div>
              </div>
            </div>
            <span className="badge-chain" style={{ fontSize: '0.65rem' }}>Instant</span>
          </button>

          {/* Explicit Wallet Selectors */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.25rem' }}>
              Select Wallet Extension:
            </div>

            {/* MetaMask */}
            <button
              onClick={() => handleWalletSelect('metamask', 'MetaMask')}
              disabled={connectingKey !== null}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#090d16',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '0.875rem',
                padding: '0.85rem 1rem',
                cursor: 'pointer',
                color: '#ffffff',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
              className="wallet-option-btn"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                  alt="MetaMask"
                  style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', objectFit: 'contain' }}
                />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>MetaMask</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    Direct MetaMask Extension Popup
                  </div>
                </div>
              </div>

              {connectingKey === 'metamask' ? (
                <span className="font-mono text-cyan" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <RefreshCw size={12} className="spin" /> Opening...
                </span>
              ) : (
                <span className="badge-chain" style={{ fontSize: '0.65rem' }}>Connect</span>
              )}
            </button>

            {/* OKX Wallet */}
            <button
              onClick={() => handleWalletSelect('okx', 'OKX Wallet')}
              disabled={connectingKey !== null}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#090d16',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '0.875rem',
                padding: '0.85rem 1rem',
                cursor: 'pointer',
                color: '#ffffff',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
              className="wallet-option-btn"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img
                  src="https://static.okx.com/cdn/assets/imgs/247/EBE1B13854BEFA4F.png"
                  alt="OKX Wallet"
                  style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', objectFit: 'contain' }}
                />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>OKX Wallet</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    Direct OKX Extension Popup
                  </div>
                </div>
              </div>

              {connectingKey === 'okx' ? (
                <span className="font-mono text-cyan" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <RefreshCw size={12} className="spin" /> Opening...
                </span>
              ) : (
                <span className="badge-chain" style={{ fontSize: '0.65rem' }}>Connect</span>
              )}
            </button>

            {/* Rabby */}
            <button
              onClick={() => handleWalletSelect('rabby', 'Rabby Wallet')}
              disabled={connectingKey !== null}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#090d16',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '0.875rem',
                padding: '0.85rem 1rem',
                cursor: 'pointer',
                color: '#ffffff',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
              className="wallet-option-btn"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img
                  src="https://rabby.io/assets/images/logo.svg"
                  alt="Rabby"
                  style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', objectFit: 'contain' }}
                />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>Rabby Wallet</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    Direct Rabby Extension Popup
                  </div>
                </div>
              </div>

              {connectingKey === 'rabby' ? (
                <span className="font-mono text-cyan" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <RefreshCw size={12} className="spin" /> Opening...
                </span>
              ) : (
                <span className="badge-chain" style={{ fontSize: '0.65rem' }}>Connect</span>
              )}
            </button>
          </div>

          {/* Quick Manual Address Link */}
          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>
              Or Enter Address (Read-Only / Testnet View):
            </div>
            <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={manualAddr}
                onChange={(e) => setManualAddr(e.target.value)}
                placeholder="0x..."
                className="amount-input font-mono"
                style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}
              />
              <button type="submit" className="btn-action primary" style={{ padding: '0.5rem 0.85rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                <span>Connect</span>
                <ArrowRight size={13} />
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
