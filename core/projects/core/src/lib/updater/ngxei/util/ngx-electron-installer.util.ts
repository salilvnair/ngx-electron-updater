import { Injectable } from "@angular/core";
import { ElectronService } from "ngx-electron";
import { NgxElectronUpdaterUtil } from "../@types/ngxeu-util";
import { NgxeiOption } from "../@types/ngxei-model";
import { DefaultDownloadInfo } from "../../type/ngxeu.types";
import { UpdateType } from "../../type/update-type.enum";
import { DownloadNotifierValueType } from "../../type/download-notifier-value.type";
import { Subject } from "rxjs";
import { DownloadNotifierType, DownloadStatus } from "../../github/model/download-status.model";
import { AppReleaseInfo } from "../../github/model/app-release.model";


@Injectable({
    providedIn: 'root'
})
export class NgxElectronInstallerUtil {

    constructor(private _electronService:ElectronService){}

    download(url:string, downloadPath:string,fileName:string){
        return this._download(url, downloadPath,fileName);
    }

    extract(options:NgxeiOption):Promise<boolean> {
        return this._extract(options);
    }

    replace(options:NgxeiOption) {
        this._replace(options);
    }

    clean(options:NgxeiOption,appDownloadPath:string) {
        this._clean(options,appDownloadPath);
    }

    private _clean(options:NgxeiOption,appDownloadPath:string) {
        let fsExtra = this._electronService.remote.require('fs-extra');
        fsExtra.removeSync(appDownloadPath);
    }

    private _removeAllDownloadEventListerners() {
        let ngxeuUtil:NgxElectronUpdaterUtil = this._electronService.remote.require('@ngxeu/util');
        ngxeuUtil.removeAllListeners(DownloadNotifierValueType.data);
        ngxeuUtil.removeAllListeners(DownloadNotifierValueType.finish);
        ngxeuUtil.removeAllListeners(DownloadNotifierValueType.error);
    }

    private _download(url:string, downloadPath:string,fileName:string){
        let downloadNotifierSubject:Subject<DownloadNotifierType> = new Subject<DownloadNotifierType>();
        let ngxeuUtil:NgxElectronUpdaterUtil = this._electronService.remote.require('@ngxeu/util');
        let downloadNotifier:DownloadNotifierType;
        ngxeuUtil.download(url, downloadPath,fileName);
        ngxeuUtil.on(DownloadNotifierValueType.data,(data:DownloadStatus)=>{
            downloadNotifier = new DownloadNotifierType();
            downloadNotifier.key = DownloadNotifierValueType.data;
            downloadNotifier.value = data;
            downloadNotifierSubject.next(downloadNotifier);
        });
        ngxeuUtil.on(DownloadNotifierValueType.finish,()=>{
            this._removeAllDownloadEventListerners();
            downloadNotifier = new DownloadNotifierType();
            downloadNotifier.key = DownloadNotifierValueType.finish;
            downloadNotifier.path = downloadPath;
            downloadNotifierSubject.next(downloadNotifier);
            downloadNotifierSubject.complete();
        });
        ngxeuUtil.on(DownloadNotifierValueType.error,(error:DownloadStatus)=>{
            downloadNotifier = new DownloadNotifierType();
            downloadNotifier.key = DownloadNotifierValueType.error;
            downloadNotifier.value = error;
            downloadNotifierSubject.next(downloadNotifier);
        });
        return downloadNotifierSubject;
    }

    private _extract(options:NgxeiOption):Promise<boolean> {
        let ngxeuUtil:NgxElectronUpdaterUtil = this._electronService.remote.require('@ngxeu/util');
        ngxeuUtil.setOptions(options);
        ngxeuUtil.extract();
        return new Promise( (resolve, reject) => {
            ngxeuUtil.on("finish",()=>{
                resolve(true);
            })
        });
    }

    private _replace(options:NgxeiOption) {
        let fsExtra = this._electronService.remote.require('fs-extra');   
        let path = this._electronService.remote.require('path');
        let currentDir = options.app_dir;
        let source:string;
        let destination:string;
        if(options.updateType===UpdateType.build){
             source = path.resolve(currentDir, DefaultDownloadInfo.newUpdateBuildPath);
             destination = path.resolve(currentDir, DefaultDownloadInfo.buildPath);
             let packageJsonPath = path.resolve(currentDir, DefaultDownloadInfo.appPath,"package.json");
             //this._updatePackageJsonVersion(packageJsonPath,options);  
        }
        else {
            source = path.resolve(currentDir, DefaultDownloadInfo.newUpdateAppPath);
            destination = path.resolve(currentDir, DefaultDownloadInfo.appPath);
        }   
        fsExtra.copySync(source, destination);
        fsExtra.removeSync(source);
    }

    private _updatePackageJsonVersion(packageJsonPath:string,options:NgxeiOption) {
        let jsonFile =   this._electronService.remote.require('jsonfile');
        let appReleaseInfo:AppReleaseInfo = options.appReleaseInfo;
        let packageJson = jsonFile.readFileSync(packageJsonPath);
        //console.log("old pkgjson",packageJson);
        packageJson.version = appReleaseInfo.version;          
        jsonFile.writeFileSync(packageJsonPath,packageJson,{spaces: 2, EOL: '\r\n'}); 
    }
    


}