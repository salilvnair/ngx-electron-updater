import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

import { AppUpdater } from './app.updater';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NotifierModule } from '@ngxeu/notifier';
import { CommonModule } from '@angular/common';
import { NgxElectronUpdaterModule } from 'projects/core/src/public_api';

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
