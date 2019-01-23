import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NgxElectronUpdaterModule } from 'projects/ngx-electron-updater/src/public_api';
import { AppUpdater } from './app.updater';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgxElectronUpdaterModule
  ],
  providers: [AppUpdater],
  bootstrap: [AppComponent]
})
export class AppModule { }
