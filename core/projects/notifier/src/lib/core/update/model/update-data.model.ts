import { DownloadStatus } from "projects/ngx-electron-updater/src/public_api";
import { AppUpadateStatus } from "projects/ngx-electron-updater/src/lib/core/github/model/app-update-status.model";

export class UpdateNotifierData {
    downloadStatus?:DownloadStatus;
    appUpadateStatus:AppUpadateStatus
}