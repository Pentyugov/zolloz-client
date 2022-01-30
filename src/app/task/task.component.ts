import {Component, OnInit} from '@angular/core';
import {ApplicationService} from "../service/application.service";
import {UserService} from "../service/user.service";
import {Router} from "@angular/router";
import {NotificationService} from "../service/notification.service";
import {AuthenticationService} from "../service/authentication.service";
import {TaskService} from "../service/task.service";
import {Task} from "../model/task";
import {NgForm} from "@angular/forms";
import {User} from "../model/user";
import {NotificationType} from "../enum/notification-type.enum";
import {HttpErrorResponse} from "@angular/common/http";
import {CustomHttpResponse} from "../model/custom-http-response";
import {TabName} from "../enum/tab-name.enum";
import {UserSessionService} from "../service/user-session.service";
import {CardHistory} from "../model/card-history";

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {
  public currentUser: User = new User();
  public tasks: Task[] = [];
  public executors: User[] = [];
  public executorId: string = '';
  public taskSelected: Task = new Task();
  public taskToCreate: Task = new Task();
  public taskToUpdate: Task = new Task();
  public taskToDelete: Task = new Task();
  public currentPage: number = 0;
  public paginationButtonFirst: number = 1;
  public paginationButtonMiddle: number = 2;
  public paginationButtonLast: number = 3;
  public paginationActiveButton = 'first';
  public executionDatePlan: Date | null = null;
  public cardHistory: CardHistory[] = [];
  private nextTaskPage: Task[] = [];

  public refreshing = false;
  constructor(private userService: UserService,
              private router: Router,
              private notificationService: NotificationService,
              private authenticationService: AuthenticationService,
              private applicationService: ApplicationService,
              private taskService: TaskService,
              private userSessionService: UserSessionService) {
    this.applicationService.setActiveTab(TabName.TASKS);
  }

  ngOnInit(): void {
    this.getTasks();
    this.getExecutors();
    this.loadNextPage(this.currentPage + 1);
    this.currentUser = this.authenticationService.getUserFromLocalCache();
  }

  public getTasks(page: number = 0): void {
      this.taskService.getTasksPageForCurrentUser(page).subscribe(
        (response: Task[]) => {
          this.tasks = response;
        }
      )
  }

  public getExecutors(): void {
    this.userService.getUsers().subscribe(
      (response: User[]) => {
        this.executors = response;
      }
    )
  }

  public setSelectedTask(task: Task): void {
    this.taskSelected = task;
    this.clickButton('open-task-info-btn');
  }

  public setTaskToUpdate(task: Task): void {
    this.taskToUpdate = this.taskService.cloneTask(task);

    if (this.taskToUpdate.executor) {
      this.executorId = this.taskToUpdate.executor.id;
    }


    if (this.taskToUpdate.executionDatePlan) {
      this.executionDatePlan = new Date(Date.parse(this.taskToUpdate.executionDatePlan.toString()))
    }
    this.clickButton('open-task-update-btn');
  }

  public setTaskToDelete(task: Task): void {
    this.taskToDelete = task;
  }

  public changePage(buttonPosition: string): void {
    if (buttonPosition === 'first') {
      this.paginationButtonMiddle = this.paginationButtonFirst;
      if (this.paginationButtonMiddle - 1 < 1) {
        this.paginationButtonMiddle = 2;
        this.paginationActiveButton = 'first'
      }
    }

    if (buttonPosition === 'middle') {
      this.paginationActiveButton = 'middle'
    }

    if (buttonPosition === 'last') {
      this.paginationButtonMiddle = this.paginationButtonLast;
      this.paginationActiveButton = 'middle'
    }

    this.paginationButtonFirst = this.paginationButtonMiddle - 1;
    this.paginationButtonLast = this.paginationButtonMiddle + 1;

    if (this.paginationActiveButton === 'first') {
      this.currentPage = this.paginationButtonFirst - 1;
    }

    if (this.paginationActiveButton === 'middle') {
      this.currentPage = this.paginationButtonMiddle - 1;
    }

    if (this.paginationActiveButton === 'last') {
      this.currentPage = this.paginationButtonLast - 1;
    }

    this.getTasks(this.currentPage);
    this.loadNextPage(this.currentPage + 1);
  }

  private loadNextPage(page: number): void {
    this.taskService.getTasksPageForCurrentUser(page).subscribe(
      (response: Task[]) => {
        this.nextTaskPage = response;
      }
    )
  }

  public search(searchTerm: string): void {
    const results: Task[] = [];
    for (let task of this.tasks) {
      if ((task.number != null && task.number.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1)) {
        results.push(task);
      }
    }

    this.tasks = results;
    if (results.length === 0 || !searchTerm) {
      this.getTasks();
    }
  }

  public clickButton(buttonId: string) {
    document.getElementById(buttonId)?.click();
  }

  public isLastPage(): boolean {
    return this.tasks.length < 5 || this.nextTaskPage.length === 0;
  }

  public resetData(ngForm: NgForm | null): void {
  this.taskSelected = new Task();
  this.taskToCreate = new Task();
  this.taskToUpdate = new Task();
  this.taskToDelete = new Task();
  this.cardHistory = [];
  this.executorId = '';
  if (ngForm) {
    ngForm.reset();
  }
  }

  public onAddNewTask(startTask: boolean = false) {
    for (let executor of this.executors) {
      if (executor.id === this.executorId) {
        this.taskToCreate.executor = new User();
        this.taskToCreate.executor.id = this.executorId;
      }
    }
    if (this.taskToCreate.executor) {
      this.taskService.addTask(this.taskToCreate).subscribe(
        (response: Task) => {
          this.clickButton('add-new-task-close-btn');
          this.getTasks();
          this.resetData(null);
          if (startTask) {
            this.startTask(response.id)
          } else {
            this.showNotification(NotificationType.SUCCESS, `New task: ${response.number} was created successfully`);
          }
        }, (errorResponse: HttpErrorResponse) => {
          this.showNotification(NotificationType.ERROR, errorResponse.error.message);
        });
    } else {
      this.showNotification(NotificationType.ERROR, `Executor with id: ${this.executorId} not found`);
    }

  }

  public onUpdateTask(startTask: boolean = false):void {
    for (let executor of this.executors) {
      if (executor.id === this.executorId) {
        this.taskToUpdate.executor = new User();
        this.taskToUpdate.executor.id = this.executorId;
      }
    }

    if (this.taskToUpdate.creator) {
      let creator = new User();
      creator.id = this.taskToUpdate.creator.id;
      this.taskToUpdate.creator = creator;
    }

    if (this.taskToUpdate.initiator) {
      let initiator = new User();
      initiator.id = this.taskToUpdate.initiator.id;
      this.taskToUpdate.initiator = initiator;
    }

    if (this.taskToUpdate.executor) {
      this.taskService.updateTask(this.taskToUpdate).subscribe(
        (response: Task) => {
          this.clickButton('update-task-close-btn');
          this.getTasks();
          this.resetData(null);
          if (startTask) {
            this.startTask(response.id);
          } else {
            this.showNotification(NotificationType.SUCCESS, `Task: ${response.number} was updated successfully`);
          }
        }, (errorResponse: HttpErrorResponse) => {
          this.showNotification(NotificationType.ERROR, errorResponse.error.message);
        });
    } else {
      this.showNotification(NotificationType.ERROR, `Executor with id: ${this.executorId} not found`);
    }
  }

  public updateExecutionDatePlan(event: any): void {
    this.executionDatePlan = new Date(Date.parse(event.target.value));
    this.taskToUpdate.executionDatePlan = this.executionDatePlan;
  }

  public onDeleteTask(id: string) {
    this.taskService.deleteTask(id).subscribe((response: CustomHttpResponse) => {
      this.clickButton('close-task-delete-modal');
      this.getTasks();
      this.resetData(null);
      this.showNotification(NotificationType.WARNING, response.message);
    }, (errorResponse: HttpErrorResponse) => {
      this.showNotification(NotificationType.ERROR, errorResponse.error.message);
    });
  }

  public startTask(id: string) : void {
    this.taskService.startTask(id).subscribe((response: CustomHttpResponse) => {
      this.getTasks();
      this.resetData(null);
      this.showNotification(NotificationType.INFO, response.message);
    }, (errorResponse: HttpErrorResponse) => {
      this.showNotification(NotificationType.ERROR, errorResponse.error.message);
    });
  }

  public cancelTask(ngForm: NgForm) {
    let comment = ngForm.value.comment;
    this.taskService.cancelTask(this.taskToUpdate.id, comment).subscribe((response: CustomHttpResponse) => {
      this.clickButton('task-cancel-modal-no-btn');
      this.clickButton('update-task-close-btn');
      this.getTasks();
      this.resetData(null);
      this.showNotification(NotificationType.INFO, response.message);
    }, (errorResponse: HttpErrorResponse) => {
      this.showNotification(NotificationType.ERROR, errorResponse.error.message);
    });
  }

  public executeTask(ngForm: NgForm) {
    let comment = ngForm.value.comment;
    this.taskService.executeTask(this.taskToUpdate.id, comment).subscribe((response: CustomHttpResponse) => {
      this.clickButton('task-execute-modal-no-btn');
      this.clickButton('update-task-close-btn');
      this.getTasks();
      this.resetData(null);
      this.showNotification(NotificationType.INFO, response.message);
    }, (errorResponse: HttpErrorResponse) => {
      this.showNotification(NotificationType.ERROR, errorResponse.error.message);
    });
  }

  public reworkTask(ngForm: NgForm) {
    let comment = ngForm.value.comment;
    this.taskService.reworkTask(this.taskToUpdate.id, comment).subscribe((response: CustomHttpResponse) => {
      this.clickButton('task-rework-modal-no-btn');
      this.clickButton('update-task-close-btn');
      this.getTasks();
      this.resetData(null);
      this.showNotification(NotificationType.INFO, response.message);
    }, (errorResponse: HttpErrorResponse) => {
      this.showNotification(NotificationType.ERROR, errorResponse.error.message);
    });
  }

  public finishTask(ngForm: NgForm) {
    let comment = ngForm.value.comment;
    this.taskService.finishTask(this.taskToUpdate.id, comment).subscribe((response: CustomHttpResponse) => {
      this.clickButton('task-finish-modal-no-btn');
      this.clickButton('update-task-close-btn');
      this.getTasks();
      this.resetData(null);
      this.showNotification(NotificationType.INFO, response.message);
    }, (errorResponse: HttpErrorResponse) => {
      this.showNotification(NotificationType.ERROR, errorResponse.error.message);
    });
  }

  public loadTaskHistory(): void {
    this.taskService.getTaskHistory(this.taskSelected.id).subscribe(
      (response: CardHistory[]) => {
        this.cardHistory = response;
      }
    )
  }

  public isCurrentUserTaskCreatorOrInitiator(): boolean {
    return this.currentUser.id === this.taskToUpdate.creator?.id
      || this.currentUser.id === this.taskToUpdate.initiator?.id;
  }

  private showNotification(notificationType: NotificationType, message: string): void {
    if (message) {
      this.notificationService.notify(notificationType, message);
    } else {
      this.notificationService.notify(notificationType, 'An error occurred. Please try again.');
    }
  }

  public isUpdateButtonEnabled(): boolean {
    if (this.userSessionService.isCurrentUserAdmin()) {
      return true;
    }

    return this.isCurrentUserTaskCreatorOrInitiator() &&
           this.taskToUpdate.state !== Task.STATE_ASSIGNED &&
           this.taskToUpdate.state !== Task.STATE_REWORK;
  }


  public isTaskEditButtonEnabled(task: Task):boolean {
    return this.userSessionService.isCurrentUserAdmin() ||
           task.executor?.id === this.currentUser.id ||
           task.initiator?.id === this.currentUser.id ||
           task.creator?.id === this.currentUser.id ;
  }

  public isTaskDeleteButtonEnabled() {
    return this.userSessionService.isCurrentUserAdmin();
  }

  public isFieldsEnabled(): boolean {
    if (this.userSessionService.isCurrentUserAdmin()) {
      return true;
    }

    if (this.taskToUpdate.state !== Task.STATE_ASSIGNED && this.taskToUpdate.state !== Task.STATE_REWORK) {
      return this.isCurrentUserTaskCreatorOrInitiator();
    }
    return false;
  }

  public isCancelButtonEnabled(): boolean {
    if (this.taskToUpdate.started) {
      return this.userSessionService.isCurrentUserAdmin() ||
             this.isCurrentUserTaskCreatorOrInitiator();
    }

    return false;
  }


  public isExecuteButtonEnabled(): boolean {
    return this.taskToUpdate.started &&
      (this.taskToUpdate.state === Task.STATE_ASSIGNED || this.taskToUpdate.state === Task.STATE_REWORK) &&
      (this.taskToUpdate.executor?.id === this.currentUser.id || this.userSessionService.isCurrentUserAdmin()) ;
  }

  public isReworkButtonEnabled(): boolean {
    return this.taskToUpdate.started && this.taskToUpdate.state === Task.STATE_EXECUTED &&
      (this.isCurrentUserTaskCreatorOrInitiator() ||
        this.userSessionService.isCurrentUserAdmin()) ;
  }

  public isFinishButtonEnabled(): boolean {
    if (this.taskToUpdate.started && this.userSessionService.isCurrentUserAdmin()) {
      return true;
    }
    return this.taskToUpdate.started &&
           this.taskToUpdate.state === Task.STATE_EXECUTED &&
           this.isCurrentUserTaskCreatorOrInitiator();
  }


}
