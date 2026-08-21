import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X, ExternalLink } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  title: string;
  message?: string;
  txHash?: string;
  explorerUrl?: string;
  duration?: number;
}

export interface ToastItem extends ToastOptions {
  id: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (type: ToastType, options: ToastOptions) => void;
  success: (title: string, message?: string, txHash?: string, explorerUrl?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, options: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = { id, type, ...options };

    setToasts((prev) => [...prev, newToast]);

    const duration = options.duration || 4500;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const success = useCallback((title: string, message?: string, txHash?: string, explorerUrl?: string) => {
    showToast('success', { title, message, txHash, explorerUrl });
  }, [showToast]);

  const error = useCallback((title: string, message?: string) => {
    showToast('error', { title, message });
  }, [showToast]);

  const info = useCallback((title: string, message?: string) => {
    showToast('info', { title, message });
  }, [showToast]);

  const warning = useCallback((title: string, message?: string) => {
    showToast('warning', { title, message });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      
      {/* Floating Toast Notification Stack (Bottom-Right) */}
      <aside aria-label="Notifications" className="luma-toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`luma-toast-card luma-toast-${t.type}`}>
            
            {/* Type Icon */}
            <div className="luma-toast-icon-wrapper">
              {t.type === 'success' && <CheckCircle2 size={19} className="text-emerald-500" />}
              {t.type === 'error' && <AlertCircle size={19} className="text-red-500" />}
              {t.type === 'warning' && <AlertTriangle size={19} className="text-amber-500" />}
              {t.type === 'info' && <Info size={19} className="text-sky-500" />}
            </div>

            {/* Content */}
            <div className="luma-toast-body">
              <div className="luma-toast-title">{t.title}</div>
              {t.message && <div className="luma-toast-message">{t.message}</div>}
              {t.txHash && (
                <div className="luma-toast-tx-link">
                  <a
                    href={t.explorerUrl ? `${t.explorerUrl}/tx/${t.txHash}` : `https://www.oklink.com/xlayer-test/tx/${t.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono"
                  >
                    <span>View Tx: {t.txHash.slice(0, 8)}...{t.txHash.slice(-6)}</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => removeToast(t.id)}
              className="luma-toast-close-btn"
              title="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </aside>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
