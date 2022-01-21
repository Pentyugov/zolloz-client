import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Note} from "../model/note";
import {Observable} from "rxjs";
import {CustomHttpResponse} from "../model/custom-http-response";
import {Role} from "../model/role";

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  private host = environment.API_URL;

  constructor(private httpClient: HttpClient) {
  }

  public addRole(role: Role): Observable<Role> {
    return this.httpClient.post<Role>(`${this.host}/role/add-new-role`, role);
  }

  public updateRole(role: Role): Observable<Role> {
    return this.httpClient.post<Role>(`${this.host}/role/update-roles`, role);
  }

  public getRoles(): Observable<Role[]> {
    return this.httpClient.get<Role[]>(`${this.host}/role/get-all-roles`);
  }

  public deleteRole(id: string): Observable<CustomHttpResponse> {
    return this.httpClient.delete<CustomHttpResponse>(`${this.host}/role/delete-role/${id}`);
  }
}
