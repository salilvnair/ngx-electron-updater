import { NgxeiOption} from "./ngxei-model";
import { ArchiveInfo } from "./archive-info";
import { ReleaseType,Comparator,Range,SemVer,Operator } from "./semvar";

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

    //now it inherits semvar 
    /**
     * Return the parsed version as a SemVer object, or null if it's not valid.
     */
    parse(v: string | SemVer, loose?: boolean): SemVer | null;
    /**
     * Return the parsed version, or null if it's not valid.
     */
    valid(v: string | SemVer, loose?: boolean): string | null;
    /**
     * Returns cleaned (removed leading/trailing whitespace, remove '=v' prefix) and parsed version, or null if version is invalid.
     */
    clean(version: string, loose?: boolean): string | null;
    /**
     * Return the version incremented by the release type (major, minor, patch, or prerelease), or null if it's not valid.
     */
    inc(v: string | SemVer, release: ReleaseType, loose?: boolean, identifier?: string): string | null;
    /**
     * Return the major version number.
     */
    major(v: string | SemVer, loose?: boolean): number;
    /**
     * Return the minor version number.
     */
    minor(v: string | SemVer, loose?: boolean): number;
    /**
     * Return the patch version number.
     */
    patch(v: string | SemVer, loose?: boolean): number;
    /**
     * Returns an array of prerelease components, or null if none exist.
     */
    prerelease(v: string | SemVer, loose?: boolean): string[] | null;

    // Comparison
    /**
     * v1 > v2
     */
    gt(v1: string | SemVer, v2: string | SemVer, loose?: boolean): boolean;
    /**
     * v1 >= v2
     */
    gte(v1: string | SemVer, v2: string | SemVer, loose?: boolean): boolean;
    /**
     * v1 < v2
     */
    lt(v1: string | SemVer, v2: string | SemVer, loose?: boolean): boolean;
    /**
     * v1 <= v2
     */
    lte(v1: string | SemVer, v2: string | SemVer, loose?: boolean): boolean;
    /**
     * v1 == v2 This is true if they're logically equivalent, even if they're not the exact same string. You already know how to compare strings.
     */
    eq(v1: string | SemVer, v2: string | SemVer, loose?: boolean): boolean;
    /**
     * v1 != v2 The opposite of eq.
     */
    neq(v1: string | SemVer, v2: string | SemVer, loose?: boolean): boolean;

    /**
     * Pass in a comparison string, and it'll call the corresponding semver comparison function.
     * "===" and "!==" do simple string comparison, but are included for completeness.
     * Throws if an invalid comparison string is provided.
     */
    cmp(v1: string | SemVer, operator: Operator, v2: string | SemVer, loose?: boolean): boolean;
    /**
     * Return 0 if v1 == v2, or 1 if v1 is greater, or -1 if v2 is greater. Sorts in ascending order if passed to Array.sort().
     */
    compare(v1: string | SemVer, v2: string | SemVer, loose?: boolean): 1 | 0 | -1;
    /**
     * The reverse of compare. Sorts an array of versions in descending order when passed to Array.sort().
     */
    rcompare(v1: string | SemVer, v2: string | SemVer, loose?: boolean): 1 | 0 | -1;

    /**
     * Compares two identifiers, must be numeric strings or truthy/falsy values. Sorts in ascending order if passed to Array.sort().
     */
    compareIdentifiers(a: string | null, b: string | null): 1 | 0 | -1;
    /**
     * The reverse of compareIdentifiers. Sorts in descending order when passed to Array.sort().
     */
    rcompareIdentifiers(a: string | null, b: string | null): 1 | 0 | -1;

    /**
     * Sorts an array of semver entries in ascending order.
     */
    sort(list: Array<string | SemVer>, loose?: boolean): Array<string | SemVer>;
    /**
     * Sorts an array of semver entries in descending order.
     */
    rsort(list: Array<string | SemVer>, loose?: boolean): Array<string | SemVer>;

    /**
     * Returns difference between two versions by the release type (major, premajor, minor, preminor, patch, prepatch, or prerelease), or null if the versions are the same.
     */
    diff(v1: string, v2: string, loose?: boolean): ReleaseType | null;

    // Ranges
    /**
     * Return the valid range or null if it's not valid
     */
    validRange(range: string | Range, loose?: boolean): string;
    /**
     * Return true if the version satisfies the range.
     */
    satisfies(version: string | SemVer, range: string | Range, loose?: boolean): boolean;
    /**
     * Return the highest version in the list that satisfies the range, or null if none of them do.
     */
    maxSatisfying(versions: Array<string | SemVer>, range: string | Range, loose?: boolean): string;
    /**
     * Return the lowest version in the list that satisfies the range, or null if none of them do.
     */
    minSatisfying(versions: Array<string | SemVer>, range: string, loose?: boolean): string;
    /**
     * Return true if version is greater than all the versions possible in the range.
     */
    gtr(version: string | SemVer, range: string | Range, loose?: boolean): boolean;
    /**
     * Return true if version is less than all the versions possible in the range.
     */
    ltr(version: string | SemVer, range: string | Range, loose?: boolean): boolean;
    /**
     * Return true if the version is outside the bounds of the range in either the high or low direction.
     * The hilo argument must be either the string '>' or '<'. (This is the function called by gtr and ltr.)
     */
    outside(version: string | SemVer, range: string | Range, hilo: '>' | '<', loose?: boolean): boolean;
    /**
     * Return true if any of the ranges comparators intersect
     */
    intersects(range1: string | Range, range2: string | Range, loose?: boolean): boolean;

    // Coercion
    /**
     * Coerces a string to semver if possible
     */
    coerce(version: string | SemVer): SemVer | null;
}
