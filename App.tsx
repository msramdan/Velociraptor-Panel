import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DialogProvider } from './src/context/DialogContext';
import { SessionProvider } from './src/context/SessionContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <DialogProvider>
          <SessionProvider>
            <RootNavigator />
          </SessionProvider>
        </DialogProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
