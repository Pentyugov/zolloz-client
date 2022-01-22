import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {AuthenticationService} from "../service/authentication.service";
import {NotificationService} from "../service/notification.service";
import {NgForm} from "@angular/forms";
import {CustomHttpResponse} from "../model/custom-http-response";
import {NotificationType} from "../enum/notification-type.enum";
import {HttpErrorResponse} from "@angular/common/http";
import {UserService} from "../service/user.service";

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  showLoading: boolean = false;

  constructor(private router: Router,
              private authenticationService: AuthenticationService,
              private notificationService: NotificationService) {
  }

  ngOnInit(): void {
    if (this.authenticationService.isUserLoggedIn()) {
      this.router.navigateByUrl('/main');
    }
  }

  public onChangePassword(changePasswordForm: NgForm) {
    let changePasswordRequest = changePasswordForm.value;
    const formData = new FormData();
    formData.append('email', changePasswordRequest.email);
    formData.append('password', changePasswordRequest.password);
    formData.append('confirmPassword', changePasswordRequest.confirmPassword);
    this.authenticationService.changePassword(formData).subscribe(
      (response: CustomHttpResponse) => {
        this.showNotification(NotificationType.WARNING, response.message);
        this.router.navigateByUrl('/login');
      }, (errorResponse: HttpErrorResponse) => {
        this.showNotification(NotificationType.ERROR, errorResponse.error.message);
      });
  }

  private showNotification(notificationType: NotificationType, message: string): void {
    if (message) {
      this.notificationService.notify(notificationType, message);
    } else {
      this.notificationService.notify(notificationType, 'An error occurred. Please try again.');
    }
  }
}

