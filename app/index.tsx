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
  const processedLengthRef = useRef(0);
  //当前正在回复的消息
  const [message, setMessage] = useState('');
  const messageRef = useRef('');
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
                'relative mb-6 max-w-[calc(100%-88px)] rounded-tl-[22px] rounded-tr-[22px] px-4 py-2.5 text-[16px] leading-6',
                {
                  'self-end bg-blue-200/50 text-white rounded-br-[8px] rounded-bl-[22px]': item.role === 'user',
                  'self-start bg-gray-200/50 text-[var(--dsw-alias-label-primary)] rounded-br-[22px] rounded-bl-[8px]':
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
                message: inputValueRef.current,
                model: 'Qwen3-32B',
              },
              {
                responseType: 'stream',
                onDownloadProgress: (progressEvent) => {
                  const text = progressEvent.event.target.response;

                  const newText = text.slice(processedLengthRef.current);
                  processedLengthRef.current = text.length;
                  const lines = newText.split('\n\n');
                  for (const line of lines) {
                    if (line.startsWith('data: ')) {
                      const payload = line.replace('data: ', '').trim();
                      if (payload === '[DONE]') {
                        const fullContent = messageRef.current;
                        setMessages((prev) => [
                          ...prev,
                          {
                            role: 'assistant',
                            content: fullContent,
                          },
                        ]);
                        setMessage('');
                        messageRef.current = '';
                      } else if (payload) {
                        try {
                          const data = JSON.parse(payload);
                          console.log(data.content);
                          messageRef.current += data.content;
                          setMessage((prev) => prev + data.content);
                        } catch (e) {
                          console.error('JSON parse error:', e);
                        }
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
