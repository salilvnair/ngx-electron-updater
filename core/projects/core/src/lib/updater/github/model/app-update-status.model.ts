import { AppReleaseInfo } from "./app-release.model";

export class AppUpadateStatus {
    updateAvailable:boolean;
    appReleaseInfo:AppReleaseInfo;
    currentAppVersion:string;
}