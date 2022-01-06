import {Component, OnInit} from '@angular/core';
import {ApplicationService} from "../service/application.service";
import {TabName} from "../enum/tab-name.enum";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  constructor(private applicationService: ApplicationService) {
    this.applicationService.setActiveTab(TabName.PROFILE);
  }

  ngOnInit(): void {

  }

}
