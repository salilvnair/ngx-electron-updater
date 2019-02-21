import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Subscription, Observable, Subject } from 'rxjs';
import { DownloadStatus, DownloadNotifierValueType, DownloadNotifierType } from 'projects/ngx-electron-updater/src/public_api';
import { DownloadNotifierDialog } from './download-dialog.component';
import { ActionType } from '../update/type/update-action.enum';
import { DownloadDialogData } from './download-dialog-data.model';
import { NotifierAction } from '../update/model/update-action.model';

@Injectable()
export class  DownloadNotifier {
  private downloadStatus:DownloadStatus = new DownloadStatus();
  private downloadDialogSubscription: Subscription;
  private dialogRef:MatDialogRef<DownloadNotifierDialog>;
  constructor(
    private dialog: MatDialog
  ) {}

  private openDialog(downloadDialogData:DownloadDialogData) {  
    this.dialogRef = this.dialog.open(DownloadNotifierDialog, {
      width: '460px',
      data: downloadDialogData,
      closeOnNavigation: false,
      disableClose:true
    });
  }

  notify(downloadNotifierObserver:Observable<DownloadNotifierType>,actionType:ActionType) {
    let dialogAction:Subject<NotifierAction> = new Subject<NotifierAction>();
    let downloadDialogData:DownloadDialogData = new DownloadDialogData();
    downloadDialogData.downloadStatus = this.downloadStatus;
    downloadDialogData.ActionType = actionType;
    this.openDialog(downloadDialogData);
    this.downloadDialogSubscription = downloadNotifierObserver.subscribe(downloadNotifier=>{
      if(downloadNotifier.key===DownloadNotifierValueType.data){
        downloadDialogData.downloadStatus = downloadNotifier.value;
        this.dialogRef.componentInstance.data = downloadDialogData;
      }
      if(downloadNotifier.key===DownloadNotifierValueType.error){
        console.log("downloadNotifier error")
      }
      if(downloadNotifier.key===DownloadNotifierValueType.finish){
        this.cleanUp();
      }
    })

    this.dialogRef.afterClosed().subscribe(result => {
      let downloadNotifierAction:NotifierAction = new NotifierAction();
      if (result === ActionType.install) {
        downloadNotifierAction.action=ActionType.install;
      }
      else if (result === ActionType.close) {
        downloadNotifierAction.action=ActionType.close;
      }
      dialogAction.next(downloadNotifierAction);
    });
    return dialogAction.asObservable();
  }

  private cleanUp() {
    if (this.downloadDialogSubscription) {
      this.downloadDialogSubscription.unsubscribe();
    }
  }

}
