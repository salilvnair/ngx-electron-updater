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
import { DownloadInfoType } from "../type/download.type";

@Injectable()
export abstract class NgxElectronUpdater<T> {
    public abstract entityInstance(): T ;
    public abstract appName(): string ;
    private _downloadNotifier:Subject<DownloadNotifier> = new Subject<DownloadNotifier>();
    constructor(
        private _downloaderUtil:DownloaderUtil,
        private _electronAppUtil:ElectronAppUtil,
        private _gitHubReleaseUtil:GitHubReleaseUtil,
        private _ngxElectronInstallerUtil:NgxElectronInstallerUtil
        ){}
    public checkForUpdate() {
        //console.log(this._electronAppUtil.appPath());
        //this._ngxElectronInstallerUtil.extract();
        return this._checkForUpdate();
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

    public autoDownload() {
        // this.checkForUpdate().subscribe(updateStatus=>{
        //     this.downloadLatest(updateStatus);
        // })
    }

    public download() {
        this.checkForUpdate().subscribe(updateStatus=>{
            this._downloadLatest(updateStatus);
        })
        return this._downloadNotifier.asObservable();
    }

   
    public install(){

    }

    public downloadAndInstall() {
        
    }

    private _downloadLatest(appUpadateStatus:AppUpadateStatus) {
        let releaseInfo:ReleaseInfoType = this._getReleaseInfo();
        let url = GitHubReleaseUtil.getLatestReleaseUrl(releaseInfo);
        this._gitHubReleaseUtil.getLatestRelease(url).subscribe(response=>{
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
    
    private _downloadAsset(asset:GithubReleaseAsset) {
     let downloadUrl = asset.browser_download_url;
     let fileName = asset.name;
     console.log(downloadUrl)
     let defaultDownloadPath:string;
     defaultDownloadPath = this._getDownloadInfo().path;
     if(!defaultDownloadPath){
        defaultDownloadPath = this._electronAppUtil.localAppDataPath();
     }
     let downloadSuffix:string = this._getDownloadInfo().suffix;
     if(!downloadSuffix){
        downloadSuffix = this.appName()+"/updates/pending/"
     }
     let downloadRelativePath = defaultDownloadPath + downloadSuffix + fileName;
     return this._downloaderUtil.download(downloadUrl, downloadRelativePath);
    }

    private _getDownloadInfo():DownloadInfoType {
        return Reflect.getMetadata("DownloadInfo", this.entityInstance().constructor);
    }

    private _getReleaseInfo():ReleaseInfoType {
        return Reflect.getMetadata("ReleaseInfo", this.entityInstance().constructor);
    }

}