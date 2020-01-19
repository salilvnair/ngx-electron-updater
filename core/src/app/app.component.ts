import { Component } from '@angular/core';
import { AppUpdater } from './app.updater';
import {  NgxElectronUpdateNotifier } from 'projects/core/src/public_api';
import { AppUpdaterConfig } from './app-updater.model';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ngeu';
  enableDownload = false;
  constructor(private appUpdater:AppUpdater,
              private updateNotifier:NgxElectronUpdateNotifier<AppUpdaterConfig>
  ){}
  onCheckUpdate(){
    this.updateNotifier.notifyUpdate(this.appUpdater);
    // this.appUpdater.checkForUpdate().subscribe(updateStatus=>{
    //   if(this.appUpdater.hasPendingUpdates()){
    //     this.downloadNotifier.notify(null,ActionType.pending).subscribe(notifierAction=>{
    //       if(notifierAction.action===ActionType.install) {
    //         this.downloadNotifier.notify(this.appUpdater.install(),ActionType.install).subscribe(notifierAction=>{
    //           if(notifierAction.action===ActionType.restart) {
    //             this.appUpdater.restart();
    //           }
    //         });
    //       }
    //     });
    //   }
    //   else if(updateStatus.updateAvailable){        
    //     this.updateNotifier.notify(updateStatus).subscribe(notifierAction=>{
    //       if(notifierAction.action===ActionType.download) {
    //         this.downloadNotifier.notify(this.appUpdater.download(),ActionType.download).subscribe(notifierAction=>{
    //           if(notifierAction.action===ActionType.install) {
    //             this.downloadNotifier.notify(this.appUpdater.install(),ActionType.install).subscribe(notifierAction=>{
    //               if(notifierAction.action===ActionType.restart) {
    //                 this.appUpdater.restart();
    //               }
    //             });
    //           }
    //         });
    //       }
    //       else if(notifierAction.action===ActionType.downloadInstall) {
    //         this.downloadNotifier.notify(this.appUpdater.download(),ActionType.downloadInstall).subscribe(notifierAction=>{
    //           if(notifierAction.action===ActionType.install) {
    //             this.downloadNotifier.notify(this.appUpdater.install(),ActionType.install).subscribe(notifierAction=>{
    //               if(notifierAction.action===ActionType.restart) {
    //                 this.appUpdater.restart();
    //               }
    //             });
    //           }
    //         });
    //       }
    //     });                
    //   }
    //   else{
    //     if(updateStatus.noInfo){
    //       this.infoNotifier.notify("Looks like you app is in the development mode,\n\n hence no release found!","400px");
    //     }
    //     else{
    //       this.infoNotifier.notify("Your app is up to date!");
    //     }
    //   }
    // });
  }

}
