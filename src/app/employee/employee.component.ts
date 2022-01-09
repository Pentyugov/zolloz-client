import { Component, OnInit } from '@angular/core';
import {ApplicationService} from "../service/application.service";

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit {

  constructor(private applicationService: ApplicationService) {
    this.applicationService.setActiveTab('Employees');
  }

  ngOnInit(): void {

  }

}
