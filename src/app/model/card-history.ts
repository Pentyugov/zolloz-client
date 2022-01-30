import {User} from "./user";

export class CardHistory {
  id: string;
  comment: string;
  user: User;
  createDate: Date;
  result: string;

  constructor() {
    this.id = '';
    this.comment = '';
    this.user = new User();
    this.createDate = new Date();
    this.result = '';
  }
}
