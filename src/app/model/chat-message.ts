import {User} from "./user";

export class ChatMessage {
  id: string;
  content: string;
  status: number;
  senderId: string;
  recipientId: string;
  chatId: string;

  constructor() {
    this.id = '';
    this.content = '';
    this.status = 0;
    this.chatId = '';
    this.senderId ='';
    this.recipientId = '';
  }
}
