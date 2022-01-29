import {Component, OnInit} from '@angular/core';
import {ApplicationService} from "../service/application.service";
import {TabName} from "../enum/tab-name.enum";
import {Position} from "../model/position";
import {UserService} from "../service/user.service";
import {Router} from "@angular/router";
import {NotificationService} from "../service/notification.service";
import {AuthenticationService} from "../service/authentication.service";
import {PositionService} from "../service/position.service";
import {NotificationType} from "../enum/notification-type.enum";
import {CustomHttpResponse} from "../model/custom-http-response";
import {HttpErrorResponse} from "@angular/common/http";
import {NgForm} from "@angular/forms";
import {DepartmentService} from "../service/department.service";
import {UserSessionService} from "../service/user-session.service";

@Component({
  selector: 'app-position',
  templateUrl: './position.component.html',
  styleUrls: ['./position.component.css']
})
export class PositionComponent implements OnInit {
  public positions: Position[] = [];
  public positionToUpdate: Position = new Position();
  public positionToDelete: Position = new Position();
  public positionSelected: Position = new Position();
  public refreshing = false;


  constructor(private userService: UserService,
              private router: Router,
              private notificationService: NotificationService,
              private authenticationService: AuthenticationService,
              private applicationService: ApplicationService,
              private positionService: PositionService,
              public userSessionService: UserSessionService) {
    this.applicationService.setActiveTab(TabName.POSITIONS);
  }

  ngOnInit(): void {
    this.getPositions(false);
  }

  public getPositions(showNotification: boolean): void {
    this.refreshing = true;
      this.positionService.getPositions().subscribe(
        (response: Position[]) => {
          this.positionService.addPositionsToLocalCache(response);
          this.positions = this.positionService.getPositionsFromLocalCache();
          if (showNotification) {
            this.showNotification(NotificationType.SUCCESS, `${response.length} position(s) loaded successfully.`)
          }
        });
    this.refreshing = false;
  }

  public onAddNewPosition(ngForm: NgForm): void {
      this.positionService.addPosition(ngForm.value).subscribe((response: Position) => {
        this.clickButton('add-new-position-close-btn');
        this.getPositions(false)
        this.resetData(ngForm);
        this.showNotification(NotificationType.SUCCESS, `New position: ${response.name} was created successfully`);
      }, (errorResponse: HttpErrorResponse) => {
        this.showNotification(NotificationType.ERROR, errorResponse.error.message);
      });
  }

  public setSelectedPosition(position: Position): void {
    this.positionSelected = position;
    this.clickButton('open-position-info-btn');
  }

  public onUpdatePosition(): void {
    this.positionService.updatePosition(this.positionToUpdate).subscribe((response: Position) => {
      this.clickButton('update-position-close-btn');
      this.getPositions(false);
      this.resetData(null);
      this.showNotification(NotificationType.SUCCESS, `Position: ${response.name} was updated successfully`);
    }, (errorResponse: HttpErrorResponse) => {
      this.showNotification(NotificationType.ERROR, errorResponse.error.message);
    })
  }

  public setPositionToUpdate(position: Position): void {
    this.positionToUpdate = this.positionService.clonePosition(position);
    this.clickButton('open-position-update-btn');
  }

  public setPositionToDelete(position: Position): void {
    this.positionToDelete = position;
  }

  public addNewPositionButtonAction() {
    this.clickButton('add-new-position-btn');
  }

  public deletePosition(positionId: string): void {
        this.positionService.deletePosition(positionId).subscribe((response: CustomHttpResponse) => {
          this.clickButton('close-position-delete-modal');
          this.getPositions(false);
          this.resetData(null);
          this.showNotification(NotificationType.WARNING, response.message);
        }, (errorResponse: HttpErrorResponse) => {
          this.showNotification(NotificationType.ERROR, errorResponse.error.message);
        });
   }


  public search(searchTerm: string): void {
    const results: Position[] = [];
    for (const position of this.positions) {
      if ((position.name != null && position.name.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1)) {
        results.push(position);
      }
    }

    this.positions = results;
    if (results.length === 0 || !searchTerm) {
      this.positions = this.positionService.getPositionsFromLocalCache();
    }
  }

  public resetData(ngForm: NgForm | null): void {
    this.positionToDelete = new Position();
    this.positionToUpdate = new Position();
    this.positionSelected = new Position();
    if (ngForm) {
      ngForm.reset();
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



}
