import { Injectable } from '@angular/core';
import {AuthenticationService} from "./authentication.service";
import {User} from "../model/user";
import {SystemRoleName} from "../enum/system-role-name.enum";

@Injectable({
  providedIn: 'root'
})
export class UserSessionService {

  constructor(private authenticationService: AuthenticationService) {

  }

  public isCurrentUserInRole(roleName: string): boolean {
    let user: User = this.authenticationService.getUserFromLocalCache();
    for (let role of user.roles) {
      if (role.name.toLowerCase() === roleName.toLowerCase()) {
        return true;
      }
    }

    return false;
  }

  public isUserInRole(user: User, roleName: string): boolean {
    for (let role of user.roles) {
      if (role.name.toLowerCase() === roleName.toLowerCase()) {
        return true;
      }
    }

    return false;
  }

  public isCurrentUserAdmin(): boolean {
    let user: User = this.authenticationService.getUserFromLocalCache();
    for (let role of user.roles) {
      if (role.name.toUpperCase() === SystemRoleName.ADMIN) {
        return true;
      }
    }

    return false;
  }

  public isCurrentUserAppEditor(): boolean {
    let user: User = this.authenticationService.getUserFromLocalCache();
    for (let role of user.roles) {
      if (role.name.toUpperCase() === SystemRoleName.APPLICATION_EDITOR) {
        return true;
      }
    }

    return false;
  }

  public canEdit(): boolean {
    return this.isCurrentUserAdmin() ||
           this.isCurrentUserAppEditor();
  }

  public canDelete(): boolean {
    return this.isCurrentUserAdmin();
  }


}
