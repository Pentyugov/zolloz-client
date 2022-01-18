import {User} from "./user";

export class Task {
  static PRIORITY_LOW: number = 10;
  static PRIORITY_MEDIUM: number = 20;
  static PRIORITY_HIGH: number = 30;

  id: string
  priority: number
  number: string
  description: string
  comment: string
  state: string
  executionDatePlan: Date | null;
  executionDateFact: Date | null;
  creator: User;
  executor: User;
  initiator: User;
  daysUntilDueDate: number


  constructor() {
    this.id = '';
    this.priority = 0;
    this.number = '';
    this.description = '';
    this.comment = '';
    this.state = '';
    this.executionDatePlan = null;
    this.executionDateFact = null;
    this.creator = new User();
    this.executor = new User();
    this.initiator = new User();
    this.daysUntilDueDate = 0;
  }
}
