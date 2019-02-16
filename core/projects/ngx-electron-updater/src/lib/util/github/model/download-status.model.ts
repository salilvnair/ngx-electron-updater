export class DownloadStatus {
    currentPercentage?:string;
    totalPercentage?:string;
    speed?:string;
    errorMessage?:string;
}

export class DownloadNotifier {
    key:string;
    value:DownloadStatus;
    path?:string;
}