import {Component, OnInit} from '@angular/core';
import {NgForm} from "@angular/forms";
import {CustomHttpResponse} from "../model/custom-http-response";
import {NotificationType} from "../enum/notification-type.enum";
import {HttpErrorResponse} from "@angular/common/http";
import {Subscription} from "rxjs";
import {UserService} from "../service/user.service";
import {NotificationService} from "../service/notification.service";
import {ApplicationService} from "../service/application.service";
import {TabName} from "../enum/tab-name.enum";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  public refreshing: boolean = false;
  private subscriptions: Subscription[] = [];

  constructor(private userService: UserService,
              private notificationService: NotificationService,
              private applicationService: ApplicationService) {
    this.applicationService.setActiveTab(TabName.SETTINGS);
  }

  ngOnInit(): void {

  }

  public resetPassword(emailForm: NgForm, email: string): void {
    this.refreshing = true;
    this.subscriptions.push(
      this.userService.resetPassword(email).subscribe((response: CustomHttpResponse) => {
        this.showNotification(NotificationType.WARNING, response.message);
      }, (errorResponse: HttpErrorResponse) => {
        this.showNotification(NotificationType.ERROR, errorResponse.error.message);
      })
    );
    emailForm.reset();
    this.refreshing = false;
  }

  private showNotification(notificationType: NotificationType, message: string): void {
    if (message) {
      this.notificationService.notify(notificationType, message);
    } else {
      this.notificationService.notify(notificationType, 'An error occurred. Please try again.');
    }
  }

}
