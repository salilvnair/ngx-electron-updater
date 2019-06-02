import { ReleaseInfo, Provider } from "projects/core/src/public_api";


export class AppUpdaterConfig {
    @ReleaseInfo({
        user:"salilvnair",
        repo:"test-ngxeu",
        isPrivate:true,
        cliEncryptedToken: '',
        provider:Provider.github
    })
    gitReleaseUrl:string;
    downloadSuffix:string;

}
