import { Injectable } from "@angular/core";
import { DownloaderUtil } from "./github/util/downloader.util";
import { ReleaseInfoType } from "../type/release.type";
import { ElectronAppUtil } from "./github/util/electron-app.util";
import { GitHubReleaseUtil } from "./github/util/github-release-downloader.util";
import { Subject } from "rxjs";
import { GithubReleaseAsset } from "./github/model/github-release.model";
import { AppUpadateStatus } from "./github/model/app-update-status.model";
import { DownloadNotifier } from "./github/model/download-status.model";
import { NgxElectronInstallerUtil } from "./github/util/ngxei/util/ngx-electron-installer.util";

@Injectable()
export abstract class NgxElectronUpdater<T> {
    public abstract entityInstance(): T ;
    public abstract appName(): string ;
    private _downloadNotifier:Subject<DownloadNotifier> = new Subject<DownloadNotifier>();
    constructor(
        private downloaderUtil:DownloaderUtil,
        private ElectronAppUtil:ElectronAppUtil,
        private gitHubReleaseUtil:GitHubReleaseUtil,
        private NgxElectronInstallerUtil:NgxElectronInstallerUtil
        ){}
    public checkForUpdate() {
        //console.log(this.ElectronAppUtil.appPath());
        this.NgxElectronInstallerUtil.extract();
        //return this._checkForUpdate();
    }

    private _checkForUpdate() {
        let updateStatus:Subject<AppUpadateStatus> = new Subject<AppUpadateStatus>();
        let releaseInfo:ReleaseInfoType = this._getReleaseUrl();
        let url = GitHubReleaseUtil.getLatestReleaseUrl(releaseInfo);
        this.gitHubReleaseUtil.getLatestAppReleaseInfo(url).subscribe(appReleaseInfo=>{
            let appUpadateStatus:AppUpadateStatus = new AppUpadateStatus();
            appUpadateStatus.appReleaseInfo = appReleaseInfo;
            appUpadateStatus.currentAppVersion = this.ElectronAppUtil.npmVersion();
            if(appReleaseInfo.version!=this.ElectronAppUtil.npmVersion()){
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

    public autoDownload() {
        // this.checkForUpdate().subscribe(updateStatus=>{
        //     this.downloadLatest(updateStatus);
        // })
    }

    public downloadLatest(appUpadateStatus:AppUpadateStatus) {
     let releaseInfo:ReleaseInfoType = this._getReleaseUrl();
     let url = GitHubReleaseUtil.getLatestReleaseUrl(releaseInfo);
     this.gitHubReleaseUtil.getLatestReleaseInfo(url).subscribe(response=>{
        if(appUpadateStatus.updateAvailable){
            let appNewVersion = appUpadateStatus.appReleaseInfo.version;
            let appNameWithVersion = this.appName() + "-"+appNewVersion;
            let newAppAsset = this._getAppZipFileAssetInfo(appNameWithVersion,response.assets);
            this._downloadAsset(newAppAsset).subscribe(downloadNotifier=>{
                this._downloadNotifier.next(downloadNotifier);
            },error=>{},()=>{
                this._downloadNotifier.complete();
            })
        }
     })
    }

    public downloadNotifier() {
        return this._downloadNotifier.asObservable();
    }

    public install(){

    }

    public downloadAndInstall() {}
    

    private _getAppZipFileAssetInfo(appNameWithVersion:string,assets:GithubReleaseAsset[]) {
        let appZipName;
        if(this.ElectronAppUtil.isWindows()){
            appZipName = appNameWithVersion+'-win.zip';
        }
        else if(this.ElectronAppUtil.isMac()){
            appZipName = appNameWithVersion+'-mac.zip';
        }
        let appAsset = assets.find(asset=>asset.name.toLowerCase()===appZipName.toLowerCase());
        return appAsset;
    }
    private _downloadAsset(asset:GithubReleaseAsset) {
     let downloadUrl = asset.browser_download_url;
     let fileName = asset.name;
     console.log(downloadUrl)
     let defaultDownloadPath:string;
     defaultDownloadPath = this._getDownloadPath();
     if(!defaultDownloadPath){
        defaultDownloadPath = this.ElectronAppUtil.localAppDataPath();
     }
     let downloadSuffix = this._getDownloadPathSuffix();
     if(!downloadSuffix){
        downloadSuffix = this.appName()+"/updates/pending/"
     }
     let downloadRelativePath = defaultDownloadPath + downloadSuffix + fileName;
     return this.downloaderUtil.download(downloadUrl, downloadRelativePath);
    }

    private _getDownloadPath(){        
        return Reflect.getMetadata("DownloadPath", this.entityInstance().constructor);
    }

    private _getDownloadPathSuffix() {
        return Reflect.getMetadata("DownloadPathSuffix", this.entityInstance().constructor);
    }

    private _getReleaseUrl() {
        return Reflect.getMetadata("Release", this.entityInstance().constructor);
    }

}