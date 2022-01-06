import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {

  constructor() { }

  public setActiveTab(tab: string) {
    localStorage.setItem('activeTab', tab);
  }
}
