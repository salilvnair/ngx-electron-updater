import { ElectronService } from "ngx-electron";
import { Injectable } from "@angular/core";
import { Platform } from "../type/platform.enum";
@Injectable({
    providedIn: 'root'
})
export class ElectronAppUtil {
    constructor(private electronService:ElectronService){}

    private _remote(){
        return this.electronService.remote;
    }

    private _process() {
       return this.electronService.process;
    }

    appPath() {
        let appPath = this.env().PWD;
        if(!appPath) {
            appPath = this._remote().app.getAppPath();
        }
        return appPath;
    }

    restart() {
        this._remote().app.relaunch();
        this._remote().app.exit(0);
    }

    reload() {
        this._remote().webContents.getFocusedWebContents().reload();
    }

    env() {
        return this._process().env;
    }

    os() {
        return this._process().platform;
    }

    pwd() {
        if(this.os()===Platform.windows){
            return this.env().INIT_CWD
        }
        return this.env().PWD
    }

    npmVersion() {
        let jsonFile = this.electronService.remote.require('jsonfile');
        let path = this.electronService.remote.require('path');
        let packageJsonPath = path.resolve(this.appPath(),"package.json");
        let packageJson = jsonFile.readFileSync(packageJsonPath);
        return packageJson.version;
    }

    localAppDataPath() {
        return this.env().LOCALAPPDATA;
    }

    appDataPath() {
        return this.env().APPDATA;
    }

    isWindows() {
        return this.electronService.isWindows;
    }

    isMac() {
        return this.electronService.isMacOS;
    }

}