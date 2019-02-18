import { Component } from '@angular/core';
import { AppUpdater } from './app.updater';
import { DownloadNotifierType } from 'projects/ngx-electron-updater/src/public_api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ngeu';
  enableDownload = false;
  downloadNotifierSubscription:Subscription;
  constructor(private appUpdater:AppUpdater){}
  onCheckUpdate(){
    this.appUpdater.checkForUpdate().subscribe(updateStatus=>{
      if(updateStatus.updateAvailable){
        this.enableDownload = true;
        console.log("new "+updateStatus.appReleaseInfo.type+" update available!:"+updateStatus.appReleaseInfo.version);
      }
      else{
        console.log("your app is up to date!");
      }
    });
  }

  downloadUpdates(){
   this.downloadNotifierSubscription = this.appUpdater.download().subscribe(downloadNotifier=>{
      if(downloadNotifier.key===DownloadNotifierType.data){
        console.log(downloadNotifier.value.currentPercentage);
      }
      if(downloadNotifier.key===DownloadNotifierType.error){
        console.log("downloadNotifier error")
      }
      if(downloadNotifier.key===DownloadNotifierType.finish){
        console.log("download finished")
      }
    });
  }

  installUpdates(){
    this.appUpdater.install();
  }

}
