import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UpdateNotifierDialog } from './update-dialog.component';
import { Subject } from 'rxjs';
import {NotifierAction } from './model/update-action.model';
import { ActionType } from './type/update-action.enum';
import { AppUpadateStatus } from 'projects/ngx-electron-updater/src/lib/core/github/model/app-update-status.model';

@Injectable()
export class  UpdateNotifierService {
  constructor(
    public dialog: MatDialog
  ) {}

  public openUpdateDialog(appUpadateStatus:AppUpadateStatus) {
    let dialogAction:Subject<NotifierAction> = new Subject<NotifierAction>();
    let dialogRef = this.dialog.open(UpdateNotifierDialog, {
      width: '460px',
      data: appUpadateStatus,
      disableClose:true
    });

    dialogRef.afterClosed().subscribe(result => {
      let updateNotifierAction:NotifierAction = new NotifierAction();
      if (result === ActionType.download) {
        updateNotifierAction.action=ActionType.download;
      } else if (result === ActionType.remind) {
        updateNotifierAction.action=ActionType.remind;
      } else if (result === ActionType.downloadInstall) {
        updateNotifierAction.action=ActionType.downloadInstall;
      }
      dialogAction.next(updateNotifierAction);
    });
    return dialogAction.asObservable();
  }


}
