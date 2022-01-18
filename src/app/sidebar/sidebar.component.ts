import {Component, OnInit, ViewChild} from '@angular/core';
import {BreakpointObserver} from '@angular/cdk/layout';
import {MatSidenav} from '@angular/material/sidenav';
import {NgForm} from "@angular/forms";
import {NotificationType} from "../enum/notification-type.enum";
import {HttpErrorResponse} from "@angular/common/http";
import {NoteService} from "../service/note.service";
import {NotificationService} from "../service/notification.service";
import {Note} from "../model/note";
import {MatPaginator} from "@angular/material/paginator";
import {Notification} from "../model/notification";


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  public notifications: Notification[] = [];
  public notificationPage = 0;
  @ViewChild(MatSidenav) sidenav!: MatSidenav;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  public noteToCreate: Note = new Note();

  constructor(private observer: BreakpointObserver,
              private noteService: NoteService,
              private notificationService: NotificationService) {
  }

  ngOnInit(): void {
    this.loadNotificationPage();
  }

  public loadNotificationPage(page: number = 0) {
    this.notificationService.getNotificationPageForCurrentUser(page).subscribe(
      (response: Notification[]) => {
        this.notifications = response;
      }
    )
  }

  public onAddNote(noteForm: NgForm): void {
    this.noteService.addNote(this.noteToCreate).subscribe((response: Note) => {
      this.clickButton('add-new-note-close-btn');
      this.resetData(noteForm);
      this.noteService.addNoteToLocalCache(response);
      if (localStorage.getItem('activeTab') === 'Main') {
        location.reload();
      }

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

  public resetData(ngForm: NgForm): void {
    this.noteToCreate = new Note();
    ngForm.reset();
  }

  public nextNotificationPage(): void {
    this.notificationPage = this.notificationPage + 1;
    this.loadNotificationPage(this.notificationPage);
  }

  public prevNotificationPage(): void {
    this.notificationPage = this.notificationPage - 1;
    if (this.notificationPage < 0) {
      this.notificationPage = 0;
    }
    this.loadNotificationPage(this.notificationPage);
  }

  public isNextBtnDisabled(): boolean {
    return this.notifications.length < 5;
  }

  public isPrevBtnDisabled(): boolean {
    return  this.notificationPage <= 0;
  }

  public onDeleteNotification(id: string): void {
    this.notificationService.deleteNotification(id).subscribe(
      () => {
        this.loadNotificationPage(this.notificationPage)
      }
    );
  }
}
