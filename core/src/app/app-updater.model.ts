import { ReleaseInfo, Provider } from "projects/core/src/public_api";


export class AppUpdaterConfig {
    @ReleaseInfo({
        user:"salilvnair",
        repo:"test-ngxeu",
        isPrivate:true,
        cliEncryptedToken: '0863a72068541a325d080274aa508771399bfad261565d160870c46660c9e28a65a5a17fa068c19b906be148bdfd4c8951acc188f1f541e2e4f002d2b200ab8c',
        provider:Provider.github
    })
    gitReleaseUrl:string;
    downloadSuffix:string;

}
