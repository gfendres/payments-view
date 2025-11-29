'use client';

import {
  createContext,
  useContext,
  useCallback,
  useState,
  type ReactNode,
} from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const DEFAULT_DURATION = 5000;
const MAX_TOASTS = 5;

/**
 * Generate unique toast ID.
 */
function generateId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Get icon for toast type.
 */
function getToastIcon(type: ToastType) {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-5 w-5 text-emerald-500" />;
    case 'error':
      return <AlertCircle className="h-5 w-5 text-destructive" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    case 'info':
      return <Info className="h-5 w-5 text-blue-500" />;
  }
}

/**
 * Get styles for toast type.
 */
function getToastStyles(type: ToastType): string {
  switch (type) {
    case 'success':
      return 'border-emerald-500/20 bg-emerald-500/10';
    case 'error':
      return 'border-destructive/20 bg-destructive/10';
    case 'warning':
      return 'border-amber-500/20 bg-amber-500/10';
    case 'info':
      return 'border-blue-500/20 bg-blue-500/10';
  }
}

export interface ToastProviderProps {
  children: ReactNode;
}

interface ToastListProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

function ToastList({ toasts, onDismiss }: ToastListProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex w-80 items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm transition-all animate-in slide-in-from-right-5 ${getToastStyles(toast.type)}`}
        >
          {getToastIcon(toast.type)}
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground">{toast.title}</p>
            {toast.message && (
              <p className="mt-1 text-sm text-muted-foreground">{toast.message}</p>
            )}
          </div>
          <button
            onClick={() => {
              onDismiss(toast.id);
            }}
            className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

function useToastState() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = generateId();
      const duration = toast.duration ?? DEFAULT_DURATION;

      setToasts((prev) => {
        const newToasts = [...prev, { ...toast, id }];
        if (newToasts.length > MAX_TOASTS) {
          return newToasts.slice(-MAX_TOASTS);
        }
        return newToasts;
      });

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return { toasts, addToast, removeToast };
}

function useTypedToastActions(addToast: (toast: Omit<Toast, 'id'>) => void) {
  const enqueueTypedToast = useCallback(
    (type: ToastType, title: string, message?: string) => {
      const payload: Omit<Toast, 'id'> = message
        ? { type, title, message }
        : { type, title };
      addToast(payload);
    },
    [addToast]
  );

  const success = useCallback(
    (title: string, message?: string) => {
      enqueueTypedToast('success', title, message);
    },
    [enqueueTypedToast]
  );

  const error = useCallback(
    (title: string, message?: string) => {
      enqueueTypedToast('error', title, message);
    },
    [enqueueTypedToast]
  );

  const warning = useCallback(
    (title: string, message?: string) => {
      enqueueTypedToast('warning', title, message);
    },
    [enqueueTypedToast]
  );

  const info = useCallback(
    (title: string, message?: string) => {
      enqueueTypedToast('info', title, message);
    },
    [enqueueTypedToast]
  );

  return { success, error, warning, info };
}

function useToastActions() {
  const { toasts, addToast, removeToast } = useToastState();
  const { success, error, warning, info } = useTypedToastActions(addToast);

  return { toasts, addToast, removeToast, success, error, warning, info };
}

/**
 * Toast provider component with helpers.
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const { toasts, addToast, removeToast, success, error, warning, info } = useToastActions();

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, success, error, warning, info }}
    >
      {children}

      <ToastList toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

/**
 * Hook to use toast notifications.
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
