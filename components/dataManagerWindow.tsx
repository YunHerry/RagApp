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
import { ScrollView, View } from 'react-native';
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
export function DataManagerWindow() {
  const { dataManagerWindowOpen, setDataManagerWindowOpen, ragDocs, setRagDocs, setUploadList } =
    useWindowContext();
  const { setChatSession, chatSession } = useChatInfoContext();
  const fullName = useMemo(
    () =>
      ragDocs.map((item) => {
        item.isChecked = false;
        return item;
      }),
    [ragDocs]
  );
  return (
    <AlertDialog open={dataManagerWindowOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>数据管理</AlertDialogTitle>
          <AlertDialogDescription className="h-96 w-96">
            {/* <Text className="mt-1 text-sm text-muted-foreground">管理你会话中的文档</Text> */}
            <View className="mt-2">
              {/* <ScrollView>
                
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
                    setUploadList(true);
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
              </ScrollView> */}
              <FlatList
                data={ragDocs}
                renderItem={({ item }) => {
                  console.log(item);
                  return (
                    <View key={item.id} className="mt-4 flex flex-row items-center gap-3">
                      <Checkbox
                        id="terms"
                        checked={item.isChecked}
                        onCheckedChange={() => {
                          item.isChecked = !item.isChecked;
                        }}
                      />
                      <Label
                        className="web:block"
                        htmlFor="width"
                        numberOfLines={1}
                        ellipsizeMode="tail">
                        {item.name}
                      </Label>
                      <Button variant="ghost" size="icon">
                        <Trash color="#dc2626" size={20} />
                      </Button>
                    </View>
                  );
                }}></FlatList>
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
