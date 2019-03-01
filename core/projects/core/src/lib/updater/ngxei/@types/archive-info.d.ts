export interface ArchiveInfo {
    signature: number;
    diskNumber: number;
    diskStart: number;
    numberOfRecordsOnDisk: number;
    numberOfRecords: number;
    sizeOfCentralDirectory: number;
    offsetToStartOfCentralDirectory: number;
    commentLength: number;
    files: [
        {
            signature: number;
            versionMadeBy: number;
            versionsNeededToExtract: number;
            flags: number;
            compressionMethod: number;
            lastModifiedTime: number;
            lastModifiedDate: number;
            crc32: number;
            compressedSize: number;
            uncompressedSize: number;
            fileNameLength: number;
            extraFieldLength: number;
            fileCommentLength: number;
            diskNumber: number;
            internalFileAttributes: number;
            externalFileAttributes: number;
            offsetToLocalFileHeader: number;
            path: string;
            comment: string;
        }
    ];
}