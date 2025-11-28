import { createContext, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import { ChatSession } from '../type/chatSession';

export interface ChatInfoContextType {
  chatSession: ChatSession;
  setChatSession: Dispatch<SetStateAction<ChatSession>>;
};
export const ChatInfoContext = createContext<any>(null);

export function useChatInfoContext() {
  const context = useContext(ChatInfoContext);
  if (!context) {
    throw new Error('useChatInfoContext must be used within ChatInfoContextProvider');
  }
  return context;
}
