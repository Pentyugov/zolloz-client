import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {User} from "../model/user";
import {ChatMessage} from "../model/chat-message";

@Injectable({
  providedIn: 'root'
})
export class ChatMessageService {

  private host = environment.API_URL;

  constructor(private httpClient: HttpClient) {
  }

  public getRoomChatMessages(recipient: User): Observable<ChatMessage[]> {
    return this.httpClient.get<ChatMessage[]>(`${this.host}/chat-messages/get-room-messages/${recipient.id}`);
  }

  public getUserChatMessagesMap(): Observable<Map<String, ChatMessage[]>> {
    return this.httpClient.get<Map<String, ChatMessage[]>>(`${this.host}/chat-messages/get-user-chat-messages-map`);
  }


}
