import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

import { AppDialog, type DialogAction, type DialogRequest, type DialogTone } from '../components/ui/AppDialog';

type DialogValue = {
  show: (request: DialogRequest) => Promise<string | null>;
  success: (title: string, message?: string) => Promise<string | null>;
  error: (title: string, message?: string) => Promise<string | null>;
  warn: (title: string, message?: string) => Promise<string | null>;
  confirm: (options: {
    title: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: DialogTone;
    confirmVariant?: DialogAction['variant'];
  }) => Promise<boolean>;
};

const DialogContext = createContext<DialogValue | null>(null);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<DialogRequest | null>(null);
  const resolver = useRef<((value: string | null) => void) | null>(null);

  const close = useCallback((id: string | null) => {
    const resolve = resolver.current;
    resolver.current = null;
    setRequest(null);
    resolve?.(id);
  }, []);

  const show = useCallback((next: DialogRequest) => {
    return new Promise<string | null>((resolve) => {
      resolver.current?.(null);
      resolver.current = resolve;
      setRequest(next);
    });
  }, []);

  const success = useCallback((title: string, message?: string) => show({ title, message, tone: 'success' }), [show]);
  const error = useCallback((title: string, message?: string) => show({ title, message, tone: 'error' }), [show]);
  const warn = useCallback((title: string, message?: string) => show({ title, message, tone: 'warning' }), [show]);

  const confirm = useCallback(
    async ({
      title,
      message,
      confirmLabel = 'Ya',
      cancelLabel = 'Batal',
      tone = 'warning',
      confirmVariant = 'primary',
    }: {
      title: string;
      message?: string;
      confirmLabel?: string;
      cancelLabel?: string;
      tone?: DialogTone;
      confirmVariant?: DialogAction['variant'];
    }) => {
      const result = await show({
        title,
        message,
        tone,
        actions: [
          { id: 'cancel', label: cancelLabel, variant: 'ghost' },
          { id: 'confirm', label: confirmLabel, variant: confirmVariant },
        ],
      });
      return result === 'confirm';
    },
    [show],
  );

  const value = useMemo(
    () => ({ show, success, error, warn, confirm }),
    [show, success, error, warn, confirm],
  );

  return (
    <DialogContext.Provider value={value}>
      {children}
      <AppDialog request={request} onAction={close} />
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const value = useContext(DialogContext);
  if (!value) throw new Error('useDialog must be used inside DialogProvider');
  return value;
}
