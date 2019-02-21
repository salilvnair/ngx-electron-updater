import { NgModule } from '@angular/core';
import { InfoNotifier } from '../info/info.notifier';
import { InfoNotifierDialog } from '../info/info-dialog.component';
import { NotifierMaterialModule } from './notifier-material.module';


const PROVIDER_ARRAY = [
  InfoNotifier
];

const DELCARATION_EXPORT_ARRAY = [
  InfoNotifierDialog
];

const ENTRY_COMPONENT_ARRAY = [
  InfoNotifierDialog
];

const IMPORT_EXPORT_MODULE_ARRAY = [
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
export class InfoNotifierModule { }
