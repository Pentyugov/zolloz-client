import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {Note} from "../model/note";
import {NoteCategory} from "../enum/note-category.enum";
import {User} from "../model/user";
import {CustomHttpResponse} from "../model/custom-http-response";

@Injectable({
  providedIn: 'root'
})
export class NoteService {

  private host = environment.API_URL;

  constructor(private httpClient: HttpClient) {
  }

  public addNote(note: Note): Observable<Note> {
    return this.httpClient.post<Note>(`${this.host}/note/add-new-note`, note);
  }

  public updateNote(note: Note): Observable<Note> {
    return this.httpClient.post<Note>(`${this.host}/note/update-note`, note);
  }

  public getNotes(): Observable<Note[]> {
    return this.httpClient.get<Note[]>(`${this.host}/note/get-all-for-current-user`);
  }

  public createNoteFormData(note: Note): FormData {
    const formData = new FormData();
    formData.append('id', '');
    formData.append('description', note.description);
    formData.append('category', note.category);
    formData.append('title', note.title);

    return formData;
  }

  public deleteNote(id: string): Observable<CustomHttpResponse> {
    return this.httpClient.delete<CustomHttpResponse>(`${this.host}/note/delete-note/${id}`);
  }

  public addNoteToLocalCache(note: Note): void {
    this.getNotesFromLocalCache().push(note);
  }

  public addNotesToLocalCache(notes: Note[]): void {
    localStorage.setItem('notes', JSON.stringify(notes));
  }

  public getNotesFromLocalCache(): Note[] {
    if (localStorage.getItem('notes')) {
      return JSON.parse(localStorage.getItem('notes') as string) as Note[];
    }
    return [];
  }

  public getNoteColor(note: Note): string {
    if (note.category === NoteCategory.NOTICE) {
      return 'green';
    }
    if (note.category === NoteCategory.REMIND) {
      return 'yellow';
    }
    if (note.category === NoteCategory.WARNING) {
      return 'orange'
    }

    return 'blue';
  }


}
