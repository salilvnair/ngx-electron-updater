import { NgModule } from '@angular/core';
import { UpdateNotifierModule } from './update-notifier.module';
import { DownloadNotifierModule } from './download-notifier.module';

const IMPORT_EXPORT_MODULE_ARRAY = [
  UpdateNotifierModule,
  DownloadNotifierModule
];

@NgModule({
  imports: [IMPORT_EXPORT_MODULE_ARRAY],
  exports: [IMPORT_EXPORT_MODULE_ARRAY]
})
export class NotifierModule { }
