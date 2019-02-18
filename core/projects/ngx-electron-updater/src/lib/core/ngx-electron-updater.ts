import { Injectable } from "@angular/core";
import { ReleaseInfoType } from "./type/release-info.type";
import { ElectronAppUtil } from "./util/electron-app.util";
import { GitHubReleaseUtil } from "./github/util/github-release-downloader.util";
import { Subject } from "rxjs";
import { GithubReleaseAsset } from "./github/model/github-release.model";
import { AppUpadateStatus } from "./github/model/app-update-status.model";
import { DownloadNotifier } from "./github/model/download-status.model";
import { NgxElectronInstallerUtil } from "./ngxei/util/ngx-electron-installer.util";
import { DownloadInfoType } from "./type/download.type";
import {NgxeiOption} from "./ngxei/@types/ngxei-model"
import { OS } from "./type/os.enum";
import { DefaultDownloadInfo, Path } from "./type/ngxeu.types";
import { ElectronService } from "ngx-electron";

@Injectable()
export abstract class NgxElectronUpdater<T> {
    public abstract entityInstance(): T ;
    public abstract appName(): string ;
    constructor(
        private _electronAppUtil:ElectronAppUtil,
        private _electronService:ElectronService,
        private _gitHubReleaseUtil:GitHubReleaseUtil,
        private _ngxElectronInstallerUtil:NgxElectronInstallerUtil
        ){}

    public checkForUpdate() {
        return this._checkForUpdate();
    }

    public download() {
        let downloadNotifierSubject:Subject<DownloadNotifier> = new Subject<DownloadNotifier>();
        this.checkForUpdate().subscribe(updateStatus=>{
            this._downloadLatest(downloadNotifierSubject,updateStatus);
        })
        return downloadNotifierSubject.asObservable();
    }
 
    public install(){
        this.checkForUpdate().subscribe(updateStatus=>{
            let appVersion = updateStatus.appReleaseInfo.version;
            let appZipFileName = this._getAppZipFileName(this.appName(),appVersion);
            let downloadRelativePath = this._getAppDownloadPath();
            let options:NgxeiOption = <NgxeiOption>{};
            if(this._electronAppUtil.isWindows()){
                options.os = OS.windows;
            }
            else if(this._electronAppUtil.isMac()){
                options.os = OS.mac;
            }
            let path = this._electronService.remote.require('path');
            options.extract_path = path.resolve(this._electronAppUtil.appPath(),DefaultDownloadInfo.extractPath);
            options.appName = this.appName();
            options.app_dir = this._electronAppUtil.appPath();
            options.zip_file_path = downloadRelativePath+Path.separator+appZipFileName;
            options.updateType=updateStatus.appReleaseInfo.type;
            this._ngxElectronInstallerUtil.extract(options);
            this._ngxElectronInstallerUtil.replace(options);
        })
    }

    public downloadAndInstall() {
        this.download();
        this.install();
    }

    private _checkForUpdate() {
        let updateStatus:Subject<AppUpadateStatus> = new Subject<AppUpadateStatus>();
        let releaseInfo:ReleaseInfoType = this._getReleaseInfo();
        let url = GitHubReleaseUtil.getLatestReleaseUrl(releaseInfo);
        this._gitHubReleaseUtil.getLatestReleaseInfo(url).subscribe(appReleaseInfo=>{
            let appUpadateStatus:AppUpadateStatus = new AppUpadateStatus();
            appUpadateStatus.appReleaseInfo = appReleaseInfo;
            appUpadateStatus.currentAppVersion = this._electronAppUtil.npmVersion();
            if(appReleaseInfo.version != appUpadateStatus.currentAppVersion){
                appUpadateStatus.updateAvailable = true;
                updateStatus.next(appUpadateStatus);
                updateStatus.complete();
            }
            else{
                appUpadateStatus.updateAvailable = false;
                updateStatus.next(appUpadateStatus);
                updateStatus.complete();
            }
        });
        return updateStatus.asObservable();
    }

    private _downloadAsset(asset:GithubReleaseAsset) {
        let downloadUrl = asset.browser_download_url;
        let fileName = asset.name;
        console.log(downloadUrl)
        let downloadRelativePath = this._getAppDownloadPath();
        return this._ngxElectronInstallerUtil.download(downloadUrl, downloadRelativePath,fileName);
    }

    private _downloadLatest(downloadNotifierSubject:Subject<DownloadNotifier>,appUpadateStatus:AppUpadateStatus) {
        let releaseInfo:ReleaseInfoType = this._getReleaseInfo();        
        let url = GitHubReleaseUtil.getLatestReleaseUrl(releaseInfo);
        this._gitHubReleaseUtil.getLatestRelease(url).subscribe(response=>{
            if(appUpadateStatus.updateAvailable){
                let appNewVersion = appUpadateStatus.appReleaseInfo.version;
                let appNameWithVersion = this.appName() + "-"+appNewVersion;
                let newAppAsset = this._getAppZipFileAssetInfo(appNameWithVersion,response.assets);
                this._downloadAsset(newAppAsset).subscribe(downloadNotifier=>{
                    downloadNotifierSubject.next(downloadNotifier);
                },error=>{},()=>{
                    downloadNotifierSubject.complete();
                })
            }
        })
    }

    private _getAppZipFileName(appName:string,version:string) {
        let appZipName;
        if(this._electronAppUtil.isWindows()){
            appZipName = appName+'-'+version+'-win.zip';
        }
        else if(this._electronAppUtil.isMac()){
            appZipName = appName+'-'+version+'-mac.zip';
        }
        
        return appZipName;
    }
    
    private _getAppZipFileAssetInfo(appNameWithVersion:string,assets:GithubReleaseAsset[]) {
        let appZipName;
        if(this._electronAppUtil.isWindows()){
            appZipName = appNameWithVersion+'-win.zip';
        }
        else if(this._electronAppUtil.isMac()){
            appZipName = appNameWithVersion+'-mac.zip';
        }
        let appAsset = assets.find(asset=>asset.name.toLowerCase()===appZipName.toLowerCase());
        return appAsset;
    }

    private _getAppDownloadPath() {
        let defaultDownloadPath:string;
        if(this._getDownloadInfo() && this._getDownloadInfo().path){
           defaultDownloadPath = this._getDownloadInfo().path;
        }
        if(!defaultDownloadPath){
           defaultDownloadPath = this._electronAppUtil.localAppDataPath();
        }
        let downloadSuffix:string;
        if(this._getDownloadInfo() && this._getDownloadInfo().suffix){
           downloadSuffix = this._getDownloadInfo().suffix;
        }
   
        if(!downloadSuffix){
           downloadSuffix = this.appName()+Path.separator+DefaultDownloadInfo.suffix+Path.separator;
        }
        let path = this._electronService.remote.require('path');
        let downloadRelativePath = path.resolve(defaultDownloadPath, downloadSuffix);
        return downloadRelativePath;
    }
    
    private _getDownloadInfo():DownloadInfoType {
        return Reflect.getMetadata("DownloadInfo", this.entityInstance().constructor);
    }

    private _getReleaseInfo():ReleaseInfoType {
        return Reflect.getMetadata("ReleaseInfo", this.entityInstance().constructor);
    }
}