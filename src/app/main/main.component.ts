import {Component, OnDestroy, OnInit} from '@angular/core';
import {ApplicationService} from "../service/application.service";
import {TabName} from "../enum/tab-name.enum";
import {Note} from "../model/note";
import {NoteService} from "../service/note.service";
import {Subscription} from "rxjs";
import {NotificationType} from "../enum/notification-type.enum";
import {NotificationService} from "../service/notification.service";
import {User} from "../model/user";
import {HttpErrorResponse} from "@angular/common/http";
import {CustomHttpResponse} from "../model/custom-http-response";
import {NgForm} from "@angular/forms";
import {Task} from "../model/task";
import {TaskService} from "../service/task.service";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[];
  public notes: Note[] = [];
  public lowPriorityTasks: Task[] = [];
  public mediumPriorityTasks: Task[] = [];
  public highPriorityTasks: Task[] = [];
  public noteToDelete: Note;
  public noteToUpdate: Note = new Note();

  constructor(private applicationService: ApplicationService,
              private noteService: NoteService,
              private notificationService: NotificationService,
              private taskService: TaskService) {
    this.subscriptions = [];
    this.applicationService.setActiveTab(TabName.MAIN);
  }

  ngOnInit(): void {
    this.getNotes(false);
    this.getTasks();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  public getNotes(showNotification: boolean): void {
    this.subscriptions.push(
      this.noteService.getNotes().subscribe(
        (response: Note[]) => {
          this.noteService.addNotesToLocalCache(response);
          this.notes = this.noteService.getNotesFromLocalCache();
          for (let note of this.notes) {
            note.noteColor = this.noteService.getNoteColor(note);
          }
          if (showNotification) {
            this.showNotification(NotificationType.SUCCESS, `${response.length} note(s) loaded successfully.`)
          }
        }, (errorResponse: HttpErrorResponse) => {
          this.showNotification(NotificationType.ERROR, errorResponse.error.message);
        })
    );
  }

  public getTasks(): void {
    this.taskService.getTasksWhereCurrentUserExecutor(Task.PRIORITY_LOW).subscribe(
      (response: Task[]) => {
        this.lowPriorityTasks = response;
      }
    );
    this.taskService.getTasksWhereCurrentUserExecutor(Task.PRIORITY_MEDIUM).subscribe(
      (response: Task[]) => {
        this.mediumPriorityTasks = response;
      }
    );
    this.taskService.getTasksWhereCurrentUserExecutor(Task.PRIORITY_HIGH).subscribe(
      (response: Task[]) => {
        this.highPriorityTasks = response;
      }
    );

  }

  public getUserName(): void {
    console.log('test ')
  }

  public setNoteToDelete(note: Note): void {
    this.noteToDelete = note;
  }

  public setNoteToUpdate(note: Note): void {
    this.noteToUpdate = note;
  }

  public onDeleteNote(noteId: string): void {
      this.noteService.deleteNote(noteId).subscribe((response: CustomHttpResponse) => {
        this.getNotes(false);
        this.showNotification(NotificationType.WARNING, response.message);
        this.clickButton('close-note-delete-modal')
      }, (errorResponse: HttpErrorResponse) => {
        this.showNotification(NotificationType.ERROR, errorResponse.error.message);
      });
  }

  public onUpdateNote(): void {
    this.noteService.updateNote(this.noteToUpdate).subscribe((response: Note) => {
      this.clickButton('update-note-close-btn');
      this.getNotes(false);
      this.resetData();
      this.showNotification(NotificationType.SUCCESS, `Note: ${response.title} was updated successfully`);
    }, (errorResponse: HttpErrorResponse) => {
      this.showNotification(NotificationType.ERROR, errorResponse.error.message);
    })
  }

  private showNotification(notificationType: NotificationType, message: string): void {
    if (message) {
      this.notificationService.notify(notificationType, message);
    } else {
      this.notificationService.notify(notificationType, 'An error occurred. Please try again.');
    }
  }

  public log() {
    console.log('test')
  }

  public resetData(): void {
    this.noteToDelete = new Note();
    this.noteToUpdate = new Note();
  }

  private clickButton(id: string): void {
    document.getElementById(id)?.click();
  }

}
