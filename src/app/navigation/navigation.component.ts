import {Component, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {User} from "../model/user";
import {AuthenticationService} from "../service/authentication.service";
import {Router} from "@angular/router";
import {ChatMessageService} from "../service/chat-message.service";
import {UserSettings} from "../model/user-settings";
import {ApplicationService} from "../service/application.service";

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit, OnDestroy {

  private titleSubject: BehaviorSubject<string>;
  public titleAction$: Observable<any>;
  public today$: Observable<Date>;
  public currentUser: User;
  public activeTab: string | null;
  public newChatMessagesCount: number = 0;
  private userSettings: UserSettings = new UserSettings();

  constructor(private router: Router,
              private authenticationService: AuthenticationService,
              private applicationService: ApplicationService,
              private render:Renderer2,
              private chatMessageService: ChatMessageService) {
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
  }

  ngOnInit(): void {
    this.currentUser = this.authenticationService.getUserFromLocalCache();
    this.chatMessageService._connectNewChatMessagesWs(this);
    this.getNewMessagesCount();
    this.userSettings = this.applicationService.getUserSettingsFromLocalCache();
  }

  ngOnDestroy(): void {
    this.chatMessageService._disconnectNewChatMessagesWs();
  }

  public getNewMessagesCount(): void {
    this.chatMessageService.getNewMessagesCount().subscribe(
      (response: number) => {
        this.newChatMessagesCount = response;
      }
    )
  }

  public updateMessagesCount(): void {
    this.chatMessageService.getNewMessagesCount().subscribe(
      (response: number) => {
        if (response > this.newChatMessagesCount) {
          if (this.userSettings.enableChatNotificationSound) {
            this.playSound();
          }
        }
        this.newChatMessagesCount = response;
      }
    )
  }


  public playSound(): void {
    let audio = new Audio('assets/new-message-sound.mp3');
    audio.play();
  }

  public changeTab(url: string): void {
    this.router.navigateByUrl(url);
  }

  public isTabActive(tab: string): boolean {
    return tab === this.activeTab;
  }

  public handleWsMessage() {
    this.updateMessagesCount()
  }
}
