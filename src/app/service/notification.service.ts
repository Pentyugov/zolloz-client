import { Injectable } from '@angular/core';
import {NotifierService} from "angular-notifier";
import {NotificationType} from "../enum/notification-type.enum";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Notification} from "../model/notification";
import {Position} from "../model/position";
import {CustomHttpResponse} from "../model/custom-http-response";

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private host = environment.API_URL;

  constructor(private notifier: NotifierService, private httpClient: HttpClient) { }

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
