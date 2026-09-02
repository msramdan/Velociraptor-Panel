import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type AppRoute =
  | { name: 'vms' }
  | { name: 'vm-detail'; uuid: string; locationSlug: string }
  | { name: 'vm-create' }
  | { name: 'billing' }
  | { name: 'topup' }
  | { name: 'profile' };

export type TabName = 'vms' | 'billing' | 'profile';

type NavigationValue = {
  route: AppRoute;
  canGoBack: boolean;
  push: (route: AppRoute) => void;
  back: () => void;
  switchTab: (tab: TabName) => void;
};

const NavigationContext = createContext<NavigationValue | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<AppRoute[]>([{ name: 'vms' }]);
  const route = stack[stack.length - 1];

  const push = useCallback((next: AppRoute) => {
    setStack((current) => [...current, next]);
  }, []);

  const back = useCallback(() => {
    setStack((current) => (current.length > 1 ? current.slice(0, -1) : current));
  }, []);

  const switchTab = useCallback((tab: TabName) => {
    setStack([{ name: tab }]);
  }, []);

  const value = useMemo(
    () => ({
      route,
      canGoBack: stack.length > 1,
      push,
      back,
      switchTab,
    }),
    [route, stack.length, push, back, switchTab],
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNav() {
  const value = useContext(NavigationContext);
  if (!value) throw new Error('useNav must be used inside NavigationProvider');
  return value;
}
