import { Component } from '@angular/core';
import { AppUpdater } from './app.updater';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ngeu';
  constructor(private appUpdater:AppUpdater){}
  onCheckUpdate(){
    this.appUpdater.checkForUpdate();
  }

}
