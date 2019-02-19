import { Component } from '@angular/core';
import { AppUpdater } from './app.updater';
import { DownloadNotifierType } from 'projects/ngx-electron-updater/src/public_api';
import { Subscription } from 'rxjs';
import { UpdateNotifierService, ActionType } from 'projects/notifier/src/public_api';
import { UpdateNotifierData } from 'projects/notifier/src/lib/core/update/model/update-data.model';
import { DownloadNotifierService } from 'projects/notifier/src/lib/core/download/download-dialog.service';

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
              private updateNotifierService:UpdateNotifierService,
              private downloadNotifierService:DownloadNotifierService){}
  onCheckUpdate(){
    this.appUpdater.checkForUpdate().subscribe(updateStatus=>{    
      if(updateStatus.updateAvailable){
        this.updateNotifierService.openUpdateDialog(updateStatus).subscribe(notifierAction=>{
          if(notifierAction.action===ActionType.download) {
            this.downloadNotifierService.openDownloadDialog(this.appUpdater.download(),ActionType.download).subscribe(notifierAction=>{
              if(notifierAction.action===ActionType.install) {
                this.appUpdater.install();
              }
            });
          }
          else if(notifierAction.action===ActionType.downloadInstall) {
            this.downloadNotifierService.openDownloadDialog(this.appUpdater.download(),ActionType.downloadInstall).subscribe(notifierAction=>{
              if(notifierAction.action===ActionType.install) {
                this.appUpdater.install();
              }
            });
          }
        });                
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
