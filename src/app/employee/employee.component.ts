import {Component, OnInit} from '@angular/core';
import {ApplicationService} from "../service/application.service";
import {UserService} from "../service/user.service";
import {Router} from "@angular/router";
import {NotificationService} from "../service/notification.service";
import {AuthenticationService} from "../service/authentication.service";
import {PositionService} from "../service/position.service";
import {Employee} from "../model/employee";
import {NotificationType} from "../enum/notification-type.enum";
import {EmployeeService} from "../service/employee.service";
import {HttpErrorResponse} from "@angular/common/http";
import {NgForm} from "@angular/forms";
import {CustomHttpResponse} from "../model/custom-http-response";
import {DepartmentService} from "../service/department.service";
import {Department} from "../model/department";

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit {

  public employees: Employee[] = [];
  public departments: Department[] = [];
  public employeeToUpdate: Employee = new Employee();
  public employeeToDelete: Employee = new Employee();
  public employeeSelected: Employee = new Employee();
  public employeeDepartmentMap = new Map<Employee, Department>();
  public refreshing = false;


  constructor(private userService: UserService,
              private router: Router,
              private notificationService: NotificationService,
              private authenticationService: AuthenticationService,
              private applicationService: ApplicationService,
              private positionService: PositionService,
              private employeeService: EmployeeService,
              private departmentService: DepartmentService) {
    this.applicationService.setActiveTab('Employees');
  }

  ngOnInit(): void {
    this.getEmployees(true, true);
  }

  public getEmployees(showNotification: boolean, loadDepartments: boolean): void {
    this.refreshing = true;
    this.employeeService.getEmployees().subscribe(
      (response: Employee[]) => {
        this.employeeService.addEmployeesToLocalCache(response);
        this.employees = this.employeeService.getEmployeesFromLocalCache();
        if (loadDepartments) {
          this.getDepartments(false);
        }
        if (showNotification) {
          this.showNotification(NotificationType.SUCCESS, `${response.length} employees(s) loaded successfully.`)
        }
      }, (errorResponse: HttpErrorResponse) => {
        this.showNotification(NotificationType.ERROR, errorResponse.error.message);
      });
    this.refreshing = false;
  }

  public getDepartments(showNotification: boolean): void {
    this.refreshing = true;
    this.departmentService.getDepartments().subscribe(
      (response: Department[]) => {
        this.departmentService.addDepartmentsToLocalCache(response);
        this.departments = response;
        this.updateEmployeeDepartmentMap();
        if (showNotification) {
          this.showNotification(NotificationType.SUCCESS, `${response.length} departments(s) loaded successfully.`)
        }
      },(errorResponse: HttpErrorResponse) => {
        this.showNotification(NotificationType.ERROR, errorResponse.error.message);
      });
    this.refreshing = false;
  }

  public setSelectedEmployee(employee: Employee): void {
    this.employeeSelected = employee;
    this.clickButton('open-employee-info-btn');
  }

  public setEmployeeToUpdate(employee: Employee): void {
    this.employeeToUpdate = this.employeeService.clonePosition(employee);
    this.clickButton('open-employee-update-btn');
  }

  public setEmployeeToDelete(employee: Employee): void {
    this.employeeToDelete = employee;
  }

  public updateEmployeeDepartmentMap(): void {
    for (let employee of this.employees) {
      for (let department of this.departments) {
        if (employee.departmentId === department.id) {
          this.employeeDepartmentMap.set(employee, department);
        }
      }
    }
  }

  public search(searchTerm: string): void {
    const results: Employee[] = [];
    for (const employee of this.employees) {
      if ((employee.firstName != null && employee.firstName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1) ||
        (employee.lastName != null && employee.lastName.toLowerCase().indexOf(searchTerm.toLowerCase())   !== -1) ||
        (employee.middleName != null && employee.middleName.toLowerCase().indexOf(searchTerm.toLowerCase())   !== -1) ||
        (employee.email != null && employee.email.toLowerCase().indexOf(searchTerm.toLowerCase())         !== -1)) {
        results.push(employee);
      }
    }

    this.employees = results;
    if (results.length === 0 || !searchTerm) {
      this.employees = this.employeeService.getEmployeesFromLocalCache();
    }
  }

  public onDeleteEmployee(employeeId: string): void {
    this.employeeService.deleteEmployee(employeeId).subscribe((response: CustomHttpResponse) => {
      this.clickButton('close-employee-delete-modal');
      this.getEmployees(false, true);
      this.resetData(null);
      this.showNotification(NotificationType.WARNING, response.message);
    }, (errorResponse: HttpErrorResponse) => {
      this.showNotification(NotificationType.ERROR, errorResponse.error.message);
    });
  }

  public resetData(ngForm: NgForm | null): void {
    this.employeeSelected = new Employee();
    this.employeeToDelete = new Employee();
    this.employeeToUpdate = new Employee();
    if (ngForm) {
      ngForm.reset();
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
