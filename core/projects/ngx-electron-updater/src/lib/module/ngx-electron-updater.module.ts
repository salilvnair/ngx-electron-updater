import { NgModule } from '@angular/core';
import { NgxElectronModule } from 'ngx-electron';
import { HttpClientModule } from '@angular/common/http';
import { ElectronAppUtil } from '../core/util/electron-app.util';
import { FsCommonUtil } from '../core/util/fs-common.util';
import { GitHubReleaseUtil } from '../core/github/util/github-release-downloader.util';
import { NgxElectronInstallerUtil } from '../core/ngxei/util/ngx-electron-installer.util';

const IMPORT_EXPORT_MODULE_ARRAY = [
  NgxElectronModule,
  HttpClientModule
];

const PROVIDER_ARRAY = [
  ElectronAppUtil,
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
