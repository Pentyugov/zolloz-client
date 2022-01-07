import {Component, OnInit, ViewChild} from '@angular/core';
import {BreakpointObserver} from '@angular/cdk/layout';
import {MatSidenav} from '@angular/material/sidenav';
import {NgForm} from "@angular/forms";
import {NotificationType} from "../enum/notification-type.enum";
import {HttpErrorResponse} from "@angular/common/http";
import {NoteService} from "../service/note.service";
import {NotificationService} from "../service/notification.service";
import {Note} from "../model/note";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;

  public noteToCreate: Note = new Note();

  constructor(private observer: BreakpointObserver,
              private noteService: NoteService,
              private notificationService: NotificationService) {
  }

  ngOnInit(): void {
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
}
