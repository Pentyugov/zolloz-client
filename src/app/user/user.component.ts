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
import {IDropdownSettings} from "ng-multiselect-dropdown";
import {Role} from "../model/role";
import {RoleService} from "../service/role.service";
import {DepartmentService} from "../service/department.service";
import {UserSessionService} from "../service/user-session.service";

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
  public roles: Role[] = [];
  public userRoles: Role[] = [];
  public refreshing = false;

  dropdownSettings:IDropdownSettings={};

  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger?: MatMenuTrigger;

  constructor(private userService: UserService,
              private router: Router,
              private notificationService: NotificationService,
              private authenticationService: AuthenticationService,
              private applicationService: ApplicationService,
              private roleService: RoleService,
              public userSessionService: UserSessionService) {
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
    this.getUsers(false);
    this.getRoles();
    this.currentUser = this.authenticationService.getUserFromLocalCache();

    this.dropdownSettings = {
      idField: 'id',
      textField: 'name',
    };
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

  public getRoles(): void {
    this.roleService.getRoles().subscribe(
      (response: Role[]) => {
        this.roles = response;
      }
    )
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
    this.resetData(null)
    this.clickButton('add-new-user-btn');
  }

  public onAddNewUser(userForm: NgForm): void {
    let userToCreate: User = userForm.value;
    userToCreate.roles = this.userRoles;
    const formData = this.userService.createUserFormData(userToCreate, this.newUserProfileImage);
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
    this.editedUser.roles = this.userRoles;
    const formData = this.userService.createUserFormData(this.editedUser, this.newUserProfileImage);
      this.userService.updateUser(formData).subscribe((response: User) => {
        this.clickButton('close-edit-user-modal-btn');
        this.getUsers(false);
        this.resetData(null);
        this.showNotification(NotificationType.SUCCESS, `User: ${response.username} was updated successfully`);
      }, (errorResponse: HttpErrorResponse) => {
        this.showNotification(NotificationType.ERROR, errorResponse.error.message);
      });
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
    this.userRoles = this.editedUser.roles;
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

  public onItemSelect(item: any) {
    let add = true;
    for (let role of this.userRoles) {
      if (role.id === item.id) {
        add = false;
        break;
      }
    }
    if (add) {
      this.userRoles.push(item);
    }
  }

  public onItemDeSelect(item: any) {
    let tmp = [];
    for (let role of this.userRoles) {
      if (role.id !== item.id) {
        tmp.push(role);
      }
    }
    this.userRoles = tmp;
  }

  public onDeselectAllItems(items: any) {
    this.userRoles = [];
  }

  public onSelectAllItems(items: any) {
    this.userRoles = this.roles;
  }

  public resetData(userForm: NgForm | null): void {
    this.newUserFilename = null;
    this.newUserProfileImage = null;
    this.selectedUser = new User();
    this.userToDelete = new User();
    this.editedUser = new User();
    this.userRoles = [];
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
