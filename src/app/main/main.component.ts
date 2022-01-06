import {Component, OnInit} from '@angular/core';
import {ApplicationService} from "../service/application.service";
import {TabName} from "../enum/tab-name.enum";
import {Note} from "../model/note";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  public dataColor: string = 'orange';
  public notes: Note[] = [];

  constructor(private applicationService: ApplicationService) {
    this.applicationService.setActiveTab(TabName.MAIN);
  }

  ngOnInit(): void {
    this.generateNotes();
  }

  private generateNotes(): void {
    for (let i = 0; i < 10; i++) {
      const note = new Note();
      note.category = 'Main';
      note.color = 'orange';
      note.description = `What all of these have in common is that they're pulling information out of the app or the service and making it relevant to the moment. ${i}`;
      note.title = `Title ${i}`;
      this.notes.push(note);
    }
  }

}
