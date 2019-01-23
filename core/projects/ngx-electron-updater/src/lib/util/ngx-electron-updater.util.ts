import { Injectable } from "@angular/core";
import { DownloaderUtil } from "./downloader.util";

@Injectable()
export abstract class NgxElectronUpdater<T> {
    public abstract entityInstance(): T ;
    public abstract appName(): string ;
    constructor(private downloaderUtil:DownloaderUtil){}
    public checkForUpdate() {
     // debugger;
     let downloadPathSuffix:string = this._getDownloadPathSuffix();
     let releaseUrl:string = this._getReleaseUrl();
     let gitHubReleaseUrl:string = this._getGithubReleaseUrl();
     let downloadUrl:string = releaseUrl;
     if(!releaseUrl) {
        downloadUrl = gitHubReleaseUrl;
     }  
     let defaultDownloadPath = "C:/Users/SalilNair/AppData/Local/";
     let downloadSuffix = this._getDownloadPathSuffix();
     if(!downloadSuffix){
        downloadSuffix = this.appName()+"/pending/"
     }
     let fileName = this._getFileNameFromUrl(downloadUrl);
     let downloadPath = defaultDownloadPath + downloadSuffix + 
     //this.downloaderUtil.download(downloadUrl, downloadPath + downloadPathSuffix+"/test.yml");
     this.downloaderUtil.download1("https://github.com/salilvnair/vdemy/releases/download/v0.0.3/Vdemy-0.0.3-win.zip","C:/Users/SalilNair/AppData/Local/vdemy-updater/pending/Vdemy-0.0.3-win.zip");
    }

    private _getFileNameFromUrl(downloadUrl: string): any {
        
    }

    private _getDownloadPath(){        
        return Reflect.getMetadata("DownloadPath", this.entityInstance().constructor);
    }

    private _getDownloadPathSuffix() {
        return Reflect.getMetadata("DownloadPathSuffix", this.entityInstance().constructor);
    }

    private _getReleaseUrl() {
        return Reflect.getMetadata("ReleaseUrl", this.entityInstance().constructor);
    }

    private _getGithubReleaseUrl() {
        return Reflect.getMetadata("GitHubReleaseUrl", this.entityInstance().constructor);
    }

}