import {Component, OnInit} from '@angular/core';
import {ApplicationService} from "../service/application.service";
import {TabName} from "../enum/tab-name.enum";
import {AuthenticationService} from "../service/authentication.service";
import {User} from "../model/user";
import {NgForm} from "@angular/forms";
import {NotificationType} from "../enum/notification-type.enum";
import {HttpErrorResponse, HttpEvent, HttpEventType} from "@angular/common/http";
import {UserService} from "../service/user.service";
import {CustomHttpResponse} from "../model/custom-http-response";
import {NotificationService} from "../service/notification.service";
import {Router} from "@angular/router";
import {FileUploadStatus} from "../model/file-upload-status";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  public user: User = new User();
  public userToUpdate: User = new User();
  public refreshing: boolean = false;
  public newUserProfileImage: File | null;
  public newUserFilename: string | null;
  public fileStatus: FileUploadStatus = new FileUploadStatus();

  constructor(private applicationService: ApplicationService,
              private authenticationService: AuthenticationService,
              private userService: UserService,
              private notificationService: NotificationService,
              private router: Router) {
    this.applicationService.setActiveTab(TabName.PROFILE);
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.userToUpdate = this.userService.cloneUser(this.user);
  }

  public loadCurrentUser(): void {
    this.user = this.authenticationService.getUserFromLocalCache();
  }

  public resetData(ngForm: NgForm | null) {
    this.newUserProfileImage = null;
    this.newUserFilename = '';
    this.fileStatus.status = 'done';
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

  public onUpdateCurrentUser(): void {
    this.refreshing = true;
    const formData = this.userService.createUserFormData(this.userToUpdate, this.newUserProfileImage);
    this.userService.updateUser(formData).subscribe((response: User) => {
      this.resetData(null);
      this.user = response;
      this.authenticationService.addUserToLocalCache(this.user);
      this.refreshing = false;
      this.showNotification(NotificationType.SUCCESS, `User: ${response.username} was updated successfully`);
    }, (errorResponse: HttpErrorResponse) => {
      this.refreshing = false;
      this.showNotification(NotificationType.ERROR, errorResponse.error.message);
    });
  }


  public onLogout(): void  {
    this.authenticationService.logOut();
    this.router.navigateByUrl('/login');
    this.showNotification(NotificationType.SUCCESS, `You've been successfully logged out`);
  }

  public updateProfileImage(): void {
    this.clickButton('profile-image-input');
  }

  public onProfileImageChange(event: any): void {
    if (event.target.files) {
      this.newUserProfileImage = event.target.files[0];
      if (this.newUserProfileImage) {
        this.newUserFilename = this.newUserProfileImage.name;
      }
    }
  }

  public onUpdateProfileImage(): void {
    if (this.newUserProfileImage) {
      const formData = new FormData();
      formData.append('id', this.user.id);
      formData.append('profileImage', this.newUserProfileImage);

      this.userService.updateUserProfileImage(formData).subscribe(
        (event: HttpEvent<any>) => {
          this.reportUploadProgress(event);
          this.resetData(null);
        },
        (errorResponse: HttpErrorResponse) => {
          this.showNotification(NotificationType.ERROR, errorResponse.error.message);
          this.resetData(null);
        }
      )
    } else {
      this.showNotification(NotificationType.ERROR, 'Profile image is empty');
      this.resetData(null);
    }

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

  private reportUploadProgress(event: HttpEvent<any>): void {
    switch (event.type) {

      case HttpEventType.UploadProgress:
        if (event.total) {
          this.fileStatus.percentage = Math.round((100 * event.loaded / event.total));
        }
        this.fileStatus.status = 'progress';
        break;

      case HttpEventType.Response:
        if (event.status === 200) {
          this.user.profileImage = `${event.body.profileImage}?time=${new Date().getTime()}`;
          this.showNotification(NotificationType.SUCCESS, `${this.user.username}\'s profile image updated successfully`);
          this.fileStatus.status = 'done';
          break;
        } else {
          this.showNotification(NotificationType.ERROR, `Unable to upload image. Please try again`);
          break;
        }

      default:
        `Finished all processes`;
    }


  }
}
