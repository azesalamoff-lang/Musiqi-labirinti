import React, { useState, useCallback, useRef, createContext, useContext } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmOptions {
  message: string;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions | string) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

/**
 * Drop-in async replacement for window.confirm().
 *
 * Native window.confirm()/alert()/prompt() are silently suppressed by some
 * mobile in-app browsers (e.g. messaging apps' built-in webviews) and in some
 * installed-PWA / sandboxed-iframe contexts — the call returns immediately
 * without ever showing anything, which makes buttons that rely on it look
 * completely unresponsive. This hook renders the same confirmation UI with
 * real React state instead, so it works identically everywhere.
 *
 * Usage: const confirm = useConfirm(); if (await confirm('Are you sure?')) { ... }
 */
export function useConfirm(): (options: ConfirmOptions | string) => Promise<boolean> {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm() must be used within a <ConfirmProvider>');
  }
  return ctx.confirm;
}

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pending, setPending] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions | string): Promise<boolean> => {
    const normalized: ConfirmOptions = typeof options === 'string' ? { message: options } : options;
    setPending(normalized);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const resolve = (result: boolean) => {
    setPending(null);
    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null;
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {pending && (
        <div
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in duration-150"
          role="alertdialog"
          aria-modal="true"
        >
          <div className="bg-slate-900 border border-amber-500/40 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                {pending.title && (
                  <h3 className="text-base font-black text-white font-display mb-1">{pending.title}</h3>
                )}
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{pending.message}</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => resolve(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                {pending.cancelLabel || 'İmtina'}
              </button>
              <button
                onClick={() => resolve(true)}
                autoFocus
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-colors cursor-pointer"
              >
                {pending.confirmLabel || 'Təsdiqlə'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};
