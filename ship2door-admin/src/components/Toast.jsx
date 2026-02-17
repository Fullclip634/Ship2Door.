import { useState, useCallback, createContext, useContext } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'success', title, message, duration = 4000 }) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, type, title, message, duration, exiting: false }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
        }, 250);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 250);
  }, []);

  const toast = useCallback({
    success: (title, message) => addToast({ type: 'success', title, message }),
    error: (title, message) => addToast({ type: 'error', title, message }),
    info: (title, message) => addToast({ type: 'info', title, message }),
    warning: (title, message) => addToast({ type: 'warning', title, message }),
  }, [addToast]);

  // Make toast callable directly as well
  const toastFn = Object.assign(
    (title, message) => addToast({ type: 'success', title, message }),
    toast
  );

  return (
    <ToastContext.Provider value={toastFn}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const icons = {
  success: <CheckCircle />,
  error: <XCircle />,
  info: <Info />,
  warning: <AlertTriangle />,
};

function ToastItem({ toast: t, onClose }) {
  return (
    <div className={`toast toast-${t.type} ${t.exiting ? 'toast-exiting' : ''}`}>
      <div className="toast-icon">
        {icons[t.type]}
      </div>
      <div className="toast-content">
        {t.title && <div className="toast-title">{t.title}</div>}
        {t.message && <div className="toast-message">{t.message}</div>}
      </div>
      <button className="toast-close" onClick={onClose}>
        <X size={14} />
      </button>
    </div>
  );
}
