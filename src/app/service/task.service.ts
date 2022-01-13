import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {CustomHttpResponse} from "../model/custom-http-response";
import {Task} from "../model/task";

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private host = environment.API_URL;

  constructor(private httpClient: HttpClient) {
  }

  public addTask(task: Task): Observable<Task> {
    return this.httpClient.post<Task>(`${this.host}/task/add-new-task`, task);
  }

  public updateTask(task: Task): Observable<Task> {
    return this.httpClient.post<Task>(`${this.host}/task/update-task`, task);
  }

  public getPriorityTaskForUser(priority: number): Observable<Task[]> {
    return this.httpClient.get<Task[]>(`${this.host}/task/get-tasks-with-priority/${priority}`);
  }

  public deleteTask(id: string): Observable<CustomHttpResponse> {
    return this.httpClient.delete<CustomHttpResponse>(`${this.host}/task/delete-note/${id}`);
  }
}
