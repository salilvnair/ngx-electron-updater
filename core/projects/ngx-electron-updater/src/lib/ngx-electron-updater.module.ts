import { NgModule } from '@angular/core';
import { DownloaderUtil } from './util/downloader.util';
import { NgxElectronModule } from 'ngx-electron';
import { FsCommonUtil } from './util/fs-common.util';
import { HttpClientModule } from '@angular/common/http';

const IMPORT_EXPORT_MODULE_ARRAY = [NgxElectronModule,HttpClientModule];
const PROVIDER_ARRAY = [DownloaderUtil,FsCommonUtil];

@NgModule({
  imports: [IMPORT_EXPORT_MODULE_ARRAY],
  exports: [IMPORT_EXPORT_MODULE_ARRAY],
  providers: [PROVIDER_ARRAY]
})
export class NgxElectronUpdaterModule { }
