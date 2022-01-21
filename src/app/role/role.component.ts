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
import {Position} from "../model/position";
import {CustomHttpResponse} from "../model/custom-http-response";

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent implements OnInit {

  public roles: Role [] = [];
  public refreshing: boolean = false;
  public roleSelected: Role = new Role();
  public roleToUpdate: Role = new Role();
  public roleToDelete: Role = new Role();
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
    const results: Role[] = [];
    for (const role of this.roles) {
      if ((role.name != null && role.name.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1)) {
        results.push(role);
      }
    }

    this.roles = results;
    if (results.length === 0 || !searchTerm) {
      this.getRoles();
    }
  }

  public setSelectedRole(role: Role) {
    this.roleSelected = role;
  }

  public setRoleToUpdate(role: Role) {
    this.roleToUpdate = this.roleService.cloneRole(role);
    this.clickButton('open-role-update-btn');
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


  public onUpdateRole() {
    this.roleService.updateRole(this.roleToUpdate).subscribe(
      (response: Role) => {
        this.clickButton('update-role-close-btn');
        this.getRoles();
        this.resetData(null);
        this.showNotification(NotificationType.SUCCESS, `Role: ${response.name} was updated successfully`);
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

  onDeletePosition() {
    this.roleService.deleteRole(this.roleToDelete.id).subscribe((response: CustomHttpResponse) => {
      this.clickButton('close-role-delete-modal');
      this.getRoles();
      this.resetData(null);
      this.showNotification(NotificationType.WARNING, response.message);
    }, (errorResponse: HttpErrorResponse) => {
      this.showNotification(NotificationType.ERROR, errorResponse.error.message);
    });
  }
}
