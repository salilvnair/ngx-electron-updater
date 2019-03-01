import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NgxElectronUpdaterModule } from '@ngxeu/core';
import { AppUpdater } from './app.updater';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NotifierModule } from '@ngxeu/notifier';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    NgxElectronUpdaterModule,
    BrowserAnimationsModule,
    NotifierModule
  ],
  providers: [AppUpdater],
  bootstrap: [AppComponent]
})
export class AppModule { }
