import * as DocumentPicker from 'expo-document-picker';
import { stringToPositiveIntId } from '../utils';
import axios from 'axios';
import { ChatSession } from '../type/chatSession';
import { toast } from 'sonner-native';
import { UploadStatus } from '@/app';

export async function uploadRagFile(
  chatSession: ChatSession,
  file: DocumentPicker.DocumentPickerAsset,
  onStatusChange: (msg: string, status: UploadStatus) => void
) {
  return new Promise(async (resolve, reject) => {
    try {
      // 预签名

      let presignRes = await axios.post(
        'https://api.ragapp.linc.work/documents/presign',
        {
          filename: file.name,
          file_size: file.size || 0,
          content_type: file.mimeType || 'application/octet-stream',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-User-ID': stringToPositiveIntId(chatSession.sessionId),
          },
        }
      );

      const { document_id, upload_url, oss_path, expires_in } = presignRes?.data;
      onStatusChange('预签名完成', UploadStatus.PRESIGN);

      // 读取文件
      const response = await fetch(file.uri);
      const blob = await response.blob();

      // 上传文件
      const uploadResponse = await fetch(upload_url, {
        method: 'PUT',
        headers: {
          'Content-Type': file.mimeType || 'application/octet-stream',
          'X-User-ID': stringToPositiveIntId(chatSession.sessionId).toString(),
        },
        body: blob,
      });

      if (!uploadResponse.ok) {
        throw new Error(`上传失败: ${uploadResponse.status}`);
      }

      onStatusChange('文件上传完成',UploadStatus.UPLOAD);

      // 确认上传
      let confirmRes = await axios.post(
        `https://api.ragapp.linc.work/documents/${document_id}/confirm`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'X-User-ID': stringToPositiveIntId(chatSession.sessionId),
          },
        }
      );
      onStatusChange('确认文件上传',UploadStatus.CONFIRM)
      // 轮询检查状态
      const interval = setInterval(async () => {
        try {
          let res = await axios.get(
            `https://api.ragapp.linc.work/documents/${document_id}/status`,
            {
              headers: {
                'X-User-ID': stringToPositiveIntId(chatSession.sessionId),
              },
            }
          );

          const { status } = res.data;

          if (status === 'completed') {
            console.log('文件处理完成');
            onStatusChange('处理完成', UploadStatus.COMPLETED);
            clearInterval(interval);
            resolve({ success: true, document_id }); // ✅ 成功时 resolve
          } else if (status === 'failed') {
            console.log('处理失败');
            onStatusChange('处理失败',UploadStatus.FAILED);
            clearInterval(interval);
            resolve({ success: false, error: '处理失败' }); // ✅ 失败时也 resolve
          } else {
            onStatusChange('处理中...',UploadStatus.PROCESS);
            console.log('处理中');
          }
        } catch (pollError) {
          console.error('轮询出错:', pollError);
          clearInterval(interval);
          resolve({ success: false, error: '轮询失败' }); // ✅ 轮询出错也 resolve
        }
      }, 2000);

    } catch (error) {
      // ✅ 捕获错误，返回 resolve 而不是 reject
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error('响应错误:', {
            状态码: error.response.status,
            状态文本: error.response.statusText,
            错误数据: error.response.data,
          });
        } else if (error.request) {
          console.error('请求错误（无响应）:', error.request);
          console.error('错误信息:', error.message);
        } else {
          console.error('配置错误:', error.message);
        }
      } else {
        console.error('其他错误:', error);
      }

      onStatusChange('上传失败',UploadStatus.FAILED);
      toast('上传失败');
      resolve({ success: false, error: error.message }); // ✅ 出错也 resolve
    }
  });
}