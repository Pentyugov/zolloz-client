import {Injectable} from '@angular/core';
import {NotifierService} from "angular-notifier";
import {NotificationType} from "../enum/notification-type.enum";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Notification} from "../model/notification";
import {CustomHttpResponse} from "../model/custom-http-response";
import {SidebarComponent} from "../sidebar/sidebar.component";
import * as SockJS from "sockjs-client";
import * as Stomp from "stompjs";
import {AuthenticationService} from "./authentication.service";

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private host = environment.API_URL;
  private webSocketEndPoint = environment.WS_URL;
  private stompNotificationClient: any;
  private sidebarComponent: SidebarComponent;
  private topic: string

  constructor(private notifier: NotifierService,
              private httpClient: HttpClient,
              private authenticationService: AuthenticationService) {
  }

  public _connectToNotificationWs(sidebarComponent: SidebarComponent) {
    const _this = this;
    _this.sidebarComponent = sidebarComponent;
    _this.topic = `/user/${_this.authenticationService.getUserFromLocalCache().id}/notifications`
    console.log("Initialize Notification WS Connection");
    let ws = new SockJS(_this.webSocketEndPoint);
    _this.stompNotificationClient = Stomp.over(ws);
    _this.stompNotificationClient.debug = function(str: string) {

    };

    _this.stompNotificationClient.connect({}, function () {
      _this.stompNotificationClient.subscribe(_this.topic, function (sdkEvent: any) {
        _this.onMessageReceived(sdkEvent);
      });
    }, this.errorCallBack);
  };

  public _disconnectFromNotificationWs() {
    if (this.stompNotificationClient !== null) {
      this.stompNotificationClient.disconnect();
    }
    console.log("Disconnected from Notification WS");
  }

  private onMessageReceived(receivedMessage: any) {
    this.sidebarComponent.handleWsMessage();
  }

  private errorCallBack(error: any) {
    console.log("errorCallBack -> " + error)
    setTimeout(() => {
      this._connectToNotificationWs(this.sidebarComponent);
    }, 5000);
  }

  public notify(type: NotificationType, message: string): void {
    this.notifier.notify(type, message);
  }

  public getNotificationPageForCurrentUser(page: number = 0): Observable<Notification[]> {
    return this.httpClient.get<Notification[]>(`${this.host}/notification/get-notification-page-for-receiver?page=${page}`);
  }

  public deleteNotification(id: string): Observable<CustomHttpResponse> {
    return this.httpClient.delete<CustomHttpResponse>(`${this.host}/notification/delete-notification/${id}`);
  }
}
