import '@/global.css';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { Drawer } from 'react-native-drawer-layout';
import { createContext, useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
export { ErrorBoundary } from 'expo-router';

import { toast, Toaster } from 'sonner-native';
import { ChatSession } from '@/lib/type/chatSession';
import { setStorage, getStorage } from '@/lib/localStorage';
import { GestureHandlerRootView, TextInput } from 'react-native-gesture-handler';
import { drawerContent, DrawerContext } from '@/components/drawerContent';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '@/lib/constant/screenInfo';

export const ChatInfoContext = createContext<any>(null);

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const [isOpen, setOpen] = useState(false);
  const [chatList, setChatList] = useState([]);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  useEffect(() => {
    getStorage('chatList').then((item) => {
      setChatList(item || []);
    });
  }, []);
  useEffect(() => {
    setStorage('chatList', chatList).catch(() => toast('保存失败'));
  }, [chatList]);
  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <SafeAreaProvider>
        <GestureHandlerRootView>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <ChatInfoContext.Provider value={{ chatSession, setChatSession }}>
            <DrawerContext.Provider value={{ isOpen, setOpen, setChatList, chatList }}>
              <Drawer
                drawerStyle={{ height: SCREEN_HEIGHT }}
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
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
