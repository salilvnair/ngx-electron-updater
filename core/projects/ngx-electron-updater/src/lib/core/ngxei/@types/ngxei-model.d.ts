import { AppReleaseInfo } from "../../github/model/app-release.model";

export interface NgxeiOption {
    zip_file_path:string;
    app_dir:string;
    extract_path:string;
    os:string;
    appName:string;
    updateType:string;
    appReleaseInfo:AppReleaseInfo;
}
