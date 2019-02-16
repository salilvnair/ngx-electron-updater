import { Component } from '@angular/core';
import { AppUpdater } from './app.updater';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ngeu';
  enableDownload = false;
  constructor(private appUpdater:AppUpdater){}
  onCheckUpdate(){
    this.appUpdater.checkForUpdate().subscribe(updateStatus=>{
      if(updateStatus.updateAvailable){
        this.enableDownload = true;
        console.log("new update available!");
      }
      else{
        console.log("your app is up to date!");
      }
    });
  }

  downloadUpdates(){
    this.appUpdater.download();
  }

  installUpdates(){

  }

}
