import '@/global.css';
import { Text } from '@/components/ui/text';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { Drawer } from 'react-native-drawer-layout';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner-native';
import { Dimensions, Pressable, SafeAreaViewBase, SectionList, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
export { ErrorBoundary } from 'expo-router';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Toaster } from 'sonner-native';
import classNames from 'classnames';
import { ChatSession } from '@/lib/types/chatSession';
import { setStorage, getStorage, removeStorage } from '@/lib/localStorage';
import { MoonStarIcon, PencilLine, SunIcon, Trash } from 'lucide-react-native';
import { GestureHandlerRootView, TextInput } from 'react-native-gesture-handler';
import { Input } from '@/components/ui/input';
import { groupChatsByDate, GroupedChats } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
export const DrawerContext = createContext<any>(null);
export const ChatInfoContext = createContext<any>(null);
const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon,
};

function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <Button
      onPressIn={toggleColorScheme}
      size="icon"
      variant="ghost"
      className="ios:size-16 rounded-full web:mx-4">
      <Icon as={THEME_ICONS[colorScheme ?? 'light']} className="size-5" />
    </Button>
  );
}

function DrawerContent() {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { isOpen, setOpen, chatList, setChatList } = useContext(DrawerContext);
  const { setChatSession, chatSession } = useContext(ChatInfoContext);
  const [isRenameOpen, setRenameOpen] = useState(false);
  const renameInputRef = useRef<TextInput | null>(null);
  const renameInput = useRef('');
  const renameItemId = useRef<null | string>(null);
  const groupedChats = useMemo(() => {
    return groupChatsByDate(chatList || []);
  }, [chatList]);
  return (
    <SafeAreaView className="flex flex-1" edges={['bottom']}>
      <View
        style={{
          paddingTop: insets.top + 20,
          paddingLeft: insets.left + 20,
          paddingRight: 20,
          backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff',
        }}
        className="flex-1">
        <AlertDialog open={isRenameOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>重命名对话</AlertDialogTitle>
              <AlertDialogDescription>
                <Input
                  onChangeText={(text) => {
                    renameInput.current = text;
                  }}
                  ref={renameInputRef}></Input>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onPress={() => {
                  setRenameOpen(false);
                  renameInputRef.current?.clear();
                  renameItemId.current = null;
                }}>
                <Text>取消</Text>
              </AlertDialogCancel>
              <AlertDialogAction
                onPress={() => {
                  setChatList(
                    chatList.map((session: ChatSession) =>
                      renameItemId.current == session.sessionId
                        ? { ...session, sessionName: renameInput.current }
                        : session
                    )
                  );
                  if (renameItemId.current == chatSession?.sessionId) {
                    setChatSession({ ...chatSession, sessionName: renameInput.current });
                  }

                  setRenameOpen(false);
                  renameInputRef.current?.clear();
                  renameItemId.current = null;
                }}>
                <Text>重命名</Text>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {groupedChats.length === 0 ? (
          // 空状态
          <View className="flex-1 items-center justify-center">
            <Text className="text-base text-gray-400">暂无对话</Text>
            <Text className="mt-2 text-xs text-gray-300">开始新的对话吧</Text>
          </View>
        ) : (
          <SectionList
            sections={groupedChats}
            keyExtractor={(item) => item.sessionId}
            renderSectionHeader={({ section }) => (
              <Text className="mb-2 mt-2 text-sm text-gray-400">{section.title}</Text>
            )}
            renderItem={({ item }) => (
              <ContextMenu
                key={item.sessionId}
                onOpenChange={(open) => {
                  setOpenMenuId(open ? item.sessionId : null);
                }}>
                <ContextMenuTrigger asChild>
                  <Pressable
                    onPress={() => {
                      setOpen(false);
                      setChatSession(item);
                    }}
                    className={classNames('rounded-lg p-4 active:bg-gray-200/50', {
                      'bg-gray-200/50':
                        openMenuId === item.sessionId || chatSession?.sessionId === item?.sessionId,
                    })}>
                    <Text>{item.sessionName}</Text>
                  </Pressable>
                </ContextMenuTrigger>

                <ContextMenuContent>
                  <ContextMenuItem
                    onPress={() => {
                      setRenameOpen(true);
                      renameItemId.current = item.sessionId;
                    }}>
                    <PencilLine size={20} />
                    <Text>重命名</Text>
                  </ContextMenuItem>

                  <ContextMenuItem
                    onPress={() => {
                      if (chatSession?.sessionId === item.sessionId) {
                        setChatSession(null);
                      }
                      setChatList(
                        chatList.filter(
                          (session: ChatSession) => item.sessionId !== session.sessionId
                        )
                      );
                      removeStorage(item.sessionId);
                    }}>
                    <Trash color="#dc2626" size={20} />
                    <Text className="text-red-600">删除</Text>
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            )}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-20">
                <Text className="text-gray-400">暂无对话</Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
          />
        )}
      </View>
      <View className='p-4' style={{ backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff' }}>
        {ThemeToggle()}
      </View>
    </SafeAreaView>
  );
}
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
    setStorage('chatList', chatList);
    // .then(() => toast('保存完成'))
    // .catch(() => toast('保存失败'));
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
                renderDrawerContent={DrawerContent}>
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
