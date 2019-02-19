import { NgModule } from '@angular/core';
import {
  MatButtonModule,
  MatExpansionModule,
  MatGridListModule,
  MatCardModule,
  MatIconModule,
  MatMenuModule,
  MatDialogModule,
  MatFormFieldModule,
  MatInputModule,
  MatSidenavModule,
  MatToolbarModule,
  MatListModule,
  MatSelectModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatCheckboxModule,
  MatChipsModule,
  MatSnackBarModule,
  MatProgressSpinnerModule
} from '@angular/material';

const NG_MAT_IMPORT_EXPORT_ARRAY = [
  MatButtonModule,
  MatExpansionModule,
  MatGridListModule,
  MatCardModule,
  MatIconModule,
  MatMenuModule,
  MatDialogModule,
  MatFormFieldModule,
  MatInputModule,
  MatSidenavModule,
  MatToolbarModule,
  MatListModule,
  MatSelectModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatCheckboxModule,
  MatSnackBarModule,
  MatChipsModule,
  MatProgressSpinnerModule
];

@NgModule({
  imports: [NG_MAT_IMPORT_EXPORT_ARRAY],
  exports: [NG_MAT_IMPORT_EXPORT_ARRAY]
})
export class NotifierMaterialModule {}
