import { createContext, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import { ChatSession } from '../type/chatSession';

export interface DrawerContextType {
  isOpen: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  chatList: ChatSession[];
  setChatList: Dispatch<SetStateAction<ChatSession[]>>;
};

export const DrawerContext = createContext<DrawerContextType | null>(null);

export function useDrawerContext() {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawer must be used within DrawerProvider');
  }
  return context;
}
