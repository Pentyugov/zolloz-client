import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {CustomHttpResponse} from "../model/custom-http-response";
import {Position} from "../model/position";
import {environment} from "../../environments/environment";
import {HttpClient, HttpErrorResponse, HttpEvent} from "@angular/common/http";
import {User} from "../model/user";

@Injectable({
  providedIn: 'root'
})
export class PositionService {

  private host = environment.API_URL;

  constructor(private httpClient: HttpClient) {
  }

  public addPosition(position: Position): Observable<Position> {
    return this.httpClient.post<Position>(`${this.host}/position/add-new-position`, position);
  }

  public updatePosition(position: Position): Observable<Position> {
    return this.httpClient.post<Position>(`${this.host}/position/update-position`, position);
  }

  public getPositions(): Observable<Position[]> {
    return this.httpClient.get<Position[]>(`${this.host}/position/get-all-positions`);
  }

  public deletePosition(id: string): Observable<CustomHttpResponse> {
    return this.httpClient.delete<CustomHttpResponse>(`${this.host}/position/delete-position/${id}`);
  }

  public addPositionsToLocalCache(positions: Position[]): void {
    localStorage.setItem('positions', JSON.stringify(positions));
  }

  public getPositionsFromLocalCache(): Position[] {
    if (localStorage.getItem('positions')) {
      return JSON.parse(localStorage.getItem('positions') as string) as Position[];
    }

    return [];
  }

  public clonePosition(positionToClone: Position): Position {
    const position = new Position();
    position.id = positionToClone.id;
    position.name = positionToClone.name;
    return position;
  }

}
