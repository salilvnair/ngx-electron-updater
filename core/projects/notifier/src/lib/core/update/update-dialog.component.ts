import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {  AppReleaseInfo } from 'projects/ngx-electron-updater/src/public_api';
import { ActionType } from './type/update-action.enum';
import { AppUpadateStatus } from 'projects/ngx-electron-updater/src/lib/core/github/model/app-update-status.model';

@Component({
  templateUrl: './update-dialog.component.html',
  styleUrls:['./update-dialog.component.css']
})
export class UpdateNotifierDialog implements OnInit, OnDestroy {
  appReleaseInfo:AppReleaseInfo;

  ngOnDestroy(): void {
  }
  ngOnInit(): void {
    this.appReleaseInfo = this.data.appReleaseInfo
  }
  constructor(
    public dialogRef: MatDialogRef<UpdateNotifierDialog>,
    @Inject(MAT_DIALOG_DATA) public data: AppUpadateStatus
  ) {}

  onClickRemind(): void {
    this.dialogRef.close(ActionType.remind);
  }
  onClickDownload(): void {
    this.dialogRef.close(ActionType.download);
  }
  onClickDownloadInstall(): void {
    this.dialogRef.close(ActionType.downloadInstall);
  }
}
