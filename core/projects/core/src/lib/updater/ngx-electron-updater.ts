import { Injectable } from "@angular/core";
import { ReleaseInfoType } from "./type/release-info.type";
import { ElectronAppUtil } from "./util/electron-app.util";
import { GitHubReleaseUtil } from "./github/util/github-release-downloader.util";
import { Subject } from "rxjs";
import { GithubReleaseAsset } from "./github/model/github-release.model";
import { AppUpadateStatus } from "./github/model/app-update-status.model";
import { DownloadNotifierType, DownloadStatus } from "./github/model/download-status.model";
import { NgxElectronInstallerUtil } from "./ngxei/util/ngx-electron-installer.util";
import { DownloadInfoType } from "./type/download.type";
import {NgxeiOption} from "./ngxei/@types/ngxei-model"
import { OS } from "./type/os.enum";
import { DefaultDownloadInfo, Path } from "./type/ngxeu.types";
import { ElectronService } from "ngx-electron";
import { FsCommonUtil } from "./util/fs-common.util";
import { DownloadNotifierValueType } from "./type/download-notifier-value.type";
import { ReleaseResponseType } from "./type/release-response.type";

@Injectable({
    providedIn: 'root'
})
export abstract class NgxElectronUpdater<T> {
    public abstract entityInstance(): T ;
    public abstract appName(): string ;
    constructor(
        private _electronAppUtil:ElectronAppUtil,
        private _electronService:ElectronService,
        private _gitHubReleaseUtil:GitHubReleaseUtil,
        private _ngxElectronInstallerUtil:NgxElectronInstallerUtil,
        private _fsCommonUtil:FsCommonUtil
        ){}

    public checkForUpdate() {
        return this._checkForUpdate();
    }

    public getAppDownloadPath() {
        return this._getAppDownloadPath();
    }

    public hasPendingUpdates() {
        return !this._fsCommonUtil.isDirectoryEmpty(this._getAppDownloadPath());
    }

    public download() {
        let downloadNotifierSubject:Subject<DownloadNotifierType> = new Subject<DownloadNotifierType>();
        this.checkForUpdate().subscribe(updateStatus=>{
            this._downloadLatest(downloadNotifierSubject,updateStatus);
        })
        return downloadNotifierSubject.asObservable();
    }
 
    public install(){
        let installNotifierSubject:Subject<DownloadNotifierType> = new Subject<DownloadNotifierType>();
        this._updateInstallationProgress(installNotifierSubject,"1");
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
            this._updateInstallationProgress(installNotifierSubject,"10");
            let path = this._electronService.remote.require('path');
            options.extract_path = path.resolve(this._electronAppUtil.appPath(),DefaultDownloadInfo.extractPath);
            options.appName = this.appName();
            options.app_dir = this._electronAppUtil.appPath();
            options.zip_file_path = downloadRelativePath+Path.separator+appZipFileName;
            options.updateType=updateStatus.appReleaseInfo.type;
            options.appReleaseInfo = updateStatus.appReleaseInfo;
            this._updateInstallationProgress(installNotifierSubject,"25");
            this._ngxElectronInstallerUtil.extract(options).then(extracted=>{
                this._updateInstallationProgress(installNotifierSubject,"40");
                if(extracted){
                    this._ngxElectronInstallerUtil.replace(options);
                    this._updateInstallationProgress(installNotifierSubject,"50");
                    this._ngxElectronInstallerUtil.clean(options,downloadRelativePath);
                    this._updateInstallationProgress(installNotifierSubject,"100");
                }
            });
        })
        return installNotifierSubject.asObservable();
    }

    public downloadAndInstall() {
        this.download();
        this.install();
    }

    public restart() {
        this._electronAppUtil.restart();
    }

    public reload() {
        this._electronAppUtil.reload();
    }

    private _updateInstallationProgress(installNotifierSubject:Subject<DownloadNotifierType>,percentage:string){
        let downloadNotifier:DownloadNotifierType;
        downloadNotifier = new DownloadNotifierType();
        downloadNotifier.key = DownloadNotifierValueType.data;
        let data:DownloadStatus = new DownloadStatus();
        data.currentPercentage=percentage;
        downloadNotifier.value = data;
        installNotifierSubject.next(downloadNotifier);
    }

    private _checkForUpdate() {
        let updateStatus:Subject<AppUpadateStatus> = new Subject<AppUpadateStatus>();
        let releaseInfo:ReleaseInfoType = this._getReleaseInfo();
        let url = GitHubReleaseUtil.getLatestReleaseUrl(releaseInfo);
        this._gitHubReleaseUtil.hasReleaseInfo(url, releaseInfo).subscribe(hasReleaseInfo=>{
            if(hasReleaseInfo===ReleaseResponseType.available){
                this._gitHubReleaseUtil.getLatestReleaseInfo(url, releaseInfo).subscribe(appReleaseInfo=>{
                    let appUpadateStatus:AppUpadateStatus = new AppUpadateStatus();
                    appUpadateStatus.appReleaseInfo = appReleaseInfo;
                    appUpadateStatus.currentAppVersion = this._electronAppUtil.npmVersion();                
                    if(this._ngxElectronInstallerUtil.ngxeuUtil().gt(appReleaseInfo.version,appUpadateStatus.currentAppVersion)){
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
            }
            else if(hasReleaseInfo===ReleaseResponseType.not_available){
                let appUpadateStatus:AppUpadateStatus = new AppUpadateStatus();
                appUpadateStatus.updateAvailable = false;
                updateStatus.next(appUpadateStatus);
                updateStatus.complete();
            }
            else if(hasReleaseInfo===ReleaseResponseType.doesnot_exist){
                let appUpadateStatus:AppUpadateStatus = new AppUpadateStatus();
                appUpadateStatus.updateAvailable = false;
                appUpadateStatus.noInfo = true;
                updateStatus.next(appUpadateStatus);
                updateStatus.complete();
            }
        });
        return updateStatus.asObservable();
    }

    private _downloadAsset(asset:GithubReleaseAsset, releaseInfo:ReleaseInfoType) {
        let downloadNotifierSubject:Subject<DownloadNotifierType> = new Subject<DownloadNotifierType>();
        let downloadUrl = asset.browser_download_url;
        let fileName = asset.name;        
        let downloadRelativePath = this._getAppDownloadPath();
        if(releaseInfo.isPrivate) {
            this._gitHubReleaseUtil.getPrivateRepoAssetDownloadUrl(asset.url, releaseInfo)
                                    .subscribe(privateRepoAssetDownloadUrl => {
                                        this._ngxElectronInstallerUtil.download(privateRepoAssetDownloadUrl, downloadRelativePath,fileName).subscribe(response => {
                                            downloadNotifierSubject.next(response);
                                        });
                                    })
        }
        else {
            downloadNotifierSubject = this._ngxElectronInstallerUtil.download(downloadUrl, downloadRelativePath,fileName);
        }
        return downloadNotifierSubject;
    }

    private _downloadLatest(downloadNotifierSubject:Subject<DownloadNotifierType>,appUpadateStatus:AppUpadateStatus) {
        let releaseInfo:ReleaseInfoType = this._getReleaseInfo();        
        let url = GitHubReleaseUtil.getLatestReleaseUrl(releaseInfo);
        this._gitHubReleaseUtil.getLatestRelease(url, releaseInfo).subscribe(response=>{
            if(appUpadateStatus.updateAvailable){
                let appNewVersion = appUpadateStatus.appReleaseInfo.version;
                let appNameWithVersion = this.appName() + "-"+appNewVersion;
                let newAppAsset = this._getAppZipFileAssetInfo(appNameWithVersion,response.assets);
                this._downloadAsset(newAppAsset, releaseInfo).subscribe(downloadNotifier=>{
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