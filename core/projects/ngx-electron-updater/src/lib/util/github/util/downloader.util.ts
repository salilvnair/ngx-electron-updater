import { Injectable } from "@angular/core";
import {ElectronService} from "ngx-electron";
import { ElectronAppUtil } from "./electron-app.util";
import { Subject } from "rxjs";
import { DownloadStatus, DownloadNotifier } from "../model/download-status.model";
import { DownloadNotifierType } from "../../../type/download-notifier.type";
import { FsCommonUtil } from "../../fs-common.util";
import { NgxElectronUpdaterUtil } from "./ngxei/@types/ngxeu-util";

@Injectable()
export class DownloaderUtil {
    constructor(private _electronService:ElectronService,
                private _fsCommonUtil:FsCommonUtil,
                private _electronAppUtil:ElectronAppUtil){}

    downloadNotifier:Subject<DownloadNotifier> = new Subject<DownloadNotifier>();

    download1(url:string,downloadPath:string){ 
       //this.electronService.ipcRenderer.send("update-check");
       console.log(this._electronAppUtil.pwd());
       console.log(this._electronAppUtil.os());
       console.log(this._electronAppUtil.env());
       console.log(this._electronService.process.platform);
       let jsonFile = this._electronService.remote.require("jsonfile");
       console.log(jsonFile);
    }
    download(url:string, downloadPath:string,fileName:string){
        //debugger;
        let fs = this._electronService.remote.require("fs");
        let http = this._electronService.remote.require("follow-redirects").http;
        let https = this._electronService.remote.require('follow-redirects').https;
        let httpClient:any;
        if(this._getWebProtocol(url)=="http"){
            httpClient = http;
        }
        else if(this._getWebProtocol(url)=="https"){
            httpClient = https;
        }
        let ngxeuUtil:NgxElectronUpdaterUtil = this._electronService.remote.require('@ngxeu/util');
        ngxeuUtil.createPathIfNotExist(downloadPath);
        var outStream = fs.createWriteStream(downloadPath+"/"+fileName);
        var request = httpClient.get(url, (response:any) => {
            var len = parseInt(response.headers['content-length'], 10);
            var cur = 0;
            var total = len / 1048576; //1048576 - bytes in  1Megabyte

            response.on("data", (chunk)=> {
                cur += chunk.length;
                var currentPercentage = (100.0 * cur / len).toFixed(2);
                var totalPercentage = total.toFixed(2);
                var downloadSpeedMbps = (cur / 1048576).toFixed(2);
                let downloadStatus:DownloadStatus  = new DownloadStatus();
                downloadStatus.currentPercentage = currentPercentage;
                downloadStatus.totalPercentage = totalPercentage;
                downloadStatus.speed = downloadSpeedMbps; 
                let downloadNotifier:DownloadNotifier = new DownloadNotifier();
                downloadNotifier.key=DownloadNotifierType.data;
                downloadNotifier.value = downloadStatus
                this.downloadNotifier.next(downloadNotifier);
                if(currentPercentage==='100.00'){
                    let downloadNotifier:DownloadNotifier = new DownloadNotifier();
                    downloadNotifier.key=DownloadNotifierType.finish;
                    downloadNotifier.path = downloadPath;
                    this.downloadNotifier.next(downloadNotifier);
                    this.downloadNotifier.complete();
                }
            });

            response.on("finish", ()=> {
                console.log('finished');
                let downloadNotifier:DownloadNotifier = new DownloadNotifier();
                downloadNotifier.key=DownloadNotifierType.finish;
                downloadNotifier.path = downloadPath;
                this.downloadNotifier.next(downloadNotifier);
                this.downloadNotifier.complete();
            });

            request.on("error", function(e:any){
                let downloadStatus:DownloadStatus  = new DownloadStatus();
                downloadStatus.errorMessage = e.message;
                let downloadNotifier:DownloadNotifier = new DownloadNotifier();
                downloadNotifier.key=DownloadNotifierType.error;
                downloadNotifier.value = downloadStatus
                this.downloadNotifier.next(downloadNotifier);
            });

            response.pipe(outStream);
        });
        return this.downloadNotifier.asObservable();
    }

    private _getWebProtocol(url){
        if (url.indexOf("http://") == 0 ) {
            return "http"
        }
        else if(url.indexOf("https://") == 0){
            return "https"
        }
    }
}

