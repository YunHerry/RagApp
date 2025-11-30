import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Image,
  type ImageStyle,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  View,
} from 'react-native';
import { Header } from '@/components/header';
import { Input } from '@/components/ui/input';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import classNames from 'classnames';
import { getStorage, setStorage } from '@/lib/localStorage';
import Markdown, { RenderRules } from 'react-native-markdown-display';
import { Separator } from '@/components/ui/separator';
import { useDrawerContext } from '@/lib/context/drawerContext';
import { useChatInfoContext } from '@/lib/context/chatInfoCntext';
import { Message } from '@/lib/type/mesage';
import { ChatSession } from '@/lib/type/chatSession';
import env from '@/lib/config/env';
import * as Progress from 'react-native-progress';
import { SCREEN_WIDTH } from '@/lib/constant/screenInfo';

const LOGO = {
  light: require('@/assets/images/react-native-reusables-light.png'),
  dark: require('@/assets/images/react-native-reusables-dark.png'),
};

const IMAGE_STYLE: ImageStyle = {
  height: 76,
  width: 76,
};
const createMarkdownRules = (isDark: boolean): Partial<RenderRules> => ({
  text: (node, children, parent, styles) => (
    <Text
      key={node.key}
      className={classNames({
        'text-white': isDark,
        'text-gray-900': !isDark,
      })}>
      {node.content}
    </Text>
  ),

  heading1: (node, children, parent, styles) => (
    <Text
      key={node.key}
      className={classNames('text-2xl font-bold', {
        'text-white': isDark,
        'text-gray-900': !isDark,
      })}>
      {children}
    </Text>
  ),

  // 标题 h2
  heading2: (node, children, parent, styles) => (
    <Text
      key={node.key}
      className={classNames('text-xl font-bold', {
        'text-white': isDark,
        'text-gray-900': !isDark,
      })}>
      {children}
    </Text>
  ),

  // 标题 h3
  heading3: (node, children, parent, styles) => (
    <Text
      key={node.key}
      variant="h3"
      className={classNames('text-xl font-bold', {
        'text-white': isDark,
        'text-gray-900': !isDark,
      })}>
      {children}
    </Text>
  ),

  // 分割线
  hr: (node, children, parent, styles) => <Separator key={node.key} className="my-4" />,
});
export default function Screen() {
  const { colorScheme } = useColorScheme();
  const { setChatList, chatList } = useDrawerContext();
  const { setChatSession, chatSession } = useChatInfoContext();
  const inputRef = useRef<TextInput | null>(null);
  const inputValueRef = useRef('');
  const [messages, setMessages] = useState<Message[]>([]);
  const processedLengthRef = useRef(0);
  const [isRequesting, setRequesting] = useState(false);
  const [message, setMessage] = useState('');
  const messageRef = useRef('');
  const scrollViewRef = useRef<ScrollView>(null);
  useEffect(() => {
    if (chatSession != null) {
      getStorage(chatSession.sessionId).then((res) => {
        const storageArr = JSON.parse(res);
        if (storageArr?.length) setMessages(storageArr);
      });
    } else {
      setMessages([]);
    }
    processedLengthRef.current = 0;
    setMessage('');
    inputValueRef.current = '';
  }, [chatSession]);
  //存储数据
  useEffect(() => {
    if (chatSession) {
      setStorage(chatSession?.sessionId, JSON.stringify(messages));
    }
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messageRef.current]);
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} // 根据你的 Header 调整
    >
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <Stack.Screen
          options={{
            header: () => <Header />,
            contentStyle: { flex: 1 },
          }}
        />

        {!(messages.length > 0) ? (
          <View className="flex-1 items-center justify-center gap-8 p-4">
            <Image source={LOGO[colorScheme ?? 'light']} style={IMAGE_STYLE} resizeMode="contain" />
            <View className="gap-2 p-4">
              <Text className="ios:text-foreground font-mono text-sm text-muted-foreground">
                我能够帮你整合各种数据,形成自己的知识库
              </Text>
            </View>
          </View>
        ) : (
          <ScrollView ref={scrollViewRef} className="flex-1" contentContainerClassName="p-6 px-8">
            {messages.map((item, index) => (
              <View
                key={index}
                className={classNames(
                  'relative mb-6 max-w-[calc(100%-88px)] rounded-tl-[22px] rounded-tr-[22px] px-4 py-0.5 text-[16px] leading-6',
                  {
                    'self-end rounded-bl-[22px] rounded-br-[8px] bg-blue-200/50 text-white':
                      item.role === 'user',
                    'self-start rounded-bl-[8px] rounded-br-[22px] text-[var(--dsw-alias-label-primary)]':
                      item.role !== 'user',
                  }
                )}>
                {/* <Text>{item.content}</Text> */}
                <Markdown
                  style={{
                    text: { fontSize: 18 },
                  }}
                  rules={createMarkdownRules(colorScheme == 'dark')}>
                  {item.content}
                </Markdown>
              </View>
            ))}
            {isRequesting && (
              <Progress.Bar
                indeterminate={true}
                color="#171717"
                borderWidth={0}
                borderRadius={4}
                width={SCREEN_WIDTH * 0.75}
                height={8}
                animationType="timing"
                unfilledColor="#17171733"
              />
            )}
            <View>
              <Markdown
                style={{
                  text: { fontSize: 18 },
                }}
                rules={createMarkdownRules(colorScheme == 'dark')}>
                {message}
              </Markdown>
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
              processedLengthRef.current = 0;
              if (!inputValueRef.current.length) return;
              //发送后存储消息,失败回退
              if (!chatSession) {
                const session: ChatSession = {
                  sessionId: Date.now().toString(36) + Math.random().toString(36).substring(2),
                  sessionName: inputValueRef.current,
                  createTime: new Date(),
                  lastChat: new Date(),
                };
                setChatSession(session);
                setChatList([...(chatList || []), session]);
              } else {
                //需要找出来重新设置
                chatSession.lastChat = new Date();
              }
              setRequesting(true);
              const userInput = inputValueRef.current;
              setMessages((prev) => [
                ...prev,
                {
                  role: 'user',
                  content: userInput,
                },
              ]);
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
                          setRequesting(false);
                        } else if (payload) {
                          try {
                            const data = JSON.parse(payload);
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
    </KeyboardAvoidingView>
  );
}
