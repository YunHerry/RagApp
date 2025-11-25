import '@/global.css';
import { Text } from '@/components/ui/text';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { Drawer } from 'react-native-drawer-layout';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner-native';
import { Dimensions, Pressable, SafeAreaViewBase, View } from 'react-native';
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
import { setStorage, getStorage } from '@/lib/localStorage';
import { PencilLine, Trash } from 'lucide-react-native';
import { GestureHandlerRootView, TextInput } from 'react-native-gesture-handler';
import { Input } from '@/components/ui/input';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
export const DrawerContext = createContext<any>(null);
export const ChatInfoContext = createContext<any>(null);
// export const
function DrawerContent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const { isOpen, setOpen, chatList, setChatList } = useContext(DrawerContext);
  const { setChatSession, chatSession } = useContext(ChatInfoContext);
  const [isRenameOpen, setRenameOpen] = useState(false);
  const renameInputRef = useRef<TextInput | null>(null);
  const renameInput = useRef('');
  const renameItemId = useRef<null | string>(null);
  return (
    <View
      style={{
        paddingTop: insets.top + 20,
        paddingLeft: insets.left + 20,
        paddingRight: 20,
      }}
      className="h-full">
      <Text className="mb-4 text-sm text-gray-400">七天内</Text>
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
      {chatList?.map((item: ChatSession) => {
        return (
          <ContextMenu key={item.sessionId} onOpenChange={setIsMenuOpen}>
            <ContextMenuTrigger asChild>
              <Pressable
                onPress={() => {
                  console.log('点击执行操作');
                  setOpen(false);
                  setChatSession(item);
                }}
                bg-orange-400
                className={classNames('rounded-lg p-4 active:bg-gray-200/50', {
                  'bg-gray-200/50': isMenuOpen || chatSession?.sessionId == item?.sessionId,
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
                  setChatList(
                    chatList.filter(
                      (chatSession: ChatSession) => item.sessionId != chatSession.sessionId
                    )
                  );
                }}>
                <Trash color="#dc2626" size={20} />
                <Text className="text-red-600">删除</Text>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        );
      })}
    </View>
  );
}
export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const [isOpen, setOpen] = useState(true);
  const [chatList, setChatList] = useState([]);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  useEffect(() => {
    getStorage('chatList').then((item) => {
      setChatList(item);
    });
  }, []);
  useEffect(() => {
    setStorage('chatList', chatList)
      .then(() => toast('保存完成'))
      .catch(() => toast('保存失败'));
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
