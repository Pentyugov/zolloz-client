import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {UserSettings} from "../model/user-settings";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {CustomHttpResponse} from "../model/custom-http-response";

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {

  public host = environment.API_URL;

  constructor(private httpClient: HttpClient) { }

  public setActiveTab(tab: string) {
    localStorage.setItem('activeTab', tab);
  }

  public loadUserSettings(): Observable<UserSettings> {
    return this.httpClient.get<UserSettings>(`${this.host}/app/user-settings/get-user-settings`);
  }

  public saveUserSettings(userSettings: UserSettings): Observable<CustomHttpResponse> {
    return this.httpClient.post<CustomHttpResponse>(`${this.host}/app/user-settings/save-user-settings`, userSettings);
  }

  public saveUserSettingsToLocalCache(userSettings: UserSettings): void {
    localStorage.setItem('userSettings', JSON.stringify(userSettings));
  }

  public getUserSettingsFromLocalCache(): UserSettings {
    return JSON.parse(localStorage.getItem('userSettings') as string) as UserSettings;
  }
}
