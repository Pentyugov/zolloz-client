import {Component, OnInit} from '@angular/core';
import {ApplicationService} from "../service/application.service";
import {TabName} from "../enum/tab-name.enum";

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.css']
})
export class DepartmentComponent implements OnInit {

  constructor(private applicationService: ApplicationService) {
    this.applicationService.setActiveTab(TabName.DEPARTMENTS);
  }

  ngOnInit(): void {

  }

}
