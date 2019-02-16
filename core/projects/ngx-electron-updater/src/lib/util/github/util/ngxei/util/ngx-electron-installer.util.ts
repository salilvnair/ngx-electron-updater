import { Injectable } from "@angular/core";
import { ElectronService } from "ngx-electron";
import { ElectronAppUtil } from "../../electron-app.util";
import { NgxElectronInstaller } from "../@types/ngx-electron-installer.util";
import { NgxeiOption } from "../@types/ngxei-model";


@Injectable()
export class NgxElectronInstallerUtil {

    constructor(private _electronService:ElectronService,
                private _electronAppUtil:ElectronAppUtil){}

    extract() {
        let ngxei:NgxElectronInstaller = this._electronService.remote.require('@ngxeu/util');
         let options:NgxeiOption = <NgxeiOption>{};
         options.app_dir=this._electronAppUtil.appPath();
         options.extract_path=this._electronAppUtil.appPath()+'/update';
         options.zip_file_path = 'C:/Users/SalilNair/AppData/Local/vdemy-updater/pending/Vdemy-3.0.4-win.zip'
         options.os='win';
         ngxei.setOptions(options);
        // ngxei.extract();
        ngxei.archiveInfo().then(val=>{
            console.log(val);
        })
        console.log(ngxei);
    }

    replace() {
        this._replace();
    }

    _replace() {
        let currentDir = this._electronAppUtil.appPath();
        let fsExtra = this._electronService.remote.require('fs-extra');
        let fs = this._electronService.remote.require('fs');
        let path = this._electronService.remote.require('path');
        let source = path.resolve(currentDir, "update/build");
        let destination = path.resolve(currentDir, "build");
        fsExtra.copySync(source, destination);
        fsExtra.removeSync(source);
    }

    _extract() {
        let pgu = this._electronService.remote.getGlobal('pgu');   
        console.log(pgu)
        pgu.extract();  
      }


}