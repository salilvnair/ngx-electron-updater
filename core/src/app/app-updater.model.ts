import { GitHubReleaseUrl } from "projects/ngx-electron-updater/src/lib/decorator/gh-releaseurl.decorator";
import { DownloadPathSuffix } from "projects/ngx-electron-updater/src/lib/decorator/download-path-suffix.decorator";

export class AppUpdaterConfig {
    @GitHubReleaseUrl("https://github.com/salilvnair/vdemy/releases/download/v0.0.3/Vdemy-0.0.3-win.zip") gitReleaseUrl:string;
    @DownloadPathSuffix("vdemy-updater/pending/") downloadPrefix:string;
}