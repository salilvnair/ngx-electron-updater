
import { AppUpdaterConfig } from "./app-updater.model";
import { NgxElectronUpdater } from "@ngxeu/core";
export class AppUpdater extends NgxElectronUpdater<AppUpdaterConfig>{
    entityInstance(): AppUpdaterConfig {
        return new AppUpdaterConfig();
    }

    appName():string {
        return "ngxeu-test";
    }
}