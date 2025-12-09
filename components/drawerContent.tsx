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
import { useColorScheme } from 'nativewind';
import { createContext, useContext, useMemo, useRef, useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pressable, SectionList, TextInput, View } from 'react-native';
import { Input } from './ui/input';
import { Text } from '@/components/ui/text';
import { groupChatsByDate } from '@/lib/utils';
import { ChatSession } from '@/lib/type/chatSession';
import { PencilLine, Trash } from 'lucide-react-native';
import { removeStorage } from '@/lib/localStorage';
import { ThemeToggle } from './ui/themeToggle';
import classNames from 'classnames';
import { useChatInfoContext } from '@/lib/context/chatInfoCntext';
import { useDrawerContext } from '@/lib/context/drawerContext';
import { SCREEN_HEIGHT } from '@/lib/constant/screenInfo';

export function drawerContent() {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { isOpen, setOpen, chatList, setChatList } = useDrawerContext();
  const { setChatSession, chatSession } = useChatInfoContext();
  const [isRenameOpen, setRenameOpen] = useState(false);
  const renameInputRef = useRef<TextInput | null>(null);
  const renameInput = useRef('');
  const renameItemId = useRef<null | string>(null);
  const groupedChats = useMemo(() => {
    return groupChatsByDate(chatList || []);
  }, [chatList]);
  return (
    <SafeAreaView
      className="flex flex-1"
      style={{
        height: SCREEN_HEIGHT,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left + 20,
        paddingRight: 20,
        backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff',
      }}>
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
                  <PencilLine color={colorScheme === 'dark' ? '#ffffff' : '#1f2937'} size={20} />
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
      <View
        className="p-4 px-0"
        style={{ backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff' }}>
        {ThemeToggle()}
      </View>
    </SafeAreaView>
  );
}
