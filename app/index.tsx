import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Stack } from 'expo-router';
import { MoonStarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useContext, useRef, useState } from 'react';
import { Image, type ImageStyle, TextInput, View } from 'react-native';
import { Header } from '@/components/header';
import { Input } from '@/components/ui/input';
import { ScrollView } from 'react-native-gesture-handler';
import { ChatInfoContext, DrawerContext } from './_layout';
import { ChatSession } from '@/lib/types/chatSession';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setStorage } from '@/lib/localStorage';
const LOGO = {
  light: require('@/assets/images/react-native-reusables-light.png'),
  dark: require('@/assets/images/react-native-reusables-dark.png'),
};

const IMAGE_STYLE: ImageStyle = {
  height: 76,
  width: 76,
};

export default function Screen() {
  const { colorScheme } = useColorScheme();
  const { setChatList, chatList } = useContext(DrawerContext);
  const { setChatSession, chatSession } = useContext(ChatInfoContext);
  const inputRef = useRef<TextInput | null>(null);
  const inputValueRef = useRef('');

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <Stack.Screen
        options={{
          header: () => <Header />,
          contentStyle: { flex: 1 },
        }}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-1 justify-center items-center gap-8 p-4">
        {!chatSession ? (
          <>
            <Image source={LOGO[colorScheme ?? 'light']} style={IMAGE_STYLE} resizeMode="contain" />
            <View className="gap-2 p-4">
              <Text className="ios:text-foreground font-mono text-sm text-muted-foreground">
                我能够帮你整合各种数据,形成自己的知识库
              </Text>
            </View>
          </>
        ) : null}
      </ScrollView>

      <View className="w-full flex-col gap-4 border-t border-border px-4 py-4">
        <Input
          multiline
          numberOfLines={4}
          className="h-24 py-3"
          textAlignVertical="top"
          placeholder="请输入内容"
          ref={inputRef}
          onChangeText={(text) => {
            inputValueRef.current = text;
          }}
        />
        <Button
          onPress={() => {
            if (!inputValueRef.current.length) return;
            //发送后存储消息,失败回退
            if (!chatSession) {
              const session = {
                sessionId: Date.now().toString(36) + Math.random().toString(36).substring(2),
                sessionName:
                  inputValueRef.current.length > 5
                    ? inputValueRef.current.substring(0, 5) + '...'
                    : inputValueRef.current,
                createTime: new Date(),
                lastChat: new Date(),
              };
              setChatSession(session);
              setChatList([...(chatList || []), session]);
            } else {
              chatSession.lastChat = new Date();
            }

            inputValueRef.current = '';
            inputRef.current?.clear();
          }}>
          <Text>发送</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
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
      className="ios:size-9 rounded-full web:mx-4">
      <Icon as={THEME_ICONS[colorScheme ?? 'light']} className="size-5" />
    </Button>
  );
}
