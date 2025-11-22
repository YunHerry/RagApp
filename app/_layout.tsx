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
import { Dimensions, Pressable, SafeAreaViewBase, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
export { ErrorBoundary } from 'expo-router';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Button } from '@/components/ui/button';
import classNames from 'classnames';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
export const DrawerContext = createContext<any>(null);
function DrawerContent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const { isOpen, setOpen } = useContext(DrawerContext);
  return (
    <View
      style={{
        paddingTop: insets.top + 20,
        paddingLeft: insets.left + 20,
        paddingRight: 20
      }}
      className="h-full">
      <Text className="text-sm text-gray-400 mb-4">七天内</Text>
      <ContextMenu onOpenChange={setIsMenuOpen}>
        <ContextMenuTrigger asChild>
          <Pressable
            onPress={() => {
              console.log('点击执行操作');
              setOpen(false);
            }}
            bg-orange-400
            className={classNames('rounded-lg p-4 active:bg-orange-400', {
              'bg-orange-400': isMenuOpen,
            })}>
            <Text>点击打开,长按显示菜单</Text>
          </Pressable>
        </ContextMenuTrigger>

        <ContextMenuContent>
          <ContextMenuItem onPress={() => console.log('编辑')}>
            <Text>编辑</Text>
          </ContextMenuItem>
          <ContextMenuItem onPress={() => console.log('删除')}>
            <Text>删除</Text>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </View>
  );
}
export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const [isOpen, setOpen] = useState(true);

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
            renderDrawerContent={DrawerContent}>
            <Stack />
          </Drawer>
          <PortalHost />
        </DrawerContext.Provider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
