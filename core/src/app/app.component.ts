import { Component } from '@angular/core';
import { AppUpdater } from './app.updater';
import { Subscription } from 'rxjs';
import { UpdateNotifier, ActionType, DownloadNotifier, InfoNotifier } from '@ngxeu/notifier';


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
      console.log(updateStatus)
      if(this.appUpdater.hasPendingUpdates()){
        this.downloadNotifier.notify(null,ActionType.pending).subscribe(notifierAction=>{
          if(notifierAction.action===ActionType.install) {
            this.downloadNotifier.notify(this.appUpdater.install(),ActionType.install).subscribe(notifierAction=>{
              if(notifierAction.action===ActionType.restart) {
                this.appUpdater.restart();
              }
            });
          }
        });
      }
      else if(updateStatus.updateAvailable){        
        this.updateNotifier.notify(updateStatus).subscribe(notifierAction=>{
          if(notifierAction.action===ActionType.download) {
            this.downloadNotifier.notify(this.appUpdater.download(),ActionType.download).subscribe(notifierAction=>{
              if(notifierAction.action===ActionType.install) {
                this.downloadNotifier.notify(this.appUpdater.install(),ActionType.install).subscribe(notifierAction=>{
                  if(notifierAction.action===ActionType.restart) {
                    this.appUpdater.restart();
                  }
                });
              }
            });
          }
          else if(notifierAction.action===ActionType.downloadInstall) {
            this.downloadNotifier.notify(this.appUpdater.download(),ActionType.downloadInstall).subscribe(notifierAction=>{
              if(notifierAction.action===ActionType.install) {
                this.downloadNotifier.notify(this.appUpdater.install(),ActionType.install).subscribe(notifierAction=>{
                  if(notifierAction.action===ActionType.restart) {
                    this.appUpdater.restart();
                  }
                });
              }
            });
          }
        });                
      }
      else{
        if(updateStatus.noInfo){
          this.infoNotifier.notify("Looks like you app is in the development mode,\n\n hence no release found!","400px");
        }
        else{
          this.infoNotifier.notify("Your app is up to date!");
        }
      }
    });
  }

}
