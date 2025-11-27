export type Message = {
  role: 'user' | 'tool' | 'system' | 'assistant';
  content: string;
};