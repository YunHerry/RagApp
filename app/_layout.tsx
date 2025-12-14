import '@/global.css';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { Drawer } from 'react-native-drawer-layout';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
export { ErrorBoundary } from 'expo-router';

import { toast, Toaster } from 'sonner-native';
import { ChatSession } from '@/lib/type/chatSession';
import { setStorage, getStorage } from '@/lib/localStorage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { drawerContent } from '@/components/drawerContent';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '@/lib/constant/screenInfo';
import { DrawerContext } from '@/lib/context/drawerContext';
import { ChatInfoContext } from '@/lib/context/chatInfoCntext';
import { STORAGE_KEYS } from '@/lib/constant/storage';
import { KeyboardProvider, KeyboardStickyView } from 'react-native-keyboard-controller';
export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const [isOpen, setOpen] = useState(false);
  const [chatList, setChatList] = useState<ChatSession[]>([]);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  useEffect(() => {
    getStorage(STORAGE_KEYS.CHAT_LIST).then((item) => {
      setChatList(item || []);
    });
  }, []);
  useEffect(() => {
    setStorage(STORAGE_KEYS.CHAT_LIST, chatList).catch(() => toast('保存失败'));
  }, [chatList]);
  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <SafeAreaProvider>
        <GestureHandlerRootView>
          <KeyboardProvider>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <ChatInfoContext.Provider value={{ chatSession, setChatSession }}>
              <DrawerContext.Provider value={{ isOpen, setOpen, setChatList, chatList }}>
                <Drawer
                  drawerStyle={{
                    flex: 1,
                    backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff',
                  }}
                  open={isOpen}
                  onOpen={() => setOpen(true)}
                  onClose={() => setOpen(false)}
                  drawerPosition="left"
                  drawerType="slide"
                  swipeEdgeWidth={SCREEN_WIDTH}
                  renderDrawerContent={drawerContent}>
                  <Stack />
                  <Toaster />
                </Drawer>
                <PortalHost />
              </DrawerContext.Provider>
            </ChatInfoContext.Provider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
