import * as DocumentPicker from 'expo-document-picker';
import { stringToPositiveIntId } from '../utils';
import axios from 'axios';
import { ChatSession } from '../type/chatSession';
import { toast } from 'sonner-native';
export async function uploadRagFile(
  chatSession: ChatSession,
  file: DocumentPicker.DocumentPickerAsset
) {
  try {
    //预签名
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
    console.log('预签名完成');
    const response = await fetch(file.uri);
    // const arrayBuffer = await response.arrayBuffer();
    const blob = await response.blob();
    // const formData = new FormData();
    // formData.append('file', {
    //   uri: file.uri,
    //   name: file.name,
    //   type: file.mimeType || 'application/octet-stream',
    // } as any);
    // console.log('读取文件buffer完成');
    //上传文件
    // let uploadRes = await axios.put(upload_url, formData, {
    //   headers: {
    //     'Content-Type': file.mimeType,
    //     'X-User-ID': stringToPositiveIntId(chatSession.sessionId),
    //   },
    // });
    const uploadResponse = await fetch(upload_url, {
      method: 'PUT',
      headers: {
        'Content-Type': file.mimeType || 'application/octet-stream',
        'X-User-ID': stringToPositiveIntId(chatSession.sessionId).toString(),
      },
      body: blob,
    });
    console.log('文件上传完成');
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
    // console.log(confirmRes);

    const interval = setInterval(async () => {
      let res = await axios.get(`https://api.ragapp.linc.work/documents/${document_id}/status`, {
        headers: {
          'X-User-ID': stringToPositiveIntId(chatSession.sessionId),
        },
      });
      const { status } = res.data;
      if (status == 'completed') {
        console.log("索引已经完成")
        clearInterval(interval);
      } else if(status == 'failed') {
        console.log("处理失败")
        clearInterval(interval);
      } else {
        console.log("处理中")
      }
    }, 2000);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // 服务器返回了错误响应（状态码 4xx, 5xx）
      if (error.response) {
        console.error('响应错误:', {
          状态码: error.response.status,
          状态文本: error.response.statusText,
          错误数据: error.response.data,
          请求头: error.response.headers,
          请求配置: error.config,
        });
      }
      // 请求已发送但没有收到响应（网络问题、超时等）
      else if (error.request) {
        console.error('请求错误（无响应）:', error.request);
        console.error('错误信息:', error.message);
      }
      // 请求配置出错
      else {
        console.error('配置错误:', error.message);
      }
    } else {
      // 非 axios 错误
      console.error('其他错误:', error);
    }
    toast('上传失败');
  }
}
