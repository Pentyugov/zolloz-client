import {Component, OnDestroy, OnInit} from '@angular/core';
import {TabName} from "../enum/tab-name.enum";
import {ApplicationService} from "../service/application.service";
import {User} from "../model/user";
import {UserService} from "../service/user.service";
import {AuthenticationService} from "../service/authentication.service";
import {ChatMessage} from "../model/chat-message";
import {ChatService} from "../service/chat.service";
import {ChatMessageService} from "../service/chat-message.service";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {

  public users: User[] = [];
  public recipient: User = new User();
  public currentUser: User = new User();
  public chatMessageToSend: ChatMessage = new ChatMessage();
  public chatMessages: ChatMessage[] = [];
  public chatService: ChatService;
  public testMap: Map<String, ChatMessage[]> = new Map<string, ChatMessage[]>();
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
    this.testMap.set('ewqqwe', []);
    this.test();
  }

  public test(): void {
    this.chatMessages = this.testMap.get('ewqqwe') as ChatMessage[];
    let a = '';

    this.chatMessageService.test().subscribe(
      (response: Map<String, ChatMessage[]>) => {
        this.testMap = response;
        let b = '';
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
    this.chatMessageToSend.senderId = this.currentUser.id;
    this.chatMessageToSend.recipientId = this.recipient.id;
    this.chatMessageToSend.status = 10;
    this.chatService._send(this.chatMessageToSend);
    this.chatMessages.push(this.chatMessageToSend);
    this.chatMessageToSend = new ChatMessage();
  }

  public handleMessage(message: ChatMessage){
    for (let user of this.users) {
      if (user.id === message.senderId) {
        this.recipient = user;
      }
    }
    this.chatMessages.push(message);
  }

  public changeRecipient(user: User) {
    this.recipient = user;
    this.chatMessageService.getRoomChatMessages(this.recipient).subscribe(
      (response: ChatMessage[]) => {
        this.chatMessages = response;
      }, error => {
        this.chatMessages = [];
      }
    );
  }

  private connect(){
    this.chatService._connect();
    this.connected = true;
  }

  private disconnect(){
    this.chatService._disconnect();
    this.connected = false;
  }

  ngOnDestroy(): void {
    this.disconnect()
  }
}
