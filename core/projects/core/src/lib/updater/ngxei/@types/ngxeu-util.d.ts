import { NgxeiOption} from "./ngxei-model";
import { ArchiveInfo } from "./archive-info";

export interface NgxElectronUpdaterUtil {
    setOptions(opts: NgxeiOption): void;
    extract(): void;
    addListener(eventName:any, listener:any):void;
    emit(eventName:any, ...args:any):boolean;
    eventNames():any[];
    getMaxListeners():number;
    listenerCount(eventName:any):number;
    listeners(eventName:any):any[];
    off(eventName:any, listener:any):any;
    on(eventName:any, listener:any):any;
    once(eventName:any, listener:any):any;
    prependListener(eventName:any, listener:any):any;
    removeAllListeners(eventName?:any):any;
    removeListener(eventName:any, listener:any):any;
    setMaxListeners(n:number):any;
    archiveInfo():Promise<ArchiveInfo>;
    createPathIfNotExist(directoryPath:string):void;
    download(url:string, downloadPath:string,fileName:string):void;

    //semvar utils
    /**
     * v1 > v2
     */
    gt(v1: string , v2: string): boolean;
    /**
     * v1 >= v2
     */
    gte(v1: string , v2: string): boolean;
    /**
     * v1 < v2
     */
    lt(v1: string , v2: string): boolean;
    /**
     * v1 <= v2
     */
    lte(v1: string , v2: string): boolean;
    /**
     * v1 == v2 This is true if they're logically equivalent, even if they're not the exact same string. You already know how to compare strings.
     */
    eq(v1: string , v2: string): boolean;
    /**
     * v1 != v2 The opposite of eq.
     */
    neq(v1: string , v2: string): boolean;
}
