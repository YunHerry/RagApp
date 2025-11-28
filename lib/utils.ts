import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChatSession } from './type/chatSession';
import { GroupedChats } from './type/groupChats';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function groupChatsByDate(chatList: ChatSession[]): GroupedChats[] {
  if (!chatList || chatList.length === 0) return [];

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const groups: { [key: string]: GroupedChats } = {
    today: { title: '今天', data: [], order: 0 },
    yesterday: { title: '昨天', data: [], order: 1 },
    sevenDays: { title: '七天内', data: [], order: 2 },
    thirtyDays: { title: '三十天内', data: [], order: 3 },
  };

  chatList.forEach((chat) => {
    const chatDate = new Date(chat.lastChat);
    const chatDateOnly = new Date(chatDate.getFullYear(), chatDate.getMonth(), chatDate.getDate());

    if (chatDateOnly.getTime() === today.getTime()) {
      groups.today.data.push(chat);
    } else if (chatDateOnly.getTime() === yesterday.getTime()) {
      groups.yesterday.data.push(chat);
    } else if (chatDateOnly > sevenDaysAgo) {
      groups.sevenDays.data.push(chat);
    } else if (chatDateOnly > thirtyDaysAgo) {
      groups.thirtyDays.data.push(chat);
    } else {
      const year = chatDate.getFullYear();
      const month = chatDate.getMonth() + 1;
      const key = `${year}-${month}`;
      const title = `${year}年${month}月`;
      if (!groups[key]) {
        const yearMonthDate = new Date(year, month - 1);
        const order =
          4 + Math.floor((now.getTime() - yearMonthDate.getTime()) / (30 * 24 * 60 * 60 * 1000));
        groups[key] = {
          title,
          data: [],
          order,
        };
      }
      groups[key].data.push(chat);
    }
  });
  return Object.values(groups)
    .filter((group) => group.data.length > 0)
    .sort((a, b) => a.order - b.order)
    .map((group) => ({
      ...group,
      data: group.data.sort(
        (a, b) => new Date(b.lastChat).getTime() - new Date(a.lastChat).getTime()
      ),
    }));
}
