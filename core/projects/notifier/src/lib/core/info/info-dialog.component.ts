import { Component, Inject, ChangeDetectorRef, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ActionType } from '../update/type/update-action.enum';

@Component({
  templateUrl: './info-dialog.component.html',
  styleUrls:['./info-dialog.component.css']
})
export class InfoNotifierDialog {
  constructor(
    public dialogRef: MatDialogRef<InfoNotifierDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onClickClose(): void {
    this.dialogRef.close(ActionType.close);
  }
}
