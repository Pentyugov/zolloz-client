export class Notification {
  id : string;
  title: string;
  message: string;
  type: number;
  read: boolean;

  constructor() {
    this.id = '';
    this.title = '';
    this.message = '';
    this.type = 0;
    this.read = false;
  }

}
