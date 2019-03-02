import { AppReleaseInfo } from "./app-release.model";

export class AppUpadateStatus {
    updateAvailable:boolean;
    noInfo?:boolean;
    appReleaseInfo:AppReleaseInfo;
    currentAppVersion:string;
}