import {Component, OnInit} from '@angular/core';
import {ApplicationService} from "../service/application.service";
import {TabName} from "../enum/tab-name.enum";
import {UserService} from "../service/user.service";
import {Router} from "@angular/router";
import {NotificationService} from "../service/notification.service";
import {AuthenticationService} from "../service/authentication.service";
import {NotificationType} from "../enum/notification-type.enum";
import {Department} from "../model/department";
import {DepartmentService} from "../service/department.service";
import {NgForm} from "@angular/forms";
import {HttpErrorResponse} from "@angular/common/http";
import {CustomHttpResponse} from "../model/custom-http-response";

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.css']
})
export class DepartmentComponent implements OnInit {

  public departments: Department[] = [];
  public departmentToUpdate: Department = new Department();
  public departmentToDelete: Department = new Department();
  public departmentSelected: Department = new Department();
  public departmentToCreate: Department = new Department();
  public selectedParentDepartment: Department | null = new Department();
  public parentDepartments: Department[] = [];

  public showInfo = false;
  public refreshing = false;
  public isMain = false;


  constructor(private userService: UserService,
              private router: Router,
              private notificationService: NotificationService,
              private authenticationService: AuthenticationService,
              private applicationService: ApplicationService,
              private departmentService: DepartmentService) {
    this.applicationService.setActiveTab(TabName.DEPARTMENTS);
  }

  ngOnInit(): void {
    this.getDepartments(true);
  }

  public getDepartments(showNotification: boolean): void {
    this.refreshing = true;
    this.departmentService.getDepartments().subscribe(
      (response: Department[]) => {
        this.departmentService.addDepartmentsToLocalCache(response);
        this.departments = this.departmentService.getDepartmentsFromLocalCache();
        if (showNotification) {
          this.showNotification(NotificationType.SUCCESS, `${response.length} departments(s) loaded successfully.`)
        }
      },(errorResponse: HttpErrorResponse) => {
        this.showNotification(NotificationType.ERROR, errorResponse.error.message);
      });
    this.refreshing = false;
  }

  public deleteDepartment(departmentId: string): void {
    this.departmentService.deleteDepartment(departmentId).subscribe((response: CustomHttpResponse) => {
      this.clickButton('close-department-delete-modal');
      this.getDepartments(false);
      this.resetData(null);
      this.showNotification(NotificationType.WARNING, response.message);
    }, (errorResponse: HttpErrorResponse) => {
      this.showNotification(NotificationType.ERROR, errorResponse.error.message);
    });
  }

  public updateDepartment(): void {
    this.departmentToUpdate.parentDepartment = this.selectedParentDepartment;
    this.departmentService.updateDepartment(this.departmentToUpdate).subscribe((response: Department) => {
      this.clickButton('update-department-close-btn');
      this.getDepartments(false);
      this.resetData(null);
      this.showNotification(NotificationType.SUCCESS, `Department: ${response.name} was updated successfully`);
    }, (errorResponse: HttpErrorResponse) => {
      this.showNotification(NotificationType.ERROR, errorResponse.error.message);
    })
  }

  public setSelectedDepartment(department: Department): void {
    this.departmentSelected = department;
    this.showDepartmentInfo();
  }

  public setDepartmentToUpdate(department: Department): void {
    this.departmentToUpdate = this.departmentService.cloneDepartment(department);
    for (let dept of this.departments) {
      if (dept.id !== this.departmentToUpdate.id && dept.parentDepartment?.id !== this.departmentToUpdate.id) {
        this.parentDepartments.push(dept);
      }
    }
    console.log(this.departmentToUpdate.parentDepartment?.name);
    if (this.departmentToUpdate.parentDepartment) {
      this.selectedParentDepartment = this.departmentToUpdate.parentDepartment;
    }

    this.clickButton('open-department-update-btn');
  }

  public setDepartmentToDelete(department: Department): void {
    this.departmentToDelete = department;
  }

  public showDepartmentInfo(): void {
    this.showInfo = true;
  }

  public search(searchTerm: string): void {
    const results: Department[] = [];
    for (const department of this.departments) {
      if ((department.name != null && department.name.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1)) {
        results.push(department);
      }
    }

    this.departments = results;
    if (results.length === 0 || !searchTerm) {
      this.departments = this.departmentService.getDepartmentsFromLocalCache();
    }
  }

  public onAddNewDepartment(ngForm: NgForm): void {
    this.departmentToCreate.parentDepartment = this.selectedParentDepartment;
    this.departmentService.addDepartment(this.departmentToCreate).subscribe(
      (response: Department) => {
        this.clickButton('add-new-department-close-btn');
        this.getDepartments(false);
        this.resetData(ngForm);
        this.showNotification(NotificationType.SUCCESS, `Department ${response.name} was successfully created`);
      }, (errorResponse: HttpErrorResponse) => {
        this.showNotification(NotificationType.ERROR, errorResponse.error.message);
      });
  }

  public resetData(ngForm: NgForm | null): void {
    this.departmentToDelete = new Department();
    this.departmentToUpdate = new Department();
    this.departmentSelected = new Department();
    this.departmentToCreate = new Department();
    this.parentDepartments = [];
    this.selectedParentDepartment = null;
    this.isMain = false;
    if (ngForm) {
      ngForm.reset();
    }
  }

  public resetUpdateParentDepartmentInput(): void {
    this.departmentToUpdate.parentDepartment = null;
    this.selectedParentDepartment = null;
  }

  public resetCreateParentDepartmentInput(): void {
    this.departmentToCreate.parentDepartment = null;
    this.selectedParentDepartment = null;
}

  public updateSelectedParentDepartment(event:any) {
    if (event.target.value !== 'null') {
      let tmp = this.departments.find(dept => dept.id === event.target.value);
      if (tmp) {
        this.selectedParentDepartment = tmp;
      }
    } else {
      this.selectedParentDepartment = null;
    }
    console.log(this.selectedParentDepartment?.name);
  }

  private clickButton(buttonId: string): void {
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
