import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Subject, Observable } from "rxjs";
import { GithubReleaseResponseType, GithubReleaseAsset } from "../model/github-release.model";
import { ReleaseInfoType } from "../../type/release-info.type";
import { AppReleaseInfo } from "../model/app-release.model";
import { ReleaseResponseType } from "../../type/release-response.type";
import { NgxElectronInstallerUtil } from "../../ngxei/util/ngx-electron-installer.util";

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
    constructor(    private ngxElectronInstallerUtil:NgxElectronInstallerUtil,
                    private httpClient:HttpClient
                ){}

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

    getLatestRelease(url:string, releaseInfo:ReleaseInfoType) {
        this.githubLatestReleaseInfo = new Subject<GithubReleaseResponseType>();
        let observer = null;
        if(releaseInfo.isPrivate) {
            const tokenSuffix = this.ngxElectronInstallerUtil.decrypt(releaseInfo.user+releaseInfo.repo,releaseInfo.cliEncryptedToken);
            observer = this.httpClient.get<GithubReleaseResponseType>(url,{headers:{'Authorization':'token '+tokenSuffix}});
        }
        else {
            observer = this.httpClient.get<GithubReleaseResponseType>(url);
        }  
        observer.subscribe((response: GithubReleaseResponseType)=>{       
            this.githubLatestReleaseInfo.next(response);
        });
        return this.githubLatestReleaseInfo.asObservable();
    }

    hasReleaseInfo(url:string, releaseInfo:ReleaseInfoType) {
        let hasReleaseInfo:Subject<ReleaseResponseType> = new Subject<ReleaseResponseType>();
        let observer = null;
        if(releaseInfo.isPrivate) {
            const tokenSuffix = this.ngxElectronInstallerUtil.decrypt(releaseInfo.user+releaseInfo.repo,releaseInfo.cliEncryptedToken);
            observer = this.httpClient.get(url,{headers:{'Authorization':'token '+tokenSuffix},observe:'response'});
        }
        else {
            observer = this.httpClient.get(url,{observe:'response'});
        }        
        observer.subscribe((response: any)=>{    
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

    getLatestReleaseInfo(url:string, releaseInfo:ReleaseInfoType) {
        let latestReleaseInfo:Subject<AppReleaseInfo> = new Subject<AppReleaseInfo>();
        this.getLatestRelease(url, releaseInfo).subscribe(releaseResponse=>{
            if(releaseResponse && releaseResponse.assets){
                let releaseAsset:GithubReleaseAsset = releaseResponse.assets.find(asset=>asset.name===this._appReleaseInfoFile);
                let observer = null;
                if(releaseInfo.isPrivate) {
                    this.getPrivateRepoAssetDownloadUrl(releaseAsset.url, releaseInfo)
                        .subscribe(privateRepoAssetDownloadUrl => {
                            this.httpClient.get<AppReleaseInfo>(privateRepoAssetDownloadUrl)
                            .subscribe(data => {
                                latestReleaseInfo.next(data);
                            })
                        })
                }
                else {
                    observer = this.httpClient.get<AppReleaseInfo>(releaseAsset.browser_download_url);
                    observer.subscribe((data: AppReleaseInfo) => {
                        latestReleaseInfo.next(data);
                    });
                }                   
            }
        })
        return latestReleaseInfo.asObservable();
    }

    getPrivateRepoAssetDownloadUrl(latestAssetUrl: string, releaseInfo:ReleaseInfoType) : Observable<string> {
        let privateRepoDownloadUrl :Subject<string> = new Subject<string>();
        if(releaseInfo.isPrivate) {
            const tokenSuffix = this.ngxElectronInstallerUtil.decrypt(releaseInfo.user+releaseInfo.repo,releaseInfo.cliEncryptedToken);
           this.httpClient.get<AppReleaseInfo>(latestAssetUrl,{headers:{'Authorization':'token '+tokenSuffix,'Accept':'application/octet-stream'}})
            .subscribe(
                () => {},
                (e: HttpErrorResponse) => {
                    privateRepoDownloadUrl.next(e.url);
                });
        }
        return privateRepoDownloadUrl.asObservable();
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