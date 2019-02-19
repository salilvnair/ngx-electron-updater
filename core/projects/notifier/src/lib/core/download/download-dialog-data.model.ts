import { ActionType } from "../update/type/update-action.enum";
import { DownloadStatus } from "projects/ngx-electron-updater/src/public_api";

export class DownloadDialogData {
    ActionType:ActionType;
    downloadStatus:DownloadStatus;
}