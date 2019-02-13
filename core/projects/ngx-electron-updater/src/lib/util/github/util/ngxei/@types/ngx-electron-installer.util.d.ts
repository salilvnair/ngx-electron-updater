import { NgxeiOption } from "./ngxei-model";

export declare class NgxElectronInstaller {
    private opts;
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
    removeAllListeners(eventName:any[]):any;
    removeListener(eventName:any, listener:any):any;
    setMaxListeners(n:number):any;
    testEvent():void;

}
