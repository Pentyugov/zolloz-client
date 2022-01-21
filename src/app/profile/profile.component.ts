import {Component, OnInit} from '@angular/core';
import {ApplicationService} from "../service/application.service";
import {TabName} from "../enum/tab-name.enum";
import {AuthenticationService} from "../service/authentication.service";
import {User} from "../model/user";
import {NgForm} from "@angular/forms";
import {NotificationType} from "../enum/notification-type.enum";
import {HttpErrorResponse} from "@angular/common/http";
import {UserService} from "../service/user.service";
import {CustomHttpResponse} from "../model/custom-http-response";
import {NotificationService} from "../service/notification.service";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  public user: User = new User();
  public refreshing: boolean = false;

  constructor(private applicationService: ApplicationService,
              private authenticationService: AuthenticationService,
              private userService: UserService,
              private notificationService: NotificationService) {
    this.applicationService.setActiveTab(TabName.PROFILE);
  }

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  public loadCurrentUser(): void {
    this.user = this.authenticationService.getUserFromLocalCache();
  }

  public resetData(ngForm: NgForm | null) {
    if (ngForm) {
      ngForm.reset();
    }
  }


  public onChangePassword(changePasswordForm: NgForm) {
    let changePasswordRequest = changePasswordForm.value;
    const formData = new FormData();
    formData.append('password', changePasswordRequest.password);
    formData.append('confirmPassword', changePasswordRequest.confirmPassword);
    this.userService.changePassword(formData).subscribe(
      (response: CustomHttpResponse) => {
        this.clickButton('change-password-close-btn');
        this.resetData(null);
        this.showNotification(NotificationType.WARNING, response.message);
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
}
