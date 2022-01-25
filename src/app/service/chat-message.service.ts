import {Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {User} from "../model/user";
import {ChatMessage} from "../model/chat-message";
import {NavigationComponent} from "../navigation/navigation.component";
import {AuthenticationService} from "./authentication.service";
import * as SockJS from "sockjs-client";
import * as Stomp from "stompjs";

@Injectable({
  providedIn: 'root'
})
export class ChatMessageService {

  private host = environment.API_URL;

  private webSocketEndPoint = environment.WS_URL;
  private stompNewChatMessagesClient: any;
  private navigationComponent: NavigationComponent;
  private topic: string

  constructor(private httpClient: HttpClient,
              private authenticationService: AuthenticationService) {
  }

  public _connectNewChatMessagesWs(navigationComponent: NavigationComponent) {
    const _this = this;
    _this.navigationComponent = navigationComponent;
    _this.topic = `/user/${_this.authenticationService.getUserFromLocalCache().id}/chat/new-messages-count`
    console.log("Initialize New Chat Messages WS Connection");
    let ws = new SockJS(_this.webSocketEndPoint);
    _this.stompNewChatMessagesClient = Stomp.over(ws);

    _this.stompNewChatMessagesClient.connect({}, function () {
      _this.stompNewChatMessagesClient.subscribe(_this.topic, function (sdkEvent: any) {
        _this.onMessageReceived(sdkEvent);
      });
    }, this.errorCallBack);
  };

  public _disconnectNewChatMessagesWs() {
    if (this.stompNewChatMessagesClient !== null) {
      this.stompNewChatMessagesClient.disconnect();
    }
    console.log("Disconnected from ew Chat Messages WS");
  }

  public getRoomChatMessages(recipient: User): Observable<ChatMessage[]> {
    return this.httpClient.get<ChatMessage[]>(`${this.host}/chat-messages/get-room-messages/${recipient.id}`);
  }

  public getNewMessagesCount(): Observable<number> {
    return this.httpClient.get<number>(`${this.host}/chat-messages/get-new-messages-count`);
  }

  public getUserChatMessagesMap(): Observable<Map<String, ChatMessage[]>> {
    return this.httpClient.get<Map<String, ChatMessage[]>>(`${this.host}/chat-messages/get-user-chat-messages-map`);
  }

  private onMessageReceived(receivedMessage: any) {
    this.navigationComponent.handleWsMessage();
  }

  private errorCallBack(error: any) {
    console.log("errorCallBack -> " + error)
    setTimeout(() => {
      this.stompNewChatMessagesClient(this.navigationComponent);
    }, 5000);
  }


}
