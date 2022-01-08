import {Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {CustomHttpResponse} from "../model/custom-http-response";
import {Department} from "../model/department";

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  private host = environment.API_URL;

  constructor(private httpClient: HttpClient) {
  }

  public addDepartment(department: Department): Observable<Department> {
    return this.httpClient.post<Department>(`${this.host}/department/add-new-department`, department);
  }

  public updateDepartment(department: Department): Observable<Department> {
    return this.httpClient.post<Department>(`${this.host}/department/update-department`, department);
  }

  public getDepartments(): Observable<Department[]> {
    return this.httpClient.get<Department[]>(`${this.host}/department/get-all-departments`);
  }

  public getDepartmentById(id: string): Observable<Department> {
    return this.httpClient.get<Department>(`${this.host}/department/get-department-by-id/${id}`);
  }

  public deleteDepartment(id: string): Observable<CustomHttpResponse> {
    return this.httpClient.delete<CustomHttpResponse>(`${this.host}/department/delete-department/${id}`);
  }

  public addDepartmentsToLocalCache(departments: Department[]): void {
    localStorage.setItem('departments', JSON.stringify(departments));
  }

  public getDepartmentsFromLocalCache(): Department[] {
    if (localStorage.getItem('departments')) {
      return JSON.parse(localStorage.getItem('departments') as string) as Department[];
    }

    return [];
  }

  public cloneDepartment(departmentToClone: Department): Department {
    const department = new Department();
    department.id = departmentToClone.id;
    department.name = departmentToClone.name;
    department.code = departmentToClone.code;
    department.parentDepartment = departmentToClone.parentDepartment;
    department.head = departmentToClone.head;
    return department;
  }
}
