import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { InfoNotifierDialog } from './info-dialog.component';

@Injectable()
export class InfoNotifier {
  constructor(
    private dialog: MatDialog
  ) {}

  public notify(infoData:any,width?:string) {  
    this.dialog.open(InfoNotifierDialog, {
      width: width||'250px',
      data: infoData,
      closeOnNavigation: false,
      disableClose:true
    });
  }
}
