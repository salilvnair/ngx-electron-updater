export type ReleaseType = "major" | "premajor" | "minor" | "preminor" | "patch" | "prepatch" | "prerelease";

export type Operator = '===' | '!==' | '' | '=' | '==' | '!=' | '>' | '>=' | '<' | '<=';

export class SemVer {
    constructor(version: string | SemVer, loose?: boolean);

    raw: string;
    loose: boolean;
    format(): string;
    inspect(): string;

    major: number;
    minor: number;
    patch: number;
    version: string;
    build: string[];
    prerelease: string[];

    compare(other: string | SemVer): 1 | 0 | -1;
    compareMain(other: string | SemVer): 1 | 0 | -1;
    comparePre(other: string | SemVer): 1 | 0 | -1;
    inc(release: ReleaseType, identifier?: string): SemVer;
}

export class Comparator {
    constructor(comp: string | Comparator, loose?: boolean);

    semver: SemVer;
    operator: string;
    value: boolean;
    parse(comp: string): void;
    test(version: string | SemVer): boolean;
    intersects(comp: Comparator, loose?: boolean): boolean;
}

export class Range {
    constructor(range: string | Range, loose?: boolean);

    range: string;
    raw: string;
    loose: boolean;
    format(): string;
    inspect(): string;

    set: Comparator[][];
    parseRange(range: string): Comparator[];
    test(version: string | SemVer): boolean;
    intersects(range: Range, loose?: boolean): boolean;
}