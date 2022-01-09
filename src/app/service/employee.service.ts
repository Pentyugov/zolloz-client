import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Position} from "../model/position";
import {Observable} from "rxjs";
import {CustomHttpResponse} from "../model/custom-http-response";
import {Employee} from "../model/employee";
import {User} from "../model/user";

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private host = environment.API_URL;

  constructor(private httpClient: HttpClient) {
  }

  public addEmployee(employee: Employee): Observable<Employee> {
    return this.httpClient.post<Employee>(`${this.host}/employee/add-new-employee`, employee);
  }

  public updateEmployee(employee: Employee): Observable<Employee> {
    return this.httpClient.post<Employee>(`${this.host}/employee/update-employee`, employee);
  }

  public getEmployees(): Observable<Employee[]> {
    return this.httpClient.get<Employee[]>(`${this.host}/employee/get-all-employees`);
  }

  public deleteEmployee(id: string): Observable<CustomHttpResponse> {
    return this.httpClient.delete<CustomHttpResponse>(`${this.host}/employee/delete-employee/${id}`);
  }

  public addEmployeesToLocalCache(employees: Employee[]): void {
    localStorage.setItem('employees', JSON.stringify(employees));
  }


  public getEmployeesFromLocalCache(): Employee[] {
    if (localStorage.getItem('employees')) {
      return JSON.parse(localStorage.getItem('employees') as string) as Employee[];
    }

    return [];
  }

  clonePosition(employeeToClone: Employee): Employee {
    const employee = new Employee();
    employee.id = employeeToClone.id;
    employee.firstName = employeeToClone.firstName;
    employee.lastName = employeeToClone.lastName;
    employee.middleName = employeeToClone.middleName;
    employee.salary = employeeToClone.salary;
    employee.phoneNumber = employeeToClone.phoneNumber;
    employee.email = employeeToClone.email;
    employee.hireDate = employeeToClone.hireDate;
    employee.dismissalDate = employeeToClone.dismissalDate;
    employee.head = employeeToClone.head;
    employee.userId = employeeToClone.userId;
    employee.positionId = employeeToClone.positionId;
    employee.departmentId = employeeToClone.departmentId;
    return employee;
  }
}
