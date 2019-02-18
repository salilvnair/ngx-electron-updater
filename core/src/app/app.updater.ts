
import { AppUpdaterConfig } from "./app-updater.model";
import { NgxElectronUpdater } from "projects/ngx-electron-updater/src/public_api";
export class AppUpdater extends NgxElectronUpdater<AppUpdaterConfig>{
    entityInstance(): AppUpdaterConfig {
        return new AppUpdaterConfig();
    }

    appName():string {
        return "ngxeu"
    }
}