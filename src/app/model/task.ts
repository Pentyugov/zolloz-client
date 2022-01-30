import {User} from "./user";

export class Task {
  static PRIORITY_LOW: number = 10;
  static PRIORITY_MEDIUM: number = 20;
  static PRIORITY_HIGH: number = 30;

  static STATE_CREATED = "CREATED";
  static STATE_ASSIGNED = "ASSIGNED";
  static STATE_FINISHED = "FINISHED";
  static STATE_CLOSED = "CLOSED";
  static STATE_CANCELED = "CANCELED";
  static STATE_EXECUTED = "EXECUTED";
  static STATE_REWORK = "REWORK";

  id: string
  priority: number
  number: string
  description: string
  comment: string
  state: string
  executionDatePlan: Date | null;
  executionDateFact: Date | null;
  creator: User | null;
  executor: User | null;
  initiator: User | null;
  daysUntilDueDate: number
  started: boolean;


  constructor() {
    this.id = '';
    this.priority = 0;
    this.number = '';
    this.description = '';
    this.comment = '';
    this.state = '';
    this.executionDatePlan = null;
    this.executionDateFact = null;
    this.creator = null;
    this.executor = null;
    this.initiator = null;
    this.daysUntilDueDate = 0;
    this.started = false;
  }
}
