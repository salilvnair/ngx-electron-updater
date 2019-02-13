import { DownloadPathSuffix } from "projects/ngx-electron-updater/src/lib/decorator/download-path-suffix.decorator";
import { Release } from "projects/ngx-electron-updater/src/lib/decorator/release.decorator";
import { Provider } from "projects/ngx-electron-updater/src/lib/type/provider.enum";

export class AppUpdaterConfig {
    @Release({
        user:"salilvnair",
        repo:"vdemy",
        provider:Provider.github
    }) 
    gitReleaseUrl:string;
    @DownloadPathSuffix("vdemy-updater/pending/") 
    downloadPrefix:string;

}