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
import { Dimensions, SafeAreaViewBase, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
export {
  ErrorBoundary,
} from 'expo-router';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
export const DrawerContext = createContext<any>(null);
export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const [isOpen, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <SafeAreaProvider>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <DrawerContext.Provider value={{ isOpen, setOpen }}>
            <Drawer
              drawerStyle={{ height: SCREEN_HEIGHT }}
              open={isOpen}
              onOpen={() => setOpen(true)}
              onClose={() => setOpen(false)}
              drawerPosition="left"
              drawerType="slide"
              swipeEdgeWidth={SCREEN_WIDTH}
              renderDrawerContent={() => {
                return (
                  <View
                    style={{
                      paddingTop: insets.top + 20,
                      paddingLeft: insets.left + 20,
                    }}
                    className="h-full">
                    <Text>呢容</Text>
                  </View>
                );
              }}>
              <Stack />
            </Drawer>
            <PortalHost />
          </DrawerContext.Provider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
