import { NgModule } from '@angular/core';
import { DownloaderUtil } from './util/github/util/downloader.util';
import { NgxElectronModule } from 'ngx-electron';
import { FsCommonUtil } from './util/fs-common.util';
import { HttpClientModule } from '@angular/common/http';
import { ElectronAppUtil } from './util/github/util/electron-app.util';
import { GitHubReleaseUtil } from './util/github/util/github-release-downloader.util';
import { NgxElectronInstallerUtil } from './util/github/util/ngxei/util/ngx-electron-installer.util';

const IMPORT_EXPORT_MODULE_ARRAY = [
  NgxElectronModule,
  HttpClientModule
];

const PROVIDER_ARRAY = [
  ElectronAppUtil,
  DownloaderUtil,
  FsCommonUtil,
  GitHubReleaseUtil,
  NgxElectronInstallerUtil
];

@NgModule({
  imports: [IMPORT_EXPORT_MODULE_ARRAY],
  exports: [IMPORT_EXPORT_MODULE_ARRAY],
  providers: [PROVIDER_ARRAY]
})
export class NgxElectronUpdaterModule { }
