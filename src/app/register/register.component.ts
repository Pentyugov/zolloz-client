import {Component, OnDestroy, OnInit} from '@angular/core';
import {SignUpRequest} from "../model/sign-up-request";
import {Router} from "@angular/router";
import {AuthenticationService} from "../service/authentication.service";
import {NotificationService} from "../service/notification.service";
import {Subscription} from "rxjs";
import {HttpErrorResponse} from "@angular/common/http";
import {User} from "../model/user";
import {NotificationType} from "../enum/notification-type.enum";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {

  public password: string = '';
  public confirmPassword: string = '';
  public passwordMatches: boolean = false;
  public showLoading: boolean = false;
  private subscriptions: Subscription[] = [];

  constructor(private router: Router,
              private authenticationService: AuthenticationService,
              private notificationService: NotificationService) {

  }

  ngOnInit(): void {
    if (this.authenticationService.isUserLoggedIn()) {
      this.router.navigateByUrl('/main');
    }
  }

  public onRegister(signUpRequest: SignUpRequest):void {
    this.showLoading = true;
    this.subscriptions.push(
      this.authenticationService.register(signUpRequest).subscribe(
        (response: User) => {
          this.showLoading = false;
          this.sendNotification(NotificationType.SUCCESS, `A new account was created for ${response.firstName}.
          Please check ${response.email} to log in.`);
          this.router.navigateByUrl('/login');
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          this.showLoading = false;
        }
      )
    );
  }

  private sendNotification(notificationType: NotificationType, message: string): void {
    if (message) {
      this.notificationService.notify(notificationType, message);
    } else {
      this.notificationService.notify(notificationType, 'An error occurred. Please try again.');
    }
  }

  public isPasswordMatches(): void {
    this.passwordMatches = this.password === this.confirmPassword;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}