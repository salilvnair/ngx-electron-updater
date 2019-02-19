import { Component, Inject, OnInit, OnDestroy, ChangeDetectorRef, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DownloadStatus } from 'projects/ngx-electron-updater/src/public_api';
import { DownloadDialogData } from './download-dialog-data.model';
import { ActionType } from '../update/type/update-action.enum';

@Component({
  templateUrl: './download-dialog.component.html',
  styleUrls:['./download-dialog.component.css']
})
export class DownloadNotifierDialog implements AfterViewInit{
  intervalRef:any;
  disableInstall:boolean=true;
  onlyInstall:boolean=false;
  downloadAndInstall:boolean;

  @ViewChild('progress') progress:ElementRef;
  
  @ViewChild('bar') bar:ElementRef;

  @ViewChild('header') header:ElementRef;
  constructor(
    public dialogRef: MatDialogRef<DownloadNotifierDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DownloadDialogData,
    private cdr:ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {  
    if(this.data && this.data.ActionType===ActionType.download){
      this.intervalRef = setInterval(()=>{
        if(this.bar){
          if(!this.data.downloadStatus.currentPercentage){
            this.data.downloadStatus.currentPercentage = "0.00";
          }
          this.bar.nativeElement.style.width = this.data.downloadStatus.currentPercentage+"%";
          this.bar.nativeElement.innerHTML = this.data.downloadStatus.currentPercentage+"%";
        }
        if(this.data.downloadStatus.currentPercentage==="100.00"){
          this.disableInstall = false;
          this.header.nativeElement.innerHTML = "Updates are ready to be installed!"
          clearInterval(this.intervalRef);
        }
      }, 500)
    }  
    else if(this.data && this.data.ActionType===ActionType.downloadInstall){   
      this.downloadAndInstall = true; 
      this.cdr.detectChanges();  
      this.intervalRef = setInterval(()=>{
        if(this.bar){
          if(!this.data.downloadStatus.currentPercentage){
            this.data.downloadStatus.currentPercentage = "0.00";
          }
          this.bar.nativeElement.style.width = this.data.downloadStatus.currentPercentage+"%";
          this.bar.nativeElement.innerHTML = this.data.downloadStatus.currentPercentage+"%";
        }
        if(this.data.downloadStatus.currentPercentage==="100.00"){
          this.header.nativeElement.innerHTML = "Updates are now being installed!"
          clearInterval(this.intervalRef);
          this.dialogRef.close(ActionType.install);
        }
      }, 500)
    }
    else if(this.data && this.data.ActionType===ActionType.install){
      this.onlyInstall = true;
      this.disableInstall = false;
    }
  }

  onClickClose(): void {
    this.dialogRef.close(ActionType.close);
  }

  onClickInstall(): void {
    this.dialogRef.close(ActionType.install);
   }
}
