import { DownloadInfo } from "projects/ngx-electron-updater/src/lib/decorator/download-info.decorator";
import { ReleaseInfo } from "projects/ngx-electron-updater/src/lib/decorator/release-info.decorator";
import { Provider } from "projects/ngx-electron-updater/src/lib/type/provider.enum";

export class AppUpdaterConfig {
    @ReleaseInfo({
        user:"salilvnair",
        repo:"vdemy",
        provider:Provider.github
    }) 
    gitReleaseUrl:string;
    @DownloadInfo({
        suffix:"vdemy-updater/pending/"
    }) 
    downloadSuffix:string;

}