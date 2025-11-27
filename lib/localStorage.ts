import AsyncStorage from '@react-native-async-storage/async-storage';
import { toast } from 'sonner-native';

/**
 * 存储数据
 */
export async function setStorage(key: string, value: any): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`存储失败 [${key}]:`, error);
  }
}

/**
 * 读取数据
 */
export async function getStorage<T = any>(
  key: string,
  defaultValue?: T
): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : (defaultValue ?? null);
  } catch (error) {
    console.error(`读取失败 [${key}]:`, error);
    return defaultValue ?? null;
  }
}

/**
 * 删除数据
 */
export const removeStorage = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    toast("删除失败!")
  }
};