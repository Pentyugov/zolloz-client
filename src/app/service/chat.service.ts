import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import {ChatComponent} from "../chat/chat.component";
import {ChatMessage} from "../model/chat-message";
import {environment} from "../../environments/environment";
import {AuthenticationService} from "./authentication.service";

export class ChatService {

  private webSocketEndPoint = environment.WS_URL;
  private stompChatClient: any;
  private chatComponent: ChatComponent;
  private topic: string
  private authenticationService: AuthenticationService;
  constructor(chatComponent: ChatComponent, currentUserId: string, authenticationService: AuthenticationService) {
    this.chatComponent = chatComponent;
    this.topic = `/user/${currentUserId}/chat/messages`;
    this.authenticationService = authenticationService;
  }

  public _connectToChat() {
    console.log("Initialize Chat WS Connection");
    let ws = new SockJS(this.webSocketEndPoint);
    this.stompChatClient = Stomp.over(ws);
    this.stompChatClient.debug = function(str: string) {

    };
    const _this = this;
    _this.stompChatClient.connect({'userId': this.authenticationService.getUserFromLocalCache().id}, function () {
      _this.stompChatClient.subscribe(_this.topic, function (sdkEvent: any) {
        _this.onMessageReceived(sdkEvent);
      });
    }, this.errorCallBack);
  };

  public _disconnectFromChat() {
    if (this.stompChatClient !== null) {
      this.stompChatClient.disconnect();
    }
    console.log("Disconnected from Chat WS");
  }

  public _sendMessage(message: ChatMessage) {
    this.stompChatClient.send(`/api/chat`, {}, JSON.stringify(message));
  }

  public _updateMessage(message: ChatMessage) {
    this.stompChatClient.send(`/api/chat/update-message`, {}, JSON.stringify(message));
  }

  private onMessageReceived(receivedMessage: any) {
    this.chatComponent.handleMessage(JSON.parse(receivedMessage.body));
  }

  errorCallBack(error: any) {
    console.log("errorCallBack -> " + error)
    setTimeout(() => {
      this._connectToChat();
    }, 5000);
  }

}
