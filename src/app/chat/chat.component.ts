import {Component, OnDestroy, OnInit} from '@angular/core';
import {TabName} from "../enum/tab-name.enum";
import {ApplicationService} from "../service/application.service";
import {User} from "../model/user";
import {UserService} from "../service/user.service";
import {AuthenticationService} from "../service/authentication.service";
import {ChatMessage} from "../model/chat-message";
import {ChatService} from "../service/chat.service";
import {ChatMessageService} from "../service/chat-message.service";
import {ChatMessageStatus} from "../enum/chat-message-status.enum";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  public chatSelected: boolean = false;
  public users: User[] = [];
  public recipient: User = new User();
  public currentUser: User = new User();
  public chatMessageToSend: ChatMessage = new ChatMessage();
  public chatMessages: ChatMessage[] = [];
  public chatService: ChatService;
  public userChatMessageMap: Map<String, ChatMessage[]> = new Map<String, ChatMessage[]>();
  connected: boolean = false;

  constructor(private applicationService: ApplicationService,
              private authenticationService: AuthenticationService,
              private userService: UserService,
              private chatMessageService: ChatMessageService) {

    this.applicationService.setActiveTab(TabName.CHAT);
  }

  ngOnInit(): void {
    this.getUsers();
    this.currentUser = this.authenticationService.getUserFromLocalCache();
    this.chatService = new ChatService(this, this.currentUser.id);
    this.connect();
    this.getUserChatMessagesMap();
  }

  ngOnDestroy(): void {
    this.disconnect()
  }

  public getUserChatMessagesMap(): void {
    this.chatMessageService.getUserChatMessagesMap().subscribe(
      (response) => {
        Object.entries(response).forEach(([key, value])=>{
          console.log(key, value)
          this.userChatMessageMap.set(key, value);
        });
      }
    )
  }

  public getUsers(): void {
    this.userService.getUsers().subscribe(
      (response: User[]) => {
        this.users = response;
      }
    )
  }

  public sendMessage() {
    if (this.chatMessageToSend.content.trim() !== '') {
      this.chatMessageToSend.senderId = this.currentUser.id;
      this.chatMessageToSend.recipientId = this.recipient.id;
      this.chatMessageToSend.status = 10;
      this.chatService._send(this.chatMessageToSend);
      this.userChatMessageMap.get(this.recipient.id)?.push(this.chatMessageToSend);
      this.chatMessageToSend = new ChatMessage();
    } else {
      this.chatMessageToSend.content = '';
    }

  }

  public handleMessage(message: ChatMessage): void {
    const senderId = message.senderId;
    message.status = senderId === this.recipient.id ? ChatMessageStatus.READ : ChatMessageStatus.RECEIVED;
    this.chatService._updateMessage(message);

    let userChatMessages = this.userChatMessageMap.get(senderId);
    if (userChatMessages) {
      userChatMessages.push(message);
    } else {
      let newUserChatMessages: ChatMessage[] = [];
      newUserChatMessages.push(message);
      this.userChatMessageMap.set(senderId, newUserChatMessages);
    }
  }

  public changeChatRoom(user: User): void {
    this.recipient = user;
    this.chatSelected = true;
    let userChatMessages = this.userChatMessageMap.get(this.recipient.id);
    if (userChatMessages) {
      this.chatMessages = userChatMessages;
    } else {
      let newUserChatMessages: ChatMessage[] = [];
      this.userChatMessageMap.set(this.recipient.id, newUserChatMessages);
    }

    this.chatMessages = this.userChatMessageMap.get(this.recipient.id) as ChatMessage[];

    for (let chatMessage of this.chatMessages) {
      if (chatMessage.status !== ChatMessageStatus.READ && chatMessage.senderId !== this.currentUser.id) {
        chatMessage.status = ChatMessageStatus.READ;
        this.chatService._updateMessage(chatMessage);
      }
    }
  }

  public getUnreadMessageCount(user: User): number {
    let userChatMessages = this.userChatMessageMap.get(user.id);
    let count = 0;
    if (userChatMessages) {
      for (let chatMessage of userChatMessages) {
        if (chatMessage.status !== ChatMessageStatus.READ && chatMessage.senderId !== this.currentUser.id) {
          count++;
        }
      }
    }

    return count;
  }

  public closeChat() {
    this.chatSelected = false;
    this.recipient = new User();
    this.chatMessages = [];
  }

  public search(searchTerm: string): void {
    const results: User[] = [];
    for (const user of this.users) {
      if ((user.username != null && user.username.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1) ||
        (user.firstName != null && user.firstName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1) ||
        (user.lastName != null && user.lastName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1)) {
        results.push(user);
      }
    }

    this.users = results;
    if (results.length === 0 || !searchTerm) {
      this.getUsers();
    }
  }

  private connect(){
    this.chatService._connect();
    this.connected = true;
  }

  private disconnect(){
    this.chatService._disconnect();
    this.connected = false;
  }



}
