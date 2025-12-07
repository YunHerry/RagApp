import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  type ImageStyle,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  TextInput,
  UIManager,
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { CirclePlus } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import * as DocumentPicker from 'expo-document-picker';
import { toast } from 'sonner-native';
import { uploadRagFile } from '@/lib/api/uploadFile';
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
import { stringToPositiveIntId } from '@/lib/utils';
const LOGO = {
  light: require('@/assets/images/react-native-reusables-light.png'),
  dark: require('@/assets/images/react-native-reusables-dark.png'),
};
const SUPPORTED_TYPES = [
  // 文档
  'application/pdf', // .pdf
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx

  // 演示文稿
  'application/vnd.ms-powerpoint', // .ppt
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx

  // 图片
  'image/png', // .png
  'image/jpeg', // .jpg, .jpeg

  // 文本
  'text/plain', // .txt
  'text/markdown', // .md
];
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
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}
function UploadWindow() {
  
}
export default function Screen() {
  const { colorScheme } = useColorScheme();
  const { setChatList, chatList } = useDrawerContext();
  const { setChatSession, chatSession } = useChatInfoContext();
  const inputRef = useRef<TextInput | null>(null);
  const inputValueRef = useRef('');
  const [messages, setMessages] = useState<Message[]>([]);
  const processedLengthRef = useRef(0);
  const [reqeustInfo, setReqeustInfo] = useState({
    isRequesting: false,
    requestMsg: '',
  });
  const [message, setMessage] = useState('');
  const [open, setOpen] = useState(false);
  const [uploadList, setUploadList] = useState<any>([]);
  const messageRef = useRef('');
  const scrollViewRef = useRef<ScrollView>(null);
  const [ragDocs, setRagDocs] = useState<any>([]);
  const controller = useRef(new AbortController());
  const handleStopRequesting = () => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        300, // 动画时长
        LayoutAnimation.Types.easeInEaseOut,
        LayoutAnimation.Properties.scaleY
      )
    );
    setReqeustInfo((prev) => {
      return { isRequesting: false, requestMsg: '' };
    });
  };
  useEffect(() => {
    if (chatSession != null) {
      getStorage(chatSession.sessionId).then((res) => {
        const storageArr = JSON.parse(res);
        if (storageArr?.length) setMessages(storageArr);
      });
      axios
        .get('https://api.ragapp.linc.work/documents', {
          headers: {
            'Content-Type': 'application/json',
            'X-User-ID': stringToPositiveIntId(chatSession.sessionId),
          },
        })
        .then((res) => {
          const { documents } = res.data;
          console.log(documents);
          setRagDocs((prev) => [
            ...documents.map((item) => ({
              name: item.filename,
              id: item.document_id,
            })),
          ]);
        });
    } else {
      setMessages([]);
      setRagDocs((pre) => []);
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
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <Stack.Screen
          options={{
            header: () => <Header />,
            contentStyle: { flex: 1 },
          }}
        />

        <AlertDialog open={open}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>上传列表</AlertDialogTitle>
              <AlertDialogDescription>
                {uploadList.map((item: any, index: number) => {
                  return (
                    <View key={index}>
                      <Text className="mt-4">{item.name}</Text>
                      <Text className="my-4 text-gray-400">{item.statusMsg}</Text>
                      <Progress.Bar
                        indeterminate={item.status == UploadStatus.PROCESS}
                        progress={getProgressByStatus(item.status) / 100}
                        color={colorScheme != 'dark' ? '#171717' : '#3964fe'}
                        borderWidth={0}
                        borderRadius={4}
                        width={SCREEN_WIDTH * 0.75}
                        height={8}
                        animationType="timing"
                        unfilledColor={colorScheme != 'dark' ? '#17171733' : '#0f1115'}
                      />
                    </View>
                  );
                })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              {uploadList.every(
                (item) =>
                  item.status == UploadStatus.COMPLETED || item.status == UploadStatus.FAILED
              ) ? (
                <AlertDialogAction onPress={() => setOpen(false)}>
                  <Text>完成</Text>
                </AlertDialogAction>
              ) : null}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {!(messages.length > 0) ? (
          <View className="flex-1 items-center justify-center gap-8 p-4">
            <Image source={LOGO[colorScheme ?? 'light']} style={IMAGE_STYLE} resizeMode="contain" />
            <View className="gap-2 p-4">
              <Text className="ios:text-foreground font-mono text-sm text-muted-foreground">
                我能够帮你整合各种数据，形成自己的知识库。
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
                <Markdown
                  style={{
                    text: { fontSize: 18 },
                  }}
                  rules={createMarkdownRules(colorScheme == 'dark')}>
                  {item.content}
                </Markdown>
              </View>
            ))}
            {reqeustInfo.isRequesting && (
              <>
                <Text className="mb-4 text-gray-400">{reqeustInfo.requestMsg}</Text>
                <Progress.Bar
                  indeterminate={true}
                  color={colorScheme != 'dark' ? '#171717' : '#3964fe'}
                  borderWidth={0}
                  borderRadius={4}
                  width={SCREEN_WIDTH * 0.75}
                  height={8}
                  animationType="timing"
                  unfilledColor={colorScheme != 'dark' ? '#17171733' : '#0f1115'}
                />
              </>
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
          <View className="flex flex-row">
            <Popover>
              <PopoverTrigger asChild>
                <Button disabled={!chatSession} className="mr-5 flex-1">
                  <Text>数据管理</Text>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="h-auto max-h-[90vh] w-full" side="top">
                <View>
                  <View>
                    <Text className="font-medium leading-none">数据管理</Text>
                    <Text className="mt-1 text-sm text-muted-foreground">管理你会话中的文档</Text>
                  </View>
                  <View className="mt-2">
                    <ScrollView>
                      {ragDocs.map((item) => {
                        console.log(item);
                        return (
                          <View key={item.id} className="flex-row items-center">
                            <Label className="web:block" htmlFor="width">
                              {item.name}
                            </Label>
                          </View>
                        );
                      })}
                      <Button
                        variant="ghost"
                        size="icon"
                        onPress={async () => {
                          const result = await DocumentPicker.getDocumentAsync({
                            type: SUPPORTED_TYPES,
                            copyToCacheDirectory: true,
                          });
                          //上传
                          if (result.canceled) {
                            console.log('取消了文件上传');
                            return;
                          }
                          setOpen(true);
                          setUploadList(
                            result.assets.map((item) => {
                              return {
                                name: item.name,
                                statusMsg: '正在等待中...',
                                status: 'pending',
                              };
                            })
                          );
                          for (let index = 0; index < result.assets.length; index++) {
                            const asset = result.assets[index];
                            await uploadRagFile(chatSession, asset, (msg, status) => {
                              setUploadList((prevList: any[]) =>
                                prevList.map((item, i) =>
                                  i === index ? { ...item, statusMsg: msg, status: status } : item
                                )
                              );
                              if (status == UploadStatus.COMPLETED) console.log('触发');
                            });
                          }
                          axios
                            .get('https://api.ragapp.linc.work/documents', {
                              headers: {
                                'Content-Type': 'application/json',
                                'X-User-ID': stringToPositiveIntId(chatSession.sessionId),
                              },
                            })
                            .then((res) => {
                              const { documents } = res.data;
                              setRagDocs((prev) => [
                                ...documents.map((item) => ({
                                  name: item.filename,
                                  id: item.document_id,
                                })),
                              ]);
                            });
                        }}>
                        <Icon as={CirclePlus} size={24} />
                      </Button>
                    </ScrollView>
                  </View>
                </View>
              </PopoverContent>
            </Popover>
            <Button
              className="flex-[4]"
              onPress={() => {
                if (reqeustInfo.isRequesting) {
                  controller.current.abort();
                  setMessages((prev) => [
                    ...prev,
                    {
                      role: 'assistant',
                      content: messageRef.current,
                    },
                  ]);
                  setMessage('');
                  messageRef.current = '';
                  handleStopRequesting();
                  return;
                }
                processedLengthRef.current = 0;
                if (!inputValueRef.current.length) return;
                //发送后存储消息,失败回退
                var session = chatSession;
                if (!session) {
                  session = {
                    sessionId: Date.now().toString(36) + Math.random().toString(36).substring(2),
                    sessionName:
                      inputValueRef.current.replaceAll('\n', '').length > 5
                        ? inputValueRef.current.replaceAll('\n', '').slice(0, 5) + '...'
                        : inputValueRef.current.replaceAll('\n', ''),
                    createTime: new Date(),
                    lastChat: new Date(),
                  };
                  setChatSession(session);
                  setChatList([...(chatList || []), session]);
                } else {
                  //需要找出来重新设置
                  chatSession.lastChat = new Date();
                }
                setReqeustInfo((prev) => {
                  return { isRequesting: true, requestMsg: '正在请求中...' };
                });
                const userInput = inputValueRef.current;
                setMessages((prev) => [
                  ...prev,
                  {
                    role: 'user',
                    content: userInput,
                  },
                ]);
                //获取rag文本片段

                axios
                  .post(
                    'https://api.ragapp.linc.work/rag/chat',
                    {
                      question: userInput,
                      mode: 'hybrid',
                      history: [...messages],
                      document_ids: ragDocs.map((item) => item.id),
                      top_k: 20,
                    },
                    {
                      signal: controller.current.signal,
                      headers: {
                        'X-User-ID': stringToPositiveIntId(session.sessionId),
                      },
                      responseType: 'stream',
                      onDownloadProgress: (progressEvent) => {
                        if (!processedLengthRef.current)
                          setReqeustInfo((prev) => {
                            return { isRequesting: true, requestMsg: '正在思索中...' };
                          });
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
                              handleStopRequesting();
                            } else if (payload) {
                              try {
                                const data = JSON.parse(payload);
                                console.log(data);
                                if (data.body) {
                                  toast.error(data.body.message);
                                  setMessage('');
                                  messageRef.current = '';
                                  handleStopRequesting();
                                }
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
                  )
                  .catch((err) => {
                    if (axios.isAxiosError(err)) {
                      console.log('AxiosError:', {
                        message: err.message,
                        code: err.code,
                        status: err.response?.status,
                        statusText: err.response?.statusText,
                        data: err.response?.data,
                        url: err.config?.url,
                        method: err.config?.method,
                        headers: err.response?.headers,
                      });

                      toast.error(err.response?.data?.message || err.message || '请求失败');
                    } else {
                      console.log('未知错误:', err);
                      toast.error('未知错误');
                    }
                  });
                inputValueRef.current = '';
                inputRef.current?.clear();
              }}>
              <Text>{reqeustInfo.isRequesting ? '停止生成' : '发送'}</Text>
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
export enum UploadStatus {
  PENDING = 'pending',
  PRESIGN = 'presign',
  READ = 'read',
  UPLOAD = 'upload',
  CONFIRM = 'confirm',
  PROCESS = 'process',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

function getProgressByStatus(status: UploadStatus): number {
  const progressMap: Record<UploadStatus, number> = {
    [UploadStatus.PENDING]: 0,
    [UploadStatus.PRESIGN]: 15,
    [UploadStatus.READ]: 25,
    [UploadStatus.UPLOAD]: 50,
    [UploadStatus.CONFIRM]: 70,
    [UploadStatus.PROCESS]: 85,
    [UploadStatus.COMPLETED]: 100,
    [UploadStatus.FAILED]: 0,
  };

  return progressMap[status] || 0;
}
