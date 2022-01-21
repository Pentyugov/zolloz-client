import {Component, OnInit} from '@angular/core';
import {ApplicationService} from "../service/application.service";
import {TabName} from "../enum/tab-name.enum";
import {AuthenticationService} from "../service/authentication.service";
import {User} from "../model/user";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  public user: User = new User();
  public refreshing: boolean = false;

  constructor(private applicationService: ApplicationService,
              private authenticationService: AuthenticationService) {
    this.applicationService.setActiveTab(TabName.PROFILE);
  }

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  public loadCurrentUser(): void {
    this.user = this.authenticationService.getUserFromLocalCache();
  }

}
