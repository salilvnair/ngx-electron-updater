import { NgModule } from '@angular/core';
import { NgxElectronModule } from 'ngx-electron';
import { HttpClientModule } from '@angular/common/http';
const IMPORT_EXPORT_MODULE_ARRAY = [
  NgxElectronModule,
  HttpClientModule
];

@NgModule({
  imports: [IMPORT_EXPORT_MODULE_ARRAY],
  exports: [IMPORT_EXPORT_MODULE_ARRAY]
})
export class NgxElectronUpdaterModule { }
