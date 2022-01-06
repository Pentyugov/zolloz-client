import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from "rxjs";
import {User} from "../model/user";
import {UserService} from "../service/user.service";
import {NotificationService} from "../service/notification.service";
import {NotificationType} from "../enum/notification-type.enum";
import {MatMenuTrigger} from '@angular/material/menu';
import {AuthenticationService} from "../service/authentication.service";
import {NgForm} from "@angular/forms";
import {HttpErrorResponse} from "@angular/common/http";
import {CustomHttpResponse} from "../model/custom-http-response";
import {Router} from "@angular/router";
import {ApplicationService} from "../service/application.service";
import {TabName} from "../enum/tab-name.enum";

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit, OnDestroy {

  private titleSubject: BehaviorSubject<string>;
  public titleAction$: Observable<any>;
  private subscriptions: Subscription[];
  public selectedUser: User;
  public currentUser: User;
  public newUserFilename: string | null;
  public newUserProfileImage: File | null;
  public today$: Observable<Date>;
  public editedUser: User;
  public userToDelete: User;

  public users: User[] = [];
  public refreshing = false;

  public menuTopLeftPosition =
    {
      x: '0',
      y: '0'
    }

  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger?: MatMenuTrigger;

  constructor(private userService: UserService,
              private router: Router,
              private notificationService: NotificationService,
              private authenticationService: AuthenticationService,
              private applicationService: ApplicationService) {
    this.titleSubject = new BehaviorSubject<string>('Users');
    this.titleAction$ = this.titleSubject.asObservable();
    this.subscriptions = [];
    this.selectedUser = new User();
    this.editedUser = new User();
    this.today$ = new Observable(observable => {
      setInterval(()=> {
        observable.next(new Date())
      }, 1000)
    });

    this.applicationService.setActiveTab(TabName.USERS);
  }

  ngOnInit(): void {
    this.getUsers(true);
    this.currentUser = this.authenticationService.getUserFromLocalCache();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  public getUsers(showNotification: boolean): void {
    this.refreshing = true;
    this.subscriptions.push(
      this.userService.getUsers().subscribe(
        (response: User[]) => {
          this.userService.addUsersToLocalCache(response);
          this.users = this.userService.getUsersFromLocalCache();
          if (showNotification) {
            this.showNotification(NotificationType.SUCCESS, `${response.length} user(s) loaded successfully.`)
          }
        })
    );
    this.refreshing = false;
  }

  public changeTitle(title: string): void {
    this.titleSubject.next(title);
  }

  onRightClick(event: MouseEvent, item: any) {
    if (this.matMenuTrigger) {
      event.preventDefault();
      this.menuTopLeftPosition.x = event.clientX + 'px';
      this.menuTopLeftPosition.y = event.clientY + 'px';
      this.matMenuTrigger.menuData = {item: item}
      this.matMenuTrigger.openMenu();
    }
  }

  public onSelectUser(selectedUser: User): void {
    this.selectedUser = selectedUser;
    this.clickButton('open-user-info-btn');
  }

  public onProfileImageChange(event: any): void {
    if (event.target.files) {
      this.newUserProfileImage = event.target.files[0];
      if (this.newUserProfileImage) {
        this.newUserFilename = this.newUserProfileImage.name;
      }
    }
  }

  public addNewUserButtonAction(): void {
    this.clickButton('add-new-user-btn');
  }

  public onAddNewUser(userForm: NgForm): void {
    const formData = this.userService.createUserFormData(userForm.value, this.newUserProfileImage);
    this.subscriptions.push(
      this.userService.addUser(formData).subscribe((response: User) => {
        this.clickButton('add-new-user-close-btn');
        this.getUsers(false);
        this.resetData(userForm);
        this.showNotification(NotificationType.SUCCESS, `New user: ${response.username} was created successfully`);
      }, (errorResponse: HttpErrorResponse) => {
        this.showNotification(NotificationType.ERROR, errorResponse.error.message);
      })
    );
  }

  public onUpdateUser():void {
    const formData = this.userService.createUserFormData(this.editedUser, this.newUserProfileImage);
    this.subscriptions.push(
      this.userService.updateUser(formData).subscribe((response: User) => {
        this.clickButton('close-edit-user-modal-btn');
        this.getUsers(false);
        this.resetData(null);
        this.showNotification(NotificationType.SUCCESS, `User: ${response.username} was updated successfully`);
      }, (errorResponse: HttpErrorResponse) => {
        this.showNotification(NotificationType.ERROR, errorResponse.error.message);
      })
    );
  }

  public onDeleteUser(userId: string): void {
    this.subscriptions.push(
      this.userService.deleteUser(userId).subscribe((response: CustomHttpResponse) => {
        this.clickButton('close-user-delete-modal');
        this.getUsers(false);
        this.resetData(null);
        this.showNotification(NotificationType.WARNING, response.message);
      }, (errorResponse: HttpErrorResponse) => {
        this.showNotification(NotificationType.ERROR, errorResponse.error.message);
      })
    );
  }

  public deleteUser(user: User): void {
    this.userToDelete = user;
  }

  public onEditUser(editedUser: User): void {
    this.editedUser = this.userService.cloneUser(editedUser);
    this.clickButton('open-user-edit-btn');
  }

  public search(searchTerm: string): void {
    const results: User[] = [];
    for (const user of this.userService.getUsersFromLocalCache()) {
      if ((user.firstName != null && user.firstName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1) ||
          (user.lastName != null && user.lastName.toLowerCase().indexOf(searchTerm.toLowerCase())   !== -1) ||
          (user.username != null && user.username.toLowerCase().indexOf(searchTerm.toLowerCase())   !== -1) ||
          (user.email != null && user.email.toLowerCase().indexOf(searchTerm.toLowerCase())         !== -1)) {
        results.push(user);
      }
    }

    this.users = results;
    if (results.length === 0 || !searchTerm) {
      this.users = this.userService.getUsersFromLocalCache();
    }
  }

  public resetData(userForm: NgForm | null): void {
    this.newUserFilename = null;
    this.newUserProfileImage = null;
    this.selectedUser = new User();
    this.userToDelete = new User();
    this.editedUser = new User();
    if (userForm) {
      userForm.reset();
    }
  }

  private showNotification(notificationType: NotificationType, message: string): void {
    if (message) {
      this.notificationService.notify(notificationType, message);
    } else {
      this.notificationService.notify(notificationType, 'An error occurred. Please try again.');
    }
  }

  private clickButton(buttonId: string) {
    document.getElementById(buttonId)?.click();
  }

}
