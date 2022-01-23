import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import {ChatComponent} from "../chat/chat.component";
import {ChatMessage} from "../model/chat-message";

export class ChatService {

  webSocketEndPoint: string = 'http://localhost:8080/ws';
  stompClient: any;
  chatComponent: ChatComponent;
  topic: string
  constructor(chatComponent: ChatComponent, currentUserId: string) {
    this.chatComponent = chatComponent;
    this.topic = `/user/${currentUserId}/queue/messages`;
    console.log(this.topic)
  }
  _connect() {
    console.log("Initialize WebSocket Connection");
    let ws = new SockJS(this.webSocketEndPoint);
    this.stompClient = Stomp.over(ws);
    const _this = this;
    _this.stompClient.connect({}, function (frame: any) {
      _this.stompClient.subscribe(_this.topic, function (sdkEvent: any) {
        _this.onMessageReceived(sdkEvent);
      });
    }, this.errorCallBack);
  };

  _disconnect() {
    if (this.stompClient !== null) {
      this.stompClient.disconnect();
    }
    console.log("Disconnected");
  }

  errorCallBack(error: any) {
    console.log("errorCallBack -> " + error)
    setTimeout(() => {
      this._connect();
    }, 5000);
  }

  _send(message: ChatMessage) {
    console.log("calling logout api via web socket");
    this.stompClient.send(`/api/chat`, {}, JSON.stringify(message));
  }

  onMessageReceived(receivedMessage: any) {
    console.log("Message Received from Server :: " + receivedMessage);
    this.chatComponent.handleMessage(JSON.parse(receivedMessage.body));
  }

}
