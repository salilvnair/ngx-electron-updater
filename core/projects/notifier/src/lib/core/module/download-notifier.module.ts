import { NgModule } from '@angular/core';
import { NotifierMaterialModule } from './notifier-material.module';
import { DownloadNotifierService } from '../download/download-dialog.service';
import { DownloadNotifierDialog } from '../download/download-dialog.component';
import { CommonModule } from '@angular/common';

const PROVIDER_ARRAY = [
  DownloadNotifierService
];

const DELCARATION_EXPORT_ARRAY = [
  DownloadNotifierDialog
];

const ENTRY_COMPONENT_ARRAY = [
  DownloadNotifierDialog
];

const IMPORT_EXPORT_MODULE_ARRAY = [
  CommonModule,
  NotifierMaterialModule
];


@NgModule({
  imports: [IMPORT_EXPORT_MODULE_ARRAY],
  declarations: [
    DELCARATION_EXPORT_ARRAY
  ],
  exports: [
    DELCARATION_EXPORT_ARRAY
  ],
  providers: [PROVIDER_ARRAY],
  entryComponents:[ENTRY_COMPONENT_ARRAY],
})
export class DownloadNotifierModule { }
