import {Component, OnInit} from '@angular/core';
import {ApplicationService} from "../service/application.service";
import {AuthenticationService} from "../service/authentication.service";
import {TabName} from "../enum/tab-name.enum";
import {Role} from "../model/role";
import {RoleService} from "../service/role.service";
import {NgForm} from "@angular/forms";
import {NotificationType} from "../enum/notification-type.enum";
import {HttpErrorResponse} from "@angular/common/http";
import {NotificationService} from "../service/notification.service";

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent implements OnInit {

  public roles: Role [] = [];
  public refreshing: boolean = false;
  public roleSelected: Role | null = null;
  public roleToUpdate: Role | null = null;
  public roleToDelete: Role | null = null;
  public roleToCreate: Role = new Role();

  constructor(private applicationService: ApplicationService,
              private authenticationService: AuthenticationService,
              private roleService: RoleService,
              private notificationService: NotificationService) {
    this.applicationService.setActiveTab(TabName.ROLE);
  }

  ngOnInit(): void {
    this.getRoles();
  }

  public getRoles(): void {
    this.roleService.getRoles().subscribe(
      (response: Role[]) => {
        this.roles = response;
      }
    )
  }

  public search(searchTerm: string): void {

  }

  public setSelectedRole(role: Role) {
    this.roleSelected = role;
  }

  public setRoleToUpdate(role: Role) {
    this.roleToUpdate = role;
  }

  public setRoleToDelete(role: Role) {
    this.roleToDelete = role;
  }

  public resetData(ngForm: NgForm | null): void {
    this.roleSelected = new Role();
    this.roleToUpdate = new Role();
    this.roleToDelete = new Role();
    this.roleToCreate = new Role();
    if (ngForm) {
      ngForm.reset();
    }
  }

  public onAddNewRole() {
    this.roleService.addRole(this.roleToCreate).subscribe(
      (response: Role) => {
        this.clickButton('add-new-role-close-btn');
        this.getRoles()
        this.resetData(null);
        this.showNotification(NotificationType.SUCCESS, `New role: ${response.name} was created successfully`);
      }, (errorResponse: HttpErrorResponse) => {
        this.showNotification(NotificationType.ERROR, errorResponse.error.message);
      });
  }

  private clickButton(buttonId: string) {
    document.getElementById(buttonId)?.click();
  }

  private showNotification(notificationType: NotificationType, message: string): void {
    if (message) {
      this.notificationService.notify(notificationType, message);
    } else {
      this.notificationService.notify(notificationType, 'An error occurred. Please try again.');
    }
  }
}
