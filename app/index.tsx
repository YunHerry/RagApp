import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Stack } from 'expo-router';
import { MoonStarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useContext, useEffect, useRef, useState } from 'react';
import { Image, type ImageStyle, TextInput, View } from 'react-native';
import { Header } from '@/components/header';
import { Input } from '@/components/ui/input';
import { ScrollView } from 'react-native-gesture-handler';
import { ChatInfoContext, DrawerContext } from './_layout';
import { ChatSession } from '@/lib/types/chatSession';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import classNames from 'classnames';
import EventSource from 'react-native-sse';
const LOGO = {
  light: require('@/assets/images/react-native-reusables-light.png'),
  dark: require('@/assets/images/react-native-reusables-dark.png'),
};

const IMAGE_STYLE: ImageStyle = {
  height: 76,
  width: 76,
};
type Message = {
  role: 'user' | 'tool' | 'system' | 'assistant';
  content: string;
};
export default function Screen() {
  const { colorScheme } = useColorScheme();
  const { setChatList, chatList } = useContext(DrawerContext);
  const { setChatSession, chatSession } = useContext(ChatInfoContext);
  const inputRef = useRef<TextInput | null>(null);
  const inputValueRef = useRef('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'user',
      content: 'test',
    },
  ]);
  const [message, setMessage] = useState('');
  // const es = useRef<EventSource | null>(null);
  useEffect(() => {
    // es.current = new EventSource('https://api.ragapp.linc.work/test/chat');
    // es.current.addEventListener('open', (event) => {
    //   console.log('Open SSE connection.');
    // });
    // es.current.addEventListener('message', (event) => {
    //   console.log('New message event:', event.data);
    // });
    // es.current.addEventListener('error', (event) => {
    //   if (event.type === 'error') {
    //     console.error('Connection error:', event.message);
    //   } else if (event.type === 'exception') {
    //     console.error('Error:', event.message, event.error);
    //   }
    // });
    // es.current.addEventListener('close', (event) => {
    //   console.log('Close SSE connection.');
    // });
  }, []);
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <Stack.Screen
        options={{
          header: () => <Header />,
          contentStyle: { flex: 1 },
        }}
      />
      {!chatSession && messages.length > 0 ? (
        <View className="flex-1 items-center justify-center gap-8 p-4">
          <Image source={LOGO[colorScheme ?? 'light']} style={IMAGE_STYLE} resizeMode="contain" />
          <View className="gap-2 p-4">
            <Text className="ios:text-foreground font-mono text-sm text-muted-foreground">
              我能够帮你整合各种数据,形成自己的知识库
            </Text>
          </View>
        </View>
      ) : (
        <ScrollView className="flex-1" contentContainerClassName="p-6 px-8">
          {messages.map((item, index) => (
            <View
              key={index}
              className={classNames(
                'relative max-w-[calc(100%-88px)] rounded-bl-[22px] rounded-br-[8px] rounded-tl-[22px] rounded-tr-[22px] px-4 py-2.5 text-[16px] leading-6',
                {
                  'self-end bg-blue-200/50 text-white': item.role === 'user',
                  'self-start bg-gray-200/50 text-[var(--dsw-alias-label-primary)]':
                    item.role !== 'user',
                }
              )}>
              <Text>{item.content}</Text>
            </View>
          ))}
          <View>
            <Text>{message}</Text>
          </View>
        </ScrollView>
      )}
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
                sessionName: inputValueRef.current,
                lastChat: new Date(),
              };
              setChatSession(session);
              setChatList([...(chatList || []), session]);
            } else {
              chatSession.lastChat = new Date();
            }
            axios.post(
              'https://api.ragapp.linc.work/test/chat',
              {
                message: '介绍一下自己',
                model: 'Qwen3-32B',
              },
              {
                responseType: 'stream',
                onDownloadProgress: (progressEvent) => {
                  const text = progressEvent.event.target.response;
                  const lines = text.split('\n\n');
                  for (const line of lines) {
                    if (line.startsWith('data: ')) {
                      const payload = line.replace('data: ', '').trim();
                      if (payload === '[DONE]') {
                        console.log('结束');
                      } else {
                        const data = JSON.parse(payload);
                        setMessage((prev) => prev + data.content);
                      }
                    }
                  }
                },
              }
            );

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
function isUserType(type: string) {
  switch (type) {
  }
}
