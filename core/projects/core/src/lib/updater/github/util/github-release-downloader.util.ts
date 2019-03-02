import { Injectable } from "@angular/core";
import { ElectronService } from "ngx-electron";
import { Subject, BehaviorSubject } from "rxjs";
import { GithubReleaseResponseType, GithubReleaseAsset } from "../model/github-release.model";
import { ReleaseInfoType } from "../../type/release-info.type";
import { HttpClient } from "@angular/common/http";
import { AppReleaseInfo } from "../model/app-release.model";
import { ReleaseResponseType } from "../../type/release-response.type";

@Injectable({
    providedIn: 'root'
})
export class GitHubReleaseUtil {
    public static API_RELEASES_URL = "https://api.github.com/repos/{user}/{repo}/releases";
    public static API_LATEST_RELEASE_URL = "https://api.github.com/repos/{user}/{repo}/releases/latest";
    public static USER_PLACEHOLDER = "{user}";
    public static REPO_PLACEHOLDER = "{repo}";
    private _appReleaseInfoFile = "app-release.json";
    public githubLatestReleaseInfo:Subject<GithubReleaseResponseType>;
    constructor(private electronService:ElectronService, private httpClient:HttpClient){}

    static getLatestReleaseUrl(releaseInfo:ReleaseInfoType) {
        let latestUrl = GitHubReleaseUtil.API_LATEST_RELEASE_URL;
        latestUrl = latestUrl.replace(GitHubReleaseUtil.USER_PLACEHOLDER,releaseInfo.user);
        latestUrl = latestUrl.replace(GitHubReleaseUtil.REPO_PLACEHOLDER,releaseInfo.repo);
        return latestUrl;
    }

    static getReleasesUrl(releaseInfo:ReleaseInfoType) {
        let latestUrl = GitHubReleaseUtil.API_RELEASES_URL;
        latestUrl = latestUrl.replace(GitHubReleaseUtil.USER_PLACEHOLDER,releaseInfo.user);
        latestUrl = latestUrl.replace(GitHubReleaseUtil.REPO_PLACEHOLDER,releaseInfo.repo);
        return latestUrl;
    }

    githubLatestReleasePublisher() {
        return this.githubLatestReleaseInfo.asObservable();
    }

    getLatestRelease(url:string) {
        this.githubLatestReleaseInfo = new Subject<GithubReleaseResponseType>();
        this.httpClient.get<GithubReleaseResponseType>(url).subscribe(response=>{       
            this.githubLatestReleaseInfo.next(response);
        });
        return this.githubLatestReleaseInfo.asObservable();
    }

    hasReleaseInfo(url:string) {
        let hasReleaseInfo:Subject<ReleaseResponseType> = new Subject<ReleaseResponseType>();
        this.httpClient.get(url,{observe:'response'}).subscribe(response=>{    
            if(response.status==200){
                hasReleaseInfo.next(ReleaseResponseType.available);
            }
            else{
                hasReleaseInfo.next(ReleaseResponseType.not_available);
            }
        },error=>{
            hasReleaseInfo.next(ReleaseResponseType.doesnot_exist);
        });
        return hasReleaseInfo.asObservable();
    }

    getLatestReleaseInfo(url:string) {
        let latestReleaseInfo:Subject<AppReleaseInfo> = new Subject<AppReleaseInfo>();
        this.getLatestRelease(url).subscribe(releaseResponse=>{
            if(releaseResponse && releaseResponse.assets){
                let releaseAsset:GithubReleaseAsset = releaseResponse.assets.find(asset=>asset.name===this._appReleaseInfoFile);
                this.httpClient.get<AppReleaseInfo>(releaseAsset.browser_download_url)
                 .subscribe(data => {
                    latestReleaseInfo.next(data);
                  });
            }
        })
        return latestReleaseInfo.asObservable();
    }

    getWebProtocol(url){
        if (url.indexOf("http://") == 0 ) {
            return "http"
        }
        else if(url.indexOf("https://") == 0){
            return "https"
        }
    }
    
}