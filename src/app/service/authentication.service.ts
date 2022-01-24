import {Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient, HttpResponse} from "@angular/common/http";
import {Observable} from "rxjs";
import {User} from "../model/user";
import {LoginRequest} from "../model/login-request";
import {SignUpRequest} from "../model/sign-up-request";
import {JwtHelperService} from "@auth0/angular-jwt";
import {CustomHttpResponse} from "../model/custom-http-response";
import {SystemRoleName} from "../enum/system-role-name.enum";

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  public host = environment.API_URL;
  private token: string | null;
  private loggedInUsername: string | null;
  private jwtHelperService = new JwtHelperService();

  constructor(private httpClient: HttpClient) {
    this.token = '';
    this.loggedInUsername = '';
  }

  public login(loginRequest: LoginRequest): Observable<HttpResponse<User>> {
    return this.httpClient.post<User>(`${this.host}/auth/login`, loginRequest, {observe: 'response'});
  }

  public register(signUpRequest: SignUpRequest): Observable<User> {
    return this.httpClient.post<User>(`${this.host}/auth/register`, signUpRequest);
  }

  public changePassword(formData: FormData): Observable<CustomHttpResponse> {
    return this.httpClient.post<CustomHttpResponse>(`${this.host}/auth/change-password`, formData);
  }

  public logOut(): void {
    this.token = null;
    this.loggedInUsername = null;
    localStorage.clear();
  }

  public saveToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', this.token);
  }

  public addUserToLocalCache(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  public getUserFromLocalCache(): User {
    return JSON.parse(localStorage.getItem('user') as string)
  }

  public getTokenFromLocalCache(): string {
    return this.token as string;
  }

  public loadToken(): void {
    this.token = localStorage.getItem('token');
  }

  public isUserLoggedIn(): boolean {
    this.loadToken();
    if (this.token != null && this.token !== '' &&
      (this.jwtHelperService.decodeToken(this.token).sub != null || '') &&
      !this.jwtHelperService.isTokenExpired(this.token)) {

      this.loggedInUsername = this.jwtHelperService.decodeToken(this.token).sub;
      return true;

    } else {
      this.logOut();
      return false;
    }
  }

  public isCurrentUserInRole(roleName: string): boolean {
    let user: User = this.getUserFromLocalCache();
    for (let role of user.roles) {
      if (role.name.toLowerCase() === roleName.toLowerCase()) {
        return true;
      }
    }

    return false;
  }

  public isCurrentUserAdmin(): boolean {
    let user: User = this.getUserFromLocalCache();
    for (let role of user.roles) {
      if (role.name.toUpperCase() === SystemRoleName.ADMIN) {
        return true;
      }
    }

    return false;
  }


}
