import { ReleaseInfo, Provider } from "projects/core/src/public_api";


export class AppUpdaterConfig {
    @ReleaseInfo({
        user:"salilvnair",
        repo:"test-ngxeu",
        provider:Provider.github
    })
    gitReleaseUrl:string;
    downloadSuffix:string;

}
