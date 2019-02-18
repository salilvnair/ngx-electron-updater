import { Injectable } from "@angular/core";
import { ElectronService } from "ngx-electron";

@Injectable()
export class FsCommonUtil {
  constructor(private electronService: ElectronService) {}
  fs = this.electronService.remote.require("fs");
  path = this.electronService.remote.require("path");

  writeFileIfNotExist(fileWithPath: string, contents: string) {
    if (!this.fs.existsSync(fileWithPath)) {
      var options = options || {};
      options.flag = "wx";
      this.fs.writeFileSync(fileWithPath, contents, options);
    }
  }

  checkAndCreateDestinationPath(fileDestination:string) {
    const dirPath = fileDestination.split("\\");
    var self = this;
    dirPath.forEach((element: any, index: number) => {
      if (!self.fs.existsSync(dirPath.slice(0, index + 1).join("/"))) {
        self.fs.mkdirSync(dirPath.slice(0, index + 1).join("/"));
      }
    });
  }

  readFileAsJson(jsonPath:string) {
    return JSON.parse(this.fs.readFileSync(jsonPath, "utf8"));
  }

  createWriteStream(path:string) {
     return this.fs.createWriteStream(path);
  }
}
