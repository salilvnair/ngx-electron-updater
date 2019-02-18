import { Injectable } from "@angular/core";
import { ElectronService } from "ngx-electron";
import { NgxElectronUpdaterUtil } from "../@types/ngxeu-util";
import { NgxeiOption } from "../@types/ngxei-model";
import { DefaultDownloadInfo } from "projects/ngx-electron-updater/src/lib/type/ngxeu.types";
import { UpdateType } from "projects/ngx-electron-updater/src/lib/type/update-type.enum";
import { DownloadNotifierType } from "projects/ngx-electron-updater/src/lib/type/download-notifier.type";
import { Subject } from "rxjs";
import { DownloadNotifier, DownloadStatus } from "../../../model/download-status.model";


@Injectable()
export class NgxElectronInstallerUtil {

    constructor(private _electronService:ElectronService){}

    download(url:string, downloadPath:string,fileName:string){
        return this._download(url, downloadPath,fileName);
    }

    extract(options:NgxeiOption) {
        this._extract(options);
    }

    replace(options:NgxeiOption) {
        this._replace(options);
    }

    private _removeAllDownloadEventListerners() {
        let ngxeuUtil:NgxElectronUpdaterUtil = this._electronService.remote.require('@ngxeu/util');
        ngxeuUtil.removeAllListeners(DownloadNotifierType.data);
        ngxeuUtil.removeAllListeners(DownloadNotifierType.finish);
        ngxeuUtil.removeAllListeners(DownloadNotifierType.error);
    }

    private _download(url:string, downloadPath:string,fileName:string){
        let downloadNotifierSubject:Subject<DownloadNotifier> = new Subject<DownloadNotifier>();
        let ngxeuUtil:NgxElectronUpdaterUtil = this._electronService.remote.require('@ngxeu/util');
        let downloadNotifier:DownloadNotifier;
        ngxeuUtil.download(url, downloadPath,fileName);
        ngxeuUtil.on(DownloadNotifierType.data,(data:DownloadStatus)=>{
            downloadNotifier = new DownloadNotifier();
            downloadNotifier.key = DownloadNotifierType.data;
            downloadNotifier.value = data;
            downloadNotifierSubject.next(downloadNotifier);
        });
        ngxeuUtil.on(DownloadNotifierType.finish,()=>{
            this._removeAllDownloadEventListerners();
            downloadNotifier = new DownloadNotifier();
            downloadNotifier.key = DownloadNotifierType.finish;
            downloadNotifier.path = downloadPath;
            downloadNotifierSubject.next(downloadNotifier);
            downloadNotifierSubject.complete();
        });
        ngxeuUtil.on(DownloadNotifierType.error,(error:DownloadStatus)=>{
            downloadNotifier = new DownloadNotifier();
            downloadNotifier.key = DownloadNotifierType.error;
            downloadNotifier.value = error;
            downloadNotifierSubject.next(downloadNotifier);
        });
        return downloadNotifierSubject;
    }

    private _extract(options:NgxeiOption) {
        let ngxeuUtil:NgxElectronUpdaterUtil = this._electronService.remote.require('@ngxeu/util');
        ngxeuUtil.setOptions(options);
        // ngxeuUtil.archiveInfo().then(info=>{
        //     console.log(info);
        // })
        ngxeuUtil.extract();
    }

    private _replace(options:NgxeiOption) {
        let fsExtra = this._electronService.remote.require('fs-extra');        
        let path = this._electronService.remote.require('path');
        let currentDir = options.app_dir;
        let source:string;
        let destination:string;
        console.log(options.updateType);
        if(options.updateType===UpdateType.build){
             source = path.resolve(currentDir, DefaultDownloadInfo.newUpdateBuildPath);
             destination = path.resolve(currentDir, DefaultDownloadInfo.buildPath);
        }
        else {
            source = path.resolve(currentDir, DefaultDownloadInfo.newUpdateAppPath);
            destination = path.resolve(currentDir, DefaultDownloadInfo.appPath);
        }        
        console.log("source:"+source);
        console.log("destination:"+destination);
        //fsExtra.copySync(source, destination);
        //fsExtra.removeSync(source);
    }
    


}