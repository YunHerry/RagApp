import { UploadStatus, useWindowContext } from '@/app';
import { SCREEN_WIDTH } from '@/lib/constant/screenInfo';
import { useColorScheme } from 'nativewind';
import { View } from 'react-native';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from './ui/alert-dialog';
import { Text } from '@/components/ui/text';
import * as Progress from 'react-native-progress';

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

export function UploadWindow() {
  const {uploadWindowOpen, setUploadWindowOpen, uploadList } = useWindowContext();
  const { colorScheme } = useColorScheme();
  return (
    <AlertDialog open={uploadWindowOpen}>
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
            (item) => item.status == UploadStatus.COMPLETED || item.status == UploadStatus.FAILED
          ) ? (
            <AlertDialogAction onPress={() => setUploadWindowOpen(false)}>
              <Text>完成</Text>
            </AlertDialogAction>
          ) : null}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
