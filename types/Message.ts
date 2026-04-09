export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  receiverId?: string;
  groupId?: string;
  content: string;
  type: 'text' | 'image' | 'file';
  status: 'sent' | 'delivered' | 'read' | 'sending' | 'failed';
  createdAt?: string;
}