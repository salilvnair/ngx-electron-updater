import { Injectable } from "@angular/core";
import {ElectronService} from "ngx-electron";
import { FsCommonUtil } from "./fs-common.util";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class DownloaderUtil {
    constructor(private electronService:ElectronService,
                 private fsCommonUtil:FsCommonUtil,
                 private http:HttpClient){}

    download1(url:string,downloadPath:string){ 
       //this.electronService.ipcRenderer.send("update-check");
       console.log(this.electronService.process.env.PWD);
       console.log(this.electronService.process.env.INIT_CWD);
       console.log(this.electronService.process.cwd());
       console.log(this.electronService.process.env.npm_package_version);
    }
   download(url,downloadPath){
    let fs = this.electronService.remote.require("fs");
    let http = this.electronService.remote.require("follow-redirects").http;
    let https = this.electronService.remote.require('follow-redirects').https;
    let httpClient;
    if(this.getWebProtocol(url)=="http"){
        httpClient = http;
    }
    else if(this.getWebProtocol(url)=="https"){
        httpClient = https;
    }
    let received_bytes = 0;
    let total_bytes = 0;  
    //console.log(httpClient); 
    var outStream = fs.createWriteStream(downloadPath);
    console.log(url)
    var request = httpClient.get(url, (response) => {
      // if (encoding){
      //     response.setEncoding(encoding);
      // }
      var len = parseInt(response.headers['content-length'], 10);
      var cur = 0;
      var total = len / 1048576; //1048576 - bytes in  1Megabyte

      response.on("data", function(chunk) {
          cur += chunk.length;
          console.log("Downloading " + (100.0 * cur / len).toFixed(2) + "% " + (cur / 1048576).toFixed(2) + " mb " + "/" + total.toFixed(2) + " mb");
      });

      response.on("end", function() {
          //callback(body);
          console.log("Downloading complete");
      });

      request.on("error", function(e){
          console.log("Error: " + e.message);
      });
      response.pipe(outStream);
      });
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

