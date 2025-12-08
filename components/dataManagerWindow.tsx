import { UploadStatus, useWindowContext } from '@/app';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from './ui/alert-dialog';
import { Label } from './ui/label';
import { Text } from '@/components/ui/text';
import { View } from 'react-native';
import { Button } from './ui/button';
import * as DocumentPicker from 'expo-document-picker';
import { SUPPORTED_TYPES } from '@/lib/config/supportedTypes';
import { uploadRagFile } from '@/lib/api/uploadFile';
import { stringToPositiveIntId } from '@/lib/utils';
import { Icon } from './ui/icon';
import { useChatInfoContext } from '@/lib/context/chatInfoCntext';
import axios from 'axios';
import { CirclePlus, Trash } from 'lucide-react-native';
import { FlatList } from 'react-native-gesture-handler';
import { Checkbox } from './ui/checkbox';
import { useMemo } from 'react';
import { toast } from 'sonner-native';
export function DataManagerWindow() {
  const {
    dataManagerWindowOpen,
    setDataManagerWindowOpen,
    uploadWindowOpen,
    setUploadWindowOpen,
    ragDocs,
    setRagDocs,
    setUploadList,
  } = useWindowContext();
  const { setChatSession, chatSession } = useChatInfoContext();
  return (
    <AlertDialog open={dataManagerWindowOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>数据管理</AlertDialogTitle>
          <AlertDialogDescription className="h-96 w-96">
            <View className="mt-2">
              <FlatList
                data={ragDocs}
                renderItem={({ item }) => {
                  return (
                    <View key={item.id} className="mt-4 flex flex-row items-center gap-3">
                      <Checkbox
                        id="terms"
                        checked={item.isChecked}
                        onCheckedChange={() => {
                          setRagDocs((prev) =>
                            prev.map((docs) =>
                              docs.id === item.id ? { ...docs, isChecked: !docs.isChecked } : docs
                            )
                          );
                          axios
                            .patch(
                              'https://api.ragapp.linc.work/documents/selection',
                              {
                                document_id: item.id,
                                is_selected: !item.isChecked,
                              },
                              {
                                headers: {
                                  'Content-Type': 'application/json',
                                  'X-User-ID': stringToPositiveIntId(chatSession.sessionId),
                                },
                              }
                            )
                            .catch((err) => {
                              toast.error('文档选择出现错误,请稍后再试');
                            });
                        }}
                      />
                      <Label
                        className="web:block"
                        htmlFor="width"
                        numberOfLines={1}
                        ellipsizeMode="tail">
                        {item.name}
                      </Label>
                      <Button
                        variant="ghost"
                        size="icon"
                        onPress={() => {
                          axios
                            .delete(`https://api.ragapp.linc.work/documents/${item.id}`, {
                              headers: {
                                'Content-Type': 'application/json',
                                'X-User-ID': stringToPositiveIntId(chatSession.sessionId),
                              },
                            })
                            .then((res) => {
                              toast.success('删除成功');
                            })
                            .catch((err) => {
                              toast.error('删除失败');
                              setRagDocs(
                                ragDocs.filter((docs) => {
                                  return docs.id != item.id;
                                })
                              );
                            });
                          setRagDocs((prev) =>
                            prev.filter((docs) => {
                              return docs.id != item.id;
                            })
                          );
                        }}>
                        <Trash color="#dc2626" size={20} />
                      </Button>
                    </View>
                  );
                }}></FlatList>
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
                  setUploadWindowOpen(true);
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
                  setUploadWindowOpen(false);
                }}>
                <Icon as={CirclePlus} size={24} />
              </Button>
            </View>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onPress={() => setDataManagerWindowOpen(false)}>
            <Text>返回</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
