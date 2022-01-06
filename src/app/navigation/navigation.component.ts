import { Component, OnInit } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {User} from "../model/user";
import {AuthenticationService} from "../service/authentication.service";
import {Router} from "@angular/router";
import { Renderer2 } from '@angular/core';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {

  private titleSubject: BehaviorSubject<string>;
  public titleAction$: Observable<any>;
  public today$: Observable<Date>;
  public currentUser: User;
  public activeTab: string | null;

  constructor(private router: Router,
              private authenticationService: AuthenticationService,
              private render:Renderer2) {
    this.activeTab = 'Main';
    if (localStorage.getItem('activeTab')) {
      this.activeTab = localStorage.getItem('activeTab');
    }
    this.titleSubject = new BehaviorSubject<string>(this.activeTab!);
    this.titleAction$ = this.titleSubject.asObservable();
    this.today$ = new Observable(observable => {
      setInterval(()=> {
        observable.next(new Date())
      }, 0)
    });


    this.activeTab = localStorage.getItem('activeTab');
    console.log(this.activeTab);
  }

  ngOnInit(): void {
    this.currentUser = this.authenticationService.getUserFromLocalCache();
  }

  public changeTab(url: string): void {
    this.router.navigateByUrl(url);
  }

  public isTabActive(tab: string): boolean {
    return tab === this.activeTab;
  }

}
