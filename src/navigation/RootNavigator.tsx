import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { TabBar } from '../components/ui/TabBar';
import { useSession } from '../context/SessionContext';
import { NavigationProvider, useNav } from '../navigation/NavigationContext';
import { BillingScreen } from '../screens/billing/BillingScreen';
import { TopupScreen } from '../screens/billing/TopupScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { SplashScreen } from '../screens/splash/SplashScreen';
import { CreateVmScreen } from '../screens/vms/CreateVmScreen';
import { VmDetailScreen } from '../screens/vms/VmDetailScreen';
import { VmListScreen } from '../screens/vms/VmListScreen';
import { colors } from '../theme';

function MainShell() {
  const { route } = useNav();
  const showTab = route.name === 'vms' || route.name === 'billing' || route.name === 'profile';

  return (
    <View style={styles.shell}>
      <StatusBar style="light" />
      <View style={styles.body}>
        {route.name === 'vms' ? <VmListScreen /> : null}
        {route.name === 'vm-detail' ? <VmDetailScreen uuid={route.uuid} locationSlug={route.locationSlug} /> : null}
        {route.name === 'vm-create' ? <CreateVmScreen /> : null}
        {route.name === 'billing' ? <BillingScreen /> : null}
        {route.name === 'topup' ? <TopupScreen /> : null}
        {route.name === 'profile' ? <ProfileScreen /> : null}
      </View>
      {showTab ? <TabBar /> : null}
    </View>
  );
}

function Gate() {
  const { phase, refreshAll } = useSession();
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (phase !== 'ready') {
      setEntered(false);
      return;
    }
    const timer = setTimeout(() => setEntered(true), 700);
    return () => clearTimeout(timer);
  }, [phase]);

  if (!entered) {
    return <SplashScreen onRetry={() => refreshAll().catch(() => undefined)} />;
  }

  return (
    <NavigationProvider>
      <MainShell />
    </NavigationProvider>
  );
}

export function RootNavigator() {
  return <Gate />;
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1 },
});
