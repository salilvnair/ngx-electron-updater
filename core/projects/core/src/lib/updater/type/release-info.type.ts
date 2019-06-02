export class ReleaseInfoType {
    user:string;
    repo:string;
    provider:string;
    isPrivate?:boolean = false;
    cliEncryptedToken?:string;
}
