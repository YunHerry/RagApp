import { ChatSession } from "./chatSession";

export interface GroupedChats {
  title: string;
  data: ChatSession[];
  order: number;
}