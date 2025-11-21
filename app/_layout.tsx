import '@/global.css';
import { Text } from '@/components/ui/text';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { Drawer } from 'react-native-drawer-layout';
import { createContext, useContext, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Dimensions } from 'react-native';
export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const DrawerContext = createContext<any>(null);
export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const [isOpen, setOpen] = useState(false);
  return (
      <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <DrawerContext.Provider value={{ isOpen, setOpen }}>
          <Drawer
            drawerStyle={{ height: 50 }}
            open={isOpen}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            drawerPosition="left"
            drawerType='slide'
            swipeEdgeWidth={SCREEN_WIDTH}
            renderDrawerContent={() => {
              return <Text>Drawer content</Text>;
            }}>
            <Stack />
          </Drawer>
          <PortalHost />
        </DrawerContext.Provider>
      </ThemeProvider>
  );
}
