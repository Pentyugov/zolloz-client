import {Component, OnInit} from '@angular/core';
import {ApplicationService} from "../service/application.service";
import {TabName} from "../enum/tab-name.enum";

@Component({
  selector: 'app-position',
  templateUrl: './position.component.html',
  styleUrls: ['./position.component.css']
})
export class PositionComponent implements OnInit {

  constructor(private applicationService: ApplicationService) {
    this.applicationService.setActiveTab(TabName.POSITIONS);
  }

  ngOnInit(): void {

  }

}
