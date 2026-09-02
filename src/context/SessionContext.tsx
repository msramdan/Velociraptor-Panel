import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { getUserInfo, listAllVms, listBillingAccounts, listLocations, updateProfile } from '../api';
import { env } from '../constants/env';
import { setStoredApiKey } from '../storage/secureStore';
import type { BillingAccount, IdCloudLocation, IdCloudUser, LocatedVm, UserProfile } from '../types';
import { delay } from '../utils/format';

export type SplashPhase = 'booting' | 'connecting' | 'syncing' | 'ready' | 'error';

type SessionValue = {
  phase: SplashPhase;
  label: string;
  error: string | null;
  user: IdCloudUser | null;
  locations: IdCloudLocation[];
  vms: LocatedVm[];
  accounts: BillingAccount[];
  account: BillingAccount | null;
  refreshAll: () => Promise<void>;
  refreshVms: () => Promise<void>;
  refreshBilling: () => Promise<void>;
  patchUserProfile: (form: Parameters<typeof updateProfile>[0]) => Promise<UserProfile>;
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<SplashPhase>('booting');
  const [label, setLabel] = useState('Menyalakan Velociraptor Panel');
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<IdCloudUser | null>(null);
  const [locations, setLocations] = useState<IdCloudLocation[]>([]);
  const [vms, setVms] = useState<LocatedVm[]>([]);
  const [accounts, setAccounts] = useState<BillingAccount[]>([]);

  const loadCore = useCallback(async () => {
    const [nextUser, nextLocations, nextVms, nextAccounts] = await Promise.all([
      getUserInfo(),
      listLocations(),
      listAllVms(),
      listBillingAccounts(),
    ]);
    setUser(nextUser);
    setLocations(nextLocations);
    setVms(nextVms);
    setAccounts(nextAccounts);
    return { nextUser, nextVms };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        await delay(360);
        if (cancelled) return;
        if (!env.apiKey) {
          setPhase('error');
          setLabel('API key belum diisi');
          setError('Tambahkan EXPO_PUBLIC_IDCLOUDHOST_API_KEY di file .env');
          return;
        }

        setPhase('connecting');
        setLabel('Menghubungkan ke IDCloudHost');
        await setStoredApiKey(env.apiKey);

        setPhase('syncing');
        setLabel('Sinkronisasi profil, VPS, dan billing');
        const { nextUser } = await loadCore();
        if (cancelled) return;

        await delay(280);
        const firstName = nextUser.profile_data?.first_name || nextUser.name;
        setPhase('ready');
        setLabel(`Halo, ${firstName}`);
        setError(null);
      } catch (caught) {
        if (cancelled) return;
        setPhase('error');
        setLabel('Gagal terhubung ke API');
        setError(caught instanceof Error ? caught.message : 'Terjadi kesalahan jaringan');
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [loadCore]);

  const refreshAll = useCallback(async () => {
    setPhase('syncing');
    setLabel('Sinkronisasi ulang');
    setError(null);
    try {
      const { nextUser } = await loadCore();
      setPhase('ready');
      setLabel(`Halo, ${nextUser.profile_data?.first_name || nextUser.name}`);
    } catch (caught) {
      setPhase('error');
      setLabel('Gagal terhubung ke API');
      setError(caught instanceof Error ? caught.message : 'Terjadi kesalahan jaringan');
    }
  }, [loadCore]);

  const refreshVms = useCallback(async () => {
    const nextVms = await listAllVms();
    setVms(nextVms);
  }, []);

  const refreshBilling = useCallback(async () => {
    const nextAccounts = await listBillingAccounts();
    setAccounts(nextAccounts);
  }, []);

  const patchUserProfile = useCallback(async (form: Parameters<typeof updateProfile>[0]) => {
    const profile = await updateProfile(form);
    setUser((current) =>
      current
        ? {
            ...current,
            profile_data: { ...(current.profile_data ?? profile), ...profile },
          }
        : current,
    );
    return profile;
  }, []);

  const account = accounts.find((item) => item.is_default) ?? accounts[0] ?? null;

  const value = useMemo(
    () => ({
      phase,
      label,
      error,
      user,
      locations,
      vms,
      accounts,
      account,
      refreshAll,
      refreshVms,
      refreshBilling,
      patchUserProfile,
    }),
    [phase, label, error, user, locations, vms, accounts, account, refreshAll, refreshVms, refreshBilling, patchUserProfile],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession must be used inside SessionProvider');
  return value;
}
