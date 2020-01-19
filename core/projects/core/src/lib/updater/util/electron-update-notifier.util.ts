import { Injectable } from "@angular/core";
import { UpdateNotifier, ActionType, DownloadNotifier, InfoNotifier } from '@ngxeu/notifier';

import { NgxElectronUpdater } from "../ngx-electron-updater";
@Injectable({
    providedIn: 'root'
})
export class NgxElectronUpdateNotifier<T> { 

    constructor(
        private updateNotifier:UpdateNotifier,
        private downloadNotifier:DownloadNotifier,
        private infoNotifier:InfoNotifier
    ){}

    notifyUpdate(appUpdater:NgxElectronUpdater<T>){
        appUpdater.checkForUpdate().subscribe(updateStatus=>{
          if(appUpdater.hasPendingUpdates()){
            this.downloadNotifier.notify(null,ActionType.pending).subscribe(notifierAction=>{
              if(notifierAction.action===ActionType.install) {
                this.downloadNotifier.notify(appUpdater.install(),ActionType.install).subscribe(notifierAction=>{
                  if(notifierAction.action===ActionType.restart) {
                    appUpdater.restart();
                  }
                });
              }
            });
          }
          else if(updateStatus.updateAvailable){        
            this.updateNotifier.notify(updateStatus).subscribe(notifierAction=>{
              if(notifierAction.action===ActionType.download) {
                this.downloadNotifier.notify(appUpdater.download(),ActionType.download).subscribe(notifierAction=>{
                  if(notifierAction.action===ActionType.install) {
                    this.downloadNotifier.notify(appUpdater.install(),ActionType.install).subscribe(notifierAction=>{
                      if(notifierAction.action===ActionType.restart) {
                        appUpdater.restart();
                      }
                    });
                  }
                });
              }
              else if(notifierAction.action===ActionType.downloadInstall) {
                this.downloadNotifier.notify(appUpdater.download(),ActionType.downloadInstall).subscribe(notifierAction=>{
                  if(notifierAction.action===ActionType.install) {
                    this.downloadNotifier.notify(appUpdater.install(),ActionType.install).subscribe(notifierAction=>{
                      if(notifierAction.action===ActionType.restart) {
                        appUpdater.restart();
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