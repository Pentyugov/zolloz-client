import {Role} from "./role";

export class User {
  public id: string;
  public firstName: string;
  public lastName: string;
  public username: string;
  public email: string;
  public lastLoginDate: Date | null;
  public lastLoginDateDisplay: Date | null;
  public joinDate: Date | null;
  public profileImage: string;
  public active: boolean;
  public nonLocked: boolean;
  public roles: Role[];

  constructor() {
    this.id = '';
    this.firstName = '';
    this.lastName = '';
    this.username = '';
    this.email = '';
    this.lastLoginDate = null;
    this.lastLoginDateDisplay = null;
    this.joinDate = null;
    this.profileImage = '';
    this.active = false;
    this.nonLocked = false;
    this.roles = [];
  }

}
