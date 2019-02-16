import { Injectable } from "@angular/core";
import {ElectronService} from "ngx-electron";
import { ElectronAppUtil } from "./electron-app.util";
import { Subject } from "rxjs";
import { DownloadStatus, DownloadNotifier } from "../model/download-status.model";

@Injectable()
export class DownloaderUtil {
    constructor(private electronService:ElectronService,
                 private ElectronAppUtil:ElectronAppUtil){}

    downloadNotifier:Subject<DownloadNotifier> = new Subject<DownloadNotifier>();

    download1(url:string,downloadPath:string){ 
       //this.electronService.ipcRenderer.send("update-check");
       console.log(this.ElectronAppUtil.pwd());
       console.log(this.ElectronAppUtil.os());
       console.log(this.ElectronAppUtil.env());
       console.log(this.electronService.process.platform);
       let jsonFile = this.electronService.remote.require("jsonfile");
       console.log(jsonFile);
    }
    download(url:string, downloadPath:string){
        let fs = this.electronService.remote.require("fs");
        let http = this.electronService.remote.require("follow-redirects").http;
        let https = this.electronService.remote.require('follow-redirects').https;
        let httpClient:any;
        if(this.getWebProtocol(url)=="http"){
            httpClient = http;
        }
        else if(this.getWebProtocol(url)=="https"){
            httpClient = https;
        }
        var outStream = fs.createWriteStream(downloadPath);
        console.log(url)
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
                downloadNotifier.key="data";
                downloadNotifier.value = downloadStatus
                this.downloadNotifier.next(downloadNotifier);

                //console.log("Downloading " + (100.0 * cur / len).toFixed(2) + "% " + (cur / 1048576).toFixed(2) + " mb " + "/" + total.toFixed(2) + " mb");
            });

            response.on("finish", ()=> {
                let downloadNotifier:DownloadNotifier = new DownloadNotifier();
                downloadNotifier.key="finish";
                downloadNotifier.path = downloadPath;
                this.downloadNotifier.next(downloadNotifier);
                this.downloadNotifier.complete();
            });

            request.on("error", function(e:any){
                let downloadStatus:DownloadStatus  = new DownloadStatus();
                downloadStatus.errorMessage = e.message;
                let downloadNotifier:DownloadNotifier = new DownloadNotifier();
                downloadNotifier.key="error";
                downloadNotifier.value = downloadStatus
                this.downloadNotifier.next(downloadNotifier);
            });

            response.pipe(outStream);
        });
        return this.downloadNotifier.asObservable();
    }

    getWebProtocol(url){
        if (url.indexOf("http://") == 0 ) {
            return "http"
        }
        else if(url.indexOf("https://") == 0){
            return "https"
        }
    }
}

