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

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {
  public tasks: Task[] = [];
  public executors: User[] = [];
  public taskSelected: Task = new Task();
  public taskToCreate: Task = new Task();
  public taskToUpdate: Task = new Task();
  public taskToDelete: Task = new Task();
  public currentPage: number = 0;
  public paginationButtonFirst: number = 1;
  public paginationButtonMiddle: number = 2;
  public paginationButtonLast: number = 3;
  public paginationActiveButton = 'first';
  private nextTaskPage: Task[] = [];

  public refreshing = false;
  constructor(private userService: UserService,
              private router: Router,
              private notificationService: NotificationService,
              private authenticationService: AuthenticationService,
              private applicationService: ApplicationService,
              private taskService: TaskService) {
    this.applicationService.setActiveTab('Tasks');
  }

  ngOnInit(): void {
    this.getTasks();
    this.getExecutors()
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
    this.clickButton('open-position-update-btn');
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
    for (const task of this.tasks) {
      if ((task.number != null && task.number.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1)) {
        results.push(task);
      }
    }

    this.tasks = results;
    if (results.length === 0 || !searchTerm) {
      this.getTasks();
    }
  }

  private clickButton(buttonId: string) {
    document.getElementById(buttonId)?.click();
  }

  public isLastPage(): boolean {
    return this.tasks.length < 5 || this.nextTaskPage.length === 0;
  }

  public resetData(ngForm: NgForm): void {
    ngForm.reset();
  }

  onAddNewTask(newTaskForm: NgForm) {

  }

  addNewTaskButtonAction() {

  }
}
