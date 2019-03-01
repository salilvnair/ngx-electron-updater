import { ReleaseInfo, Provider } from "@ngxeu/core";


export class AppUpdaterConfig {
    @ReleaseInfo({
        user:"salilvnair",
        repo:"ngxeu-test",
        provider:Provider.github
    }) 
    gitReleaseUrl:string;
    downloadSuffix:string;

}