import { Component } from '@angular/core';
import { AppUpdater } from './app.updater';
import { DownloadNotifierValueType } from 'projects/ngx-electron-updater/src/public_api';
import { Subscription } from 'rxjs';
import { UpdateNotifier, ActionType } from 'projects/notifier/src/public_api';
import { DownloadNotifier } from 'projects/notifier/src/lib/core/download/download.notifier';
import { InfoNotifier } from 'projects/notifier/src/lib/core/info/info.notifier';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ngeu';
  enableDownload = false;
  downloadNotifierSubscription:Subscription;
  constructor(private appUpdater:AppUpdater,
              private updateNotifier:UpdateNotifier,
              private downloadNotifier:DownloadNotifier,
              private infoNotifier:InfoNotifier
  ){}
  onCheckUpdate(){
    this.appUpdater.checkForUpdate().subscribe(updateStatus=>{    
      if(updateStatus.updateAvailable){
        this.updateNotifier.notify(updateStatus).subscribe(notifierAction=>{
          if(notifierAction.action===ActionType.download) {
            this.downloadNotifier.notify(this.appUpdater.download(),ActionType.download).subscribe(notifierAction=>{
              if(notifierAction.action===ActionType.install) {
                this.appUpdater.install();
              }
            });
          }
          else if(notifierAction.action===ActionType.downloadInstall) {
            this.downloadNotifier.notify(this.appUpdater.download(),ActionType.downloadInstall).subscribe(notifierAction=>{
              if(notifierAction.action===ActionType.install) {
                this.appUpdater.install();
              }
            });
          }
        });                
      }
      else{
        this.infoNotifier.notify("Your app is up to date!");
      }
    });
  }

  downloadUpdates(){
   this.downloadNotifierSubscription = this.appUpdater.download().subscribe(downloadNotifier=>{
      if(downloadNotifier.key===DownloadNotifierValueType.data){
        console.log(downloadNotifier.value.currentPercentage);
      }
      if(downloadNotifier.key===DownloadNotifierValueType.error){
        console.log("downloadNotifier error")
      }
      if(downloadNotifier.key===DownloadNotifierValueType.finish){
        console.log("download finished")
      }
    });
  }

  installUpdates(){
    this.appUpdater.install();
  }

}
