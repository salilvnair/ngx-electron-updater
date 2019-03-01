export class DownloadStatus {
    currentPercentage?:string;
    totalPercentage?:string;
    speed?:string;
    errorMessage?:string;
}

export class DownloadNotifierType {
    key:string;
    value:DownloadStatus;
    path?:string;
}