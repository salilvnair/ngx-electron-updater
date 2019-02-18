import { ReleaseInfo, Provider } from "projects/ngx-electron-updater/src/public_api";

export class AppUpdaterConfig {
    @ReleaseInfo({
        user:"salilvnair",
        repo:"ngxeu-test",
        provider:Provider.github
    }) 
    gitReleaseUrl:string;
    downloadSuffix:string;

}