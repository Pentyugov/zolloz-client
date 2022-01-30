import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {AuthenticationService} from "../service/authentication.service";
import {NotificationService} from "../service/notification.service";
import {NotificationType} from "../enum/notification-type.enum";
import {ScreenUrlEnum} from "../enum/screen-url.enum";
import {SystemRoleName} from "../enum/system-role-name.enum";
import {UserSessionService} from "../service/user-session.service";

@Injectable({
  providedIn: 'root'
})
export class ScreenGuard implements CanActivate {

  constructor(private authenticationService: AuthenticationService,
              private userSessionService: UserSessionService,
              private notificationService: NotificationService,
              private router: Router) {

  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.hasAccessToScreen(route.routeConfig?.path);
  }

  private hasAccessToScreen(screenUrl: string | undefined): boolean {
    let hasAccess: boolean = false;
    if (screenUrl) {
      switch (screenUrl.toLowerCase()) {
        case ScreenUrlEnum.ROLES :
          hasAccess = this.userSessionService.isCurrentUserAdmin();
          break;
        case ScreenUrlEnum.TASKS :
          hasAccess = this.userSessionService.isCurrentUserAdmin() ||
                      this.userSessionService.isCurrentUserInRole(SystemRoleName.TASK_EXECUTOR);
          break;
      }
    }

    if (hasAccess) {
      return true;
    }

    this.router.navigate(['/main']);
    this.notificationService.notify(NotificationType.ERROR, 'You have no permission to access this page');
    return false;
  }
}
