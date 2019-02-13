import { ElectronService } from "ngx-electron";
import { Platform } from "../../../type/platform.enum";
import { Injectable } from "@angular/core";
@Injectable()
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
        return this.env().npm_package_version;
    }

    localAppDataPath() {
        return this.env().LOCALAPPDATA;
    }

    isWindows() {
        return this.electronService.isWindows;
    }

    isMac() {
        return this.electronService.isMacOS;
    }

}